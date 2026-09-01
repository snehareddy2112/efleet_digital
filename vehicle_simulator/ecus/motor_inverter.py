"""
Motor & Inverter ECU Models for 250 kW Permanent Magnet Synchronous Motor (PMSM) & SiC Inverter
Models electromechanical conversion, power, efficiency, thermal heating, and AC/DC waveforms.
"""

import math
from typing import Dict, Any

class MotorInverterECU:
    def __init__(self, max_power_kw: float = 250.0, max_rpm: int = 6000):
        self.max_power_kw = max_power_kw
        self.max_rpm = max_rpm

        # Motor thermal state
        self.motor_temp_c = 64.2
        self.stator_temp_c = 66.8
        self.rotor_temp_c = 61.5
        self.controller_temp_c = 48.2
        self.motor_state = 2 # 2 = Enabled / Running
        self.motor_fault = False

        # Inverter thermal & status
        self.inverter_temp_c = 49.5
        self.inverter_fault = False
        self.inverter_warning = False
        self.inverter_enable = True

        # Fault flags
        self.fault_motor_temp = False
        self.fault_inverter_temp = False
        self.fault_inverter_trip = False

    def step(self,
             command_torque_nm: float,
             motor_rpm: int,
             dc_bus_voltage_v: float,
             regen_torque_nm: float = 0.0,
             coolant_temp_c: float = 45.0,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Calculates electrical power draw / generation, AC phase current, efficiency, and component heating.
        """
        # Determine actual delivered torque (drive torque or negative regen torque)
        if regen_torque_nm > 0:
            actual_torque_nm = -min(regen_torque_nm, 1500.0)
        else:
            actual_torque_nm = max(0.0, command_torque_nm)

        # Angular velocity
        omega_rad_s = (motor_rpm * 2.0 * math.pi) / 60.0

        # Shaft mechanical power: P = Torque * omega (Watts)
        mech_power_kw = (actual_torque_nm * omega_rad_s) / 1000.0

        # Efficiency curve (high efficiency around 2000-4000 RPM and 30-80% load)
        rpm_ratio = min(1.0, motor_rpm / float(self.max_rpm))
        load_ratio = min(1.0, abs(actual_torque_nm) / 2500.0)
        base_eff = 0.95
        motor_efficiency = max(0.80, min(0.97, base_eff - (0.05 * (1.0 - load_ratio)**2) - (0.03 * rpm_ratio**2)))
        inverter_efficiency = max(0.92, min(0.985, 0.98 - (0.02 * (1.0 - load_ratio))))

        # Electrical DC power demand from battery
        if mech_power_kw >= 0:
            # Driving mode: DC power = Mech power / (Motor_eff * Inv_eff)
            inverter_dc_power_kw = mech_power_kw / max(0.5, (motor_efficiency * inverter_efficiency)) if mech_power_kw > 0.1 else 0.4
        else:
            # Regeneration mode: DC power = Mech power * (Motor_eff * Inv_eff) (negative = returns to battery)
            inverter_dc_power_kw = mech_power_kw * (motor_efficiency * inverter_efficiency)

        # DC Bus current
        inverter_dc_current_a = (inverter_dc_power_kw * 1000.0) / max(400.0, dc_bus_voltage_v)

        # AC Electrical phase calculations
        ac_voltage_rms = min(460.0, (dc_bus_voltage_v / math.sqrt(2)) * min(1.0, (motor_rpm / 4500.0) + 0.1))
        ac_freq_hz = (motor_rpm * 4) / 60.0  # 8-pole PMSM (4 pole pairs)
        ac_current_rms = abs(inverter_dc_current_a) * 0.98 if abs(inverter_dc_current_a) > 0.5 else 0.0

        # Thermal heating
        # Losses in motor and inverter
        motor_loss_kw = abs(mech_power_kw - (inverter_dc_power_kw * inverter_efficiency))
        inverter_loss_kw = abs(inverter_dc_power_kw * (1.0 - inverter_efficiency))

        # Motor cooling & heating
        motor_heat_rise = (motor_loss_kw * 40.0 - (self.motor_temp_c - coolant_temp_c) * 15.0) * (dt_seconds / 2500.0)
        self.motor_temp_c += motor_heat_rise
        self.stator_temp_c = round(self.motor_temp_c + (motor_loss_kw * 1.2), 1)
        self.rotor_temp_c = round(self.motor_temp_c - 1.8, 1)

        # Inverter cooling & heating
        inverter_heat_rise = (inverter_loss_kw * 60.0 - (self.inverter_temp_c - coolant_temp_c) * 20.0) * (dt_seconds / 1500.0)
        self.inverter_temp_c += inverter_heat_rise
        self.controller_temp_c = round(self.inverter_temp_c - 2.5, 1)

        # Apply fault overrides
        if self.fault_motor_temp:
            self.motor_temp_c = max(self.motor_temp_c, 135.0)
            self.stator_temp_c = 142.0
            self.motor_fault = True
        if self.fault_inverter_temp:
            self.inverter_temp_c = max(self.inverter_temp_c, 118.0)
            self.inverter_warning = True
        if self.fault_inverter_trip:
            self.inverter_fault = True
            self.inverter_enable = False
            inverter_dc_power_kw = 0.0
            inverter_dc_current_a = 0.0

        return {
            # Motor signals
            "motor_rpm": motor_rpm,
            "motor_speed": round(omega_rad_s, 2),
            "motor_torque": round(actual_torque_nm, 1),
            "motor_actual_torque": round(actual_torque_nm, 1),
            "motor_command_torque": round(command_torque_nm, 1),
            "motor_power": round(mech_power_kw, 2),
            "motor_voltage": round(ac_voltage_rms, 1),
            "motor_current": round(ac_current_rms, 1),
            "motor_temperature": round(self.motor_temp_c, 1),
            "motor_stator_temperature": round(self.stator_temp_c, 1),
            "motor_rotor_temperature": round(self.rotor_temp_c, 1),
            "motor_controller_temperature": round(self.controller_temp_c, 1),
            "motor_efficiency": round(motor_efficiency * 100.0, 1),
            "motor_direction": "FORWARD" if actual_torque_nm >= 0 else "REGEN",
            "motor_state": self.motor_state,
            "motor_fault": self.motor_fault,

            # Inverter signals
            "inverter_dc_voltage": round(dc_bus_voltage_v, 1),
            "inverter_dc_current": round(inverter_dc_current_a, 1),
            "inverter_dc_power": round(inverter_dc_power_kw, 2),
            "inverter_ac_voltage": round(ac_voltage_rms, 1),
            "inverter_ac_current": round(ac_current_rms, 1),
            "inverter_ac_frequency": round(ac_freq_hz, 1),
            "inverter_temperature": round(self.inverter_temp_c, 1),
            "inverter_power": round(inverter_dc_power_kw, 2),
            "inverter_efficiency": round(inverter_efficiency * 100.0, 1),
            "inverter_state": "TRIPPED" if self.inverter_fault else "ENABLED",
            "inverter_enable": self.inverter_enable,
            "inverter_fault": self.inverter_fault,
            "inverter_warning": self.inverter_warning
        }
