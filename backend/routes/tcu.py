"""
TCU Device & Modem REST Routes
Provides TCU connection metrics, store-and-forward queue inspection, and network failure injection.
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

router = APIRouter(prefix="/buses/{bus_id}/tcu", tags=["TCU Device"])

# Global reference to TCU instance
tcu_instance = None

def set_tcu(tcu):
    global tcu_instance
    tcu_instance = tcu

@router.get("")
def get_tcu_status(bus_id: str):
    if not tcu_instance:
        raise HTTPException(status_code=503, detail="TCU simulator not initialized")
    return tcu_instance.get_status()

@router.get("/raw-packet")
def get_tcu_raw_packet(bus_id: str):
    if not tcu_instance or not tcu_instance.last_published_packet:
        raise HTTPException(status_code=404, detail="No published packet available yet")
    return tcu_instance.last_published_packet

@router.post("/control/network")
def toggle_network(bus_id: str, connected: bool = Body(..., embed=True)):
    if not tcu_instance:
        raise HTTPException(status_code=503, detail="TCU simulator not initialized")
    tcu_instance.set_network_connection(connected)
    return {"status": "success", "network_connected": connected}

@router.post("/control/mqtt")
def toggle_mqtt(bus_id: str, connected: bool = Body(..., embed=True)):
    if not tcu_instance:
        raise HTTPException(status_code=503, detail="TCU simulator not initialized")
    tcu_instance.set_mqtt_connection(connected)
    return {"status": "success", "mqtt_connected": connected}

@router.post("/flush-buffer")
def flush_buffer(bus_id: str):
    if not tcu_instance:
        raise HTTPException(status_code=503, detail="TCU simulator not initialized")
    tcu_instance.flush_buffer()
    return {"status": "success", "buffer_size": tcu_instance.buffer.size}
