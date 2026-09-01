"""
TCUSimulator: Physical Telematics Control Unit (TCU-001) Device Simulator
Connects to vehicle CAN bus, decodes frames, buffers offline packets, manages network MQTT/TLS connections, and publishes telemetry.
"""

import time
import json
import queue
import threading
import ssl
from typing import Dict, Any, List, Optional, Callable

import paho.mqtt.client as mqtt

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
                 mqtt_publish_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
                 mqtt_host: Optional[str] = None,
                 mqtt_port: Optional[int] = None,
                 mqtt_tls: bool = False,
                 mqtt_username: Optional[str] = None,
                 mqtt_password: Optional[str] = None,
                 mqtt_ca_cert: Optional[str] = None):
        self.tcu_id = tcu_id
        self.bus_id = bus_id
        self.fleet_id = fleet_id
        self.can_bus = can_bus
        self.mqtt_publish_cb = mqtt_publish_callback

        # MQTT Network Client configuration
        self.mqtt_host = mqtt_host
        self.mqtt_port = mqtt_port or (8883 if mqtt_tls else 1883)
        self.mqtt_tls = mqtt_tls
        self.mqtt_username = mqtt_username
        self.mqtt_password = mqtt_password
        self.mqtt_ca_cert = mqtt_ca_cert

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
        self.mqtt_connected = False
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

        # Paho MQTT Client setup
        self._mqtt_client: Optional[mqtt.Client] = None
        self._lock = threading.Lock()
        if self.mqtt_host:
            self._init_network_mqtt_client()
        else:
            self.mqtt_connected = True

    def _init_network_mqtt_client(self):
        """Initializes real network MQTT client with TLS and credentials"""
        try:
            # Generate deterministic client ID
            client_id = f"{self.tcu_id}-client"
            try:
                # Paho MQTT v2 vs v1 compatibility
                self._mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=client_id)
            except Exception:
                self._mqtt_client = mqtt.Client(client_id=client_id)

            if self.mqtt_username and self.mqtt_password:
                self._mqtt_client.username_pw_set(self.mqtt_username, self.mqtt_password)

            if self.mqtt_tls:
                context = ssl.create_default_context()
                if self.mqtt_ca_cert and os.path.exists(self.mqtt_ca_cert):
                    context.load_verify_locations(self.mqtt_ca_cert)
                self._mqtt_client.tls_set_context(context)

            def on_connect(client, userdata, flags, rc, properties=None):
                if rc == 0:
                    with self._lock:
                        self.mqtt_connected = True
                    print(f"[TCU-001 MQTT] Connected to broker {self.mqtt_host}:{self.mqtt_port}")
                    self.flush_buffer()
                else:
                    with self._lock:
                        self.mqtt_connected = False
                    print(f"[TCU-001 MQTT] Connect failed with code {rc}")

            def on_disconnect(client, userdata, rc, properties=None):
                with self._lock:
                    self.mqtt_connected = False
                    self.reconnect_count += 1
                print(f"[TCU-001 MQTT] Disconnected (code {rc}), buffering enabled")

            self._mqtt_client.on_connect = on_connect
            self._mqtt_client.on_disconnect = on_disconnect

            print(f"[TCU-001 MQTT] Connecting to {self.mqtt_host}:{self.mqtt_port} (TLS={self.mqtt_tls})...")
            self._mqtt_client.connect_async(self.mqtt_host, self.mqtt_port, keepalive=60)
            self._mqtt_client.loop_start()
        except Exception as e:
            print(f"[TCU-001 MQTT Init Error] {e}")
            self.mqtt_connected = False

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
        can_frames = self.process_can_frames()

        lat = vehicle_full_state.get("latitude", 17.3850)
        lng = vehicle_full_state.get("longitude", 78.4867)
        spd = vehicle_full_state.get("vehicle_speed", vehicle_full_state.get("speed_kmh", 0.0))
        modem_state = self.modem.step(lat, lng, spd)

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

        packet = self.aggregator.build_normalized_packet(vehicle_full_state, modem_state, tcu_metrics)
        payload_bytes = len(json.dumps(packet).encode("utf-8"))
        packet["payload_size"] = payload_bytes

        is_online = self.mqtt_connected and self.network_connected
        if is_online:
            if not self.buffer.is_empty():
                self.flush_buffer()
            self._publish_packet(self.topic_telemetry, packet)
        else:
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

        # 1. Publish over real network MQTT client if active
        if self._mqtt_client and self.mqtt_connected:
            try:
                self._mqtt_client.publish(topic, raw_json, qos=1)
            except Exception as e:
                print(f"[TCU-001 Publish Error] {e}")

        # 2. Notify local ingestion callback
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
            "firmware_version": self.aggregator.firmware_version,
            "broker_host": self.mqtt_host or "internal-broker",
            "broker_port": self.mqtt_port,
            "tls_active": self.mqtt_tls
        }
