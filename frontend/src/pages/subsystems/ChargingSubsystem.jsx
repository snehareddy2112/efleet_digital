import React from 'react';
import { BatteryCharging, Zap } from 'lucide-react';

export default function ChargingSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <BatteryCharging className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">CCS2 Fast Charging & 24V Auxiliary DC-DC Converter</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              CC-CV DC Fast Charge Controller (up to 150 kW) + High-to-Low Voltage Auxiliary Buck
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">CCS2 Inlet Connection</span>
          <span className={`text-xl font-bold ${t.charger_plug_connected || t.charger_connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
            {t.charger_plug_connected || t.charger_connected ? 'PLUGGED IN' : 'UNPLUGGED'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">State: {t.charger_state !== undefined ? t.charger_state : 'STANDBY'}</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">EVSE Output Power</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{(t.charger_power || 0).toFixed(1)} kW</span>
          <span className="text-[10px] text-slate-400 block mt-1">{(t.charger_current || 0).toFixed(1)} A @ {(t.charger_voltage || 0).toFixed(1)} V</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Delivered Session Energy</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.charger_energy_delivered_kwh || t.charging_energy || 0).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-400 block mt-1">Remain: {t.charger_time_remaining_min || 0} min</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">24V Low Voltage DC-DC</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(t.aux_battery_voltage || t.dc_dc_output_voltage || 27.8).toFixed(2)} V</span>
          <span className="text-[10px] text-slate-400 block mt-1">Draw: {(t.dc_dc_converter_power_kw || t.dc_dc_power || 1.74).toFixed(2)} kW</span>
        </div>
      </div>

      {/* Side by side: Charging Profile & 24V Aux Loads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            CCS2 Fast Charging Parameters
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Charging Protocol:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">CCS2 DC FAST 150kW</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Target Session SOC:</span>
            <span className="text-slate-800 dark:text-slate-200">{t.charge_target_soc || 95.0}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Inlet Pin Temp:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.charger_inlet_temp || t.connector_temperature || 31.0).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Charger Voltage:</span>
            <span className="text-slate-800 dark:text-slate-200">{(t.charger_voltage || 0).toFixed(1)} V</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            24V Auxiliary DC-DC Converter & Low Voltage Bus
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">24V Aux Battery Voltage:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(t.aux_battery_voltage || 27.6).toFixed(1)} V</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">DC-DC Converter Temp:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.dc_dc_converter_temp_c || 42.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Auxiliary Current:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.aux_battery_current || 62.5).toFixed(1)} A</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">DC-DC Converter Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE (CONVERTING)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
