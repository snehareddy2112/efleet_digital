"""
MQTT / EMQX Visual Console REST Routes
Provides broker statistics, live message stream, test message publisher, and topology info.
"""

from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, Any, List
import time

router = APIRouter(prefix="/mqtt", tags=["MQTT Console"])

ingestion_service_instance = None

def set_ingestion_service(service):
    global ingestion_service_instance
    ingestion_service_instance = service

@router.get("/stats")
def get_mqtt_stats():
    if not ingestion_service_instance:
        raise HTTPException(status_code=503, detail="MQTT Ingestion Service not ready")
    return ingestion_service_instance.get_console_stats()

@router.get("/messages")
def get_recent_mqtt_messages(limit: int = Query(50, ge=5, le=200)):
    if not ingestion_service_instance:
        raise HTTPException(status_code=503, detail="MQTT Ingestion Service not ready")
    return ingestion_service_instance.get_recent_messages(limit=limit)

@router.post("/test-publish")
def publish_test_message(topic: str = Body("fleet/OLECTRA-E-FLEET/bus/BUS-001/test"),
                         message: str = Body("test-ping")):
    if not ingestion_service_instance:
        raise HTTPException(status_code=503, detail="MQTT Ingestion Service not ready")

    test_packet = {
        "source": "mqtt-visual-console",
        "type": "TEST_MESSAGE",
        "message": message,
        "timestamp": time.time(),
        "timestamp_iso": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    ingestion_service_instance.handle_tcu_publish(topic, test_packet)
    return {"status": "published", "topic": topic, "payload": test_packet}
