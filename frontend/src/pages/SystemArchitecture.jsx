import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Radio, 
  Server, 
  Database, 
  Monitor, 
  Activity, 
  Zap, 
  Info 
} from 'lucide-react';

export default function SystemArchitecture({ telemetry, onOpenTraceModal }) {
  const [selectedNode, setSelectedNode] = useState('can');

  const nodes = {
    bus: {
      name: 'Electric Bus Systems (BUS-001)',
      layer: 'Vehicle Hardware & ECUs',
      purpose: 'Simulates physical multi-physics kinematics, dual 160 kWh LFP packs, 250 kW PMSM motor, SiC inverter, dual-zone HVAC, and high-voltage contactors.',
      inputs: 'Driver accelerator/brake demands, road elevation profile, passenger count, ambient temperature.',
      outputs: 'Torque, RPM, battery current/voltage/SOC, thermal coolant loops, contactor states.',
      protocol: 'Internal State Engine (Euler numerical integration, 1000ms discrete tick).',
      dataFormat: 'Floating point physical state variables & SAE DTC structures.',
      failureModes: 'Battery over-temp, cell voltage imbalance, isolation fault, inverter desaturation trip.'
    },
    can: {
      name: 'Vehicle CAN Bus Network (CAN0)',
      layer: 'In-Vehicle Network',
      purpose: 'Standard 500 kbps arbitration bus broadcasting raw 8-byte binary frames from ECUs to TCU-001.',
      inputs: 'ECU signal values encoded via CAN Dictionary bit layouts (IDs 0x100..0x750).',
      outputs: 'Raw 8-byte hex payload frames (DLC 8) with microsecond timestamps.',
      protocol: 'CAN 2.0B / J1939-like 8-byte frame broadcast.',
      dataFormat: '8-byte binary bytearrays (e.g. 0x100: [00 2A 02 01 02 40 00 00]).',
      failureModes: 'Bus-off error state, frame loss, checksum mismatch, arbitration collision.'
    },
    tcu: {
      name: 'TCU-001 Telematics Gateway',
      layer: 'Edge Computing & Gateway',
      purpose: 'Reads CAN frames, decodes engineering values, validates signal boundaries, aggregates 322 parameters, buffers offline data, and manages 4G/5G MQTT transport.',
      inputs: 'Raw CAN frames from CAN0 + GNSS Doppler GPS fix + 4G/5G modem RSSI/SINR.',
      outputs: 'Normalized JSON telemetry packets with monotonic sequence numbers.',
      protocol: 'MQTT 5.0 / 3.1.1 over TCP/TLS with QoS 1.',
      dataFormat: 'JSON telemetry payload with device headers & timestamps.',
      failureModes: '4G/5G cellular link loss (triggers store-and-forward flash buffer), memory overflow.'
    },
    emqx: {
      name: 'EMQX Cloud MQTT Broker',
      layer: 'Messaging Backbone',
      purpose: 'High-throughput, low-latency cloud MQTT broker routing telemetry packets from TCU-001 to Cloud Ingestion backend over TLS port 8883.',
      inputs: 'MQTT Publish from TCU-001 on topic `fleet/OLECTRA-E-FLEET/bus/BUS-001/telemetry`.',
      outputs: 'Fan-out delivery to Cloud Ingestion subscriber.',
      protocol: 'MQTT 5.0 on TLS port 8883.',
      dataFormat: 'UTF-8 Encoded JSON packets (2.4 KB average).',
      failureModes: 'Broker connection timeout, keepalive expiration, topic authorization failure.'
    },
    backend: {
      name: 'Cloud Ingestion & FastAPI Backend',
      layer: 'Cloud Core & REST/WS',
      purpose: 'Consumes MQTT packets, validates JSON schema, computes multi-stage latencies, stores time-series records in SQLite, and streams over WebSockets.',
      inputs: 'MQTT topic stream + REST queries from Operations Dashboard.',
      outputs: 'SQLite database writes + 1 Hz WebSocket broadcast + REST JSON APIs.',
      protocol: 'FastAPI / ASGI / WebSockets / SQLite.',
      dataFormat: 'Structured Python dicts / JSON payloads.',
      failureModes: 'DB lock contention, WebSocket client disconnect.'
    },
    dashboard: {
      name: 'Operations Control Dashboard',
      layer: 'Presentation & Fleet NOC',
      purpose: 'Real-time interactive user interface (React + Vite) providing cockpit gauges, CAN monitors, TCU inspectors, MQTT consoles, and DTC fault racks.',
      inputs: '1 Hz live WebSocket stream + REST API polling.',
      outputs: 'Visual telemetry graphs, Leaflet Telangana transit maps, fault controls.',
      protocol: 'WSS / HTTPS.',
      dataFormat: 'React DOM / Canvas / SVG rendering.',
      failureModes: 'Client network disconnection (auto-reconnection watchdog active).'
    }
  };

  const nodeOrder = [
    { id: 'bus', label: '1. Vehicle & ECUs', icon: Zap },
    { id: 'can', label: '2. CAN Bus (CAN0)', icon: Cpu },
    { id: 'tcu', label: '3. TCU-001 Gateway', icon: Radio },
    { id: 'emqx', label: '4. EMQX MQTT Cloud', icon: Server },
    { id: 'backend', label: '5. Ingestion Backend', icon: Database },
    { id: 'dashboard', label: '6. Operations UI', icon: Monitor }
  ];

  const current = nodes[selectedNode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>End-to-End System Architecture & Data Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict separation between Vehicle Physics → CAN Bus → TCU-001 → EMQX Cloud → Cloud Ingestion → Operations Dashboard.
          </p>
        </div>

        <button
          onClick={onOpenTraceModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Launch Live Signal Tracer</span>
        </button>
      </div>

      {/* Interactive Horizontal Pipeline Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {nodeOrder.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-3 rounded-lg border text-left transition ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-dark-850 border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 live-pulse" />}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{node.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Click to inspect</div>
            </button>
          );
        })}
      </div>

      {/* Detailed Layer Inspector */}
      <div className="glass-panel p-4 rounded-lg border space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{current.name}</h3>
            <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-semibold">{current.layer}</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
          {current.purpose}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Inputs</span>
            <span className="text-slate-800 dark:text-slate-200">{current.inputs}</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Outputs</span>
            <span className="text-slate-800 dark:text-slate-200">{current.outputs}</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Protocol</span>
            <span className="text-slate-800 dark:text-slate-200">{current.protocol}</span>
          </div>
          <div className="p-3 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Data Format</span>
            <span className="text-slate-800 dark:text-slate-200">{current.dataFormat}</span>
          </div>
        </div>

        <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs font-mono">
          <span className="text-amber-800 dark:text-amber-400 font-bold block mb-0.5">Failure Modes & Handlers:</span>
          <span className="text-slate-700 dark:text-slate-300">{current.failureModes}</span>
        </div>
      </div>
    </div>
  );
}
