"""
BusSimulator: Complete Electric Bus Digital Twin Simulator
Orchestrates vehicle physics, multi-ECU controllers, scenario drivers, fault injections, and CAN frame broadcast.
Configurable for BUS-001 through BUS-100 without code duplication.
"""

import time
import math
from typing import Dict, Any, List, Optional
import threading

from .physics import VehiclePhysics
from .route import RouteSimulator
from .ecus.bms import BatteryPack, CombinedBMS
from .ecus.vcu import VCU
from .ecus.motor_inverter import MotorInverterECU
from .ecus.brakes import BrakeECU
from .ecus.hvac import HVACECU
from .ecus.charger import ChargerECU
from .ecus.thermal import ThermalController
from .ecus.safety import SafetyECU
from vehicle_network.can_bus import CANBus, encode_can_frame

class BusSimulator:
    def __init__(self, config: Optional[Dict[str, Any]] = None, can_bus: Optional[CANBus] = None):
        cfg = config or {}
        self.fleet_id = cfg.get("fleetId", "OLECTRA-E-FLEET")
        self.bus_id = cfg.get("busId", "BUS-001")
        self.vehicle_model = cfg.get("vehicleModel", "ELECTRA-12M")
        self.vehicle_variant = cfg.get("vehicleVariant", "CityTransit-LFP")
        self.tcu_id = cfg.get("tcuId", "TCU-001")
        self.vin = cfg.get("vin", "MA6OL12ME0012026")

        # CAN Network
        self.can_bus = can_bus or CANBus(f"CAN_{self.bus_id}")

        # Subsystems & ECUs
        self.physics = VehiclePhysics(
            curb_mass_kg=cfg.get("curbMassKg", 13500.0),
            max_speed_kmh=cfg.get("maxSpeedKmh", 85.0)
        )
        self.route = RouteSimulator(route_id=cfg.get("routeId", "TS-HYD-WGL-101"))

        # Dual Battery Packs A & B
        self.pack_a = BatteryPack(pack_id=f"{self.bus_id}-BAT-A", capacity_kwh=160.0, initial_soc_pct=82.4)
        self.pack_b = BatteryPack(pack_id=f"{self.bus_id}-BAT-B", capacity_kwh=160.0, initial_soc_pct=81.9)
        self.bms = CombinedBMS(self.pack_a, self.pack_b)

        self.vcu = VCU()
        self.motor_inverter = MotorInverterECU(max_power_kw=250.0)
        self.brakes = BrakeECU()
        self.hvac = HVACECU(target_temp_c=22.0)
        self.charger = ChargerECU(max_charge_power_kw=150.0)
        self.thermal = ThermalController()
        self.safety = SafetyECU()

        # Operational state & driver automation
        self.is_running = True
        self.is_paused = False
        self.sim_speed_multiplier = 1.0
        self.active_scenario = "Normal Route" # Normal Route, Heavy Acceleration, Heavy Braking, Charging, HVAC Heavy Load
        self.active_faults: Dict[str, bool] = {}

        # Driver profile variables
        self.target_driver_speed_kmh = 45.0
        self.driver_accel_pedal = 32.0
        self.driver_brake_pedal = 0.0

        # Latest raw unified vehicle state
        self.latest_state: Dict[str, Any] = {}
        self.tick_count = 0

    def set_scenario(self, scenario_name: str):
        self.active_scenario = scenario_name
        if "Charging" in scenario_name or scenario_name == "Fast Charging (150 kW)":
            self.charger.charger_connected = True
            self.driver_accel_pedal = 0.0
            self.driver_brake_pedal = 100.0
            self.vcu.gear_state = 3 # P
        elif scenario_name == "Heavy Acceleration":
            self.charger.charger_connected = False
            self.driver_accel_pedal = 85.0
            self.driver_brake_pedal = 0.0
            self.vcu.drive_mode = 2 # POWER
        elif scenario_name == "Heavy Braking":
            self.charger.charger_connected = False
            self.driver_accel_pedal = 0.0
            self.driver_brake_pedal = 75.0
        elif scenario_name == "HVAC Heavy Load":
            self.charger.charger_connected = False
            self.hvac.target_temp_c = 18.0
            self.hvac.ambient_temp_c = 42.0
        else: # Normal Route
            self.charger.charger_connected = False
            self.vcu.drive_mode = 1 # NORMAL

    def set_fault(self, fault_name: str, enabled: bool):
        self.active_faults[fault_name] = enabled

        # Map fault to specific ECU overrides
        if fault_name == "Battery Over Temperature":
            self.pack_a.fault_over_temp = enabled
            self.pack_b.fault_over_temp = enabled
        elif fault_name == "Battery Over Voltage":
            self.pack_a.fault_over_voltage = enabled
        elif fault_name == "Battery Under Voltage":
            self.pack_a.fault_under_voltage = enabled
        elif fault_name == "Battery Over Current":
            self.pack_a.fault_over_current = enabled
        elif fault_name == "BMS Fault":
            self.pack_a.bms_fault = enabled
            self.pack_b.bms_fault = enabled
        elif fault_name == "Motor Fault":
            self.motor_inverter.fault_motor_temp = enabled
        elif fault_name == "Inverter Fault":
            self.motor_inverter.fault_inverter_trip = enabled
        elif fault_name == "HVAC Fault":
            self.hvac.fault_compressor = enabled
        elif fault_name == "Charger Fault":
            self.charger.fault_charger_overtemp = enabled
        elif fault_name == "HV Isolation Fault":
            self.safety.isolation_resistance_kohm = 180.0 if enabled else 2450.0
        elif fault_name == "CAN Communication Loss":
            self.can_bus.set_bus_state(not enabled)
        elif fault_name == "GPS Loss":
            self.route.current_latitude = 0.0 if enabled else 17.3850
        elif fault_name == "TCU Fault":
            pass

    def tick(self, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Executes one discrete simulation step of the electric bus.
        Computes physical forces, electrical balances, thermal equations, and broadcasts CAN frames.
        """
        self.tick_count += 1
        curr_speed = self.physics.speed_kmh

        # 1. Update Route & Navigation
        route_state = self.route.step(curr_speed, dt_seconds)
        self.physics.passenger_count = route_state["passenger_count"]

        # 2. Driver Simulation logic based on Scenario & Stops
        if self.active_scenario == "Charging":
            self.driver_accel_pedal = 0.0
            self.driver_brake_pedal = 100.0
        elif route_state["is_at_bus_stop"]:
            # Bus stopping at passenger station
            self.driver_accel_pedal = 0.0
            self.driver_brake_pedal = 65.0
        elif self.active_scenario == "Heavy Acceleration":
            self.driver_accel_pedal = 85.0
            self.driver_brake_pedal = 0.0
        elif self.active_scenario == "Heavy Braking":
            self.driver_accel_pedal = 0.0
            self.driver_brake_pedal = 75.0
        else: # Normal cruising
            target_spd = min(route_state["speed_limit_kmh"], 55.0)
            if curr_speed < target_spd - 2.0:
                self.driver_accel_pedal = min(60.0, self.driver_accel_pedal + 5.0)
                self.driver_brake_pedal = 0.0
            elif curr_speed > target_spd + 2.0:
                self.driver_accel_pedal = 0.0
                self.driver_brake_pedal = min(40.0, self.driver_brake_pedal + 5.0)
            else:
                self.driver_accel_pedal = 22.0
                self.driver_brake_pedal = 0.0

        # 3. Safety ECU
        safety_state = self.safety.step(curr_speed, route_state["is_at_bus_stop"], dt_seconds)

        # 4. VCU Processing
        has_crit_fault = safety_state["emergency_stop"] or not safety_state["hv_interlock_ok"]
        vcu_state = self.vcu.step(
            accelerator_pos_pct=self.driver_accel_pedal,
            brake_pedal_pos_pct=self.driver_brake_pedal,
            current_speed_kmh=curr_speed,
            is_charging=self.charger.charger_connected,
            has_critical_fault=has_crit_fault,
            dt_seconds=dt_seconds
        )

        # 5. Brake ECU Processing (Regen & Friction)
        brake_state = self.brakes.step(
            brake_pedal_pct=self.driver_brake_pedal,
            current_speed_kmh=curr_speed,
            battery_soc_pct=self.bms.pack_a.soc_pct,
            allow_regen=not self.charger.charger_connected,
            dt_seconds=dt_seconds
        )

        # 6. Motor & Inverter Processing
        motor_state = self.motor_inverter.step(
            command_torque_nm=vcu_state["torque_request"],
            motor_rpm=self.physics.motor_rpm,
            dc_bus_voltage_v=self.bms.pack_a.voltage_v,
            regen_torque_nm=brake_state["regen_torque"],
            coolant_temp_c=self.thermal.motor_coolant_temp_c,
            dt_seconds=dt_seconds
        )

        # 7. Vehicle Physics Dynamics Engine Step
        phys_state = self.physics.step(
            motor_torque_nm=motor_state["motor_actual_torque"],
            brake_force_kn=brake_state["friction_brake"],
            road_gradient_pct=route_state["road_gradient_pct"],
            dt_seconds=dt_seconds
        )

        # 8. HVAC ECU Processing
        hvac_state = self.hvac.step(
            passenger_count=route_state["passenger_count"],
            ambient_temp_c=34.5,
            dt_seconds=dt_seconds
        )

        # 9. Charger / DC-DC Converter Processing
        charger_state = self.charger.step(
            battery_voltage_v=self.bms.pack_a.voltage_v,
            battery_soc_pct=self.bms.pack_a.soc_pct,
            dt_seconds=dt_seconds
        )

        # 10. Thermal Controller Processing
        thermal_state = self.thermal.step(
            battery_temp_c=self.bms.pack_a.temperature_c,
            motor_temp_c=motor_state["motor_temperature"],
            inverter_temp_c=motor_state["inverter_temperature"],
            ambient_temp_c=34.5,
            dt_seconds=dt_seconds
        )

        # 11. Battery Current Balance: Traction Motor + HVAC + 24V Aux DC-DC - Charging
        traction_current_a = motor_state["inverter_dc_current"]
        hvac_current_a = (hvac_state["hvac_power_kw"] * 1000.0) / max(400.0, self.bms.pack_a.voltage_v)
        aux_current_a = (thermal_state["auxiliary_power"] * 1000.0) / max(400.0, self.bms.pack_a.voltage_v)
        chg_current_a = charger_state["charger_current"]

        total_battery_current_demand = traction_current_a + hvac_current_a + aux_current_a - chg_current_a

        # 12. Battery BMS Step
        bms_state = self.bms.step(total_battery_current_demand, ambient_temp_c=34.5, dt_seconds=dt_seconds)

        # 13. Energy & Efficiency Calculations
        total_kwh_consumed = bms_state["total_energy_consumed"]
        trip_km = max(0.1, vcu_state["trip_distance"])
        kwh_per_km = round(total_kwh_consumed / trip_km, 2)
        est_range_km = round((bms_state["total_energy_remaining"] / max(0.6, kwh_per_km)), 1)

        # 14. Compile Unified Vehicle State
        unified_state = {
            # Identity
            "bus_id": self.bus_id,
            "vehicle_model": self.vehicle_model,
            "vehicle_variant": self.vehicle_variant,
            "vehicle_serial_number": f"OL-2026-12M-{self.bus_id[-3:] if len(self.bus_id)>=3 else '001'}",
            "fleet_id": self.fleet_id,
            "tcu_id": self.tcu_id,
            "vin": self.vin,
            "timestamp": time.time(),

            # Merged Subsystem States
            **vcu_state,
            **route_state,
            **phys_state,
            **bms_state,
            **motor_state,
            **brake_state,
            **hvac_state,
            **charger_state,
            **thermal_state,
            **safety_state,

            # Energy Metrics
            "instantaneous_power": bms_state["total_battery_power"],
            "average_power": round(total_kwh_consumed / max(0.01, (vcu_state["operating_hours"] % 10.0)), 1),
            "energy_consumption": total_kwh_consumed,
            "energy_consumption_per_km": kwh_per_km,
            "energy_regenerated": brake_state["regen_energy"],
            "regen_percentage": round((brake_state["regen_energy"] / max(0.1, total_kwh_consumed)) * 100.0, 1),
            "distance_since_charge": round(vcu_state["trip_distance"] * 1.5, 1),
            "distance_since_trip_start": vcu_state["trip_distance"],
            "estimated_range": est_range_km,
            "estimated_range_remaining": round(est_range_km * 0.92, 1),
            "battery_utilization": round(100.0 - bms_state["total_battery_soc"], 1),
            "motor_energy": round(total_kwh_consumed * 0.76, 2),
            "hvac_energy": hvac_state["hvac_energy_consumption"],
            "driving_efficiency": 92.4,
            "regenerative_efficiency": 84.5,
            "vehicle_speed": phys_state["speed_kmh"],
            "vehicle_speed_can": phys_state["speed_kmh"],
            "vehicle_speed_gps": phys_state["speed_kmh"],
            "ground_speed": phys_state["speed_kmh"],
            "gps_accuracy": 1.1,
            "hdop": 0.8,
            "vdop": 1.0,
            "satellite_count": 16,
            "gps_fix": "3D_FIX",
            "gps_signal": 95.0,
            "geofence_id": "GEO-HYD-URBAN"
        }

        self.latest_state = unified_state

        # 15. Encode & Broadcast CAN Frames to Simulated CAN Network
        self._broadcast_can_frames(unified_state)

        return unified_state

    def _broadcast_can_frames(self, state: Dict[str, Any]):
        """
        Encodes physical states into 12 distinct 8-byte CAN frames and publishes them on CANBus.
        """
        can_msgs = [
            (0x100, {
                "vehicle_speed": state.get("vehicle_speed", 0.0),
                "vehicle_state": state.get("vehicle_state", 2),
                "drive_mode": state.get("drive_mode", 1),
                "gear_state": state.get("gear_state", 1),
                "ignition_state": state.get("ignition_state", 2),
                "accelerator_pos": state.get("accelerator_position", 0.0),
                "brake_pedal_pos": state.get("brake_pedal_position", 0.0)
            }),
            (0x200, {
                "pack_a_soc": state.get("pack_a_soc", 80.0),
                "pack_a_soh": state.get("pack_a_soh", 98.0),
                "pack_a_voltage": state.get("pack_a_voltage", 650.0),
                "pack_a_current": state.get("pack_a_current", 0.0),
                "pack_a_bms_state": state.get("pack_a_bms_state", 1)
            }),
            (0x205, {
                "pack_a_avg_temp": int(state.get("pack_a_avg_temperature", 30.0)),
                "pack_a_max_temp": int(state.get("pack_a_max_temperature", 32.0)),
                "pack_a_min_temp": int(state.get("pack_a_min_temperature", 28.0)),
                "pack_a_cell_max_v": state.get("pack_a_cell_max_voltage", 3.30),
                "pack_a_cell_min_v": state.get("pack_a_cell_min_voltage", 3.28),
                "pack_a_balancing_active": 1 if state.get("pack_a_balancing_active") else 0
            }),
            (0x210, {
                "pack_b_soc": state.get("pack_b_soc", 80.0),
                "pack_b_soh": state.get("pack_b_soh", 98.0),
                "pack_b_voltage": state.get("pack_b_voltage", 650.0),
                "pack_b_current": state.get("pack_b_current", 0.0),
                "pack_b_bms_state": state.get("pack_b_bms_state", 1)
            }),
            (0x215, {
                "pack_b_avg_temp": int(state.get("pack_b_avg_temperature", 30.0)),
                "pack_b_max_temp": int(state.get("pack_b_max_temperature", 32.0)),
                "pack_b_min_temp": int(state.get("pack_b_min_temperature", 28.0)),
                "pack_b_cell_max_v": state.get("pack_b_cell_max_voltage", 3.30),
                "pack_b_cell_min_v": state.get("pack_b_cell_min_voltage", 3.28),
                "pack_b_balancing_active": 1 if state.get("pack_b_balancing_active") else 0
            }),
            (0x300, {
                "motor_rpm": state.get("motor_rpm", 0),
                "motor_torque": state.get("motor_torque", 0.0),
                "motor_temp": int(state.get("motor_temperature", 60.0)),
                "motor_stator_temp": int(state.get("motor_stator_temperature", 65.0)),
                "motor_efficiency": state.get("motor_efficiency", 94.0),
                "motor_state": state.get("motor_state", 2)
            }),
            (0x310, {
                "inverter_dc_v": state.get("inverter_dc_voltage", 650.0),
                "inverter_dc_i": state.get("inverter_dc_current", 0.0),
                "inverter_temp": int(state.get("inverter_temperature", 45.0)),
                "inverter_ac_freq": state.get("inverter_ac_frequency", 0.0),
                "inverter_fault": 1 if state.get("inverter_fault") else 0
            }),
            (0x400, {
                "brake_pressure_bar": state.get("brake_pressure_bar", 8.5),
                "regen_power_kw": state.get("regen_power_kw", 0.0),
                "regen_torque_nm": state.get("regen_torque_nm", 0.0),
                "abs_active": 1 if state.get("abs_active") else 0,
                "esc_active": 1 if state.get("esc_active") else 0
            }),
            (0x500, {
                "cabin_temp": state.get("cabin_temperature", 23.0),
                "ambient_temp": state.get("outside_temperature", 34.0),
                "target_cabin_temp": state.get("target_cabin_temperature", 22.0),
                "hvac_power_kw": state.get("hvac_power_kw", 4.0),
                "hvac_mode": 1
            }),
            (0x600, {
                "charger_connected": 1 if state.get("charger_connected") else 0,
                "charging_state": 1 if state.get("charging_state") == "CONSTANT_CURRENT" else 0,
                "charger_voltage": state.get("charger_voltage", 0.0),
                "charger_current": state.get("charger_current", 0.0),
                "dc_dc_output_v": state.get("dc_dc_output_v", 27.8),
                "dc_dc_power_kw": state.get("dc_dc_power_kw", 1.7)
            }),
            (0x650, {
                "bat_coolant_temp": int(state.get("battery_coolant_temperature", 26.0)),
                "motor_coolant_temp": int(state.get("motor_coolant_temperature", 48.0)),
                "coolant_pump_speed": state.get("coolant_pump_speed", 50.0),
                "radiator_fan_speed": state.get("radiator_fan_speed", 40.0),
                "coolant_pressure_bar": state.get("coolant_pressure_bar", 1.45),
                "thermal_warning": 1 if state.get("thermal_warning") else 0,
                "thermal_fault": 1 if state.get("thermal_fault") else 0,
                "aux_power_kw": state.get("aux_power_kw", 1.0)
            }),
            (0x700, {
                "hv_interlock_ok": 1 if state.get("hv_interlock_ok") else 0,
                "isolation_kohm": state.get("isolation_kohm", 2450.0),
                "door_front_open": 1 if state.get("door_front_open") else 0,
                "door_middle_open": 1 if state.get("door_middle_open") else 0,
                "door_rear_open": 1 if state.get("door_rear_open") else 0,
                "emergency_stop": 1 if state.get("emergency_stop") else 0,
                "fire_smoke_detected": 1 if state.get("fire_smoke_detected") else 0
            }),
            (0x750, {
                "accel_x": state.get("accel_x", 0.0),
                "accel_y": state.get("accel_y", 0.0),
                "accel_z": state.get("accel_z", 9.81),
                "pitch_deg": state.get("pitch_deg", 0.0),
                "roll_deg": state.get("roll_deg", 0.0)
            })
        ]

        for can_id, sigs in can_msgs:
            try:
                frame = encode_can_frame(can_id, sigs)
                self.can_bus.publish(frame)
            except Exception:
                pass
