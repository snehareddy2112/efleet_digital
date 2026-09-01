"""
CAN Bus REST Routes
Provides raw CAN frame streaming and click-to-decode dictionary breakdowns.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from vehicle_network.can_bus import CAN_DICTIONARY, CANFrame, decode_can_frame

router = APIRouter(prefix="/buses/{bus_id}/can", tags=["CAN Network"])

# Global reference to CAN Bus instance
can_bus_instance = None

def set_can_bus(bus):
    global can_bus_instance
    can_bus_instance = bus

@router.get("/recent")
def get_recent_can_frames(bus_id: str, limit: int = Query(50, ge=5, le=100)):
    if not can_bus_instance:
        raise HTTPException(status_code=503, detail="CAN Bus not initialized")
    return {
        "bus_id": bus_id,
        "bus_active": can_bus_instance.is_active,
        "total_frames_transmitted": can_bus_instance.total_frames_transmitted,
        "frames": can_bus_instance.get_recent_frames(limit=limit)
    }

@router.get("/dictionary")
def get_can_dictionary():
    return {
        f"0x{can_id:03X}": meta for can_id, meta in CAN_DICTIONARY.items()
    }

@router.post("/decode-frame")
def decode_custom_frame(can_id_hex: str, data_hex: str):
    try:
        can_id = int(can_id_hex, 16) if can_id_hex.startswith("0x") else int(can_id_hex)
        bytes_list = [int(b, 16) for b in data_hex.strip().split()]
        payload = bytearray(bytes_list)
        frame = CANFrame(arbitration_id=can_id, data=payload, dlc=len(payload))
        decoded = decode_can_frame(frame)
        return {
            "can_id": f"0x{can_id:03X}",
            "message_name": CAN_DICTIONARY.get(can_id, {}).get("name", "UNKNOWN"),
            "source_ecu": CAN_DICTIONARY.get(can_id, {}).get("ecu", "UNKNOWN"),
            "decoded_signals": decoded
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Frame decode error: {str(e)}")
