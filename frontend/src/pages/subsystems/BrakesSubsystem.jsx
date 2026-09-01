import React from 'react';
import { Disc, Zap, Activity, Wind, ShieldCheck } from 'lucide-react';

export default function BrakesSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Disc className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Braking, Blended Regeneration & Pneumatics</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Regenerative Deceleration Energy Capture + Pneumatic Service Friction Brakes (ABS/ESC)
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-slate-400 block text-[11px]">Regenerative Braking</span>
          <span className={`text-xl font-bold ${t.regenerative_braking ? 'text-emerald-400' : 'text-slate-400'}`}>
            {t.regenerative_braking ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Power: {(t.regen_power_kw || 0).toFixed(1)} kW</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">Air Reservoir Pressure</span>
          <span className="text-xl font-bold text-cyan-300">{(t.brake_pressure_bar || 8.5).toFixed(2)} bar</span>
          <span className="text-[10px] text-slate-500 block mt-1">Compressor: {t.brake_pressure_bar < 6.8 ? 'CHARGING' : 'STANDBY'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Total Energy Captured</span>
          <span className="text-xl font-bold text-purple-300">{(t.regen_energy || 14.8).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-500 block mt-1">Recapture Rate: {(t.regen_percentage || 25.9).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">ABS / ESC Status</span>
          <span className="text-xl font-bold text-emerald-400">
            {t.abs_active ? 'ABS ENGAGED' : 'ARMED / NOMINAL'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">ESC: {t.esc_active ? 'INTERVENING' : 'OK'}</span>
        </div>
      </div>

      {/* Braking Force Split Breakdown */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
          Braking Effort Blend Decomposition (Kinetic Energy Recovery)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Driver Brake Pedal Travel:</span>
              <span className="text-amber-300 font-bold">{(t.brake_pedal_position || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Total Commanded Braking Force:</span>
              <span className="text-slate-200 font-bold">{(t.brake_command || 0).toFixed(2)} kN</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Regenerative Braking Torque:</span>
              <span className="text-emerald-400 font-bold">{(t.regen_torque_nm || 0).toFixed(1)} Nm</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Battery Influx Regen Current:</span>
              <span className="text-emerald-400 font-bold">{(t.regen_current || 0).toFixed(1)} A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Pneumatic Friction Brake Force:</span>
              <span className="text-cyan-300 font-bold">{(t.friction_brake_kn || 0).toFixed(2)} kN</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Low Air Pressure (&lt;6 bar) Warning:</span>
              <span className={t.air_pressure_warning ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {t.air_pressure_warning ? "ALERT: LOW AIR" : "NORMAL (OK)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
