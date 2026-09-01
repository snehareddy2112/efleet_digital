"""
Braking & Regeneration ECU Model
Blends regenerative braking with pneumatic friction brakes, tracks air reservoir pressure and ABS/ESC.
"""

from typing import Dict, Any

class BrakeECU:
    def __init__(self, max_regen_torque_nm: float = 1200.0, max_friction_brake_kn: float = 65.0):
        self.max_regen_torque_nm = max_regen_torque_nm
        self.max_friction_brake_kn = max_friction_brake_kn
        self.air_reservoir_pressure_bar = 8.5
        self.compressor_running = False
        self.total_regen_energy_kwh = 14.8

    def step(self,
             brake_pedal_pct: float,
             current_speed_kmh: float,
             battery_soc_pct: float,
             allow_regen: bool = True,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Calculates regen torque and friction braking force based on pedal travel and battery acceptance.
        """
        pedal_norm = max(0.0, min(100.0, brake_pedal_pct)) / 100.0
        service_brake_active = brake_pedal_pct > 2.0

        # Maintain pneumatic reservoir pressure (6.5 - 9.0 bar)
        if service_brake_active:
            self.air_reservoir_pressure_bar -= (pedal_norm * 0.08 * dt_seconds)
        if self.air_reservoir_pressure_bar < 6.8:
            self.compressor_running = True
        elif self.air_reservoir_pressure_bar > 8.8:
            self.compressor_running = False

        if self.compressor_running:
            self.air_reservoir_pressure_bar += 0.15 * dt_seconds

        self.air_reservoir_pressure_bar = max(4.0, min(10.0, self.air_reservoir_pressure_bar))
        air_pressure_warning = self.air_reservoir_pressure_bar < 6.0

        if not service_brake_active or current_speed_kmh <= 1.0:
            regen_torque_nm = 0.0
            regen_power_kw = 0.0
            regen_current_a = 0.0
            friction_brake_kn = 0.0
            regen_active = False
            abs_active = False
            esc_active = False
        else:
            # Regen cut-off above 95% SOC to protect battery from over-voltage
            soc_regen_factor = 1.0 if battery_soc_pct < 90.0 else max(0.0, (95.0 - battery_soc_pct) / 5.0)
            speed_regen_factor = min(1.0, current_speed_kmh / 12.0) # Tapers off below 12 km/h

            if allow_regen and soc_regen_factor > 0 and speed_regen_factor > 0:
                # First 40% of pedal is prioritized for pure regeneration
                regen_portion = min(1.0, pedal_norm / 0.45)
                regen_torque_nm = regen_portion * self.max_regen_torque_nm * soc_regen_factor * speed_regen_factor
                regen_active = regen_torque_nm > 20.0
                # Mechanical power regenerated: P = (Torque * RPM * 2*pi)/60
                rpm = (current_speed_kmh / 3.6 / 0.485) * 5.2 * (60.0 / 6.283)
                regen_power_kw = (regen_torque_nm * rpm * 0.1047) / 1000.0 * 0.88 # 88% capture efficiency
                regen_current_a = (regen_power_kw * 1000.0) / 650.0
                self.total_regen_energy_kwh += (regen_power_kw * (dt_seconds / 3600.0))
            else:
                regen_torque_nm = 0.0
                regen_power_kw = 0.0
                regen_current_a = 0.0
                regen_active = False

            # Friction braking kicks in progressively beyond 25% pedal or when regen saturated
            friction_demand = max(0.0, (pedal_norm - 0.20) / 0.80)
            friction_brake_kn = friction_demand * self.max_friction_brake_kn

            # Heavy braking triggers ABS / ESC
            abs_active = pedal_norm > 0.85
            esc_active = abs_active

        total_brake_kn = friction_brake_kn + ((regen_torque_nm * 5.2) / 0.485 / 1000.0)

        return {
            "brake_pedal_position": round(brake_pedal_pct, 1),
            "brake_pressure": round(self.air_reservoir_pressure_bar, 2),
            "brake_pressure_bar": round(self.air_reservoir_pressure_bar, 2),
            "brake_command": round(total_brake_kn, 2),
            "brake_actual": round(total_brake_kn, 2),
            "service_brake": service_brake_active,
            "regenerative_braking": regen_active,
            "regen_power": round(regen_power_kw, 2),
            "regen_power_kw": round(regen_power_kw, 2),
            "regen_current": round(regen_current_a, 1),
            "regen_torque": round(regen_torque_nm, 1),
            "regen_torque_nm": round(regen_torque_nm, 1),
            "regen_energy": round(self.total_regen_energy_kwh, 2),
            "friction_brake": round(friction_brake_kn, 2),
            "friction_brake_kn": round(friction_brake_kn, 2),
            "abs_active": abs_active,
            "esc_active": esc_active,
            "air_pressure": round(self.air_reservoir_pressure_bar, 2),
            "air_pressure_warning": air_pressure_warning
        }
