"""
Battery Management System (BMS) for Dual 160 kWh LFP Battery Packs (Pack A & Pack B)
Models cell-level voltage gradients, internal resistance, thermal behavior, contactors, and balancing.
"""

import math
from typing import Dict, Any, List

class BatteryPack:
    def __init__(self,
                 pack_id: str = "BAT-001-A",
                 capacity_kwh: float = 160.0,
                 nominal_voltage_v: float = 650.0,
                 cell_count: int = 200,
                 initial_soc_pct: float = 82.4,
                 soh_pct: float = 98.5):
        self.pack_id = pack_id
        self.capacity_kwh = capacity_kwh
        self.nominal_voltage_v = nominal_voltage_v
        self.cell_count = cell_count
        self.capacity_ah = (capacity_kwh * 1000.0) / nominal_voltage_v  # ~246.15 Ah
        self.soc_pct = initial_soc_pct
        self.soh_pct = soh_pct
        self.internal_resistance_ohm = 0.075

        # Thermal state
        self.temperature_c = 29.8
        self.min_temperature_c = 28.5
        self.max_temperature_c = 31.2

        # Contactors
        self.contactor_positive = True
        self.contactor_negative = True
        self.precharge_contactor = False

        # Status & Limits
        self.bms_state = 1  # 1 = Operational
        self.bms_fault = False
        self.bms_warning = False
        self.isolation_resistance_kohm = 2450.0

        # Energy counters
        self.energy_remaining_kwh = (self.soc_pct / 100.0) * self.capacity_kwh
        self.energy_consumed_kwh = 28.16
        self.energy_charged_kwh = 3.42

        # Real-time electrical
        self.voltage_v = nominal_voltage_v
        self.current_a = 0.0
        self.power_kw = 0.0
        self.cell_balancing_active = False

        # Fault override
        self.fault_over_temp = False
        self.fault_over_voltage = False
        self.fault_under_voltage = False
        self.fault_over_current = False

        # Limits & Cell Metrics
        self.charge_current_limit = 200.0
        self.discharge_current_limit = 350.0
        self.charge_power_limit = 130.0
        self.discharge_power_limit = 220.0
        self.cell_min_v = 3.285
        self.cell_max_v = 3.305
        self.cell_voltage_delta_mv = 20.0

    def get_open_circuit_voltage(self) -> float:
        """LFP open circuit voltage curve based on SOC"""
        # Nominal LFP cell OCV ranges from 3.10V (empty) to 3.35V (nominal) to 3.45V (full)
        soc = max(0.0, min(100.0, self.soc_pct)) / 100.0
        cell_ocv = 3.05 + (0.35 * (soc ** 0.4)) + (0.05 * (soc ** 4))
        return cell_ocv * self.cell_count

    def step(self, current_demand_a: float, ambient_temp_c: float = 32.0, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Advances the battery pack electrical & thermal state for dt_seconds.
        Positive current = discharging, Negative current = charging/regen.
        """
        # Check contactors
        if not (self.contactor_positive and self.contactor_negative):
            self.current_a = 0.0
            self.power_kw = 0.0
            self.voltage_v = self.get_open_circuit_voltage()
            return self.get_telemetry()

        self.current_a = current_demand_a

        # Coulomb counting
        ah_delta = (self.current_a * dt_seconds) / 3600.0
        soc_delta = (ah_delta / self.capacity_ah) * 100.0
        self.soc_pct = max(0.0, min(100.0, self.soc_pct - soc_delta))

        # Energy tracking
        ocv = self.get_open_circuit_voltage()
        # Terminal voltage with IR drop: V = Vocv - I * R
        self.voltage_v = max(450.0, min(750.0, ocv - (self.current_a * self.internal_resistance_ohm)))
        self.power_kw = (self.voltage_v * self.current_a) / 1000.0

        if self.current_a > 0:
            self.energy_consumed_kwh += (self.power_kw * (dt_seconds / 3600.0))
        elif self.current_a < 0:
            self.energy_charged_kwh += (abs(self.power_kw) * (dt_seconds / 3600.0))

        self.energy_remaining_kwh = (self.soc_pct / 100.0) * self.capacity_kwh

        # Joule heating: Q_gen = I^2 * R
        heat_gen_w = (self.current_a ** 2) * self.internal_resistance_ohm
        heat_dissipation_w = (self.temperature_c - ambient_temp_c) * 45.0  # Coolant flow transfer
        net_heat_w = heat_gen_w - heat_dissipation_w
        temp_delta = (net_heat_w * dt_seconds) / (1200.0 * 900.0)  # ~1200kg thermal mass
        self.temperature_c += temp_delta

        # Apply fault injections if active
        if self.fault_over_temp:
            self.temperature_c = max(self.temperature_c, 62.5)
            self.bms_warning = True
        if self.fault_over_voltage:
            self.voltage_v = 745.0
            self.bms_warning = True
        if self.fault_under_voltage:
            self.voltage_v = 460.0
            self.bms_warning = True
        if self.fault_over_current:
            self.current_a = 420.0
            self.bms_warning = True

        self.min_temperature_c = round(self.temperature_c - 1.3, 1)
        self.max_temperature_c = round(self.temperature_c + 1.4, 1)

        # Cell min/max voltages
        avg_cell_v = self.voltage_v / self.cell_count
        cell_delta_mv = 18.0 + (abs(self.current_a) * 0.05)
        self.cell_min_v = round(avg_cell_v - (cell_delta_mv / 2000.0), 3)
        self.cell_max_v = round(avg_cell_v + (cell_delta_mv / 2000.0), 3)
        self.cell_voltage_delta_mv = round(cell_delta_mv, 1)

        # Cell balancing active during light load / high SOC
        self.cell_balancing_active = (self.soc_pct > 80.0 and abs(self.current_a) < 15.0 and cell_delta_mv > 15.0)

        # Dynamic discharge / charge limits
        if self.temperature_c > 55.0:
            self.charge_current_limit = 50.0
            self.discharge_current_limit = 100.0
        elif self.soc_pct > 90.0:
            self.charge_current_limit = 75.0
            self.discharge_current_limit = 350.0
        elif self.soc_pct < 10.0:
            self.charge_current_limit = 200.0
            self.discharge_current_limit = 100.0
        else:
            self.charge_current_limit = 200.0
            self.discharge_current_limit = 350.0

        return self.get_telemetry()

    def get_telemetry(self) -> Dict[str, Any]:
        pfx = "pack_a" if (self.pack_id.upper().endswith("-A") or self.pack_id.upper().endswith("_A") or "BAT-A" in self.pack_id.upper() or "PACK_A" in self.pack_id.upper()) else "pack_b"
        return {
            f"{pfx}_soc": round(self.soc_pct, 2),
            f"{pfx}_soh": round(self.soh_pct, 1),
            f"{pfx}_voltage": round(self.voltage_v, 1),
            f"{pfx}_current": round(self.current_a, 1),
            f"{pfx}_power": round(self.power_kw, 2),
            f"{pfx}_energy_remaining": round(self.energy_remaining_kwh, 2),
            f"{pfx}_energy_consumed": round(self.energy_consumed_kwh, 2),
            f"{pfx}_energy_charged": round(self.energy_charged_kwh, 2),
            f"{pfx}_temperature": round(self.temperature_c, 1),
            f"{pfx}_min_temperature": round(self.min_temperature_c, 1),
            f"{pfx}_max_temperature": round(self.max_temperature_c, 1),
            f"{pfx}_avg_temperature": round(self.temperature_c, 1),
            f"{pfx}_cell_min_voltage": self.cell_min_v,
            f"{pfx}_cell_max_voltage": self.cell_max_v,
            f"{pfx}_cell_voltage_delta": self.cell_voltage_delta_mv,
            f"{pfx}_charge_current_limit": self.charge_current_limit,
            f"{pfx}_discharge_current_limit": self.discharge_current_limit,
            f"{pfx}_charge_power_limit": round((self.voltage_v * self.charge_current_limit) / 1000.0, 1),
            f"{pfx}_discharge_power_limit": round((self.voltage_v * self.discharge_current_limit) / 1000.0, 1),
            f"{pfx}_contactor_positive": self.contactor_positive,
            f"{pfx}_contactor_negative": self.contactor_negative,
            f"{pfx}_precharge_contactor": self.precharge_contactor,
            f"{pfx}_bms_state": self.bms_state,
            f"{pfx}_bms_fault": self.bms_fault,
            f"{pfx}_bms_warning": self.bms_warning,
            f"{pfx}_isolation_resistance": self.isolation_resistance_kohm
        }


class CombinedBMS:
    """
    Combines independent Battery Pack A and Battery Pack B into high-voltage dual-pack master metrics.
    """
    def __init__(self, pack_a: BatteryPack, pack_b: BatteryPack):
        self.pack_a = pack_a
        self.pack_b = pack_b

    def step(self, total_current_demand_a: float, ambient_temp_c: float = 32.0, dt_seconds: float = 1.0) -> Dict[str, Any]:
        # Split current demand between Pack A and Pack B based on internal impedance and balance
        current_a = total_current_demand_a * 0.502
        current_b = total_current_demand_a * 0.498

        data_a = self.pack_a.step(current_a, ambient_temp_c, dt_seconds)
        data_b = self.pack_b.step(current_b, ambient_temp_c, dt_seconds)

        total_soc = round((self.pack_a.soc_pct + self.pack_b.soc_pct) / 2.0, 2)
        total_soh = round((self.pack_a.soh_pct + self.pack_b.soh_pct) / 2.0, 1)
        effective_v = round((self.pack_a.voltage_v + self.pack_b.voltage_v) / 2.0, 1)
        total_i = round(self.pack_a.current_a + self.pack_b.current_a, 1)
        total_p = round((effective_v * total_i) / 1000.0, 2)

        total_energy_rem = round(self.pack_a.energy_remaining_kwh + self.pack_b.energy_remaining_kwh, 2)
        total_energy_cons = round(self.pack_a.energy_consumed_kwh + self.pack_b.energy_consumed_kwh, 2)
        total_energy_chg = round(self.pack_a.energy_charged_kwh + self.pack_b.energy_charged_kwh, 2)

        v_delta = round(abs(self.pack_a.voltage_v - self.pack_b.voltage_v), 2)
        i_balance = round(self.pack_a.current_a / max(0.1, abs(self.pack_b.current_a)), 3) if self.pack_b.current_a != 0 else 1.0

        return {
            **data_a,
            **data_b,
            "total_battery_soc": total_soc,
            "total_battery_soh": total_soh,
            "total_battery_voltage": effective_v,
            "total_battery_current": total_i,
            "total_battery_power": total_p,
            "total_energy_remaining": total_energy_rem,
            "total_energy_consumed": total_energy_cons,
            "total_energy_charged": total_energy_chg,
            "available_discharge_power": round(self.pack_a.discharge_power_limit + self.pack_b.discharge_power_limit, 1),
            "available_charge_power": round(self.pack_a.charge_power_limit + self.pack_b.charge_power_limit, 1),
            "battery_temperature": round((self.pack_a.temperature_c + self.pack_b.temperature_c) / 2.0, 1),
            "battery_min_temperature": min(self.pack_a.min_temperature_c, self.pack_b.min_temperature_c),
            "battery_max_temperature": max(self.pack_a.max_temperature_c, self.pack_b.max_temperature_c),
            "battery_voltage_delta": v_delta,
            "battery_current_balance": i_balance,
            "battery_power_balance": round(self.pack_a.power_kw / max(0.1, abs(self.pack_b.power_kw)), 3) if self.pack_b.power_kw != 0 else 1.0,
            "battery_system_state": "FAULT" if (self.pack_a.bms_fault or self.pack_b.bms_fault) else "OPERATIONAL",
            "battery_system_warning": self.pack_a.bms_warning or self.pack_b.bms_warning,
            "battery_system_fault": self.pack_a.bms_fault or self.pack_b.bms_fault
        }
