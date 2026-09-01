"""
Thermal Management System Controller ECU
Models dual coolant circuits (Battery loop & Powertrain loop), radiator heat exchange, and pump/fan loads.
"""

from typing import Dict, Any

class ThermalController:
    def __init__(self, ambient_temp_c: float = 34.5):
        self.ambient_temp_c = ambient_temp_c
        self.battery_coolant_temp_c = 26.5
        self.motor_coolant_temp_c = 48.2
        self.inverter_coolant_temp_c = 44.1
        self.radiator_temp_c = 38.5
        self.coolant_level_pct = 92.0
        self.coolant_pressure_bar = 1.45
        self.coolant_pump_speed_pct = 55.0
        self.coolant_pump_power_kw = 0.45
        self.radiator_fan_speed_pct = 40.0
        self.radiator_fan_power_kw = 0.55
        self.thermal_state = "ACTIVE_COOLING"
        self.thermal_warning = False
        self.thermal_fault = False

    def step(self,
             battery_temp_c: float,
             motor_temp_c: float,
             inverter_temp_c: float,
             ambient_temp_c: float = 34.5,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Adjusts pump and fan speeds to regulate coolant temperatures.
        """
        self.ambient_temp_c = ambient_temp_c

        # Battery loop target: 25-32°C
        if battery_temp_c > 33.0:
            self.battery_coolant_temp_c = max(22.0, self.battery_coolant_temp_c - (0.1 * dt_seconds))
            pump_target = 80.0
        else:
            self.battery_coolant_temp_c = min(30.0, self.battery_coolant_temp_c + (0.05 * dt_seconds))
            pump_target = 45.0

        # Powertrain loop target: 40-60°C
        max_pt_temp = max(motor_temp_c, inverter_temp_c)
        if max_pt_temp > 65.0:
            fan_target = 90.0
            self.motor_coolant_temp_c = max(38.0, self.motor_coolant_temp_c - (0.15 * dt_seconds))
        else:
            fan_target = 35.0
            self.motor_coolant_temp_c = min(52.0, self.motor_coolant_temp_c + (0.08 * dt_seconds))

        self.inverter_coolant_temp_c = round(self.motor_coolant_temp_c - 4.1, 1)
        self.radiator_temp_c = round((self.battery_coolant_temp_c + self.motor_coolant_temp_c) / 2.0, 1)

        # Smooth fan and pump ramp
        self.coolant_pump_speed_pct += (pump_target - self.coolant_pump_speed_pct) * 0.1
        self.radiator_fan_speed_pct += (fan_target - self.radiator_fan_speed_pct) * 0.1

        self.coolant_pump_power_kw = round((self.coolant_pump_speed_pct / 100.0) * 0.85, 2)
        self.radiator_fan_power_kw = round((self.radiator_fan_speed_pct / 100.0) * 1.20, 2)
        total_aux_cooling_kw = round(self.coolant_pump_power_kw + self.radiator_fan_power_kw, 2)

        self.thermal_warning = (battery_temp_c > 52.0 or motor_temp_c > 115.0 or inverter_temp_c > 105.0)
        self.thermal_fault = (battery_temp_c > 62.0 or motor_temp_c > 130.0 or inverter_temp_c > 120.0)

        return {
            "battery_coolant_temperature": round(self.battery_coolant_temp_c, 1),
            "bat_coolant_temp": round(self.battery_coolant_temp_c, 1),
            "motor_coolant_temperature": round(self.motor_coolant_temp_c, 1),
            "motor_coolant_temp": round(self.motor_coolant_temp_c, 1),
            "inverter_coolant_temperature": round(self.inverter_coolant_temp_c, 1),
            "coolant_level": round(self.coolant_level_pct, 1),
            "coolant_pressure": round(self.coolant_pressure_bar, 2),
            "coolant_pressure_bar": round(self.coolant_pressure_bar, 2),
            "coolant_pump_speed": round(self.coolant_pump_speed_pct, 1),
            "coolant_pump_power": self.coolant_pump_power_kw,
            "radiator_temperature": round(self.radiator_temp_c, 1),
            "radiator_fan_speed": round(self.radiator_fan_speed_pct, 1),
            "radiator_fan_power": self.radiator_fan_power_kw,
            "aux_power_kw": total_aux_cooling_kw,
            "auxiliary_power": total_aux_cooling_kw + 1.2, # includes steer pump, lighting
            "thermal_management_state": self.thermal_state,
            "thermal_warning": self.thermal_warning,
            "thermal_fault": self.thermal_fault
        }
