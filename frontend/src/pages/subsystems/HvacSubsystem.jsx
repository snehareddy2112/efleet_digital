import React from 'react';
import { Wind, Thermometer, Zap, ShieldCheck, Sun, UserCheck } from 'lucide-react';

export default function HvacSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Wind className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Dual-Zone HVAC & Saloon Climate Control</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Inverter Scroll Compressor (0-8 kW), Dual Driver/Saloon Zones & Evaporator Thermal Balance
            </p>
          </div>
        </div>
      </div>

      {/* Climate Temperature Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-blue-500/30">
          <span className="text-slate-400 block text-[11px]">Cabin Mean Temp</span>
          <span className="text-xl font-bold text-blue-300">{(t.cabin_temperature || 23.8).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-500 block mt-1">Target: {t.target_cabin_temperature || 22.0} °C</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">Outside Ambient Temp</span>
          <span className="text-xl font-bold text-amber-300">{(t.outside_temperature || 34.5).toFixed(1)} °C</span>
          <span className="text-[10px] text-slate-500 block mt-1">Solar Heat Influx: ~2.5 kW</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">Compressor Electrical Draw</span>
          <span className="text-xl font-bold text-cyan-300">{(t.compressor_power || 4.6).toFixed(2)} kW</span>
          <span className="text-[10px] text-slate-500 block mt-1">{t.compressor_speed || 3400} RPM</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Cumulative HVAC Energy</span>
          <span className="text-xl font-bold text-purple-300">{(t.hvac_energy_consumption || 8.4).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-500 block mt-1">Mode: {t.hvac_mode || 'AUTO_COOL'}</span>
        </div>
      </div>

      {/* Dual Zone Breakdown & Refrigeration Circuit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Dual Climate Zones & Blower Fans
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Driver Cockpit Temperature:</span>
            <span className="text-cyan-300 font-bold">{(t.driver_zone_temperature || 23.2).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Passenger Saloon Temperature:</span>
            <span className="text-slate-200 font-bold">{(t.passenger_zone_temperature || 24.1).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Evaporator Blower Fan Speed:</span>
            <span className="text-purple-300 font-bold">{(t.blower_speed || 65.0).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Blower Fan Electrical Power:</span>
            <span className="text-slate-300 font-bold">{(t.blower_power || 0.55).toFixed(2)} kW</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Refrigeration Circuit Temperatures
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Evaporator Core Temp:</span>
            <span className="text-cyan-300 font-bold">{(t.evaporator_temperature || 4.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Condenser Heat Exchanger Temp:</span>
            <span className="text-amber-300 font-bold">{(t.condenser_temperature || 42.8).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Chiller Coolant Temp:</span>
            <span className="text-slate-200">{(t.coolant_temperature || 12.4).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">AC Compressor Active Status:</span>
            <span className="text-emerald-400 font-bold">{t.compressor_status ? 'RUNNING' : 'IDLE'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
