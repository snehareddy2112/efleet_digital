# OLECTRA E-FLEET — REALISTIC EV BUS + TCU DIGITAL TWIN MVP

An industrial-grade, physics-accurate digital twin of a 12m Electric Transit Bus (**BUS-001 / ELECTRA-12M**) and its dedicated Telematics Control Unit (**TCU-001**), modeled with strict layer boundaries:

```text
Physical Vehicle Systems → ECUs → Simulated CAN Bus → TCU-001 → MQTT Broker (EMQX) → Cloud Ingestion → SQLite Time-Series DB → Real-Time Dashboard
```

---

## 1. Key Architectural Features

1. **Physical Multi-Physics Vehicle Systems**:
   - 12m transit bus kinematics ($13,500\text{ kg} + N_{pax}\times 68\text{ kg}$, aerodynamic drag, rolling resistance, road elevation profile).
   - Dual independent $160\text{ kWh}$ LFP Battery Packs (**BAT-001-A** and **BAT-001-B**) with cell-level voltage gradients ($3.28\text{V}-3.31\text{V}$), thermal equations, and contactors.
   - $250\text{ kW}$ PMSM Traction Motor & Silicon Carbide (SiC) Inverter with dynamic torque curves and field weakening.
   - Pneumatic braking with regenerative braking blending ($0-120\text{ kW}$ energy recapture).
   - Dual-zone HVAC with variable scroll compressor ($0-8\text{ kW}$) and cabin thermodynamics.
   - Dual coolant loops for battery pack and powertrain thermal management.
   - Safety controller (High Voltage Interlock Loop HVIL, insulation resistance $2.4\text{ M}\Omega$, door interlocks).
   - Complete catalog of **280+ telemetry signals** across 18 subsystems.

2. **Simulated CAN Network Layer**:
   - 12 distinct CAN message definitions (IDs `0x100` to `0x750`) with explicit bit layouts, endianness, scale factors, and offsets.
   - ECUs encode physical signals into 8-byte raw hex payloads.
   - Thread-safe `CANBus` broker broadcasting frames to subscribers with arbitration simulation.

3. **Dedicated TCU Simulator (TCU-001)**:
   - Separate architectural device with unique IMEI, ICCID, firmware version, and 4G/5G cellular modem simulator (RSRP, RSRQ, SINR, Serving Cell ID).
   - Reads CAN frames, decodes signals using the CAN dictionary, runs boundary range validation, and normalizes into standard JSON packets with monotonic sequence numbers.
   - **Store-and-Forward Offline Buffering**: When cellular link or MQTT drops, packets buffer to flash RAM ring buffer; upon reconnection, all packets flush sequentially without loss.

4. **MQTT Broker & Cloud Ingestion**:
   - Publishes to standardized topics: `fleet/{fleetId}/bus/{busId}/telemetry`, `status`, `diagnostics`, `events`, `fleet/{fleetId}/tcu/{tcuId}/status`.
   - Connects to external EMQX broker (`EMQX_DASHBOARD_URL=http://localhost:18083`) or integrated embedded bridge.
   - Ingestion service records multi-stage latencies ($T_{can} \to T_{tcu} \to T_{mqtt} \to T_{backend} \to T_{db}$), writes to SQLite time-series storage, and streams over 1 Hz WebSockets.

5. **Operations & Digital Twin Dashboard (React + Vite)**:
   - **Fleet Overview**: Fleet KPIs, active buses, Telangana highway transit corridors.
   - **BUS-001 Digital Twin**: Interactive cockpit view, dual pack status, powertrain gauges, HVAC, 6-DOF IMU, thermal heatmaps, and rolling time-series charts.
   - **Live Telemetry**: Searchable tabular inspector for all 280+ signals across 18 subsystems.
   - **CAN Monitor**: Live scrolling 8-byte hex CAN traffic with click-to-decode signal breakdown drawer.
   - **TCU Monitor**: TCU status, 4G/5G radio parameters, store-and-forward queue depth, network disconnect simulator, and raw normalized JSON packet viewer.
   - **MQTT / EMQX Visual Console**: Visual EMQX topology, bidirectional IN/OUT message stream, topic explorer, message rate graphs, live test publisher, and security audit.
   - **Diagnostics & DTCs**: Active DTC table with severity and freeze-frame data + 10-point fault injection matrix.
   - **System Architecture & Live E2E Tracer**: Interactive data pipeline diagram with single-packet journey latency tracer.

---

## 2. Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)

### Step 1: Start the Backend & Simulation Engine
```bash
cd C:\Users\sneha\.gemini\antigravity\scratch\olectra_efleet_digital_twin
python run_platform.py
```
*API and WebSocket server will run on `http://localhost:8000` (Swagger docs at `/docs`).*

### Step 2: Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 3. Running Automated Tests

Run the test suite verifying CAN frame encoding, physics consistency, TCU store-and-forward buffering, and multi-bus instantiation:
```bash
python tests/test_digital_twin.py
```

---

## 4. Multi-Bus Scalability (Scaling to 100 Buses)

The architecture is configuration-driven. To instantiate additional buses (`BUS-002`, `BUS-003` ... `BUS-100`), instantiate `BusSimulator` and `TCUSimulator` with configuration objects:

```python
from vehicle_simulator.bus import BusSimulator
from tcu_simulator.tcu import TCUSimulator

# BUS-002
bus_002 = BusSimulator({
    "fleetId": "OLECTRA-E-FLEET",
    "busId": "BUS-002",
    "tcuId": "TCU-002",
    "routeId": "TS-HYD-KMN-202"
})

tcu_002 = TCUSimulator(
    tcu_id="TCU-002",
    bus_id="BUS-002",
    can_bus=bus_002.can_bus
)
```
No code duplication or simulator logic alteration is required.
