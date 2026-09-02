import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Signal, 
  Database, 
  Layers, 
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
      if (st) setTcuStatus(st);
      if (raw) setRawPacket(raw);
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
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Radio className={`w-5 h-5 ${isOnline ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">TCU-001 Telematics Control Unit & Gateway</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}>
                {tcuStatus?.status || 'ONLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              IMEI: {tcuStatus?.imei || '862901048291048'} | ICCID: {tcuStatus?.iccid || '8991404000291048123F'} | FW: {tcuStatus?.firmware_version || 'v3.12.4-PROD'}
            </p>
          </div>
        </div>

        {/* Network & MQTT Simulation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleNetwork}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition border ${
              tcuStatus?.network_connected
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {tcuStatus?.network_connected ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{tcuStatus?.network_connected ? 'DISCONNECT 5G' : 'RESTORE 5G'}</span>
          </button>

          <button
            onClick={handleToggleMqtt}
            disabled={loading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition border ${
              tcuStatus?.mqtt_connected
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-100'
            }`}
          >
            <span>{tcuStatus?.mqtt_connected ? 'DISCONNECT MQTT' : 'RESTORE MQTT'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 4G/5G Radio Stats & Store-and-Forward Buffer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 4G/5G Radio & GNSS Metrics */}
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Signal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cellular 5G NR NSA & GNSS Receiver</span>
            </h3>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{tcuStatus?.network_type || '5G_NR_NSA'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">RSRP (Signal Power)</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{tcuStatus?.rsrp || -85.4} dBm</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">RSRQ (Quality)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{tcuStatus?.rsrq || -9.8} dB</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">SINR (SNR)</span>
              <span className="text-purple-700 dark:text-purple-400 font-bold text-sm">{tcuStatus?.sinr || 18.2} dB</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">CSQ Signal Level</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">{tcuStatus?.csq || 26} / 31</span>
            </div>
          </div>
        </div>

        {/* Flash Store-and-Forward Buffer */}
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Flash Store-and-Forward Buffer (Failover Queue)</span>
            </h3>
            <span className={`text-xs font-mono font-bold ${isBuffering ? 'text-amber-600' : 'text-emerald-600'}`}>
              {tcuStatus?.buffer_size || 0} / 10,000 PKTS
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Buffer Fill:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{((tcuStatus?.buffer_size || 0) / 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-dark-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((tcuStatus?.buffer_size || 0) / 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              When cellular connectivity or MQTT connection is interrupted, telemetry packets are stored in non-volatile circular flash and flushed in FIFO order upon reconnection.
            </p>
          </div>
        </div>
      </div>

      {/* Raw TCU JSON Packet Inspector */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Normalized TCU-001 Telemetry Payload (Built from CAN Frames)</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">Sequence: #{rawPacket?.sequence_number || 1}</span>
        </div>

        <pre className="p-3 rounded bg-slate-900 dark:bg-dark-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-60 overflow-y-auto">
          {rawPacket ? JSON.stringify(rawPacket, null, 2) : '// Loading raw TCU telemetry packet...'}
        </pre>
      </div>
    </div>
  );
}
