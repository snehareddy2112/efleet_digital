"""
Diagnostics & Fault Injection REST Routes
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
import time

router = APIRouter(prefix="/buses/{bus_id}/diagnostics", tags=["Diagnostics"])

bus_simulator_instance = None

def set_bus_simulator(bus_sim):
    global bus_simulator_instance
    bus_simulator_instance = bus_sim

# Active DTC catalog
DTC_CATALOG = {
    "Battery Over Temperature": {
        "dtc_code": "P0A7E",
        "severity": "CRITICAL",
        "subsystem": "BMS",
        "description": "High Voltage Battery Pack Exceeded 60°C Safety Threshold",
        "action": "Derate discharge current to 100A, trigger battery chiller loop"
    },
    "Battery Over Voltage": {
        "dtc_code": "P0A0E",
        "severity": "CRITICAL",
        "subsystem": "BMS",
        "description": "High Voltage Bus Exceeded 740V Over-Voltage Threshold",
        "action": "Inhibit regenerative braking, open precharge contactor"
    },
    "Battery Under Voltage": {
        "dtc_code": "P0A0C",
        "severity": "WARNING",
        "subsystem": "BMS",
        "description": "High Voltage Pack Cell Saturated Below 2.65V Cutoff",
        "action": "Limit motor torque to 500 Nm, prompt driver to charge"
    },
    "Battery Over Current": {
        "dtc_code": "P0AFA",
        "severity": "CRITICAL",
        "subsystem": "BMS",
        "description": "Battery Instantaneous Discharge Exceeded 400A Fuse Rating",
        "action": "Immediate powertrain current clamping"
    },
    "BMS Fault": {
        "dtc_code": "U0110",
        "severity": "CRITICAL",
        "subsystem": "BMS",
        "description": "BMS Internal Master Microcontroller CRC Check Failure",
        "action": "Vehicle emergency state transition"
    },
    "Motor Fault": {
        "dtc_code": "P0A2B",
        "severity": "WARNING",
        "subsystem": "Powertrain",
        "description": "Traction Motor Stator Winding Overheated (>130°C)",
        "action": "Ramp powertrain coolant pump to 100%"
    },
    "Inverter Fault": {
        "dtc_code": "P0A1B",
        "severity": "CRITICAL",
        "subsystem": "Powertrain",
        "description": "SiC Inverter Gate Drive Desaturation Fault",
        "action": "Open IGBT/SiC gate drives, disable propulsion"
    },
    "HVAC Fault": {
        "dtc_code": "B1042",
        "severity": "WARNING",
        "subsystem": "HVAC",
        "description": "Cabin AC Scroll Compressor Thermal Lockout",
        "action": "Switch HVAC to passive ventilation mode"
    },
    "Charger Fault": {
        "dtc_code": "P0D56",
        "severity": "CRITICAL",
        "subsystem": "Charging",
        "description": "CCS2 DC Inlet Pin Over-Temperature (>90°C)",
        "action": "Abort DC Fast Charging session immediately"
    },
    "HV Isolation Fault": {
        "dtc_code": "P0AA6",
        "severity": "CRITICAL",
        "subsystem": "Safety",
        "description": "Chassis Insulation Resistance Dropped Below 500 Ohm/V",
        "action": "Trigger isolation alarm, prevent high-voltage precharge"
    },
    "CAN Communication Loss": {
        "dtc_code": "U0001",
        "severity": "CRITICAL",
        "subsystem": "Network",
        "description": "High-Speed Vehicle CAN Bus Controller Bus-Off State",
        "action": "TCU switches to local offline store-and-forward queue"
    },
    "GPS Loss": {
        "dtc_code": "U0126",
        "severity": "WARNING",
        "subsystem": "Telematics",
        "description": "Lost Communication with GNSS Receiver Module",
        "action": "Fallback to wheel-speed dead reckoning"
    },
    "MQTT Loss": {
        "dtc_code": "U0140",
        "severity": "CRITICAL",
        "subsystem": "Telematics",
        "description": "Cellular Cloud MQTT Transport Layer Timeout",
        "action": "Buffer packets in store-and-forward flash memory"
    },
    "TCU Fault": {
        "dtc_code": "U0199",
        "severity": "CRITICAL",
        "subsystem": "Telematics",
        "description": "TCU Edge Gateway Processing Watchdog Trip",
        "action": "Trigger hardware watchdog reboot and diagnostics log"
    }
}

@router.get("")
def get_diagnostics(bus_id: str):
    if not bus_simulator_instance:
        raise HTTPException(status_code=503, detail="Simulator not ready")

    active_dtcs = []
    for fault_name, is_active in bus_simulator_instance.active_faults.items():
        if is_active and fault_name in DTC_CATALOG:
            item = dict(DTC_CATALOG[fault_name])
            item["fault_name"] = fault_name
            item["timestamp"] = time.time()
            item["timestamp_iso"] = time.strftime("%H:%M:%S")
            active_dtcs.append(item)

    return {
        "bus_id": bus_id,
        "dtc_count": len(active_dtcs),
        "active_dtc_count": len(active_dtcs),
        "warning_count": sum(1 for d in active_dtcs if d["severity"] == "WARNING"),
        "critical_fault_count": sum(1 for d in active_dtcs if d["severity"] == "CRITICAL"),
        "active_dtcs": active_dtcs,
        "supported_faults": list(DTC_CATALOG.keys())
    }

@router.post("/fault-injection")
def inject_fault(bus_id: str, fault_name: str = Body(..., embed=True), enabled: bool = Body(..., embed=True)):
    if not bus_simulator_instance:
        raise HTTPException(status_code=503, detail="Simulator not ready")
    bus_simulator_instance.set_fault(fault_name, enabled)
    return {
        "status": "success",
        "fault_name": fault_name,
        "enabled": enabled,
        "active_faults": bus_simulator_instance.active_faults
    }

@router.post("/clear-all-faults")
def clear_all_faults(bus_id: str):
    if not bus_simulator_instance:
        raise HTTPException(status_code=503, detail="Simulator not ready")
    for f in list(bus_simulator_instance.active_faults.keys()):
        bus_simulator_instance.set_fault(f, False)
    return {"status": "success", "active_faults": {}}
