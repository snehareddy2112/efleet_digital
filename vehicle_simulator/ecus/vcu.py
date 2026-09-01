"""
Vehicle Control Unit (VCU) ECU
Coordinates driving states, accelerator mapping, torque arbitration, gear selection, and contactor logic.
"""

from typing import Dict, Any

class VCU:
    # State Enum: 0=OFF, 1=STARTING, 2=READY, 3=ACCELERATING, 4=CRUISING, 5=BRAKING, 6=CHARGING, 7=FAULT
    STATE_NAMES = {
        0: "OFF",
        1: "STARTING",
        2: "READY",
        3: "ACCELERATING",
        4: "CRUISING",
        5: "BRAKING",
        6: "CHARGING",
        7: "FAULT"
    }

    def __init__(self, max_torque_nm: float = 2500.0):
        self.max_torque_nm = max_torque_nm
        self.ignition_state = 2   # 0=OFF, 1=ACC, 2=ON
        self.state = 2            # 2 = READY
        self.drive_mode = 1       # 0=ECO, 1=NORMAL, 2=POWER
        self.gear_state = 1       # 0=N, 1=D, 2=R, 3=P
        self.parking_brake = False
        self.vehicle_ready = True
        self.direction = "FORWARD"
        self.torque_limit_nm = 2200.0

        # Odometers
        self.odometer_km = 14250.8
        self.trip_distance_km = 28.4
        self.operating_hours = 842.5

    def step(self,
             accelerator_pos_pct: float,
             brake_pedal_pos_pct: float,
             current_speed_kmh: float,
             is_charging: bool = False,
             has_critical_fault: bool = False,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Calculates drive state, commanded torque request, and updates distance.
        """
        # Distance integration
        distance_step_km = (current_speed_kmh * dt_seconds) / 3600.0
        self.odometer_km += distance_step_km
        self.trip_distance_km += distance_step_km
        if self.ignition_state == 2:
            self.operating_hours += (dt_seconds / 3600.0)

        # State transition
        if has_critical_fault:
            self.state = 7 # FAULT
            self.vehicle_ready = False
        elif is_charging:
            self.state = 6 # CHARGING
            self.vehicle_ready = False
            self.gear_state = 3 # P
        elif self.ignition_state == 0:
            self.state = 0 # OFF
            self.vehicle_ready = False
        elif brake_pedal_pos_pct > 2.0:
            self.state = 5 # BRAKING
            self.vehicle_ready = True
        elif accelerator_pos_pct > 5.0 and current_speed_kmh < 75.0:
            self.state = 3 # ACCELERATING
            self.vehicle_ready = True
        elif current_speed_kmh > 3.0:
            self.state = 4 # CRUISING
            self.vehicle_ready = True
        else:
            self.state = 2 # READY
            self.vehicle_ready = True

        # Mode torque scaling factor
        mode_multipliers = {0: 0.75, 1: 1.0, 2: 1.25} # ECO, NORMAL, POWER
        mode_mult = mode_multipliers.get(self.drive_mode, 1.0)

        # Torque calculation from pedal
        if self.state in (0, 6, 7) or self.parking_brake or self.gear_state in (0, 3):
            torque_request_nm = 0.0
            accel_cmd = 0.0
        elif brake_pedal_pos_pct > 2.0:
            torque_request_nm = 0.0
            accel_cmd = 0.0
        else:
            # Non-linear throttle response curve
            pedal_norm = accelerator_pos_pct / 100.0
            accel_cmd = accelerator_pos_pct
            # Taper torque at high speeds to simulate motor field weakening
            speed_factor = max(0.2, 1.0 - (current_speed_kmh / 110.0))
            torque_request_nm = (pedal_norm ** 1.3) * self.max_torque_nm * mode_mult * speed_factor
            torque_request_nm = min(torque_request_nm, self.torque_limit_nm)

        self.direction = "FORWARD" if self.gear_state == 1 else ("REVERSE" if self.gear_state == 2 else "NEUTRAL")

        return {
            "vehicle_state": self.state,
            "vehicle_state_name": self.STATE_NAMES.get(self.state, "READY"),
            "drive_mode": self.drive_mode,
            "direction": self.direction,
            "gear_state": self.gear_state,
            "ignition_state": self.ignition_state,
            "parking_brake": self.parking_brake,
            "vehicle_ready": self.vehicle_ready,
            "accelerator_position": round(accelerator_pos_pct, 1),
            "accelerator_command": round(accel_cmd, 1),
            "throttle_position": round(accelerator_pos_pct, 1),
            "throttle_command": round(accel_cmd, 1),
            "torque_request": round(torque_request_nm, 1),
            "torque_limit": self.torque_limit_nm,
            "drive_request": torque_request_nm > 5.0,
            "odometer": round(self.odometer_km, 2),
            "trip_distance": round(self.trip_distance_km, 2),
            "operating_hours": round(self.operating_hours, 1)
        }
