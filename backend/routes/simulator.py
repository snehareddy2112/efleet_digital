"""
Simulator Control REST Routes
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

router = APIRouter(prefix="/simulator", tags=["Simulator Control"])

bus_simulator_instance = None

def set_bus_simulator(bus_sim):
    global bus_simulator_instance
    bus_simulator_instance = bus_sim

@router.get("/status")
def get_simulator_status():
    if not bus_simulator_instance:
        raise HTTPException(status_code=503, detail="Simulator not initialized")
    return {
        "is_running": bus_simulator_instance.is_running,
        "is_paused": bus_simulator_instance.is_paused,
        "speed_multiplier": bus_simulator_instance.sim_speed_multiplier,
        "active_scenario": bus_simulator_instance.active_scenario,
        "tick_count": bus_simulator_instance.tick_count
    }

@router.post("/control")
def control_simulator(action: str = Body(..., embed=True), value: Any = Body(None, embed=True)):
    if not bus_simulator_instance:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if action in ("pause", "stop"):
        bus_simulator_instance.is_paused = True
    elif action in ("resume", "play", "start"):
        bus_simulator_instance.is_paused = False
    elif action == "set_speed":
        bus_simulator_instance.sim_speed_multiplier = float(value)
    elif action == "set_scenario":
        bus_simulator_instance.set_scenario(str(value))
    elif action == "reset":
        bus_simulator_instance.pack_a.soc_pct = 82.4
        bus_simulator_instance.pack_b.soc_pct = 81.9
        bus_simulator_instance.physics.speed_ms = 0.0
        bus_simulator_instance.vcu.odometer_km = 14250.8
        bus_simulator_instance.vcu.trip_distance_km = 0.0
        bus_simulator_instance.route.waypoint_index = 0
        bus_simulator_instance.route.progress_between_wps = 0.0

    return {
        "status": "success",
        "action": action,
        "is_paused": bus_simulator_instance.is_paused,
        "speed_multiplier": bus_simulator_instance.sim_speed_multiplier,
        "active_scenario": bus_simulator_instance.active_scenario
    }
