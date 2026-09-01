import React from 'react';
import { Thermometer, Activity, Wind, ShieldCheck, Zap, Droplets } from 'lucide-react';

export default function ThermalSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Thermometer className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Dual-Loop Thermal Management & Coolant Circuit</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Independent Battery Coolant Loop (25-32°C) & Powertrain Coolant Loop (40-60°C)
            </p>
          </div>
        </div>
      </div>

      {/* Main Coolant Temperatures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">Battery Loop Coolant</span>
          <span className="text-xl font-bold text-cyan-300">{(t.battery_coolant_temperature || 26.5).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-500 block mt-1">Target Range: 25 - 32 °C</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">Powertrain Loop Coolant</span>
          <span className="text-xl font-bold text-amber-300">{(t.motor_coolant_temperature || 48.2).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-500 block mt-1">Target Range: 40 - 60 °C</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Coolant Pump Speed</span>
          <span className="text-xl font-bold text-purple-300">{(t.coolant_pump_speed || 55.0).toFixed(0)}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">Power: {(t.coolant_pump_power || 0.45).toFixed(2)} kW</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-slate-400 block text-[11px]">Radiator Fan Speed</span>
          <span className="text-xl font-bold text-emerald-300">{(t.radiator_fan_speed || 40.0).toFixed(0)}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">Power: {(t.radiator_fan_power || 0.55).toFixed(2)} kW</span>
        </div>
      </div>

      {/* Hydraulic & Component Thermal Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Hydraulic Loop Pressure & Temperatures
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Coolant Reservoir Level:</span>
            <span className="text-emerald-400 font-bold">{(t.coolant_level || 92.0).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">System Head Pressure:</span>
            <span className="text-cyan-300 font-bold">{(t.coolant_pressure || 1.45).toFixed(2)} bar</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Front Radiator Heat Exchanger:</span>
            <span className="text-slate-200 font-bold">{(t.radiator_temperature || 38.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Inverter Cold Plate Coolant:</span>
            <span className="text-purple-300 font-bold">{(t.inverter_coolant_temperature || 44.1).toFixed(1)} °C</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Thermal Safety Status
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Thermal Controller State:</span>
            <span className="text-cyan-300 font-bold">{t.thermal_management_state || 'ACTIVE_COOLING'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Thermal Warning Active:</span>
            <span className={t.thermal_warning ? "text-amber-400 font-bold" : "text-emerald-400"}>
              {t.thermal_warning ? "WARNING (HIGH TEMP)" : "NOMINAL"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Thermal Critical Fault:</span>
            <span className={t.thermal_fault ? "text-rose-400 font-bold" : "text-emerald-400"}>
              {t.thermal_fault ? "CRITICAL FAULT" : "NONE"}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Total Auxiliary Thermal Power:</span>
            <span className="text-slate-200 font-bold">{(t.aux_power_kw || 1.0).toFixed(2)} kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
