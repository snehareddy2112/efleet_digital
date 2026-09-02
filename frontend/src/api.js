/**
 * REST API and WebSocket Client for E-Fleet Digital Operations Platform
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

export async function fetchFleetSummary() {
  const res = await fetch(`${API_BASE}/fleet`);
  return res.json();
}

export async function fetchBusTelemetry(busId = 'BUS-001') {
  const res = await fetch(`${API_BASE}/buses/${busId}/telemetry`);
  return res.json();
}

export async function fetchTelemetrySeries(busId = 'BUS-001', limit = 60) {
  const res = await fetch(`${API_BASE}/buses/${busId}/telemetry/series?limit=${limit}`);
  return res.json();
}

export async function fetchSignalRegistry() {
  const res = await fetch(`${API_BASE}/buses/BUS-001/telemetry/signals`);
  return res.json();
}

export async function fetchRecentCanFrames(busId = 'BUS-001', limit = 50) {
  const res = await fetch(`${API_BASE}/buses/${busId}/can/recent?limit=${limit}`);
  return res.json();
}

export async function fetchCanDictionary(busId = 'BUS-001') {
  const res = await fetch(`${API_BASE}/buses/${busId}/can/dictionary`);
  return res.json();
}

export async function fetchTcuStatus(busId = 'BUS-001') {
  const res = await fetch(`${API_BASE}/buses/${busId}/tcu`);
  return res.json();
}

export async function fetchTcuRawPacket(busId = 'BUS-001') {
  const res = await fetch(`${API_BASE}/buses/${busId}/tcu/raw-packet`);
  return res.json();
}

export async function toggleTcuNetwork(busId, connected) {
  const res = await fetch(`${API_BASE}/buses/${busId}/tcu/control/network`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connected })
  });
  return res.json();
}

export async function toggleTcuMqtt(busId, connected) {
  const res = await fetch(`${API_BASE}/buses/${busId}/tcu/control/mqtt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connected })
  });
  return res.json();
}

export async function fetchMqttStats() {
  const res = await fetch(`${API_BASE}/mqtt/stats`);
  return res.json();
}

export async function fetchMqttMessages(limit = 50) {
  const res = await fetch(`${API_BASE}/mqtt/messages?limit=${limit}`);
  return res.json();
}

export async function publishMqttTest(topic, message) {
  const res = await fetch(`${API_BASE}/mqtt/test-publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, message })
  });
  return res.json();
}

export async function fetchDiagnostics(busId = 'BUS-001') {
  const res = await fetch(`${API_BASE}/buses/${busId}/diagnostics`);
  return res.json();
}

export async function injectFault(busId, faultName, enabled) {
  const res = await fetch(`${API_BASE}/buses/${busId}/diagnostics/fault-injection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault_name: faultName, enabled })
  });
  return res.json();
}

export async function controlSimulator(action, value = null) {
  const res = await fetch(`${API_BASE}/simulator/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, value })
  });
  return res.json();
}

export function createTelemetryWebSocket(onMessage, onOpen, onClose) {
  let wsUrl;
  if (import.meta.env.VITE_WS_URL) {
    wsUrl = import.meta.env.VITE_WS_URL;
  } else if (import.meta.env.VITE_BACKEND_URL) {
    const backendHost = import.meta.env.VITE_BACKEND_URL.replace(/^https?:\/\//, '');
    const protocol = import.meta.env.VITE_BACKEND_URL.startsWith('https') ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//${backendHost}/ws/telemetry`;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
  }

  let ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (onMessage) onMessage(parsed);
    } catch (e) {
      console.error('WS Parse Error', e);
    }
  };

  ws.onclose = () => {
    if (onClose) onClose();
  };

  return ws;
}
