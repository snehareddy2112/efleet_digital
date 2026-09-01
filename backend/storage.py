"""
Time-Series Storage Engine (SQLite + In-Memory Fast Rolling Buffers)
Stores all telemetry records indexed by fleet_id, bus_id, timestamp, and parameter values.
"""

import sqlite3
import json
import time
import threading
from typing import Dict, Any, List, Optional
import collections

class TimeSeriesStorage:
    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self._lock = threading.Lock()
        self.recent_telemetry_by_bus: Dict[str, collections.deque] = {}
        self.latest_telemetry_by_bus: Dict[str, Dict[str, Any]] = {}
        self._max_history = 300 # 300 seconds rolling history
        self._init_db()

    def _init_db(self):
        with self._lock:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS telemetry_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fleet_id TEXT,
                    bus_id TEXT,
                    tcu_id TEXT,
                    timestamp REAL,
                    sequence_number INTEGER,
                    speed REAL,
                    soc REAL,
                    voltage REAL,
                    current REAL,
                    power REAL,
                    motor_rpm INTEGER,
                    motor_temp REAL,
                    cabin_temp REAL,
                    payload_json TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_bus_ts ON telemetry_records (bus_id, timestamp)")
            conn.commit()
            conn.close()

    def write_telemetry(self, packet: Dict[str, Any]):
        """Writes a normalized telemetry packet to storage"""
        bus_id = packet.get("bus_id", "BUS-001")
        fleet_id = packet.get("fleet_id", "OLECTRA-E-FLEET")
        tcu_id = packet.get("tcu_id", "TCU-001")
        ts = packet.get("device_timestamp", time.time())
        seq = packet.get("sequence_number", 0)

        speed = packet.get("vehicle_speed", 0.0)
        soc = packet.get("total_battery_soc", 80.0)
        v = packet.get("total_battery_voltage", 650.0)
        i = packet.get("total_battery_current", 0.0)
        p = packet.get("total_battery_power", 0.0)
        rpm = packet.get("motor_rpm", 0)
        m_temp = packet.get("motor_temperature", 60.0)
        cab_temp = packet.get("cabin_temperature", 23.0)

        # Update in-memory rolling buffers
        with self._lock:
            if bus_id not in self.recent_telemetry_by_bus:
                self.recent_telemetry_by_bus[bus_id] = collections.deque(maxlen=self._max_history)

            self.recent_telemetry_by_bus[bus_id].append(packet)
            self.latest_telemetry_by_bus[bus_id] = packet

            # Write to SQLite
            try:
                conn = sqlite3.connect(self.db_path, check_same_thread=False)
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO telemetry_records (
                        fleet_id, bus_id, tcu_id, timestamp, sequence_number,
                        speed, soc, voltage, current, power, motor_rpm, motor_temp, cabin_temp, payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    fleet_id, bus_id, tcu_id, ts, seq,
                    speed, soc, v, i, p, rpm, m_temp, cab_temp, json.dumps(packet)
                ))
                conn.commit()
                conn.close()
            except Exception:
                pass

    def get_latest_telemetry(self, bus_id: str = "BUS-001") -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.latest_telemetry_by_bus.get(bus_id)

    def get_latest(self, bus_id: str = "BUS-001") -> Optional[Dict[str, Any]]:
        return self.get_latest_telemetry(bus_id)

    def get_recent_series(self, bus_id: str = "BUS-001", limit: int = 60) -> List[Dict[str, Any]]:
        with self._lock:
            buf = self.recent_telemetry_by_bus.get(bus_id)
            if not buf:
                return []
            return list(buf)[-limit:]

    def get_all_buses_latest(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self.latest_telemetry_by_bus.values())
