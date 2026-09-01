import React, { useState, useEffect } from 'react';
import { Search, Filter, Database, RefreshCw, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { fetchSignalRegistry } from '../api';

export default function LiveTelemetry({ telemetry }) {
  const [registry, setRegistry] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'raw_json'

  useEffect(() => {
    fetchSignalRegistry().then(data => {
      if (data) setRegistry(data);
    }).catch(console.error);
  }, []);

  const subsystems = ['ALL', ...new Set(Object.values(registry).map(s => s.subsystem))];

  const filteredSignals = Object.entries(registry).filter(([key, meta]) => {
    const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          meta.ecu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubsystem = selectedSubsystem === 'ALL' || meta.subsystem === selectedSubsystem;
    return matchesSearch && matchesSubsystem;
  });

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Complete 280+ Signal Telemetry Registry & Raw Cloud JSON</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full signal dictionary showing exact data types, engineering units, min/max limits, source ECUs, and live values.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex space-x-1 bg-dark-900 p-1 rounded-lg border border-dark-700 font-mono text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded transition ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              Signal Table
            </button>
            <button
              onClick={() => setViewMode('raw_json')}
              className={`px-3 py-1 rounded transition ${viewMode === 'raw_json' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'}`}
            >
              Raw Cloud JSON
            </button>
          </div>

          {viewMode === 'table' && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search parameter, ECU, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-64"
              />
            </div>
          )}

          <div className="text-xs font-mono px-3 py-1.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            {filteredSignals.length} / {Object.keys(registry).length} Signals
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Subsystem Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2">
            {subsystems.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubsystem(sub)}
                className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition font-medium ${
                  selectedSubsystem === sub
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Main Signal Table */}
          <div className="glass-panel rounded-xl border border-dark-600 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-dark-800 text-slate-400 border-b border-dark-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Parameter ID</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Subsystem</th>
                    <th className="py-2.5 px-4">Source ECU</th>
                    <th className="py-2.5 px-4">CAN Message ID</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Range Limits</th>
                    <th className="py-2.5 px-4 text-right">Live Decoded Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/60">
                  {filteredSignals.map(([key, meta]) => {
                    const liveVal = telemetry ? telemetry[key] : undefined;
                    const formattedVal = liveVal !== undefined ? (
                      typeof liveVal === 'number' ? (Number.isInteger(liveVal) ? liveVal : liveVal.toFixed(2)) : String(liveVal)
                    ) : (meta.default !== undefined ? String(meta.default) : '--');

                    return (
                      <tr key={key} className="hover:bg-dark-800/60 transition">
                        <td className="py-2 px-4 font-bold text-cyan-300">{key}</td>
                        <td className="py-2 px-4 text-slate-200 font-sans">{meta.name}</td>
                        <td className="py-2 px-4 text-slate-400 font-sans">
                          <span className="px-2 py-0.5 rounded bg-dark-900 text-[10px] border border-dark-700">
                            {meta.subsystem}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-purple-300 font-semibold">{meta.ecu}</td>
                        <td className="py-2 px-4 text-amber-300 font-bold">{meta.can_id}</td>
                        <td className="py-2 px-4 text-slate-400">{meta.unit || '-'}</td>
                        <td className="py-2 px-4 text-slate-500 text-[10px]">
                          {meta.min !== null && meta.max !== null ? `[${meta.min}, ${meta.max}]` : 'N/A'}
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-emerald-400 bg-emerald-500/5">
                          {formattedVal} <span className="text-[10px] text-slate-500">{meta.unit}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">
              Actual Ingested Cloud Telemetry JSON Packet (Single Source of Truth)
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              Payload Size: {telemetry?.payload_size || 2420} Bytes | Sequence: #{telemetry?.sequence_number || 1}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-dark-900 border border-dark-700 max-h-[600px] overflow-y-auto font-mono text-xs text-emerald-300">
            <pre>{JSON.stringify(telemetry || {}, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
