"""
Olectra E-Fleet Platform Launcher
Starts the FastAPI Backend and Simulator Runtime.
"""

import sys
import os
import uvicorn

# Add current directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def main():
    print("=" * 75)
    print("  OLECTRA E-FLEET — REALISTIC EV BUS + TCU DIGITAL TWIN MVP")
    print("  Reference Architecture: BUS-001 + TCU-001 (ELECTRA-12M)")
    print("=" * 75)
    print("  Physical Systems -> ECUs -> Simulated CAN Bus -> TCU-001 -> MQTT -> Cloud")
    print("  FastAPI Backend & Ingestion: http://localhost:8000")
    print("  Swagger API Docs:            http://localhost:8000/docs")
    print("  WebSocket Live Stream:       ws://localhost:8000/ws/telemetry")
    print("  React Operations Dashboard:  http://localhost:5173")
    print("=" * 75)

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()
