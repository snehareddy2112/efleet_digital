"""
Dual-Zone HVAC ECU Simulation
Models cabin thermal equilibrium, ambient solar loads, inverter compressor, blower fan, and energy consumption.
"""

from typing import Dict, Any

class HVACECU:
    def __init__(self, target_temp_c: float = 22.0, ambient_temp_c: float = 34.5):
        self.target_temp_c = target_temp_c
        self.ambient_temp_c = ambient_temp_c
        self.cabin_temp_c = 23.8
        self.driver_zone_temp_c = 23.2
        self.passenger_zone_temp_c = 24.1
        self.evaporator_temp_c = 4.5
        self.condenser_temp_c = 42.8
        self.chiller_coolant_temp_c = 12.4

        self.ac_enabled = True
        self.heater_enabled = False
        self.compressor_status = True
        self.hvac_mode = "AUTO_COOL" # AUTO_COOL, AUTO_HEAT, VENT, OFF
        self.compressor_speed_rpm = 3400
        self.compressor_power_kw = 4.6
        self.blower_speed_pct = 65.0
        self.blower_power_kw = 0.55
        self.cumulative_energy_kwh = 8.4

        # Faults
        self.fault_compressor = False

    def step(self, passenger_count: int = 38, ambient_temp_c: float = 34.5, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Advances the cabin thermodynamic model and calculates electrical power load.
        """
        self.ambient_temp_c = ambient_temp_c

        if not self.ac_enabled and not self.heater_enabled:
            self.compressor_status = False
            self.compressor_speed_rpm = 0
            self.compressor_power_kw = 0.0
            self.blower_speed_pct = 20.0
            self.blower_power_kw = 0.15
            # Cabin slowly drifts toward ambient
            self.cabin_temp_c += (self.ambient_temp_c - self.cabin_temp_c) * (0.005 * dt_seconds)
        else:
            # Temperature error
            temp_error = self.cabin_temp_c - self.target_temp_c

            if temp_error > 0.5:
                # Cooling needed
                self.compressor_status = True
                self.hvac_mode = "AUTO_COOL"
                comp_ratio = min(1.0, max(0.2, temp_error / 5.0))
                self.compressor_speed_rpm = int(1200 + (comp_ratio * 4000))
                # Compressor power: 1.5 kW base up to 7.5 kW under heavy heat/passenger load
                passenger_heat_kw = passenger_count * 0.08  # ~80W per person
                solar_load_kw = 2.5
                self.compressor_power_kw = round(1.8 + (comp_ratio * 4.8) + (passenger_heat_kw * 0.3), 2)
                self.blower_speed_pct = round(40.0 + (comp_ratio * 55.0), 1)
                self.blower_power_kw = round(0.2 + (self.blower_speed_pct / 100.0) * 0.6, 2)

                # Cooling effect on cabin
                cooling_rate = (self.compressor_power_kw * 1.8 - passenger_heat_kw - solar_load_kw) * (0.008 * dt_seconds)
                self.cabin_temp_c = max(18.0, self.cabin_temp_c - cooling_rate)
            else:
                # Temperature satisfied, modulate lower
                self.compressor_speed_rpm = 1500
                self.compressor_power_kw = 1.6
                self.blower_speed_pct = 35.0
                self.blower_power_kw = 0.25
                self.cabin_temp_c += (self.ambient_temp_c - self.cabin_temp_c) * (0.002 * dt_seconds)

        if self.fault_compressor:
            self.compressor_status = False
            self.compressor_power_kw = 0.0
            self.compressor_speed_rpm = 0

        total_hvac_power_kw = self.compressor_power_kw + self.blower_power_kw
        self.cumulative_energy_kwh += total_hvac_power_kw * (dt_seconds / 3600.0)

        self.driver_zone_temp_c = round(self.cabin_temp_c - 0.6, 1)
        self.passenger_zone_temp_c = round(self.cabin_temp_c + 0.3, 1)
        self.evaporator_temp_c = round(3.5 + (0.5 if self.compressor_status else 15.0), 1)
        self.condenser_temp_c = round(self.ambient_temp_c + (8.0 if self.compressor_status else 0.0), 1)

        return {
            "cabin_temperature": round(self.cabin_temp_c, 2),
            "cabin_temp": round(self.cabin_temp_c, 2),
            "outside_temperature": round(self.ambient_temp_c, 2),
            "ambient_temp": round(self.ambient_temp_c, 2),
            "target_cabin_temperature": self.target_temp_c,
            "target_cabin_temp": self.target_temp_c,
            "hvac_mode": self.hvac_mode,
            "ac_status": self.ac_enabled,
            "heater_status": self.heater_enabled,
            "compressor_status": self.compressor_status,
            "compressor_speed": self.compressor_speed_rpm,
            "compressor_power": self.compressor_power_kw,
            "blower_speed": self.blower_speed_pct,
            "blower_power": self.blower_power_kw,
            "evaporator_temperature": self.evaporator_temp_c,
            "condenser_temperature": self.condenser_temp_c,
            "coolant_temperature": self.chiller_coolant_temp_c,
            "driver_zone_temperature": self.driver_zone_temp_c,
            "passenger_zone_temperature": self.passenger_zone_temp_c,
            "hvac_power_kw": round(total_hvac_power_kw, 2),
            "hvac_energy_consumption": round(self.cumulative_energy_kwh, 2)
        }
