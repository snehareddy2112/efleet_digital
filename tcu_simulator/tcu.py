"""
TCUSimulator: Physical Telematics Control Unit (TCU-001) Device Simulator
Connects to vehicle CAN bus, decodes frames, buffers offline packets, manages MQTT connections, and publishes telemetry.
"""

import time
import json
import queue
import threading
from typing import Dict, Any, List, Optional, Callable

from vehicle_network.can_bus import CANBus, CANFrame
from .modem import TCUModem
from .buffer import TCUBuffer
from .aggregator import TelemetryAggregator

class TCUSimulator:
    def __init__(self,
                 tcu_id: str = "TCU-001",
                 bus_id: str = "BUS-001",
                 fleet_id: str = "OLECTRA-E-FLEET",
                 can_bus: Optional[CANBus] = None,
                 mqtt_publish_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None):
        self.tcu_id = tcu_id
        self.bus_id = bus_id
        self.fleet_id = fleet_id
        self.can_bus = can_bus
        self.mqtt_publish_cb = mqtt_publish_callback

        # Hardware & Submodules
        self.modem = TCUModem()
        self.buffer = TCUBuffer(max_capacity=10000)
        self.aggregator = TelemetryAggregator(tcu_id=tcu_id, bus_id=bus_id, fleet_id=fleet_id)

        # CAN Subscription Queue
        self.can_queue: Optional[queue.Queue] = None
        if self.can_bus:
            self.can_queue = self.can_bus.subscribe(max_queue=2000)

        # Connection & Lifecycle States
        self.is_powered = True
        self.mqtt_connected = True
        self.network_connected = True
        self.tcu_temperature_c = 38.5
        self.tcu_voltage_v = 24.2
        self.tcu_current_a = 0.45

        # Counters & Metrics
        self.total_packets_sent = 0
        self.total_bytes_sent = 0
        self.reconnect_count = 0
        self.retry_count = 0
        self.last_publish_time = time.time()
        self.last_published_packet: Optional[Dict[str, Any]] = None

        # Topics
        self.topic_telemetry = f"fleet/{self.fleet_id}/bus/{self.bus_id}/telemetry"
        self.topic_status = f"fleet/{self.fleet_id}/bus/{self.bus_id}/status"
        self.topic_diagnostics = f"fleet/{self.fleet_id}/bus/{self.bus_id}/diagnostics"
        self.topic_events = f"fleet/{self.fleet_id}/bus/{self.bus_id}/events"
        self.topic_tcu_status = f"fleet/{self.fleet_id}/tcu/{self.tcu_id}/status"

    def set_mqtt_connection(self, connected: bool):
        """Simulates disconnecting or reconnecting MQTT transport"""
        if self.mqtt_connected != connected and connected:
            self.reconnect_count += 1
        self.mqtt_connected = connected
        if connected:
            self.flush_buffer()

    def set_network_connection(self, connected: bool):
        """Simulates 4G/5G cellular modem loss or restoration"""
        self.network_connected = connected
        self.modem.is_cellular_connected = connected
        if connected and self.mqtt_connected:
            self.flush_buffer()

    def process_can_frames(self) -> List[CANFrame]:
        """Drains incoming CAN frames from the CAN bus queue"""
        frames = []
        if not self.can_queue:
            return frames

        while True:
            try:
                frame = self.can_queue.get_nowait()
                frames.append(frame)
            except queue.Empty:
                break

        if frames:
            self.aggregator.ingest_can_frames(frames)
        return frames

    def step(self, vehicle_full_state: Dict[str, Any], dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        TCU operational tick:
        1. Reads and decodes CAN frames from vehicle network.
        2. Queries GNSS and 4G/5G radio modem.
        3. Aggregates into normalized telemetry packet.
        4. If online, publishes to MQTT; if offline, pushes to local store-and-forward buffer.
        """
        # Read CAN frames from simulated vehicle CAN network
        can_frames = self.process_can_frames()

        # Update Modem & Radio
        lat = vehicle_full_state.get("latitude", 17.3850)
        lng = vehicle_full_state.get("longitude", 78.4867)
        spd = vehicle_full_state.get("speed_kmh", 0.0)
        modem_state = self.modem.step(lat, lng, spd)

        # TCU internal metrics
        tcu_metrics = {
            "tcu_status": "ONLINE" if (self.network_connected and self.mqtt_connected) else ("BUFFERING" if self.network_connected else "OFFLINE"),
            "tcu_temperature": round(self.tcu_temperature_c, 1),
            "tcu_voltage": round(self.tcu_voltage_v, 2),
            "tcu_current": round(self.tcu_current_a, 2),
            "mqtt_connection": self.mqtt_connected and self.network_connected,
            "mqtt_latency": 14.5 if self.mqtt_connected else 0.0,
            "buffer_size": self.buffer.size,
            "retry_count": self.retry_count,
            "reconnect_count": self.reconnect_count
        }

        # Build normalized telemetry packet
        packet = self.aggregator.build_normalized_packet(vehicle_full_state, modem_state, tcu_metrics)
        payload_bytes = len(json.dumps(packet).encode("utf-8"))
        packet["payload_size"] = payload_bytes

        # Transmit or buffer
        is_online = self.mqtt_connected and self.network_connected
        if is_online:
            # If there were buffered packets, flush them first in order
            if not self.buffer.is_empty():
                self.flush_buffer()

            # Publish live packet
            self._publish_packet(self.topic_telemetry, packet)
        else:
            # Offline: Store in local buffer
            self.buffer.push(packet)
            self.retry_count += 1

        self.last_published_packet = packet
        return packet

    def flush_buffer(self):
        """Flushes buffered packets to MQTT when connection is restored"""
        if not (self.mqtt_connected and self.network_connected):
            return

        batch = self.buffer.pop_batch(batch_size=100)
        for pkt in batch:
            self._publish_packet(self.topic_telemetry, pkt)

    def _publish_packet(self, topic: str, packet: Dict[str, Any]):
        self.total_packets_sent += 1
        raw_json = json.dumps(packet)
        self.total_bytes_sent += len(raw_json.encode("utf-8"))
        self.last_publish_time = time.time()

        if self.mqtt_publish_cb:
            try:
                self.mqtt_publish_cb(topic, packet)
            except Exception:
                pass

    def get_status(self) -> Dict[str, Any]:
        return {
            "tcu_id": self.tcu_id,
            "bus_id": self.bus_id,
            "fleet_id": self.fleet_id,
            "status": "ONLINE" if (self.network_connected and self.mqtt_connected) else ("BUFFERING" if self.network_connected else "OFFLINE"),
            "network_connected": self.network_connected,
            "mqtt_connected": self.mqtt_connected,
            "network_type": self.modem.network_type,
            "signal_strength": self.modem.csq_signal,
            "rsrp": self.modem.rsrp_dbm,
            "rsrq": self.modem.rsrq_db,
            "sinr": self.modem.sinr_db,
            "buffer_size": self.buffer.size,
            "total_packets_sent": self.total_packets_sent,
            "total_bytes_sent": self.total_bytes_sent,
            "reconnect_count": self.reconnect_count,
            "retry_count": self.retry_count,
            "imei": self.modem.imei,
            "iccid": self.modem.iccid,
            "firmware_version": self.aggregator.firmware_version
        }
