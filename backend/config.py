"""
Backend Configuration & Environment Settings
Safely loads environment variables from .env if present.
"""

import os
from dataclasses import dataclass, field
from typing import List, Optional

def load_dotenv_file():
    """Lightweight built-in .env parser to avoid dependency issues"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
        except Exception as e:
            print(f"[Config] Note: Could not read .env: {e}")

load_dotenv_file()

@dataclass
class Settings:
    PROJECT_NAME: str = "Olectra E-Fleet Digital Twin Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # MQTT & EMQX Cloud Configuration
    MQTT_BROKER_HOST: str = os.getenv("MQTT_BROKER_HOST", "localhost")
    MQTT_BROKER_PORT: int = int(os.getenv("MQTT_BROKER_PORT", "1883"))
    MQTT_TLS: bool = os.getenv("MQTT_TLS", "false").lower() in ("true", "1", "yes")
    MQTT_USERNAME: Optional[str] = os.getenv("MQTT_USERNAME", None)
    MQTT_PASSWORD: Optional[str] = os.getenv("MQTT_PASSWORD", None)
    MQTT_CA_CERT: Optional[str] = os.getenv("MQTT_CA_CERT", None)
    MQTT_USE_EMBEDDED_BROKER: bool = os.getenv("MQTT_USE_EMBEDDED", "false").lower() in ("true", "1", "yes")
    EMQX_DASHBOARD_URL: str = os.getenv("EMQX_DASHBOARD_URL", "https://cloud.emqx.com/console/deployments")

    # Time-Series Database
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "telemetry.db"))

    # Web & Streaming
    CORS_ORIGINS: List[str] = field(default_factory=lambda: ["*"])
    WS_STREAM_INTERVAL_MS: int = 1000 # 1 Hz telemetry stream

settings = Settings()
