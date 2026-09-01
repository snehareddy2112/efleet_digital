import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Signal, 
  Database, 
  RefreshCw, 
  Send, 
  Layers, 
  ShieldAlert, 
  Sliders,
  Code
} from 'lucide-react';
import { fetchTcuStatus, fetchTcuRawPacket, toggleTcuNetwork, toggleTcuMqtt } from '../api';

export default function TcuMonitor({ telemetry }) {
  const [tcuStatus, setTcuStatus] = useState(null);
  const [rawPacket, setRawPacket] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    try {
      const [st, raw] = await Promise.all([fetchTcuStatus('BUS-001'), fetchTcuRawPacket('BUS-001')]);
      setTcuStatus(st);
      setRawPacket(raw);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNetwork = async () => {
    if (!tcuStatus) return;
    setLoading(true);
    try {
      await toggleTcuNetwork('BUS-001', !tcuStatus.network_connected);
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMqtt = async () => {
    if (!tcuStatus) return;
    setLoading(true);
    try {
      await toggleTcuMqtt('BUS-001', !tcuStatus.mqtt_connected);
      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  const isOnline = tcuStatus?.network_connected && tcuStatus?.mqtt_connected;
  const isBuffering = tcuStatus?.buffer_size > 0 || !isOnline;

  return (
    <div className="space-y-6">
      {/* TCU Status Banner & Network Simulation Controls */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Radio className={`w-6 h-6 ${isOnline ? 'text-cyan-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-100">TCU-001 Telematics Control Unit</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                isOnline
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {tcuStatus?.status || 'ONLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              IMEI: {tcuStatus?.imei || '862901048291048'} | ICCID: {tcuStatus?.iccid || '8991404000291048123F'} | FW: {tcuStatus?.firmware_version || 'v3.12.4'}
            </p>
          </div>
        </div>

        {/* Failure Simulation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleNetwork}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-medium transition ${
              tcuStatus?.network_connected
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
          >
            {tcuStatus?.network_connected ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{tcuStatus?.network_connected ? 'DISABLE 5G NETWORK' : 'RESTORE 5G NETWORK'}</span>
          </button>

          <button
            onClick={handleToggleMqtt}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-medium transition ${
              tcuStatus?.mqtt_connected
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            <span>{tcuStatus?.mqtt_connected ? 'DISCONNECT MQTT' : 'RESTORE MQTT'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 4G/5G Radio Stats & Store-and-Forward Buffer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4G/5G Radio & GNSS Metrics */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Signal className="w-4 h-4 text-cyan-400" />
              <span>Cellular 5G NR NSA & GNSS Link</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{tcuStatus?.network_type || '5G_NR_NSA'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">RSRP (Signal Power)</span>
              <span className="text-cyan-300 font-bold text-sm">{tcuStatus?.rsrp || -85.4} dBm</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">RSRQ (Quality)</span>
              <span className="text-emerald-300 font-bold text-sm">{tcuStatus?.rsrq || -9.8} dB</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">SINR (SNR)</span>
              <span className="text-purple-300 font-bold text-sm">{tcuStatus?.sinr || 18.2} dB</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">CSQ Signal Level</span>
              <span className="text-amber-300 font-bold text-sm">{tcuStatus?.signal_strength || 28} / 31</span>
            </div>
          </div>

          <div className="p-3 rounded bg-dark-900/60 border border-dark-700/80 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Serving Cell ID:</span>
              <span className="text-slate-200">404-45-78219</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network Operator:</span>
              <span className="text-slate-200">Airtel IoT 5G Enterprise</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">GNSS Satellites:</span>
              <span className="text-emerald-400">16 Visible (3D_FIX)</span>
            </div>
          </div>
        </div>

        {/* Store-and-Forward Ring Buffer */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Store-and-Forward Telemetry Buffer</span>
            </h3>
            <span className={`text-xs font-mono font-bold ${
              tcuStatus?.buffer_size > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {tcuStatus?.buffer_size > 0 ? `BUFFERING (${tcuStatus.buffer_size} PKTS)` : 'QUEUE EMPTY (0 PKTS)'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            When cellular connectivity drops, CAN frames are decoded and queued in local flash RAM buffer. Upon reconnection, all packets flush in chronological FIFO sequence without loss.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Queue Capacity</span>
              <span className="text-slate-200 font-bold text-sm">10,000 Packets</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Total Sent</span>
              <span className="text-cyan-400 font-bold text-sm">{tcuStatus?.total_packets_sent || 0}</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Reconnects</span>
              <span className="text-amber-400 font-bold text-sm">{tcuStatus?.reconnect_count || 0}</span>
            </div>
            <div className="p-3 rounded bg-dark-900 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Retries</span>
              <span className="text-rose-400 font-bold text-sm">{tcuStatus?.retry_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw TCU JSON Packet Inspector */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Raw Normalized TCU Telemetry Packet (Transmitted to MQTT Broker)</span>
          </h4>
          <span className="text-[10px] font-mono text-cyan-400">
            Seq: #{rawPacket?.sequence_number || 1} | Size: {rawPacket?.payload_size || 2420} B
          </span>
        </div>

        <div className="p-4 rounded-lg bg-dark-900 border border-dark-700 max-h-72 overflow-y-auto font-mono text-xs text-emerald-300">
          <pre>{JSON.stringify(rawPacket, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
