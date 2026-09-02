import React from 'react';
import { Wind } from 'lucide-react';

export default function HvacSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dual-Zone HVAC & Saloon Climate Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Inverter Scroll Compressor (0-8.5 kW), Dual Driver/Saloon Zones & Evaporator Thermal Balance
            </p>
          </div>
        </div>
      </div>

      {/* Climate Temperature Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Cabin Mean Temp</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{(t.hvac_cabin_temp || t.cabin_temperature || 23.8).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Target: {t.hvac_target_temp || t.target_cabin_temperature || 22.0} °C</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Outside Ambient Temp</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{(t.hvac_ambient_temp || t.outside_temperature || 34.5).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Saloon: {(t.hvac_saloon_temp || 24.1).toFixed(1)} °C</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Compressor Power</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.hvac_compressor_power || t.compressor_power || 4.6).toFixed(2)} kW</span>
          <span className="text-[10px] text-slate-400 block mt-1">{t.hvac_compressor_rpm || t.compressor_speed || 3400} RPM</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Cumulative HVAC Energy</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.hvac_energy_consumption || 8.4).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-400 block mt-1">Mode: AUTO COOL</span>
        </div>
      </div>

      {/* Dual Zone Breakdown & Refrigeration Circuit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            Dual Climate Zones & Blower Fans
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Driver Cockpit Temp:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.hvac_cabin_temp || 23.2).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Passenger Saloon Temp:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.hvac_saloon_temp || 24.1).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Blower Fan Level:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{t.hvac_fan_speed || 3} / 4</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Ambient Temperature:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.hvac_ambient_temp || 34.5).toFixed(1)} °C</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            Refrigeration Circuit Temperatures
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Evaporator Core Temp:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.hvac_evaporator_temp || 4.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Condenser Heat Exchanger Temp:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.hvac_condenser_temp || 42.8).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Compressor Electrical Power:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.hvac_compressor_power || 4.6).toFixed(2)} kW</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">AC Compressor Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">RUNNING (ACTIVE)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
