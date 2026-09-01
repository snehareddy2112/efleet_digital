import React from 'react';
import { Zap, BatteryCharging, Flame, Activity, ShieldCheck } from 'lucide-react';

export default function ChargingSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <BatteryCharging className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">CCS2 Fast Charging & 24V Auxiliary DC-DC Converter</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              CC-CV DC Fast Charge Controller (up to 150 kW) + High-to-Low Voltage Auxiliary Buck
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">CCS2 Inlet Connection</span>
          <span className={`text-xl font-bold ${t.charger_connected ? 'text-emerald-400' : 'text-slate-400'}`}>
            {t.charger_connected ? 'PLUGGED IN' : 'UNPLUGGED'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">State: {t.charging_state || 'STANDBY'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">EVSE Output Power</span>
          <span className="text-xl font-bold text-cyan-300">{(t.charger_power || 0).toFixed(1)} kW</span>
          <span className="text-[10px] text-slate-500 block mt-1">{(t.charger_current || 0).toFixed(1)} A @ {(t.charger_voltage || 0).toFixed(1)} V</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Delivered Session Energy</span>
          <span className="text-xl font-bold text-purple-300">{(t.charging_energy || 0).toFixed(2)} kWh</span>
          <span className="text-[10px] text-slate-500 block mt-1">Duration: {t.charging_duration || 0} s</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-slate-400 block text-[11px]">24V Low Voltage DC-DC</span>
          <span className="text-xl font-bold text-emerald-300">{(t.dc_dc_output_voltage || 27.8).toFixed(2)} V</span>
          <span className="text-[10px] text-slate-500 block mt-1">Draw: {(t.dc_dc_power || 1.74).toFixed(2)} kW</span>
        </div>
      </div>

      {/* Side by side: Charging Profile & 24V Aux Loads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            CCS2 Fast Charging Parameters
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Charging Mode:</span>
            <span className="text-cyan-300 font-bold">{t.charging_mode || 'DC_FAST_150KW'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Target Session SOC:</span>
            <span className="text-slate-200">{t.charge_target_soc || 95.0}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">BMS Charge Current Limit:</span>
            <span className="text-purple-300 font-bold">{t.charge_current_limit || 200.0} A</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Inlet Pin Temperature:</span>
            <span className="text-amber-300 font-bold">{(t.connector_temperature || 31.0).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Charger Hardware Temp:</span>
            <span className="text-slate-300">{(t.charger_temperature || 32.4).toFixed(1)} °C</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            24V Auxiliary DC-DC Converter & Low Voltage Bus
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">24V Auxiliary Battery SOC:</span>
            <span className="text-emerald-400 font-bold">{(t.lv_battery_soc || 94.0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">24V DC-DC Output Current:</span>
            <span className="text-cyan-300 font-bold">{(t.dc_dc_current || 62.5).toFixed(1)} A</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Lighting & Saloon Power:</span>
            <span className="text-slate-200 font-bold">{(t.lighting_power || 0.45).toFixed(2)} kW</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Cooling & Steering Pump Power:</span>
            <span className="text-slate-200 font-bold">{(t.pump_power || 0.85).toFixed(2)} kW</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Total Auxiliary Cumulative Energy:</span>
            <span className="text-purple-300 font-bold">{(t.auxiliary_energy_total || 3.82).toFixed(2)} kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
