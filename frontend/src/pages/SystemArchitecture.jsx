import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Radio, 
  Server, 
  Database, 
  Monitor, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Info,
  Zap,
  Activity
} from 'lucide-react';

export default function SystemArchitecture({ telemetry, onOpenTraceModal }) {
  const [selectedNode, setSelectedNode] = useState('can');

  const nodes = {
    bus: {
      name: 'Electric Bus Systems (BUS-001)',
      layer: 'Vehicle Hardware & ECUs',
      purpose: 'Simulates physical multi-physics kinematics, dual 160 kWh LFP packs, 250 kW PMSM motor, SiC inverter, dual-zone HVAC, and contactors.',
      inputs: 'Driver accelerator/brake demands, road elevation profile, passenger count, ambient temperature.',
      outputs: 'Torque, RPM, battery current/voltage/SOC, thermal coolant loops, contactor states.',
      protocol: 'Internal State Engine (Euler integration, 1000ms discrete tick).',
      dataFormat: 'Floating point physical state variables & SAE DTC structures.',
      failureModes: 'Battery over-temp, cell voltage imbalance, isolation fault, inverter desaturation trip.'
    },
    can: {
      name: 'Simulated CAN Bus Network (CAN0)',
      layer: 'In-Vehicle Network',
      purpose: 'Standard 250/500 kbps arbitration bus broadcasting raw 8-byte binary frames from ECUs to TCU.',
      inputs: 'ECU signal values encoded via CAN Dictionary bit layouts (IDs 0x100..0x750).',
      outputs: 'Raw 8-byte hex payload frames (DLC 8) with microsecond timestamps.',
      protocol: 'CAN 2.0B / J1939-like 8-byte frame broadcast.',
      dataFormat: '8-byte binary bytearrays (e.g. 0x100: [00 2A 02 01 02 40 00 00]).',
      failureModes: 'Bus-off error state, frame loss, checksum mismatch, arbitration collision.'
    },
    tcu: {
      name: 'TCU-001 Telematics Device',
      layer: 'Edge Computing & Gateway',
      purpose: 'Reads CAN frames, decodes engineering values, validates signal boundaries, aggregates 280+ parameters, buffers offline data, and manages 4G/5G MQTT transport.',
      inputs: 'Raw CAN frames from CAN0 + GNSS Doppler GPS fix + 4G/5G modem RSSI/SINR.',
      outputs: 'Normalized JSON telemetry packets with monotonic sequence numbers.',
      protocol: 'MQTT 5.0 / 3.1.1 over TCP/TLS with QoS 1.',
      dataFormat: 'JSON telemetry payload with device headers & timestamps.',
      failureModes: '4G/5G cellular link loss (triggers store-and-forward flash buffer), memory overflow.'
    },
    emqx: {
      name: 'EMQX MQTT Enterprise Broker',
      layer: 'Messaging Backbone',
      purpose: 'High-throughput, low-latency MQTT broker routing telemetry packets from 100+ TCUs to Cloud Ingestion backend.',
      inputs: 'MQTT Publish from TCU-001 on topic `fleet/OLECTRA-E-FLEET/bus/BUS-001/telemetry`.',
      outputs: 'Fan-out delivery to Cloud Ingestion subscribers.',
      protocol: 'MQTT 5.0 on TCP port 1883 / TLS 8883.',
      dataFormat: 'UTF-8 Encoded JSON packets (2.4 KB average).',
      failureModes: 'Broker connection timeout, keepalive expiration, topic authorization failure.'
    },
    backend: {
      name: 'Cloud Ingestion & FastAPI Backend',
      layer: 'Cloud Core & REST/WS',
      purpose: 'Consumes MQTT packets, validates JSON schema, computes multi-stage latencies, stores time-series records in SQLite, and streams over WebSockets.',
      inputs: 'MQTT topic stream + REST queries from Dashboard.',
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
    { id: 'bus', label: '1. Vehicle Systems & ECUs', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 'can', label: '2. Simulated CAN Bus', icon: Cpu, color: 'text-cyan-400', border: 'border-cyan-500/40' },
    { id: 'tcu', label: '3. TCU-001 Gateway', icon: Radio, color: 'text-purple-400', border: 'border-purple-500/40' },
    { id: 'emqx', label: '4. EMQX MQTT Broker', icon: Server, color: 'text-blue-400', border: 'border-blue-500/40' },
    { id: 'backend', label: '5. Cloud Ingestion Backend', icon: Database, color: 'text-emerald-400', border: 'border-emerald-500/40' },
    { id: 'dashboard', label: '6. Live Operations Dashboard', icon: Monitor, color: 'text-rose-400', border: 'border-rose-500/40' }
  ];

  const current = nodes[selectedNode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>End-to-End System Architecture & Data Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation between Vehicle Physical Simulation → CAN Network → TCU Device → MQTT Broker → Cloud Ingestion → Dashboard.
          </p>
        </div>

        <button
          onClick={onOpenTraceModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-dark-900 font-bold text-xs transition shadow-md shadow-cyan-500/20"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Live E2E Message Tracer</span>
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
              className={`p-3.5 rounded-xl border text-left transition ${
                isSelected
                  ? `bg-dark-800 shadow-lg ${node.border} ring-1 ring-cyan-400`
                  : 'bg-dark-900/80 border-dark-700 hover:border-dark-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${node.color}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">{node.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Click to inspect layer</div>
            </button>
          );
        })}
      </div>

      {/* Layer Detail Inspector Card */}
      <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">{current.name}</h3>
            <span className="text-xs text-cyan-400 font-mono font-semibold">{current.layer}</span>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-dark-900 text-slate-300 font-mono border border-dark-700">
            Selected Stage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-dark-900/80 border border-dark-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Primary Purpose</span>
            <p className="text-slate-200 font-sans leading-relaxed">{current.purpose}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-900/80 border border-dark-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Protocol & Timing</span>
            <p className="text-cyan-300 font-bold">{current.protocol}</p>
            <p className="text-[11px] text-slate-400 font-sans mt-1">Data Format: <span className="text-slate-200">{current.dataFormat}</span></p>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-900/80 border border-dark-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Inputs & Influx</span>
            <p className="text-slate-200 font-sans">{current.inputs}</p>
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans mt-2">Outputs & Outflux</span>
            <p className="text-slate-200 font-sans">{current.outputs}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-900/80 border border-dark-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-400 block font-sans">Failure Modes & Resilience Handling</span>
            <p className="text-rose-300 font-sans">{current.failureModes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
