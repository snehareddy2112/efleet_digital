import React from 'react';
import { Layers } from 'lucide-react';

export default function BmsCellsSubsystem({ telemetry }) {
  const t = telemetry || {};

  // Mock cell array (24 representative series cells for visual matrix)
  const cellBaseV = (t.pack_a_voltage || 654.0) / 200.0;
  const delta = (t.pack_a_cell_voltage_delta || 20.0) / 2000.0;

  const mockCells = Array.from({ length: 24 }).map((_, i) => {
    const microVar = Math.sin(i * 1.7) * delta;
    const v = (cellBaseV + microVar).toFixed(3);
    const temp = ((t.pack_a_temperature || 29.8) + Math.cos(i * 0.8) * 0.8).toFixed(1);
    const isBalancing = t.pack_a_balancing_active && i % 4 === 0;
    return { id: i + 1, v, temp, isBalancing };
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">BMS Cell Matrix & Balancing Controller</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              200s Cell Level Voltage Gradients, Active Balancing Shunts, and Thermal Distribution
            </p>
          </div>
        </div>
      </div>

      {/* High-Level Cell Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Lowest Cell Voltage</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{t.pack_a_min_cell_mv ? (t.pack_a_min_cell_mv / 1000).toFixed(3) : 3.285} V</span>
          <span className="text-[10px] text-slate-400 block mt-1">Cell #14 (Pack A)</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Highest Cell Voltage</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{t.pack_a_max_cell_mv ? (t.pack_a_max_cell_mv / 1000).toFixed(3) : 3.305} V</span>
          <span className="text-[10px] text-slate-400 block mt-1">Cell #88 (Pack A)</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Cell Voltage Delta</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{(t.pack_a_cell_delta_mv || t.pack_a_cell_voltage_delta || 20.0).toFixed(1)} mV</span>
          <span className="text-[10px] text-slate-400 block mt-1">Acceptable: &lt; 50 mV</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Cell Balancing</span>
          <span className={`text-xl font-bold ${t.pack_a_balancing_active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>
            {t.pack_a_balancing_active ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Shunt: ~150 mA</span>
        </div>
      </div>

      {/* Visual Cell Grid Matrix */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Sample Series Cell Voltage & Thermal Distribution (Pack A Module 1..24)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">200s Total Series Cells</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {mockCells.map((c) => (
            <div
              key={c.id}
              className={`p-2 rounded border text-center font-mono text-xs space-y-0.5 transition ${
                c.isBalancing 
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600' 
                  : 'bg-slate-50 dark:bg-dark-850 border-slate-200 dark:border-dark-700'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>#{c.id}</span>
                {c.isBalancing && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 live-pulse" />}
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{c.v} V</div>
              <div className="text-[10px] text-slate-500">{c.temp} °C</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
