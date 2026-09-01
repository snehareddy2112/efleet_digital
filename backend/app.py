"""
FastAPI Backend Application & Simulation Runtime Engine
Coordinates the full architectural data flow:
Vehicle Simulator -> ECUs -> CAN Bus -> TCU-001 -> MQTT Broker -> Cloud Ingestion -> Database -> WebSocket -> Dashboard.
"""

import time
import asyncio
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .storage import TimeSeriesStorage
from .ingestion import MQTTIngestionService
from .websocket_manager import ws_manager

from vehicle_network.can_bus import CANBus
from vehicle_simulator.bus import BusSimulator
from tcu_simulator.tcu import TCUSimulator

from .routes import fleet, telemetry, can, tcu, diagnostics, mqtt_console, simulator

# Global singletons
storage = TimeSeriesStorage(db_path=settings.SQLITE_DB_PATH)
can_bus = CANBus("CAN0_BUS001")
bus_sim = BusSimulator({"busId": "BUS-001", "tcuId": "TCU-001"}, can_bus=can_bus)

# Loop reference for async websocket broadcast from sync thread
main_loop = None

def on_new_telemetry_packet(packet):
    """Callback when ingestion service completes processing a packet"""
    global main_loop
    if main_loop and main_loop.is_running():
        asyncio.run_coroutine_threadsafe(
            ws_manager.broadcast_json({"type": "TELEMETRY_UPDATE", "data": packet}),
            main_loop
        )

ingestion_service = MQTTIngestionService(storage=storage, on_new_telemetry_cb=on_new_telemetry_packet)

# TCU callback publishes into MQTT Ingestion Pipeline
def tcu_mqtt_publish_hook(topic: str, packet: dict):
    ingestion_service.handle_tcu_publish(topic, packet)

tcu_sim = TCUSimulator(
    tcu_id="TCU-001",
    bus_id="BUS-001",
    fleet_id="OLECTRA-E-FLEET",
    can_bus=can_bus,
    mqtt_publish_callback=tcu_mqtt_publish_hook,
    mqtt_host=settings.MQTT_BROKER_HOST if not settings.MQTT_USE_EMBEDDED_BROKER else None,
    mqtt_port=settings.MQTT_BROKER_PORT,
    mqtt_tls=settings.MQTT_TLS,
    mqtt_username=settings.MQTT_USERNAME,
    mqtt_password=settings.MQTT_PASSWORD,
    mqtt_ca_cert=settings.MQTT_CA_CERT
)

# Inject dependencies into route modules
telemetry.set_storage(storage)
can.set_can_bus(can_bus)
tcu.set_tcu(tcu_sim)
diagnostics.set_bus_simulator(bus_sim)
mqtt_console.set_ingestion_service(ingestion_service)
simulator.set_bus_simulator(bus_sim)

# Simulation background thread
sim_thread_running = True

def simulation_worker_loop():
    while sim_thread_running:
        t0 = time.time()
        try:
            if not bus_sim.is_paused:
                # 1. Bus generates physical state & encodes CAN frames
                veh_state = bus_sim.tick(dt_seconds=1.0)
                # 2. TCU receives CAN frames, normalizes & publishes over MQTT
                tcu_sim.step(veh_state, dt_seconds=1.0)
        except Exception as e:
            print(f"[Sim Worker Error] {e}")

        # Sleep interval accounting for speed multiplier
        multiplier = max(0.1, min(10.0, bus_sim.sim_speed_multiplier))
        target_sleep = 1.0 / multiplier
        elapsed = time.time() - t0
        sleep_dur = max(0.01, target_sleep - elapsed)
        time.sleep(sleep_dur)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global main_loop, sim_thread_running
    main_loop = asyncio.get_running_loop()
    print("[Startup] Initializing Olectra E-Fleet Simulator & Ingestion Pipeline...")

    # Start simulation worker thread
    sim_thread_running = True
    worker_thread = threading.Thread(target=simulation_worker_loop, daemon=True)
    worker_thread.start()

    yield

    print("[Shutdown] Stopping Simulator...")
    sim_thread_running = False

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(fleet.router, prefix=settings.API_PREFIX)
app.include_router(telemetry.router, prefix=settings.API_PREFIX)
app.include_router(can.router, prefix=settings.API_PREFIX)
app.include_router(tcu.router, prefix=settings.API_PREFIX)
app.include_router(diagnostics.router, prefix=settings.API_PREFIX)
app.include_router(mqtt_console.router, prefix=settings.API_PREFIX)
app.include_router(simulator.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "olectra-efleet-backend",
        "bus_simulator": "RUNNING" if not bus_sim.is_paused else "PAUSED",
        "can_bus": "ACTIVE" if can_bus.is_active else "OFFLINE",
        "tcu_modem": tcu_sim.modem.network_type,
        "mqtt_broker": "CONNECTED"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot immediately upon connect
        latest = storage.get_latest_telemetry("BUS-001")
        if latest:
            await websocket.send_json({"type": "INITIAL_SNAPSHOT", "data": latest})
        while True:
            # Keep connection alive
            msg = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
