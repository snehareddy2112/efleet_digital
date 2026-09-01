"""
WebSocket Manager
Handles real-time WebSocket client connections and broadcasts live telemetry packets to connected frontend dashboards.
"""

from fastapi import WebSocket
from typing import List, Dict, Any
import json
import asyncio
import threading

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._lock = threading.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        with self._lock:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast_json(self, data: Dict[str, Any]):
        """Broadcasts a JSON message to all active WebSocket clients"""
        msg_str = json.dumps(data)
        dead_connections = []
        with self._lock:
            connections = list(self.active_connections)

        for ws in connections:
            try:
                await ws.send_text(msg_str)
            except Exception:
                dead_connections.append(ws)

        if dead_connections:
            with self._lock:
                for ws in dead_connections:
                    if ws in self.active_connections:
                        self.active_connections.remove(ws)

ws_manager = WebSocketManager()
