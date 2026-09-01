"""
Comprehensive 280+ Telemetry Signal Registry for Olectra E-Fleet
Defines metadata, units, min/max bounds, source ECU, CAN message ID, and derivation rules.
"""

from typing import Dict, Any, List

SIGNAL_REGISTRY: Dict[str, Dict[str, Any]] = {
    # ==========================================
    # 1. VEHICLE OVERVIEW & IDENTIFICATION
    # ==========================================
    "bus_id": {"name": "Bus Identifier", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "BUS-001", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "vehicle_model": {"name": "Vehicle Model", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "ELECTRA-12M", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "vehicle_variant": {"name": "Vehicle Variant", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "CityTransit-LFP", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "vehicle_serial_number": {"name": "Vehicle Serial Number", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "OL-2026-12M-001", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "fleet_id": {"name": "Fleet ID", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "OLECTRA-E-FLEET", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "tcu_id": {"name": "TCU ID", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "TCU-001", "freq_hz": 1, "ecu": "TCU", "can_id": "0x100", "source": "config"},
    "vin": {"name": "VIN", "subsystem": "Vehicle", "unit": "", "type": "string", "min": None, "max": None, "default": "MA6OL12ME0012026", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "ignition_state": {"name": "Ignition State", "subsystem": "Vehicle", "unit": "enum", "type": "int", "min": 0, "max": 2, "default": 2, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "vehicle_state": {"name": "Vehicle Operational State", "subsystem": "Vehicle", "unit": "enum", "type": "int", "min": 0, "max": 7, "default": 2, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "drive_mode": {"name": "Drive Mode", "subsystem": "Vehicle", "unit": "enum", "type": "int", "min": 0, "max": 2, "default": 1, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "direction": {"name": "Drive Direction", "subsystem": "Vehicle", "unit": "enum", "type": "string", "min": None, "max": None, "default": "FORWARD", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "gear_state": {"name": "Selected Gear", "subsystem": "Vehicle", "unit": "enum", "type": "int", "min": 0, "max": 3, "default": 1, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "parking_brake": {"name": "Parking Brake", "subsystem": "Vehicle", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "vehicle_ready": {"name": "Vehicle Ready (HV Active)", "subsystem": "Vehicle", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "vehicle_speed": {"name": "Vehicle Speed (Filtered)", "subsystem": "Vehicle", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 0.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "vehicle_speed_can": {"name": "Vehicle Speed (Wheel Speed CAN)", "subsystem": "Vehicle", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 0.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "vehicle_speed_gps": {"name": "Vehicle Speed (GPS Doppler)", "subsystem": "Vehicle", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 0.0, "freq_hz": 1, "ecu": "TCU", "can_id": "0x100", "source": "measured"},
    "odometer": {"name": "Total Odometer", "subsystem": "Vehicle", "unit": "km", "type": "float", "min": 0, "max": 1000000, "default": 14250.8, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "trip_distance": {"name": "Trip Distance", "subsystem": "Vehicle", "unit": "km", "type": "float", "min": 0, "max": 5000, "default": 28.4, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "operating_hours": {"name": "Operating Hours", "subsystem": "Vehicle", "unit": "h", "type": "float", "min": 0, "max": 50000, "default": 842.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},

    # ==========================================
    # 2. GPS / GNSS & GEOGRAPHIC ROUTE
    # ==========================================
    "latitude": {"name": "Latitude", "subsystem": "GPS", "unit": "deg", "type": "float", "min": -90, "max": 90, "default": 17.3850, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "longitude": {"name": "Longitude", "subsystem": "GPS", "unit": "deg", "type": "float", "min": -180, "max": 180, "default": 78.4867, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "altitude": {"name": "Altitude", "subsystem": "GPS", "unit": "m", "type": "float", "min": -50, "max": 5000, "default": 542.0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "heading": {"name": "Heading", "subsystem": "GPS", "unit": "deg", "type": "float", "min": 0, "max": 360, "default": 94.5, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "ground_speed": {"name": "Ground Speed", "subsystem": "GPS", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "gps_accuracy": {"name": "GPS Horizontal Accuracy", "subsystem": "GPS", "unit": "m", "type": "float", "min": 0.1, "max": 50, "default": 1.2, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "hdop": {"name": "HDOP", "subsystem": "GPS", "unit": "", "type": "float", "min": 0.5, "max": 10, "default": 0.9, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "vdop": {"name": "VDOP", "subsystem": "GPS", "unit": "", "type": "float", "min": 0.5, "max": 10, "default": 1.1, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "satellite_count": {"name": "Visible Satellites", "subsystem": "GPS", "unit": "", "type": "int", "min": 0, "max": 32, "default": 14, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "gps_fix": {"name": "GPS Fix Status", "subsystem": "GPS", "unit": "enum", "type": "string", "min": None, "max": None, "default": "3D_FIX", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "gps_signal": {"name": "GPS Signal Quality", "subsystem": "GPS", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 94.0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "geofence_id": {"name": "Active Geofence ID", "subsystem": "GPS", "unit": "", "type": "string", "min": None, "max": None, "default": "GEO-HYD-URBAN", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "route_id": {"name": "Assigned Route ID", "subsystem": "GPS", "unit": "", "type": "string", "min": None, "max": None, "default": "TS-HYD-WGL-101", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "stop_id": {"name": "Next / Current Bus Stop", "subsystem": "GPS", "unit": "", "type": "string", "min": None, "max": None, "default": "STOP-SECUNDERABAD", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},

    # ==========================================
    # 3. TCU & 4G/5G CELLULAR CONNECTIVITY
    # ==========================================
    "tcu_status": {"name": "TCU Operational Status", "subsystem": "TCU", "unit": "enum", "type": "string", "min": None, "max": None, "default": "ONLINE", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "tcu_temperature": {"name": "TCU Internal Temp", "subsystem": "TCU", "unit": "°C", "type": "float", "min": -20, "max": 85, "default": 38.5, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "tcu_voltage": {"name": "TCU Supply Voltage", "subsystem": "TCU", "unit": "V", "type": "float", "min": 9, "max": 32, "default": 24.2, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "tcu_current": {"name": "TCU Current Draw", "subsystem": "TCU", "unit": "A", "type": "float", "min": 0, "max": 5, "default": 0.45, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "network_type": {"name": "Cellular Network Type", "subsystem": "TCU", "unit": "enum", "type": "string", "min": None, "max": None, "default": "5G_NR_NSA", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "network_operator": {"name": "Network Operator", "subsystem": "TCU", "unit": "", "type": "string", "min": None, "max": None, "default": "Airtel IoT 5G", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "signal_strength": {"name": "Signal Strength CSQ", "subsystem": "TCU", "unit": "CSQ", "type": "int", "min": 0, "max": 31, "default": 28, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "rsrp": {"name": "RSRP (Reference Signal Power)", "subsystem": "TCU", "unit": "dBm", "type": "float", "min": -140, "max": -44, "default": -85.4, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "rsrq": {"name": "RSRQ (Reference Signal Quality)", "subsystem": "TCU", "unit": "dB", "type": "float", "min": -20, "max": -3, "default": -9.8, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "sinr": {"name": "SINR (Signal-to-Interference Ratio)", "subsystem": "TCU", "unit": "dB", "type": "float", "min": -10, "max": 40, "default": 18.2, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "cell_id": {"name": "Serving Cell ID", "subsystem": "TCU", "unit": "", "type": "string", "min": None, "max": None, "default": "404-45-78219", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "imei": {"name": "TCU Modem IMEI", "subsystem": "TCU", "unit": "", "type": "string", "min": None, "max": None, "default": "862901048291048", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "iccid": {"name": "eSIM ICCID", "subsystem": "TCU", "unit": "", "type": "string", "min": None, "max": None, "default": "8991404000291048123F", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "sim_status": {"name": "SIM Card Status", "subsystem": "TCU", "unit": "enum", "type": "string", "min": None, "max": None, "default": "READY", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "mqtt_connection": {"name": "MQTT Broker Connection", "subsystem": "TCU", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "mqtt_latency": {"name": "MQTT RTT Latency", "subsystem": "TCU", "unit": "ms", "type": "float", "min": 0, "max": 5000, "default": 14.5, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},
    "packet_sequence": {"name": "Monotonic Packet Sequence", "subsystem": "TCU", "unit": "", "type": "int", "min": 0, "max": 2000000000, "default": 1, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "packet_loss": {"name": "Packet Loss Rate", "subsystem": "TCU", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 0.0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "retry_count": {"name": "MQTT Retry Count", "subsystem": "TCU", "unit": "", "type": "int", "min": 0, "max": 1000, "default": 0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "buffer_size": {"name": "Store-Forward Buffer Queue Size", "subsystem": "TCU", "unit": "packets", "type": "int", "min": 0, "max": 10000, "default": 0, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "measured"},

    # ==========================================
    # 4. BATTERY PACK A (160 kWh LFP)
    # ==========================================
    "pack_a_soc": {"name": "Pack A State of Charge", "subsystem": "Battery A", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 82.4, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_soh": {"name": "Pack A State of Health", "subsystem": "Battery A", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 98.5, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_voltage": {"name": "Pack A Terminal Voltage", "subsystem": "Battery A", "unit": "V", "type": "float", "min": 450, "max": 750, "default": 654.2, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_current": {"name": "Pack A Total Current", "subsystem": "Battery A", "unit": "A", "type": "float", "min": -400, "max": 400, "default": 45.2, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_power": {"name": "Pack A Electrical Power", "subsystem": "Battery A", "unit": "kW", "type": "float", "min": -250, "max": 250, "default": 29.57, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_energy_remaining": {"name": "Pack A Energy Remaining", "subsystem": "Battery A", "unit": "kWh", "type": "float", "min": 0, "max": 160, "default": 131.84, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_energy_consumed": {"name": "Pack A Energy Discharged", "subsystem": "Battery A", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 28.16, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_energy_charged": {"name": "Pack A Energy Charged", "subsystem": "Battery A", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 3.42, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_temperature": {"name": "Pack A Temperature", "subsystem": "Battery A", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 29.8, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},
    "pack_a_min_temperature": {"name": "Pack A Min Cell Temp", "subsystem": "Battery A", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 28.5, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},
    "pack_a_max_temperature": {"name": "Pack A Max Cell Temp", "subsystem": "Battery A", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 31.2, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},
    "pack_a_avg_temperature": {"name": "Pack A Avg Cell Temp", "subsystem": "Battery A", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 29.8, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "derived"},
    "pack_a_cell_min_voltage": {"name": "Pack A Lowest Cell Voltage", "subsystem": "Battery A", "unit": "V", "type": "float", "min": 2.5, "max": 3.65, "default": 3.285, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},
    "pack_a_cell_max_voltage": {"name": "Pack A Highest Cell Voltage", "subsystem": "Battery A", "unit": "V", "type": "float", "min": 2.5, "max": 3.65, "default": 3.305, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},
    "pack_a_cell_voltage_delta": {"name": "Pack A Cell Delta Voltage", "subsystem": "Battery A", "unit": "mV", "type": "float", "min": 0, "max": 500, "default": 20.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "derived"},
    "pack_a_charge_current_limit": {"name": "Pack A Max Charge Current", "subsystem": "Battery A", "unit": "A", "type": "float", "min": 0, "max": 300, "default": 200.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_discharge_current_limit": {"name": "Pack A Max Discharge Current", "subsystem": "Battery A", "unit": "A", "type": "float", "min": 0, "max": 450, "default": 350.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_charge_power_limit": {"name": "Pack A Max Charge Power", "subsystem": "Battery A", "unit": "kW", "type": "float", "min": 0, "max": 200, "default": 130.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_discharge_power_limit": {"name": "Pack A Max Discharge Power", "subsystem": "Battery A", "unit": "kW", "type": "float", "min": 0, "max": 250, "default": 220.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_contactor_positive": {"name": "Pack A Main Positive Contactor", "subsystem": "Battery A", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_contactor_negative": {"name": "Pack A Main Negative Contactor", "subsystem": "Battery A", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_precharge_contactor": {"name": "Pack A Precharge Contactor", "subsystem": "Battery A", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_bms_state": {"name": "Pack A BMS Status Code", "subsystem": "Battery A", "unit": "enum", "type": "int", "min": 0, "max": 5, "default": 1, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "measured"},
    "pack_a_bms_fault": {"name": "Pack A BMS Fault Flag", "subsystem": "Battery A", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_bms_warning": {"name": "Pack A BMS Warning Flag", "subsystem": "Battery A", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "pack_a_isolation_resistance": {"name": "Pack A Isolation Resistance", "subsystem": "Battery A", "unit": "kOhm", "type": "float", "min": 0, "max": 5000, "default": 2450.0, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "measured"},

    # ==========================================
    # 5. BATTERY PACK B (160 kWh LFP)
    # ==========================================
    "pack_b_soc": {"name": "Pack B State of Charge", "subsystem": "Battery B", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 81.9, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_soh": {"name": "Pack B State of Health", "subsystem": "Battery B", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 98.1, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_voltage": {"name": "Pack B Terminal Voltage", "subsystem": "Battery B", "unit": "V", "type": "float", "min": 450, "max": 750, "default": 653.8, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_current": {"name": "Pack B Total Current", "subsystem": "Battery B", "unit": "A", "type": "float", "min": -400, "max": 400, "default": 45.8, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_power": {"name": "Pack B Electrical Power", "subsystem": "Battery B", "unit": "kW", "type": "float", "min": -250, "max": 250, "default": 29.94, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_energy_remaining": {"name": "Pack B Energy Remaining", "subsystem": "Battery B", "unit": "kWh", "type": "float", "min": 0, "max": 160, "default": 131.04, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_energy_consumed": {"name": "Pack B Energy Discharged", "subsystem": "Battery B", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 28.96, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_energy_charged": {"name": "Pack B Energy Charged", "subsystem": "Battery B", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 3.39, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_temperature": {"name": "Pack B Temperature", "subsystem": "Battery B", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 30.2, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},
    "pack_b_min_temperature": {"name": "Pack B Min Cell Temp", "subsystem": "Battery B", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 28.8, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},
    "pack_b_max_temperature": {"name": "Pack B Max Cell Temp", "subsystem": "Battery B", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 31.6, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},
    "pack_b_avg_temperature": {"name": "Pack B Avg Cell Temp", "subsystem": "Battery B", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 30.2, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "derived"},
    "pack_b_cell_min_voltage": {"name": "Pack B Lowest Cell Voltage", "subsystem": "Battery B", "unit": "V", "type": "float", "min": 2.5, "max": 3.65, "default": 3.282, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},
    "pack_b_cell_max_voltage": {"name": "Pack B Highest Cell Voltage", "subsystem": "Battery B", "unit": "V", "type": "float", "min": 2.5, "max": 3.65, "default": 3.308, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},
    "pack_b_cell_voltage_delta": {"name": "Pack B Cell Delta Voltage", "subsystem": "Battery B", "unit": "mV", "type": "float", "min": 0, "max": 500, "default": 26.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "derived"},
    "pack_b_charge_current_limit": {"name": "Pack B Max Charge Current", "subsystem": "Battery B", "unit": "A", "type": "float", "min": 0, "max": 300, "default": 200.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_discharge_current_limit": {"name": "Pack B Max Discharge Current", "subsystem": "Battery B", "unit": "A", "type": "float", "min": 0, "max": 450, "default": 350.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_charge_power_limit": {"name": "Pack B Max Charge Power", "subsystem": "Battery B", "unit": "kW", "type": "float", "min": 0, "max": 200, "default": 130.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_discharge_power_limit": {"name": "Pack B Max Discharge Power", "subsystem": "Battery B", "unit": "kW", "type": "float", "min": 0, "max": 250, "default": 220.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_contactor_positive": {"name": "Pack B Main Positive Contactor", "subsystem": "Battery B", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_contactor_negative": {"name": "Pack B Main Negative Contactor", "subsystem": "Battery B", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_precharge_contactor": {"name": "Pack B Precharge Contactor", "subsystem": "Battery B", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_bms_state": {"name": "Pack B BMS Status Code", "subsystem": "Battery B", "unit": "enum", "type": "int", "min": 0, "max": 5, "default": 1, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "measured"},
    "pack_b_bms_fault": {"name": "Pack B BMS Fault Flag", "subsystem": "Battery B", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_bms_warning": {"name": "Pack B BMS Warning Flag", "subsystem": "Battery B", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x210", "source": "derived"},
    "pack_b_isolation_resistance": {"name": "Pack B Isolation Resistance", "subsystem": "Battery B", "unit": "kOhm", "type": "float", "min": 0, "max": 5000, "default": 2420.0, "freq_hz": 1, "ecu": "BMS_B", "can_id": "0x215", "source": "measured"},

    # ==========================================
    # 6. COMBINED DUAL-BATTERY SYSTEM (320 kWh Total)
    # ==========================================
    "total_battery_soc": {"name": "Total Combined SOC", "subsystem": "Battery Total", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 82.15, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_battery_soh": {"name": "Total Combined SOH", "subsystem": "Battery Total", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 98.3, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_battery_voltage": {"name": "Effective Bus Voltage", "subsystem": "Battery Total", "unit": "V", "type": "float", "min": 450, "max": 750, "default": 654.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_battery_current": {"name": "Total Battery Current", "subsystem": "Battery Total", "unit": "A", "type": "float", "min": -800, "max": 800, "default": 91.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_battery_power": {"name": "Total Battery Power", "subsystem": "Battery Total", "unit": "kW", "type": "float", "min": -500, "max": 500, "default": 59.51, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_energy_remaining": {"name": "Total Energy Remaining", "subsystem": "Battery Total", "unit": "kWh", "type": "float", "min": 0, "max": 320, "default": 262.88, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_energy_consumed": {"name": "Total Energy Consumed", "subsystem": "Battery Total", "unit": "kWh", "type": "float", "min": 0, "max": 200000, "default": 57.12, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "total_energy_charged": {"name": "Total Energy Charged", "subsystem": "Battery Total", "unit": "kWh", "type": "float", "min": 0, "max": 200000, "default": 6.81, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "available_discharge_power": {"name": "Available Discharge Power", "subsystem": "Battery Total", "unit": "kW", "type": "float", "min": 0, "max": 500, "default": 440.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "available_charge_power": {"name": "Available Charge Power", "subsystem": "Battery Total", "unit": "kW", "type": "float", "min": 0, "max": 400, "default": 260.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_temperature": {"name": "Average Pack Temperature", "subsystem": "Battery Total", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 30.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_min_temperature": {"name": "Global Min Battery Temp", "subsystem": "Battery Total", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 28.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_max_temperature": {"name": "Global Max Battery Temp", "subsystem": "Battery Total", "unit": "°C", "type": "float", "min": -20, "max": 75, "default": 31.6, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_voltage_delta": {"name": "Pack A vs B Voltage Delta", "subsystem": "Battery Total", "unit": "V", "type": "float", "min": 0, "max": 50, "default": 0.4, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_current_balance": {"name": "Current Balance Ratio", "subsystem": "Battery Total", "unit": "ratio", "type": "float", "min": 0.5, "max": 1.5, "default": 0.987, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_power_balance": {"name": "Power Balance Ratio", "subsystem": "Battery Total", "unit": "ratio", "type": "float", "min": 0.5, "max": 1.5, "default": 0.988, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_system_state": {"name": "Battery Master System State", "subsystem": "Battery Total", "unit": "enum", "type": "string", "min": None, "max": None, "default": "OPERATIONAL", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_system_warning": {"name": "Battery System Warning", "subsystem": "Battery Total", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_system_fault": {"name": "Battery System Fault", "subsystem": "Battery Total", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},

    # ==========================================
    # 7. MOTOR (250 kW PMSM)
    # ==========================================
    "motor_rpm": {"name": "Motor Rotational Speed", "subsystem": "Motor", "unit": "RPM", "type": "int", "min": -6000, "max": 10000, "default": 2450, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_speed": {"name": "Motor Angular Velocity", "subsystem": "Motor", "unit": "rad/s", "type": "float", "min": -600, "max": 1000, "default": 256.56, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "motor_torque": {"name": "Motor Shaft Torque", "subsystem": "Motor", "unit": "Nm", "type": "float", "min": -2500, "max": 2500, "default": 210.5, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_command_torque": {"name": "Motor Commanded Torque", "subsystem": "Motor", "unit": "Nm", "type": "float", "min": -2500, "max": 2500, "default": 215.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "motor_actual_torque": {"name": "Motor Feedback Torque", "subsystem": "Motor", "unit": "Nm", "type": "float", "min": -2500, "max": 2500, "default": 210.5, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_power": {"name": "Motor Mechanical Power", "subsystem": "Motor", "unit": "kW", "type": "float", "min": -250, "max": 250, "default": 54.01, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "motor_voltage": {"name": "Motor Phase Voltage (RMS)", "subsystem": "Motor", "unit": "V", "type": "float", "min": 0, "max": 600, "default": 420.0, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_current": {"name": "Motor Phase Current (RMS)", "subsystem": "Motor", "unit": "A", "type": "float", "min": 0, "max": 500, "default": 88.4, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_temperature": {"name": "Motor Internal Temp", "subsystem": "Motor", "unit": "°C", "type": "float", "min": -20, "max": 160, "default": 64.2, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_stator_temperature": {"name": "Motor Stator Temp", "subsystem": "Motor", "unit": "°C", "type": "float", "min": -20, "max": 160, "default": 66.8, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_rotor_temperature": {"name": "Motor Rotor Temp", "subsystem": "Motor", "unit": "°C", "type": "float", "min": -20, "max": 160, "default": 61.5, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "motor_controller_temperature": {"name": "Motor Controller Temp", "subsystem": "Motor", "unit": "°C", "type": "float", "min": -20, "max": 120, "default": 48.2, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_efficiency": {"name": "Motor Operating Efficiency", "subsystem": "Motor", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 94.2, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "motor_direction": {"name": "Motor Direction", "subsystem": "Motor", "unit": "enum", "type": "string", "min": None, "max": None, "default": "FORWARD", "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "motor_state": {"name": "Motor ECU State", "subsystem": "Motor", "unit": "enum", "type": "int", "min": 0, "max": 5, "default": 2, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "motor_fault": {"name": "Motor Fault Flag", "subsystem": "Motor", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},

    # ==========================================
    # 8. INVERTER (Silicon Carbide SiC Traction Inverter)
    # ==========================================
    "inverter_dc_voltage": {"name": "Inverter DC Bus Voltage", "subsystem": "Inverter", "unit": "V", "type": "float", "min": 0, "max": 800, "default": 654.0, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_dc_current": {"name": "Inverter DC Bus Current", "subsystem": "Inverter", "unit": "A", "type": "float", "min": -600, "max": 600, "default": 89.2, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_dc_power": {"name": "Inverter DC Power", "subsystem": "Inverter", "unit": "kW", "type": "float", "min": -300, "max": 300, "default": 58.34, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},
    "inverter_ac_voltage": {"name": "Inverter AC Phase-Phase RMS", "subsystem": "Inverter", "unit": "V", "type": "float", "min": 0, "max": 600, "default": 420.0, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_ac_current": {"name": "Inverter AC Output Current", "subsystem": "Inverter", "unit": "A", "type": "float", "min": 0, "max": 500, "default": 88.4, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_ac_frequency": {"name": "Inverter Fundamental Freq", "subsystem": "Inverter", "unit": "Hz", "type": "float", "min": 0, "max": 600, "default": 163.3, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_temperature": {"name": "Inverter IGBT/SiC Junction Temp", "subsystem": "Inverter", "unit": "°C", "type": "float", "min": -20, "max": 130, "default": 49.5, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_power": {"name": "Inverter Electrical Throughput", "subsystem": "Inverter", "unit": "kW", "type": "float", "min": -300, "max": 300, "default": 58.34, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},
    "inverter_efficiency": {"name": "Inverter Power Efficiency", "subsystem": "Inverter", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 97.4, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},
    "inverter_state": {"name": "Inverter Operational State", "subsystem": "Inverter", "unit": "enum", "type": "string", "min": None, "max": None, "default": "ENABLED", "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_enable": {"name": "Inverter Gate Drive Enable", "subsystem": "Inverter", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "measured"},
    "inverter_fault": {"name": "Inverter Fault Flag", "subsystem": "Inverter", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},
    "inverter_warning": {"name": "Inverter Warning Flag", "subsystem": "Inverter", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},

    # ==========================================
    # 9. VEHICLE DYNAMICS & INERTIAL MEASUREMENT
    # ==========================================
    "speed_kph": {"name": "Speed (Vehicle Dynamics Engine)", "subsystem": "Dynamics", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.3, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "derived"},
    "acceleration_x": {"name": "Longitudinal Accel (X-axis)", "subsystem": "Dynamics", "unit": "m/s²", "type": "float", "min": -15, "max": 15, "default": 0.42, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "acceleration_y": {"name": "Lateral Accel (Y-axis)", "subsystem": "Dynamics", "unit": "m/s²", "type": "float", "min": -15, "max": 15, "default": 0.08, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "acceleration_z": {"name": "Vertical Accel (Z-axis)", "subsystem": "Dynamics", "unit": "m/s²", "type": "float", "min": -25, "max": 25, "default": 9.81, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "angular_velocity_x": {"name": "Roll Rate (X-axis)", "subsystem": "Dynamics", "unit": "deg/s", "type": "float", "min": -50, "max": 50, "default": 0.1, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "angular_velocity_y": {"name": "Pitch Rate (Y-axis)", "subsystem": "Dynamics", "unit": "deg/s", "type": "float", "min": -50, "max": 50, "default": -0.2, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "angular_velocity_z": {"name": "Yaw Rate (Z-axis)", "subsystem": "Dynamics", "unit": "deg/s", "type": "float", "min": -50, "max": 50, "default": 0.4, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "pitch": {"name": "Vehicle Pitch Angle", "subsystem": "Dynamics", "unit": "deg", "type": "float", "min": -30, "max": 30, "default": 0.5, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "roll": {"name": "Vehicle Roll Angle", "subsystem": "Dynamics", "unit": "deg", "type": "float", "min": -30, "max": 30, "default": 0.2, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "measured"},
    "yaw": {"name": "Vehicle Heading / Yaw", "subsystem": "Dynamics", "unit": "deg", "type": "float", "min": 0, "max": 360, "default": 94.5, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "derived"},
    "jerk_x": {"name": "Longitudinal Jerk", "subsystem": "Dynamics", "unit": "m/s³", "type": "float", "min": -20, "max": 20, "default": 0.05, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "derived"},
    "jerk_y": {"name": "Lateral Jerk", "subsystem": "Dynamics", "unit": "m/s³", "type": "float", "min": -20, "max": 20, "default": 0.02, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "derived"},
    "jerk_z": {"name": "Vertical Jerk", "subsystem": "Dynamics", "unit": "m/s³", "type": "float", "min": -20, "max": 20, "default": 0.01, "freq_hz": 1, "ecu": "DYNAMICS_ECU", "can_id": "0x750", "source": "derived"},
    "wheel_speed_fl": {"name": "Front Left Wheel Speed", "subsystem": "Dynamics", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.3, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "wheel_speed_fr": {"name": "Front Right Wheel Speed", "subsystem": "Dynamics", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.4, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "wheel_speed_rl": {"name": "Rear Left Wheel Speed", "subsystem": "Dynamics", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.2, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "wheel_speed_rr": {"name": "Rear Right Wheel Speed", "subsystem": "Dynamics", "unit": "km/h", "type": "float", "min": 0, "max": 120, "default": 42.3, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "wheel_slip": {"name": "Tire Longitudinal Slip", "subsystem": "Dynamics", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 0.8, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "traction_control": {"name": "Traction Control Engagement", "subsystem": "Dynamics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},

    # ==========================================
    # 10. ACCELERATOR & DRIVER REQUEST
    # ==========================================
    "accelerator_position": {"name": "Accelerator Pedal Position", "subsystem": "Driver Input", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 32.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "accelerator_command": {"name": "VCU Validated Accel Request", "subsystem": "Driver Input", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 32.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "throttle_position": {"name": "Throttle Signal Position", "subsystem": "Driver Input", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 32.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "throttle_command": {"name": "Throttle Target Drive Signal", "subsystem": "Driver Input", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 32.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "torque_request": {"name": "Total Powertrain Torque Request", "subsystem": "Driver Input", "unit": "Nm", "type": "float", "min": -2500, "max": 2500, "default": 215.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "torque_limit": {"name": "VCU Active Torque Limit", "subsystem": "Driver Input", "unit": "Nm", "type": "float", "min": 0, "max": 2500, "default": 1800.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "torque_actual": {"name": "Delivered Drive Torque", "subsystem": "Driver Input", "unit": "Nm", "type": "float", "min": -2500, "max": 2500, "default": 210.5, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "measured"},
    "acceleration_request": {"name": "Driver Acceleration Demand", "subsystem": "Driver Input", "unit": "m/s²", "type": "float", "min": 0, "max": 4, "default": 0.45, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "drive_request": {"name": "Powertrain Propulsion Active", "subsystem": "Driver Input", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},

    # ==========================================
    # 11. BRAKING & REGENERATION
    # ==========================================
    "brake_pedal_position": {"name": "Brake Pedal Travel", "subsystem": "Braking", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 0.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "brake_pressure": {"name": "Air Brake Reservoir Pressure", "subsystem": "Braking", "unit": "bar", "type": "float", "min": 0, "max": 12, "default": 8.5, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "brake_command": {"name": "Target Brake Decel Force", "subsystem": "Braking", "unit": "kN", "type": "float", "min": 0, "max": 80, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "brake_actual": {"name": "Applied Total Brake Force", "subsystem": "Braking", "unit": "kN", "type": "float", "min": 0, "max": 80, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "service_brake": {"name": "Service Brake Engagement", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "emergency_brake": {"name": "Emergency Spring Brake", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "regenerative_braking": {"name": "Regen Braking Active", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "regen_power": {"name": "Regenerative Power Generated", "subsystem": "Braking", "unit": "kW", "type": "float", "min": 0, "max": 180, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "regen_current": {"name": "Battery Influx Regen Current", "subsystem": "Braking", "unit": "A", "type": "float", "min": 0, "max": 280, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "regen_torque": {"name": "Motor Negative Regen Torque", "subsystem": "Braking", "unit": "Nm", "type": "float", "min": 0, "max": 1500, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "regen_energy": {"name": "Cumulative Energy Regenerated", "subsystem": "Braking", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 14.8, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "friction_brake": {"name": "Friction Pneumatic Brake Force", "subsystem": "Braking", "unit": "kN", "type": "float", "min": 0, "max": 80, "default": 0.0, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "abs_active": {"name": "Anti-lock Braking Active", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "esc_active": {"name": "Electronic Stability Control Active", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "traction_control_active": {"name": "Traction Control Active", "subsystem": "Braking", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},

    # ==========================================
    # 12. DUAL-ZONE HVAC & CABIN CLIMATE
    # ==========================================
    "cabin_temperature": {"name": "Cabin Mean Temperature", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -20, "max": 60, "default": 23.8, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "outside_temperature": {"name": "Ambient Air Temperature", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -20, "max": 60, "default": 34.5, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "target_cabin_temperature": {"name": "HVAC Thermostat Setpoint", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": 16, "max": 30, "default": 22.0, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "config"},
    "hvac_mode": {"name": "HVAC Operating Mode", "subsystem": "HVAC", "unit": "enum", "type": "string", "min": None, "max": None, "default": "AUTO_COOL", "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "ac_status": {"name": "AC Compressor Enabled", "subsystem": "HVAC", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "heater_status": {"name": "PTC Cabin Heater Enabled", "subsystem": "HVAC", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "compressor_status": {"name": "AC Inverter Compressor Active", "subsystem": "HVAC", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "compressor_speed": {"name": "Compressor Inverter RPM", "subsystem": "HVAC", "unit": "RPM", "type": "int", "min": 0, "max": 6000, "default": 3400, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "compressor_power": {"name": "Compressor Electrical Draw", "subsystem": "HVAC", "unit": "kW", "type": "float", "min": 0, "max": 12, "default": 4.6, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "derived"},
    "blower_speed": {"name": "Evaporator Blower Fan Speed", "subsystem": "HVAC", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 65.0, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "blower_power": {"name": "Blower Fan Power", "subsystem": "HVAC", "unit": "kW", "type": "float", "min": 0, "max": 2, "default": 0.55, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "derived"},
    "evaporator_temperature": {"name": "Evaporator Core Temp", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -10, "max": 40, "default": 4.5, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "condenser_temperature": {"name": "Condenser Coil Temp", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": 10, "max": 80, "default": 42.8, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "coolant_temperature": {"name": "HVAC Chiller Coolant Temp", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -10, "max": 60, "default": 12.4, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "driver_zone_temperature": {"name": "Driver Cockpit Temp", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -10, "max": 50, "default": 23.2, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "passenger_zone_temperature": {"name": "Passenger Saloon Temp", "subsystem": "HVAC", "unit": "°C", "type": "float", "min": -10, "max": 50, "default": 24.1, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "measured"},
    "hvac_energy_consumption": {"name": "Cumulative HVAC Energy", "subsystem": "HVAC", "unit": "kWh", "type": "float", "min": 0, "max": 10000, "default": 8.4, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "derived"},

    # ==========================================
    # 13. CHARGING & CC-CV FAST CHARGER
    # ==========================================
    "charger_connected": {"name": "CCS2 DC Charger Plugged", "subsystem": "Charging", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "charging_state": {"name": "Charging Phase State", "subsystem": "Charging", "unit": "enum", "type": "string", "min": None, "max": None, "default": "STANDBY", "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "charging_mode": {"name": "Charge Mode (CCS2/AC)", "subsystem": "Charging", "unit": "enum", "type": "string", "min": None, "max": None, "default": "DC_FAST_150KW", "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "config"},
    "charger_voltage": {"name": "EVSE Charger Output Voltage", "subsystem": "Charging", "unit": "V", "type": "float", "min": 0, "max": 850, "default": 0.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "charger_current": {"name": "EVSE Delivered Current", "subsystem": "Charging", "unit": "A", "type": "float", "min": 0, "max": 350, "default": 0.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "charger_power": {"name": "EVSE Influx Power", "subsystem": "Charging", "unit": "kW", "type": "float", "min": 0, "max": 250, "default": 0.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charging_energy": {"name": "Delivered Session Energy", "subsystem": "Charging", "unit": "kWh", "type": "float", "min": 0, "max": 320, "default": 0.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charging_duration": {"name": "Session Active Time", "subsystem": "Charging", "unit": "s", "type": "int", "min": 0, "max": 86400, "default": 0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charging_session_id": {"name": "Session UUID", "subsystem": "Charging", "unit": "", "type": "string", "min": None, "max": None, "default": "CHG-SESSION-000", "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "config"},
    "charge_start_soc": {"name": "Session Start SOC", "subsystem": "Charging", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 20.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charge_target_soc": {"name": "Session Target SOC", "subsystem": "Charging", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 95.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "config"},
    "charge_current_limit": {"name": "BMS Negotiated Current Limit", "subsystem": "Charging", "unit": "A", "type": "float", "min": 0, "max": 350, "default": 200.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charge_power_limit": {"name": "BMS Max Power Envelope", "subsystem": "Charging", "unit": "kW", "type": "float", "min": 0, "max": 250, "default": 150.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charger_temperature": {"name": "Onboard Charger Temp", "subsystem": "Charging", "unit": "°C", "type": "float", "min": -20, "max": 90, "default": 32.4, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "connector_temperature": {"name": "CCS2 Inlet Pin Temp", "subsystem": "Charging", "unit": "°C", "type": "float", "min": -20, "max": 100, "default": 31.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "charging_fault": {"name": "Charger Fault Status", "subsystem": "Charging", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "charging_warning": {"name": "Charger Warning Flag", "subsystem": "Charging", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},

    # ==========================================
    # 14. LOW VOLTAGE (24V) & AUXILIARY DC-DC
    # ==========================================
    "lv_battery_voltage": {"name": "24V Lead-Acid/LFP Aux Voltage", "subsystem": "Auxiliary", "unit": "V", "type": "float", "min": 18, "max": 32, "default": 27.6, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "lv_battery_current": {"name": "24V Battery Net Current", "subsystem": "Auxiliary", "unit": "A", "type": "float", "min": -100, "max": 100, "default": 4.2, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "lv_battery_soc": {"name": "24V Battery SOC", "subsystem": "Auxiliary", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 94.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "dc_dc_input_voltage": {"name": "HV to 24V DC-DC Input V", "subsystem": "Auxiliary", "unit": "V", "type": "float", "min": 400, "max": 800, "default": 654.0, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "dc_dc_output_voltage": {"name": "DC-DC Converter Output V", "subsystem": "Auxiliary", "unit": "V", "type": "float", "min": 20, "max": 30, "default": 27.8, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "dc_dc_current": {"name": "DC-DC Low Voltage Output Current", "subsystem": "Auxiliary", "unit": "A", "type": "float", "min": 0, "max": 180, "default": 62.5, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "measured"},
    "dc_dc_power": {"name": "DC-DC Auxiliary Output Power", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 6, "default": 1.74, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "auxiliary_power": {"name": "Total 24V Auxiliary Power Load", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 8, "default": 2.1, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "auxiliary_energy": {"name": "Cumulative Aux Energy Draw", "subsystem": "Auxiliary", "unit": "kWh", "type": "float", "min": 0, "max": 10000, "default": 3.8, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "lighting_power": {"name": "Saloon & Headlamp Power", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 2, "default": 0.45, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "dashboard_power": {"name": "Instrument Cluster & ECU Power", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 1, "default": 0.18, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "pump_power": {"name": "Coolant & Power Steering Pumps", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 3, "default": 0.85, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "fan_power": {"name": "Radiator & Condenser Fans", "subsystem": "Auxiliary", "unit": "kW", "type": "float", "min": 0, "max": 3, "default": 0.62, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},

    # ==========================================
    # 15. THERMAL MANAGEMENT & COOLING LOOPS
    # ==========================================
    "battery_coolant_temperature": {"name": "Battery Loop Coolant Inlet Temp", "subsystem": "Thermal", "unit": "°C", "type": "float", "min": -10, "max": 70, "default": 26.5, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "motor_coolant_temperature": {"name": "Powertrain Coolant Loop Temp", "subsystem": "Thermal", "unit": "°C", "type": "float", "min": -10, "max": 95, "default": 48.2, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "inverter_coolant_temperature": {"name": "Inverter Cold Plate Coolant Temp", "subsystem": "Thermal", "unit": "°C", "type": "float", "min": -10, "max": 90, "default": 44.1, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "coolant_level": {"name": "Coolant Reservoir Level", "subsystem": "Thermal", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 92.0, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "coolant_pressure": {"name": "Coolant System Head Pressure", "subsystem": "Thermal", "unit": "bar", "type": "float", "min": 0, "max": 3, "default": 1.45, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "coolant_pump_speed": {"name": "Electric Coolant Pump Speed", "subsystem": "Thermal", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 55.0, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "coolant_pump_power": {"name": "Coolant Pump Electrical Power", "subsystem": "Thermal", "unit": "kW", "type": "float", "min": 0, "max": 2, "default": 0.45, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "radiator_temperature": {"name": "Front Heat Exchanger Temp", "subsystem": "Thermal", "unit": "°C", "type": "float", "min": -10, "max": 90, "default": 38.5, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "radiator_fan_speed": {"name": "Electric Radiator Fan Speed", "subsystem": "Thermal", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 40.0, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "radiator_fan_power": {"name": "Radiator Fan Power Draw", "subsystem": "Thermal", "unit": "kW", "type": "float", "min": 0, "max": 3, "default": 0.55, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "thermal_management_state": {"name": "Thermal Controller State", "subsystem": "Thermal", "unit": "enum", "type": "string", "min": None, "max": None, "default": "ACTIVE_COOLING", "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "measured"},
    "thermal_warning": {"name": "Thermal Limit Warning", "subsystem": "Thermal", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},
    "thermal_fault": {"name": "Thermal System Critical Fault", "subsystem": "Thermal", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "THERMAL_CTRL", "can_id": "0x650", "source": "derived"},

    # ==========================================
    # 16. DIAGNOSTICS & ACTIVE DTC FAULT CODES
    # ==========================================
    "dtc_count": {"name": "Total Active DTCs", "subsystem": "Diagnostics", "unit": "count", "type": "int", "min": 0, "max": 50, "default": 0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "active_dtc_count": {"name": "Active Unresolved DTCs", "subsystem": "Diagnostics", "unit": "count", "type": "int", "min": 0, "max": 50, "default": 0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "stored_dtc_count": {"name": "Historical Stored DTCs", "subsystem": "Diagnostics", "unit": "count", "type": "int", "min": 0, "max": 50, "default": 0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "warning_count": {"name": "Active Warnings", "subsystem": "Diagnostics", "unit": "count", "type": "int", "min": 0, "max": 50, "default": 0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "critical_fault_count": {"name": "Critical Faults", "subsystem": "Diagnostics", "unit": "count", "type": "int", "min": 0, "max": 50, "default": 0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "bms_fault": {"name": "BMS Aggregate Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "motor_fault_diag": {"name": "Motor Overload/Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "inverter_fault_diag": {"name": "Inverter Hardware Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "INVERTER_ECU", "can_id": "0x310", "source": "derived"},
    "charger_fault_diag": {"name": "Charger Interface Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "hvac_fault_diag": {"name": "HVAC Compressor Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "derived"},
    "tcu_fault": {"name": "TCU Internal Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "gps_fault": {"name": "GPS Lock Loss Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "communication_fault": {"name": "CAN Bus Communication Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "isolation_fault": {"name": "High Voltage Isolation Fault", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "over_voltage": {"name": "HV Over Voltage Alert", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "under_voltage": {"name": "HV Under Voltage Alert", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "over_current": {"name": "HV Over Current Alert", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x200", "source": "derived"},
    "over_temperature": {"name": "Battery Over Temperature Alert", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "derived"},
    "under_temperature": {"name": "Battery Under Temperature Alert", "subsystem": "Diagnostics", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BMS_A", "can_id": "0x205", "source": "derived"},

    # ==========================================
    # 17. SAFETY, DOORS & HIGH VOLTAGE INTERLOCK
    # ==========================================
    "emergency_stop": {"name": "E-Stop Safety Button Pressed", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "high_voltage_interlock": {"name": "HVIL Interlock Loop Closed", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": True, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "hv_interlock_status": {"name": "HVIL Circuit Status", "subsystem": "Safety", "unit": "enum", "type": "string", "min": None, "max": None, "default": "LOCKED_OK", "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "isolation_status": {"name": "Chassis Insulation Status", "subsystem": "Safety", "unit": "enum", "type": "string", "min": None, "max": None, "default": "PASS (>500 ohm/V)", "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "door_front": {"name": "Passenger Front Door Open", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "door_middle": {"name": "Passenger Middle Door Open", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "door_rear": {"name": "Passenger Rear Door Open", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "door_open_count": {"name": "Number of Open Doors", "subsystem": "Safety", "unit": "count", "type": "int", "min": 0, "max": 3, "default": 0, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "door_warning": {"name": "Door Open While In Motion Warning", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},
    "fire_detection": {"name": "Battery Compartment Fire Detector", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "smoke_detection": {"name": "Saloon Aerosol/Smoke Sensor", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "crash_detection": {"name": "Pyrotechnic Crash Sensor", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "measured"},
    "air_pressure": {"name": "Pneumatic System Pressure", "subsystem": "Safety", "unit": "bar", "type": "float", "min": 0, "max": 12, "default": 8.5, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "measured"},
    "air_pressure_warning": {"name": "Low Air Pressure (<6 bar) Alert", "subsystem": "Safety", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},

    # ==========================================
    # 18. ENERGY EFFICIENCY & RANGE METRICS
    # ==========================================
    "instantaneous_power": {"name": "Net Instantaneous Power", "subsystem": "Energy", "unit": "kW", "type": "float", "min": -300, "max": 300, "default": 59.51, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "average_power": {"name": "Trip Average Power", "subsystem": "Energy", "unit": "kW", "type": "float", "min": 0, "max": 200, "default": 42.1, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "energy_consumption": {"name": "Total Cumulative Energy Discharged", "subsystem": "Energy", "unit": "kWh", "type": "float", "min": 0, "max": 200000, "default": 57.12, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "energy_consumption_per_km": {"name": "Specific Energy Efficiency", "subsystem": "Energy", "unit": "kWh/km", "type": "float", "min": 0.5, "max": 3.5, "default": 0.88, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "energy_regenerated": {"name": "Total Regenerated Energy", "subsystem": "Energy", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 14.8, "freq_hz": 1, "ecu": "BRAKE_ECU", "can_id": "0x400", "source": "derived"},
    "regen_percentage": {"name": "Regenerative Braking Capture Rate", "subsystem": "Energy", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 25.9, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "distance_since_charge": {"name": "Distance Since Last Full Charge", "subsystem": "Energy", "unit": "km", "type": "float", "min": 0, "max": 1000, "default": 64.8, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "distance_since_trip_start": {"name": "Trip Distance", "subsystem": "Energy", "unit": "km", "type": "float", "min": 0, "max": 1000, "default": 28.4, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "estimated_range": {"name": "Estimated Usable Driving Range", "subsystem": "Energy", "unit": "km", "type": "float", "min": 0, "max": 400, "default": 298.5, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "estimated_range_remaining": {"name": "Dynamic Conservative Range", "subsystem": "Energy", "unit": "km", "type": "float", "min": 0, "max": 400, "default": 285.2, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "battery_utilization": {"name": "Battery Capacity Utilization", "subsystem": "Energy", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 17.85, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "motor_energy": {"name": "Energy Spent On Traction", "subsystem": "Energy", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 44.9, "freq_hz": 1, "ecu": "MOTOR_ECU", "can_id": "0x300", "source": "derived"},
    "hvac_energy": {"name": "Energy Spent On Cabin Climate", "subsystem": "Energy", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 8.4, "freq_hz": 1, "ecu": "HVAC_ECU", "can_id": "0x500", "source": "derived"},
    "auxiliary_energy_total": {"name": "Energy Spent On 24V Aux", "subsystem": "Energy", "unit": "kWh", "type": "float", "min": 0, "max": 100000, "default": 3.82, "freq_hz": 1, "ecu": "CHARGER_ECU", "can_id": "0x600", "source": "derived"},
    "driving_efficiency": {"name": "Drivetrain Mechanical Efficiency", "subsystem": "Energy", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 91.8, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "regenerative_efficiency": {"name": "Kinetic-to-Chemical Regen Efficiency", "subsystem": "Energy", "unit": "%", "type": "float", "min": 0, "max": 100, "default": 82.4, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},

    # ==========================================
    # 19. PASSENGER & COMMODITY LOAD MODEL
    # ==========================================
    "passenger_count": {"name": "Current Passenger Count", "subsystem": "Vehicle", "unit": "pax", "type": "int", "min": 0, "max": 65, "default": 38, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "measured"},
    "passenger_capacity": {"name": "Total Seated & Standee Capacity", "subsystem": "Vehicle", "unit": "pax", "type": "int", "min": 0, "max": 100, "default": 65, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "vehicle_load_kg": {"name": "Gross Vehicle Passenger Mass", "subsystem": "Vehicle", "unit": "kg", "type": "float", "min": 0, "max": 5000, "default": 2584.0, "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "derived"},
    "door_open_duration": {"name": "Bus Stop Dwell Time", "subsystem": "Safety", "unit": "s", "type": "int", "min": 0, "max": 300, "default": 0, "freq_hz": 1, "ecu": "SAFETY_ECU", "can_id": "0x700", "source": "derived"},

    # ==========================================
    # 20. TELEMETRY PACKET METADATA
    # ==========================================
    "message_id": {"name": "UUID Telemetry Message ID", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "msg-0000", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "sequence_number": {"name": "Monotonic Sequence Number", "subsystem": "Metadata", "unit": "", "type": "int", "min": 0, "max": 2000000000, "default": 1, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "schema_version": {"name": "Telemetry JSON Schema Version", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "2.4.0", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "protocol": {"name": "Transport Protocol", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "MQTT v5.0", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "mqtt_topic": {"name": "Published MQTT Topic", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "fleet/OLECTRA-E-FLEET/bus/BUS-001/telemetry", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "qos": {"name": "MQTT QoS Level", "subsystem": "Metadata", "unit": "", "type": "int", "min": 0, "max": 2, "default": 1, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "retain_flag": {"name": "MQTT Retain Flag", "subsystem": "Metadata", "unit": "bool", "type": "bool", "min": 0, "max": 1, "default": False, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "payload_size": {"name": "Raw Payload Size", "subsystem": "Metadata", "unit": "bytes", "type": "int", "min": 0, "max": 65536, "default": 2420, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "latency_ms": {"name": "TCU Processing Latency", "subsystem": "Metadata", "unit": "ms", "type": "float", "min": 0, "max": 500, "default": 2.4, "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "derived"},
    "firmware_version": {"name": "TCU Firmware Version", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "v3.12.4-prod", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"},
    "software_version": {"name": "VCU Software Version", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "v2.8.0-olectra", "freq_hz": 1, "ecu": "VCU", "can_id": "0x100", "source": "config"},
    "configuration_version": {"name": "Vehicle Profile Config Version", "subsystem": "Metadata", "unit": "", "type": "string", "min": None, "max": None, "default": "cfg-2026.08", "freq_hz": 1, "ecu": "TCU", "can_id": "N/A", "source": "config"}
}


def get_all_subsystems() -> List[str]:
    """Returns unique list of subsystem names in order"""
    seen = []
    for sig in SIGNAL_REGISTRY.values():
        sub = sig["subsystem"]
        if sub not in seen:
            seen.append(sub)
    return seen


def get_signals_by_subsystem(subsystem: str) -> Dict[str, Dict[str, Any]]:
    """Returns dictionary of signals filtered by subsystem"""
    return {k: v for k, v in SIGNAL_REGISTRY.items() if v["subsystem"] == subsystem}
