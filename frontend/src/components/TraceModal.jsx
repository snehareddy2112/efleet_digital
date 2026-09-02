import React from 'react';
import { X, CheckCircle2, Cpu, Radio, MessageSquare, Server, Database, Monitor, Zap } from 'lucide-react';

export default function TraceModal({ isOpen, onClose, telemetry }) {
  if (!isOpen || !telemetry) return null;

  const e2e = telemetry.e2e_trace || {
    can_to_tcu_ms: 1.2,
    tcu_to_mqtt_ms: 2.4,
    mqtt_to_backend_ms: 3.1,
    backend_to_db_ms: 0.8,
    total_e2e_ms: 7.5
  };

  const steps = [
    {
      title: '1. Vehicle Systems & ECUs',
      sub: 'VCU & BMS compute state',
      icon: Zap,
      data: {
        Speed: `${telemetry.vehicle_speed?.toFixed(1)} km/h`,
        Torque: `${telemetry.motor_torque?.toFixed(1)} Nm`,
        SOC: `${telemetry.total_battery_soc?.toFixed(1)}%`,
        Current: `${telemetry.total_battery_current?.toFixed(1)} A`
      }
    },
    {
      title: '2. Simulated CAN Bus',
      sub: '8-Byte CAN Frames Broadcast',
      icon: Cpu,
      data: {
        'CAN ID 0x100': 'VCU_STATUS (Speed/State)',
        'CAN ID 0x200': 'BMS_A_STATUS (SOC/V/I)',
        'CAN ID 0x300': 'MOTOR_STATUS (RPM/Torque)',
        'Cycle Time': '1000 ms'
      }
    },
    {
      title: '3. TCU-001 Gateway',
      sub: 'Decodes & Aggregates Payload',
      icon: Radio,
      data: {
        'Seq Number': telemetry.sequence_number || 1,
        'Processing': `${e2e.tcu_to_mqtt_ms} ms`,
        'Radio': telemetry.network_type || '5G_NR_NSA',
        'RSRP': `${telemetry.rsrp || -85.4} dBm`
      }
    },
    {
      title: '4. MQTT / EMQX Broker',
      sub: 'Published to Cloud Topic',
      icon: MessageSquare,
      data: {
        Topic: `fleet/${telemetry.fleet_id || 'OLECTRA-E-FLEET'}/bus/${telemetry.bus_id || 'BUS-001'}/telemetry`,
        QoS: telemetry.qos || 1,
        'Size': `${telemetry.payload_size || 2420} Bytes`,
        'Network RTT': '14.5 ms'
      }
    },
    {
      title: '5. Cloud Ingestion Backend',
      sub: 'FastAPI Ingestion Engine',
      icon: Server,
      data: {
        'Ingest Latency': `${e2e.mqtt_to_backend_ms} ms`,
        'Validation': 'Passed (322 signals)',
        'E2E Latency': `${e2e.total_e2e_ms} ms`
      }
    },
    {
      title: '6. Storage & Operations UI',
      sub: 'SQLite + Real-Time WebSocket',
      icon: Monitor,
      data: {
        'DB Write': `${e2e.backend_to_db_ms} ms`,
        'WS Delivery': '< 1.0 ms',
        'Stream Status': 'LIVE 1 Hz'
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-650 rounded-lg max-w-4xl w-full p-5 shadow-2xl overflow-y-auto max-h-[90vh] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-dark-700">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live End-to-End Telemetry Signal Trace</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tracing message across architectural boundaries: Bus Physics → CAN0 → TCU-001 → EMQX Cloud → Ingestion → WebSocket.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-750 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Latency Banner */}
        <div className="my-3 p-2.5 rounded bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-700 dark:text-slate-300">Total Latency:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{e2e.total_e2e_ms} ms</span>
          </div>
          <div className="text-[11px] text-slate-500">
            CAN: {e2e.can_to_tcu_ms}ms → TCU: {e2e.tcu_to_mqtt_ms}ms → MQTT: {e2e.mqtt_to_backend_ms}ms → DB: {e2e.backend_to_db_ms}ms
          </div>
        </div>

        {/* Pipeline Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-slate-200 dark:bg-dark-700 text-blue-600 dark:text-blue-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{step.title}</h4>
                    <p className="text-[10px] text-slate-500">{step.sub}</p>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-200/80 dark:border-dark-700">
                  {Object.entries(step.data).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
