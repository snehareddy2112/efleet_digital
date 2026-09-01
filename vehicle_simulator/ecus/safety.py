"""
Safety & Door Controller ECU
Supervises High Voltage Interlock Loop (HVIL), chassis isolation, door motion interlocks, and emergency fire/crash alerts.
"""

from typing import Dict, Any, List

class SafetyECU:
    def __init__(self):
        self.emergency_stop = False
        self.hv_interlock_ok = True
        self.isolation_resistance_kohm = 2450.0
        self.door_front_open = False
        self.door_middle_open = False
        self.door_rear_open = False
        self.fire_detected = False
        self.smoke_detected = False
        self.crash_detected = False
        self.door_dwell_time_s = 0

    def step(self, vehicle_speed_kmh: float, is_at_bus_stop: bool = False, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Manages door states during stops, verifies motion lock, and evaluates safety interlocks.
        """
        if is_at_bus_stop and vehicle_speed_kmh < 0.5:
            # Bus stopped at station: Open doors
            self.door_front_open = True
            self.door_middle_open = True
            self.door_dwell_time_s += int(dt_seconds)
        else:
            self.door_front_open = False
            self.door_middle_open = False
            self.door_rear_open = False
            self.door_dwell_time_s = 0

        open_doors = sum([1 for d in (self.door_front_open, self.door_middle_open, self.door_rear_open) if d])
        door_motion_warning = (open_doors > 0 and vehicle_speed_kmh > 1.0)

        isolation_status = "PASS (>500 ohm/V)" if self.isolation_resistance_kohm >= 500.0 else "FAIL (<500 ohm/V)"
        hvil_status = "LOCKED_OK" if self.hv_interlock_ok else "INTERLOCK_OPEN"

        return {
            "emergency_stop": self.emergency_stop,
            "high_voltage_interlock": self.hv_interlock_ok,
            "hv_interlock_ok": self.hv_interlock_ok,
            "hv_interlock_status": hvil_status,
            "isolation_status": isolation_status,
            "isolation_kohm": self.isolation_resistance_kohm,
            "door_front": self.door_front_open,
            "door_front_open": self.door_front_open,
            "door_middle": self.door_middle_open,
            "door_middle_open": self.door_middle_open,
            "door_rear": self.door_rear_open,
            "door_rear_open": self.door_rear_open,
            "door_open_count": open_doors,
            "door_warning": door_motion_warning,
            "fire_detection": self.fire_detected,
            "smoke_detection": self.smoke_detected,
            "fire_smoke_detected": self.fire_detected or self.smoke_detected,
            "crash_detection": self.crash_detected,
            "door_open_duration": self.door_dwell_time_s
        }
