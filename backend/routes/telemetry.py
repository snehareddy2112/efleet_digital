"""
Telemetry REST Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from vehicle_simulator.dictionary import SIGNAL_REGISTRY, get_all_subsystems, get_signals_by_subsystem

router = APIRouter(prefix="/buses/{bus_id}/telemetry", tags=["Telemetry"])

# Global reference to storage (injected on app startup)
storage_instance = None

def set_storage(storage):
    global storage_instance
    storage_instance = storage

@router.get("")
def get_latest_telemetry(bus_id: str):
    if not storage_instance:
        raise HTTPException(status_code=503, detail="Storage not ready")
    data = storage_instance.get_latest_telemetry(bus_id)
    if not data:
        raise HTTPException(status_code=404, detail="No telemetry available yet for this bus")
    return data

@router.get("/series")
def get_telemetry_series(bus_id: str, limit: int = Query(60, ge=10, le=300)):
    if not storage_instance:
        raise HTTPException(status_code=503, detail="Storage not ready")
    return storage_instance.get_recent_series(bus_id, limit=limit)

@router.get("/subsystems")
def list_subsystems():
    return get_all_subsystems()

@router.get("/signals")
def get_signal_registry(subsystem: Optional[str] = None):
    if subsystem:
        return get_signals_by_subsystem(subsystem)
    return SIGNAL_REGISTRY
