"""
Charger & DC-DC Converter ECU
Models CCS2 DC Fast Charging (CC-CV curve), inlet pin temperatures, and 24V Low Voltage DC-DC buck conversion.
"""

from typing import Dict, Any

class ChargerECU:
    def __init__(self, max_charge_power_kw: float = 150.0):
        self.max_charge_power_kw = max_charge_power_kw
        self.charger_connected = False
        self.charging_state = "STANDBY" # STANDBY, NEGOTIATING, CONSTANT_CURRENT, CONSTANT_VOLTAGE, COMPLETED, FAULT
        self.charging_mode = "DC_FAST_150KW"
        self.charger_voltage_v = 0.0
        self.charger_current_a = 0.0
        self.charger_power_kw = 0.0
        self.session_energy_kwh = 0.0
        self.session_duration_s = 0
        self.session_id = "CHG-SESSION-000"
        self.charge_start_soc = 20.0
        self.charge_target_soc = 95.0
        self.connector_temp_c = 31.0
        self.charger_temp_c = 32.4
        self.charging_fault = False
        self.charging_warning = False

        # 24V Low Voltage Auxiliary DC-DC Converter
        self.lv_voltage_v = 27.6
        self.lv_current_a = 4.2
        self.lv_soc_pct = 94.0
        self.dc_dc_output_v = 27.8
        self.dc_dc_current_a = 62.5
        self.dc_dc_power_kw = 1.74
        self.cumulative_aux_energy_kwh = 3.82

        # Faults
        self.fault_charger_overtemp = False

    def step(self,
             battery_voltage_v: float,
             battery_soc_pct: float,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Processes charging curves and 24V auxiliary power conversion.
        """
        if not self.charger_connected:
            self.charging_state = "STANDBY"
            self.charger_voltage_v = 0.0
            self.charger_current_a = 0.0
            self.charger_power_kw = 0.0
            self.connector_temp_c = max(28.0, self.connector_temp_c - (0.05 * dt_seconds))
        else:
            self.session_duration_s += int(dt_seconds)

            if battery_soc_pct >= self.charge_target_soc:
                self.charging_state = "COMPLETED"
                self.charger_current_a = 0.0
                self.charger_power_kw = 0.0
                self.charger_voltage_v = battery_voltage_v
            elif battery_soc_pct < 80.0:
                # Constant Current (CC) Phase: Max current delivered
                self.charging_state = "CONSTANT_CURRENT"
                self.charger_voltage_v = battery_voltage_v + 4.5
                # Up to 200A or power limit
                self.charger_power_kw = min(self.max_charge_power_kw, (self.charger_voltage_v * 200.0) / 1000.0)
                self.charger_current_a = (self.charger_power_kw * 1000.0) / self.charger_voltage_v
                self.connector_temp_c = min(58.0, self.connector_temp_c + (0.12 * dt_seconds))
            else:
                # Constant Voltage (CV) Phase: Current tapers linearly down to 10A
                self.charging_state = "CONSTANT_VOLTAGE"
                taper_ratio = max(0.05, (self.charge_target_soc - battery_soc_pct) / 15.0)
                self.charger_voltage_v = battery_voltage_v + 1.2
                self.charger_current_a = 200.0 * taper_ratio
                self.charger_power_kw = (self.charger_voltage_v * self.charger_current_a) / 1000.0
                self.connector_temp_c = max(38.0, self.connector_temp_c - (0.04 * dt_seconds))

            self.session_energy_kwh += (self.charger_power_kw * (dt_seconds / 3600.0))

        if self.fault_charger_overtemp:
            self.connector_temp_c = 96.5
            self.charging_fault = True
            self.charging_state = "FAULT"
            self.charger_current_a = 0.0
            self.charger_power_kw = 0.0

        # DC-DC Low Voltage conversion: Powers 24V bus from HV battery
        self.dc_dc_power_kw = (self.dc_dc_output_v * self.dc_dc_current_a) / 1000.0
        self.cumulative_aux_energy_kwh += (self.dc_dc_power_kw * (dt_seconds / 3600.0))

        return {
            "charger_connected": self.charger_connected,
            "charging_state": self.charging_state,
            "charging_mode": self.charging_mode,
            "charger_voltage": round(self.charger_voltage_v, 1),
            "charger_current": round(self.charger_current_a, 1),
            "charger_power": round(self.charger_power_kw, 2),
            "charging_energy": round(self.session_energy_kwh, 2),
            "charging_duration": self.session_duration_s,
            "charging_session_id": self.session_id,
            "charge_start_soc": self.charge_start_soc,
            "charge_target_soc": self.charge_target_soc,
            "charge_current_limit": 200.0,
            "charge_power_limit": self.max_charge_power_kw,
            "charger_temperature": round(self.charger_temp_c, 1),
            "connector_temperature": round(self.connector_temp_c, 1),
            "charging_fault": self.charging_fault,
            "charging_warning": self.charging_warning,

            # LV / DC-DC
            "lv_battery_voltage": round(self.lv_voltage_v, 2),
            "lv_battery_current": round(self.lv_current_a, 2),
            "lv_battery_soc": round(self.lv_soc_pct, 1),
            "dc_dc_input_voltage": round(battery_voltage_v, 1),
            "dc_dc_output_voltage": round(self.dc_dc_output_v, 2),
            "dc_dc_output_v": round(self.dc_dc_output_v, 2),
            "dc_dc_current": round(self.dc_dc_current_a, 1),
            "dc_dc_power": round(self.dc_dc_power_kw, 2),
            "dc_dc_power_kw": round(self.dc_dc_power_kw, 2),
            "auxiliary_energy_total": round(self.cumulative_aux_energy_kwh, 2)
        }
