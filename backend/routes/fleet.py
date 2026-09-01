"""
Fleet Management REST Routes
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

router = APIRouter(prefix="/fleet", tags=["Fleet"])

# Reference fleet list (scalable to 100+ buses)
FLEET_CATALOG = [
    {
        "bus_id": "BUS-001",
        "model": "ELECTRA-12M",
        "variant": "CityTransit-LFP",
        "tcu_id": "TCU-001",
        "vin": "MA6OL12ME0012026",
        "status": "ONLINE",
        "route_id": "TS-HYD-WGL-101",
        "battery_capacity_kwh": 320.0,
        "max_motor_power_kw": 250.0,
        "operator": "TSRTC Commercial EV Division",
        "depot": "Miyapur Central Bus Depot"
    },
    {
        "bus_id": "BUS-002",
        "model": "ELECTRA-12M",
        "variant": "InterCity-Express",
        "tcu_id": "TCU-002",
        "vin": "MA6OL12ME0022026",
        "status": "ONLINE",
        "route_id": "TS-HYD-KMN-202",
        "battery_capacity_kwh": 320.0,
        "max_motor_power_kw": 250.0,
        "operator": "TSRTC Commercial EV Division",
        "depot": "Secunderabad JBS Depot"
    },
    {
        "bus_id": "BUS-003",
        "model": "ELECTRA-12M",
        "variant": "AirportShuttle-LFP",
        "tcu_id": "TCU-003",
        "vin": "MA6OL12ME0032026",
        "status": "STANDBY",
        "route_id": "TS-HYD-LOOP-707",
        "battery_capacity_kwh": 320.0,
        "max_motor_power_kw": 250.0,
        "operator": "TSRTC Commercial EV Division",
        "depot": "Shamshabad Airport EV Hub"
    }
]

@router.get("")
def get_fleet_summary():
    return {
        "fleet_id": "OLECTRA-E-FLEET",
        "fleet_name": "Olectra E-Fleet Commercial Electric Bus Network",
        "total_buses": 100,
        "active_digital_twins": len(FLEET_CATALOG),
        "online_buses": 3,
        "average_fleet_soc": 81.8,
        "total_fleet_power_kw": 178.5,
        "total_energy_delivered_mwh": 142.8,
        "buses": FLEET_CATALOG
    }

@router.get("/buses")
def list_buses():
    return FLEET_CATALOG

@router.get("/buses/{bus_id}")
def get_bus_details(bus_id: str):
    for b in FLEET_CATALOG:
        if b["bus_id"] == bus_id:
            return b
    if bus_id == "BUS-001":
        return FLEET_CATALOG[0]
    raise HTTPException(status_code=404, detail="Bus ID not found")
