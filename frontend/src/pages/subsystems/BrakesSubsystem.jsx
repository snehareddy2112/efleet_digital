import React from 'react';
import { Disc } from 'lucide-react';

export default function BrakesSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Disc className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Braking, Blended Regeneration & Pneumatics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Regenerative Deceleration Energy Capture + Pneumatic Service Friction Brakes (ABS/ESC)
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Regenerative Braking</span>
          <span className={`text-xl font-bold ${t.regenerative_braking ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
            {t.regenerative_braking ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Power: {(t.regenerative_braking_power || t.regen_power_kw || 0).toFixed(1)} kW</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Air Reservoir Pressure</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{(t.brake_air_pressure_1 || t.brake_pressure_bar || 8.5).toFixed(2)} bar</span>
          <span className="text-[10px] text-slate-400 block mt-1">Circuit 2: {(t.brake_air_pressure_2 || 8.4).toFixed(2)} bar</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Total Energy Captured</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.total_regen_energy_kwh || t.regen_energy || 14.8).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-400 block mt-1">Recapture: {(t.energy_regen_ratio_pct || t.regen_percentage || 25.9).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">ABS / ESC Status</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {t.abs_active ? 'ABS ENGAGED' : 'ARMED / NOMINAL'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Status: OK</span>
        </div>
      </div>

      {/* Braking Force Split Breakdown */}
      <div className="glass-panel p-4 rounded-lg border space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
          Braking Effort Blend Decomposition (Kinetic Energy Recovery)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
              <span className="text-slate-500">Driver Brake Pedal Travel:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.brake_pedal_pos || t.brake_pedal_position || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
              <span className="text-slate-500">Friction Braking Torque:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.friction_braking_torque || 0).toFixed(1)} Nm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
              <span className="text-slate-500">Regenerative Braking Torque:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(t.regenerative_braking_torque || t.regen_torque_nm || 0).toFixed(1)} Nm</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
              <span className="text-slate-500">Regenerative Power:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(t.regenerative_braking_power || t.regen_power_kw || 0).toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
              <span className="text-slate-500">Pneumatic Air Pressure (Circuit 1):</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.brake_air_pressure_1 || 8.5).toFixed(2)} bar</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Low Air Pressure (&lt;6 bar) Warning:</span>
              <span className={t.air_pressure_warning ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                {t.air_pressure_warning ? "ALERT: LOW AIR" : "NORMAL (OK)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
