"""
Simulated CAN Network Layer for Olectra E-Fleet
Defines CAN frames, bit-level CAN message dictionaries, and thread-safe CAN bus broadcast channel.
"""

from dataclasses import dataclass, field
import time
import struct
from typing import Dict, List, Any, Optional, Callable
import threading
import queue

@dataclass
class CANFrame:
    arbitration_id: int          # e.g. 0x100
    data: bytearray              # 8-byte standard CAN payload
    dlc: int = 8                 # Data Length Code (typically 8)
    timestamp: float = field(default_factory=time.time)
    source_ecu: str = ""         # e.g. "VCU", "BMS_A"
    message_name: str = ""       # e.g. "VCU_STATUS"

    def to_hex_string(self) -> str:
        return " ".join(f"{b:02X}" for b in self.data)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "timestamp_iso": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.timestamp)) + f".{int((self.timestamp % 1) * 1000):03d}",
            "can_id": f"0x{self.arbitration_id:03X}",
            "arbitration_id": self.arbitration_id,
            "dlc": self.dlc,
            "data_hex": self.to_hex_string(),
            "source_ecu": self.source_ecu,
            "message_name": self.message_name
        }


# ============================================================================
# CAN MESSAGE DICTIONARY (Bit-level layout, scale, offset, unit)
# ============================================================================
CAN_DICTIONARY: Dict[int, Dict[str, Any]] = {
    # 0x100: VCU Status & Dynamics
    0x100: {
        "name": "VCU_STATUS",
        "ecu": "VCU",
        "cycle_time_ms": 1000,
        "signals": {
            "vehicle_speed": {"start_byte": 0, "length_bytes": 2, "type": "uint16", "scale": 0.01, "offset": 0.0, "unit": "km/h", "min": 0, "max": 120},
            "vehicle_state": {"start_byte": 2, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 10}, # 0=OFF,1=STARTING,2=READY,3=ACCEL,4=CRUISE,5=BRAKE,6=CHARGING,7=FAULT
            "drive_mode": {"start_byte": 3, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 3},    # 0=ECO, 1=NORMAL, 2=POWER
            "gear_state": {"start_byte": 4, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 4},    # 0=N, 1=D, 2=R, 3=P
            "ignition_state": {"start_byte": 5, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 2}, # 0=OFF, 1=ACC, 2=ON
            "accelerator_pos": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "brake_pedal_pos": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
        }
    },
    # 0x200: Battery Pack A Core Status
    0x200: {
        "name": "BMS_A_STATUS",
        "ecu": "BMS_A",
        "cycle_time_ms": 1000,
        "signals": {
            "pack_a_soc": {"start_byte": 0, "length_bytes": 2, "type": "uint16", "scale": 0.01, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "pack_a_soh": {"start_byte": 2, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "pack_a_voltage": {"start_byte": 3, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "V", "min": 400, "max": 800},
            "pack_a_current": {"start_byte": 5, "length_bytes": 2, "type": "int16", "scale": 0.1, "offset": 0.0, "unit": "A", "min": -500, "max": 500},
            "pack_a_bms_state": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 5},
        }
    },
    # 0x205: Battery Pack A Cells & Thermal
    0x205: {
        "name": "BMS_A_CELL_THERMAL",
        "ecu": "BMS_A",
        "cycle_time_ms": 1000,
        "signals": {
            "pack_a_avg_temp": {"start_byte": 0, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_a_max_temp": {"start_byte": 1, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_a_min_temp": {"start_byte": 2, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_a_cell_max_v": {"start_byte": 3, "length_bytes": 2, "type": "uint16", "scale": 0.001, "offset": 0.0, "unit": "V", "min": 2.5, "max": 4.2},
            "pack_a_cell_min_v": {"start_byte": 5, "length_bytes": 2, "type": "uint16", "scale": 0.001, "offset": 0.0, "unit": "V", "min": 2.5, "max": 4.2},
            "pack_a_balancing_active": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
        }
    },
    # 0x210: Battery Pack B Core Status
    0x210: {
        "name": "BMS_B_STATUS",
        "ecu": "BMS_B",
        "cycle_time_ms": 1000,
        "signals": {
            "pack_b_soc": {"start_byte": 0, "length_bytes": 2, "type": "uint16", "scale": 0.01, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "pack_b_soh": {"start_byte": 2, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "pack_b_voltage": {"start_byte": 3, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "V", "min": 400, "max": 800},
            "pack_b_current": {"start_byte": 5, "length_bytes": 2, "type": "int16", "scale": 0.1, "offset": 0.0, "unit": "A", "min": -500, "max": 500},
            "pack_b_bms_state": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 5},
        }
    },
    # 0x215: Battery Pack B Cells & Thermal
    0x215: {
        "name": "BMS_B_CELL_THERMAL",
        "ecu": "BMS_B",
        "cycle_time_ms": 1000,
        "signals": {
            "pack_b_avg_temp": {"start_byte": 0, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_b_max_temp": {"start_byte": 1, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_b_min_temp": {"start_byte": 2, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "pack_b_cell_max_v": {"start_byte": 3, "length_bytes": 2, "type": "uint16", "scale": 0.001, "offset": 0.0, "unit": "V", "min": 2.5, "max": 4.2},
            "pack_b_cell_min_v": {"start_byte": 5, "length_bytes": 2, "type": "uint16", "scale": 0.001, "offset": 0.0, "unit": "V", "min": 2.5, "max": 4.2},
            "pack_b_balancing_active": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
        }
    },
    # 0x300: Motor ECU
    0x300: {
        "name": "MOTOR_STATUS",
        "ecu": "MOTOR_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "motor_rpm": {"start_byte": 0, "length_bytes": 2, "type": "int16", "scale": 1.0, "offset": 0.0, "unit": "RPM", "min": -6000, "max": 10000},
            "motor_torque": {"start_byte": 2, "length_bytes": 2, "type": "int16", "scale": 0.1, "offset": 0.0, "unit": "Nm", "min": -2500, "max": 2500},
            "motor_temp": {"start_byte": 4, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 150},
            "motor_stator_temp": {"start_byte": 5, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 150},
            "motor_efficiency": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "motor_state": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 5},
        }
    },
    # 0x310: Inverter ECU
    0x310: {
        "name": "INVERTER_STATUS",
        "ecu": "INVERTER_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "inverter_dc_v": {"start_byte": 0, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "V", "min": 0, "max": 800},
            "inverter_dc_i": {"start_byte": 2, "length_bytes": 2, "type": "int16", "scale": 0.1, "offset": 0.0, "unit": "A", "min": -600, "max": 600},
            "inverter_temp": {"start_byte": 4, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 120},
            "inverter_ac_freq": {"start_byte": 5, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "Hz", "min": 0, "max": 600},
            "inverter_fault": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
        }
    },
    # 0x400: Brake / ABS / ESC ECU
    0x400: {
        "name": "BRAKE_STATUS",
        "ecu": "BRAKE_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "brake_pressure_bar": {"start_byte": 0, "length_bytes": 2, "type": "uint16", "scale": 0.01, "offset": 0.0, "unit": "bar", "min": 0, "max": 15},
            "regen_power_kw": {"start_byte": 2, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "kW", "min": 0, "max": 200},
            "regen_torque_nm": {"start_byte": 4, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "Nm", "min": 0, "max": 1500},
            "abs_active": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "esc_active": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
        }
    },
    # 0x500: HVAC ECU
    0x500: {
        "name": "HVAC_STATUS",
        "ecu": "HVAC_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "cabin_temp": {"start_byte": 0, "length_bytes": 2, "type": "int16", "scale": 0.01, "offset": 0.0, "unit": "°C", "min": -20, "max": 60},
            "ambient_temp": {"start_byte": 2, "length_bytes": 2, "type": "int16", "scale": 0.01, "offset": 0.0, "unit": "°C", "min": -20, "max": 60},
            "target_cabin_temp": {"start_byte": 4, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "°C", "min": 15, "max": 30},
            "hvac_power_kw": {"start_byte": 5, "length_bytes": 2, "type": "uint16", "scale": 0.01, "offset": 0.0, "unit": "kW", "min": 0, "max": 15},
            "hvac_mode": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 4},
        }
    },
    # 0x600: Charger / DC-DC ECU
    0x600: {
        "name": "CHARGER_STATUS",
        "ecu": "CHARGER_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "charger_connected": {"start_byte": 0, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "charging_state": {"start_byte": 1, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "enum", "min": 0, "max": 5},
            "charger_voltage": {"start_byte": 2, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "V", "min": 0, "max": 850},
            "charger_current": {"start_byte": 4, "length_bytes": 2, "type": "uint16", "scale": 0.1, "offset": 0.0, "unit": "A", "min": 0, "max": 350},
            "dc_dc_output_v": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 0.1, "offset": 10.0, "unit": "V", "min": 10, "max": 30},
            "dc_dc_power_kw": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 0.05, "offset": 0.0, "unit": "kW", "min": 0, "max": 10},
        }
    },
    # 0x650: Thermal Management Controller
    0x650: {
        "name": "THERMAL_STATUS",
        "ecu": "THERMAL_CTRL",
        "cycle_time_ms": 1000,
        "signals": {
            "bat_coolant_temp": {"start_byte": 0, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 80},
            "motor_coolant_temp": {"start_byte": 1, "length_bytes": 1, "type": "int8", "scale": 1.0, "offset": 0.0, "unit": "°C", "min": -20, "max": 100},
            "coolant_pump_speed": {"start_byte": 2, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "radiator_fan_speed": {"start_byte": 3, "length_bytes": 1, "type": "uint8", "scale": 0.5, "offset": 0.0, "unit": "%", "min": 0, "max": 100},
            "coolant_pressure_bar": {"start_byte": 4, "length_bytes": 1, "type": "uint8", "scale": 0.05, "offset": 0.0, "unit": "bar", "min": 0, "max": 5},
            "thermal_warning": {"start_byte": 5, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "thermal_fault": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "aux_power_kw": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 0.05, "offset": 0.0, "unit": "kW", "min": 0, "max": 10},
        }
    },
    # 0x700: Safety & Door ECU
    0x700: {
        "name": "SAFETY_STATUS",
        "ecu": "SAFETY_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "hv_interlock_ok": {"start_byte": 0, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "isolation_kohm": {"start_byte": 1, "length_bytes": 2, "type": "uint16", "scale": 1.0, "offset": 0.0, "unit": "kOhm", "min": 0, "max": 5000},
            "door_front_open": {"start_byte": 3, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "door_middle_open": {"start_byte": 4, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "door_rear_open": {"start_byte": 5, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "emergency_stop": {"start_byte": 6, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
            "fire_smoke_detected": {"start_byte": 7, "length_bytes": 1, "type": "uint8", "scale": 1.0, "offset": 0.0, "unit": "bool", "min": 0, "max": 1},
        }
    },
    # 0x750: Sensors / Inertial Dynamics
    0x750: {
        "name": "DYNAMICS_SENSORS",
        "ecu": "DYNAMICS_ECU",
        "cycle_time_ms": 1000,
        "signals": {
            "accel_x": {"start_byte": 0, "length_bytes": 2, "type": "int16", "scale": 0.01, "offset": 0.0, "unit": "m/s²", "min": -15, "max": 15},
            "accel_y": {"start_byte": 2, "length_bytes": 2, "type": "int16", "scale": 0.01, "offset": 0.0, "unit": "m/s²", "min": -15, "max": 15},
            "accel_z": {"start_byte": 4, "length_bytes": 2, "type": "int16", "scale": 0.01, "offset": 0.0, "unit": "m/s²", "min": -25, "max": 25},
            "pitch_deg": {"start_byte": 6, "length_bytes": 1, "type": "int8", "scale": 0.5, "offset": 0.0, "unit": "°", "min": -30, "max": 30},
            "roll_deg": {"start_byte": 7, "length_bytes": 1, "type": "int8", "scale": 0.5, "offset": 0.0, "unit": "°", "min": -30, "max": 30},
        }
    }
}


def encode_can_frame(can_id: int, signal_values: Dict[str, Any]) -> CANFrame:
    """
    Encodes physical signal values into an 8-byte raw CANFrame payload according to the CAN dictionary.
    """
    if can_id not in CAN_DICTIONARY:
        raise ValueError(f"Unknown CAN arbitration ID: 0x{can_id:X}")

    msg_meta = CAN_DICTIONARY[can_id]
    payload = bytearray(8)

    for sig_name, sig_def in msg_meta["signals"].items():
        val = signal_values.get(sig_name, 0)
        raw_val = int(round((val - sig_def["offset"]) / sig_def["scale"]))
        sb = sig_def["start_byte"]
        lb = sig_def["length_bytes"]
        st = sig_def["type"]

        if st == "uint8":
            raw_val = max(0, min(255, raw_val))
            payload[sb] = raw_val & 0xFF
        elif st == "int8":
            raw_val = max(-128, min(127, raw_val))
            payload[sb] = struct.unpack("B", struct.pack("b", raw_val))[0]
        elif st == "uint16":
            raw_val = max(0, min(65535, raw_val))
            payload[sb:sb+2] = struct.pack(">H", raw_val)
        elif st == "int16":
            raw_val = max(-32768, min(32767, raw_val))
            payload[sb:sb+2] = struct.pack(">h", raw_val)
        elif st == "bool":
            payload[sb] = 1 if val else 0

    return CANFrame(
        arbitration_id=can_id,
        data=payload,
        dlc=8,
        timestamp=time.time(),
        source_ecu=msg_meta["ecu"],
        message_name=msg_meta["name"]
    )


def decode_can_frame(frame: CANFrame) -> Dict[str, Any]:
    """
    Decodes an 8-byte raw CANFrame into physical engineering values according to the CAN dictionary.
    """
    if frame.arbitration_id not in CAN_DICTIONARY:
        return {}

    msg_meta = CAN_DICTIONARY[frame.arbitration_id]
    payload = frame.data
    decoded = {}

    for sig_name, sig_def in msg_meta["signals"].items():
        sb = sig_def["start_byte"]
        lb = sig_def["length_bytes"]
        st = sig_def["type"]

        if sb + lb > len(payload):
            continue

        raw_bytes = payload[sb:sb+lb]

        if st == "uint8":
            raw_val = raw_bytes[0]
        elif st == "int8":
            raw_val = struct.unpack("b", raw_bytes)[0]
        elif st == "uint16":
            raw_val = struct.unpack(">H", raw_bytes)[0]
        elif st == "int16":
            raw_val = struct.unpack(">h", raw_bytes)[0]
        elif st == "bool":
            raw_val = 1 if raw_bytes[0] != 0 else 0
        else:
            raw_val = raw_bytes[0]

        eng_val = round((raw_val * sig_def["scale"]) + sig_def["offset"], 3)
        decoded[sig_name] = eng_val

    return decoded


class CANBus:
    """
    Thread-safe Simulated Vehicle CAN Network.
    Broadcasts CAN frames to subscribers (such as TCU-001 or Developer CAN Monitors).
    Supports failure injection (bus-off, message drop).
    """
    def __init__(self, bus_name: str = "CAN0"):
        self.bus_name = bus_name
        self._subscribers: List[queue.Queue] = []
        self._lock = threading.Lock()
        self.is_active = True
        self.total_frames_transmitted = 0
        self.error_frame_count = 0
        self.recent_frames: List[CANFrame] = []
        self._max_recent = 100

    def subscribe(self, max_queue: int = 1000) -> queue.Queue:
        q = queue.Queue(maxsize=max_queue)
        with self._lock:
            self._subscribers.append(q)
        return q

    def unsubscribe(self, q: queue.Queue):
        with self._lock:
            if q in self._subscribers:
                self._subscribers.remove(q)

    def publish(self, frame: CANFrame):
        if not self.is_active:
            self.error_frame_count += 1
            return

        with self._lock:
            self.total_frames_transmitted += 1
            self.recent_frames.append(frame)
            if len(self.recent_frames) > self._max_recent:
                self.recent_frames.pop(0)

            for q in list(self._subscribers):
                try:
                    q.put_nowait(frame)
                except queue.Full:
                    try:
                        q.get_nowait()
                        q.put_nowait(frame)
                    except queue.Empty:
                        pass

    def get_recent_frames(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._lock:
            return [f.to_dict() for f in self.recent_frames[-limit:]]

    def set_bus_state(self, active: bool):
        with self._lock:
            self.is_active = active
