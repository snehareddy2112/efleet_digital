import React, { useState, useEffect } from 'react';
import { Search, Database, Layers, Copy, Check } from 'lucide-react';
import { fetchSignalRegistry } from '../api';

export default function LiveTelemetry({ telemetry }) {
  const [registry, setRegistry] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'raw_json'
  const [copied, setCopied] = useState(false);

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

  const handleCopyJson = () => {
    if (!telemetry) return;
    navigator.clipboard.writeText(JSON.stringify(telemetry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Vehicle Telemetry Signal Dictionary (322 Parameters) & Raw Ingestion Payload</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete signal dictionary showing data types, engineering units, boundaries, source ECUs, and live decoded values.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex bg-slate-100 dark:bg-dark-800 p-0.5 rounded border border-slate-300 dark:border-dark-600 font-mono text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded transition font-medium ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Signal Table
            </button>
            <button
              onClick={() => setViewMode('raw_json')}
              className={`px-3 py-1 rounded transition font-medium ${viewMode === 'raw_json' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Raw Payload JSON
            </button>
          </div>

          {viewMode === 'table' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search parameter, ECU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-300 dark:border-dark-600 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono w-56"
              />
            </div>
          )}

          <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-dark-600">
            {filteredSignals.length} / {Object.keys(registry).length} Signals
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Subsystem Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {subsystems.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubsystem(sub)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition font-medium border ${
                  selectedSubsystem === sub
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold'
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Main Signal Table */}
          <div className="glass-panel rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Parameter Key</th>
                    <th className="py-2.5 px-3">Engineering Name</th>
                    <th className="py-2.5 px-3">Subsystem</th>
                    <th className="py-2.5 px-3">Source ECU</th>
                    <th className="py-2.5 px-3">CAN Message</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Valid Limits</th>
                    <th className="py-2.5 px-3 text-right">Live Decoded Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-dark-750">
                  {filteredSignals.map(([key, meta]) => {
                    const liveVal = telemetry ? telemetry[key] : undefined;
                    const formattedVal = liveVal !== undefined ? (
                      typeof liveVal === 'number' ? (Number.isInteger(liveVal) ? liveVal : liveVal.toFixed(2)) : String(liveVal)
                    ) : (meta.default !== undefined ? String(meta.default) : '--');

                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition">
                        <td className="py-2 px-3 font-semibold text-blue-700 dark:text-blue-400">{key}</td>
                        <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-sans">{meta.name}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-850 text-[10px] border border-slate-200 dark:border-dark-700">
                            {meta.subsystem}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-semibold">{meta.ecu}</td>
                        <td className="py-2 px-3 text-amber-700 dark:text-amber-400 font-bold">{meta.can_id}</td>
                        <td className="py-2 px-3 text-slate-500">{meta.unit || '-'}</td>
                        <td className="py-2 px-3 text-slate-400 text-[10px]">
                          {meta.min !== null && meta.max !== null ? `[${meta.min}, ${meta.max}]` : 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-dark-800/30">
                          {formattedVal} <span className="text-[10px] text-slate-400 font-normal">{meta.unit}</span>
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
        /* Raw JSON Inspector */
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Live Ingested Telemetry Packet (JSON Payload over WebSocket)
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-xs font-mono border border-slate-300 dark:border-dark-600 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded bg-slate-900 dark:bg-dark-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
            {telemetry ? JSON.stringify(telemetry, null, 2) : '// Waiting for live telemetry stream...'}
          </pre>
        </div>
      )}
    </div>
  );
}
