import React from 'react';
import { Battery, Zap, Thermometer, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

export default function BatteriesSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Battery className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Dual 160 kWh LFP Battery System (320 kWh Total)</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Independent Packs BAT-001-A & BAT-001-B with Master High-Voltage Combiner
            </p>
          </div>
        </div>
      </div>

      {/* Combined Battery System High-Voltage Master Strip */}
      <div className="glass-panel-glow p-5 rounded-xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-700 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Combined High-Voltage Bus Metrics</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
            {t.battery_system_state || 'OPERATIONAL'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-dark-900 border border-dark-700">
            <span className="text-[10px] text-slate-400 block">Total Combined SOC</span>
            <span className="text-xl font-bold text-emerald-400">{(t.total_battery_soc || 82.15).toFixed(1)}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">SOH: {(t.total_battery_soh || 98.3).toFixed(1)}%</span>
          </div>
          <div className="p-3 rounded bg-dark-900 border border-dark-700">
            <span className="text-[10px] text-slate-400 block">Effective HV Voltage</span>
            <span className="text-xl font-bold text-cyan-400">{(t.total_battery_voltage || 654.0).toFixed(1)} V</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Pack ΔV: {(t.battery_voltage_delta || 0.4).toFixed(1)} V</span>
          </div>
          <div className="p-3 rounded bg-dark-900 border border-dark-700">
            <span className="text-[10px] text-slate-400 block">Total Net Current</span>
            <span className="text-xl font-bold text-amber-400">{(t.total_battery_current || 91.0).toFixed(1)} A</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Balance Ratio: {t.battery_current_balance || 0.987}</span>
          </div>
          <div className="p-3 rounded bg-dark-900 border border-dark-700">
            <span className="text-[10px] text-slate-400 block">Total HV Power</span>
            <span className="text-xl font-bold text-purple-400">{(t.total_battery_power || 59.51).toFixed(2)} kW</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Max: {(t.available_discharge_power || 440).toFixed(0)} kW</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Pack A vs Pack B Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pack A */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Battery Pack A (BAT-001-A)</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
              {(t.pack_a_soc || 82.4).toFixed(1)}% SOC
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Terminal Voltage:</span>
              <span className="text-cyan-300 font-bold">{(t.pack_a_voltage || 654.2).toFixed(1)} V</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Current Draw:</span>
              <span className="text-amber-300 font-bold">{(t.pack_a_current || 45.2).toFixed(1)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Power Output:</span>
              <span className="text-purple-300 font-bold">{(t.pack_a_power || 29.57).toFixed(2)} kW</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Pack Temperature:</span>
              <span className="text-emerald-300 font-bold">{(t.pack_a_temperature || 29.8).toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Max Discharge Current Limit:</span>
              <span className="text-slate-200">{(t.pack_a_discharge_current_limit || 350).toFixed(0)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Max Charge Current Limit:</span>
              <span className="text-slate-200">{(t.pack_a_charge_current_limit || 200).toFixed(0)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Main Positive Contactor:</span>
              <span className="text-emerald-400 font-bold">{t.pack_a_contactor_positive ? 'CLOSED' : 'OPEN'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Isolation Resistance:</span>
              <span className="text-emerald-400 font-bold">{t.pack_a_isolation_resistance || 2450} kΩ</span>
            </div>
          </div>
        </div>

        {/* Pack B */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Battery Pack B (BAT-001-B)</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
              {(t.pack_b_soc || 81.9).toFixed(1)}% SOC
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Terminal Voltage:</span>
              <span className="text-cyan-300 font-bold">{(t.pack_b_voltage || 653.8).toFixed(1)} V</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Current Draw:</span>
              <span className="text-amber-300 font-bold">{(t.pack_b_current || 45.8).toFixed(1)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Power Output:</span>
              <span className="text-purple-300 font-bold">{(t.pack_b_power || 29.94).toFixed(2)} kW</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Pack Temperature:</span>
              <span className="text-emerald-300 font-bold">{(t.pack_b_temperature || 30.2).toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Max Discharge Current Limit:</span>
              <span className="text-slate-200">{(t.pack_b_discharge_current_limit || 350).toFixed(0)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Max Charge Current Limit:</span>
              <span className="text-slate-200">{(t.pack_b_charge_current_limit || 200).toFixed(0)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Main Positive Contactor:</span>
              <span className="text-emerald-400 font-bold">{t.pack_b_contactor_positive ? 'CLOSED' : 'OPEN'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Isolation Resistance:</span>
              <span className="text-emerald-400 font-bold">{t.pack_b_isolation_resistance || 2420} kΩ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
