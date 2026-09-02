import React from 'react';
import { Thermometer } from 'lucide-react';

export default function ThermalSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Thermometer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dual-Loop Thermal Management & Coolant Circuit</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Independent Battery Coolant Loop (25-32°C) & Powertrain Coolant Loop (40-60°C)
            </p>
          </div>
        </div>
      </div>

      {/* Main Coolant Temperatures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Battery Loop Coolant</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{(t.thermal_battery_coolant_in || t.battery_coolant_temperature || 26.5).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Out: {(t.thermal_battery_coolant_out || 28.2).toFixed(1)} °C</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Powertrain Loop Coolant</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{(t.thermal_motor_coolant_in || t.motor_coolant_temperature || 48.2).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Out: {(t.thermal_motor_coolant_out || 52.4).toFixed(1)} °C</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Battery Pump RPM</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.thermal_battery_pump_rpm || 2450} RPM</span>
          <span className="text-[10px] text-slate-400 block mt-1">Motor Pump: {t.thermal_motor_pump_rpm || 2800} RPM</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Radiator Fan</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(t.thermal_radiator_fan_pct || t.radiator_fan_speed || 40.0).toFixed(0)}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Chiller Valve: {t.thermal_chiller_valve_pct || 25}%</span>
        </div>
      </div>

      {/* Hydraulic & Component Thermal Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            Coolant Temperatures & Loop Controls
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Battery Loop Inflow:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.thermal_battery_coolant_in || 26.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Battery Loop Outflow:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.thermal_battery_coolant_out || 28.2).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Motor Coolant Inflow:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.thermal_motor_coolant_in || 48.2).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Inverter Coolant Inflow:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.thermal_inverter_coolant_in || 44.1).toFixed(1)} °C</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            Thermal Safety Status
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Thermal Management State:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE COOLING</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Battery Thermal Gradient:</span>
            <span className="text-slate-800 dark:text-slate-200">1.7 °C (NOMINAL)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Thermal Warning Active:</span>
            <span className={t.thermal_warning ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
              {t.thermal_warning ? "WARNING (HIGH TEMP)" : "NOMINAL"}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Thermal Fault State:</span>
            <span className={t.thermal_fault ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
              {t.thermal_fault ? "CRITICAL FAULT" : "NONE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
