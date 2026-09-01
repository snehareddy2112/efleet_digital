"""
Backend Configuration & Environment Settings
"""

import os
from dataclasses import dataclass, field
from typing import List

@dataclass
class Settings:
    PROJECT_NAME: str = "Olectra E-Fleet Digital Twin Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # MQTT & EMQX Configuration
    MQTT_BROKER_HOST: str = os.getenv("MQTT_BROKER_HOST", "localhost")
    MQTT_BROKER_PORT: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    MQTT_USE_EMBEDDED_BROKER: bool = os.getenv("MQTT_USE_EMBEDDED", "true").lower() == "true"
    EMQX_DASHBOARD_URL: str = os.getenv("EMQX_DASHBOARD_URL", "http://localhost:18083")

    # Time-Series Database
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "telemetry.db"))

    # Web & Streaming
    CORS_ORIGINS: List[str] = field(default_factory=lambda: ["*"])
    WS_STREAM_INTERVAL_MS: int = 1000 # 1 Hz telemetry stream

settings = Settings()
