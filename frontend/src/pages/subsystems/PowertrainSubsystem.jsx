import React from 'react';
import { Zap } from 'lucide-react';

export default function PowertrainSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">250 kW PMSM Traction Motor & SiC Inverter</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Permanent Magnet Synchronous Machine (8-Pole) + Silicon Carbide High-Frequency Inverter
            </p>
          </div>
        </div>
      </div>

      {/* Powertrain Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Motor Shaft Torque</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.motor_torque || 0).toFixed(1)} Nm</span>
          <span className="text-[10px] text-slate-400 block mt-1">Cmd: {(t.motor_command_torque || 0).toFixed(1)} Nm</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Motor Rotational Speed</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{t.motor_rpm || 0} RPM</span>
          <span className="text-[10px] text-slate-400 block mt-1">Angular: {(t.motor_speed || 0).toFixed(1)} rad/s</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Mechanical Power</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(t.motor_power || 0).toFixed(2)} kW</span>
          <span className="text-[10px] text-slate-400 block mt-1">Motor Eff: {(t.motor_efficiency || 94.2).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Inverter DC Power</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{(t.inverter_dc_power || 0).toFixed(2)} kW</span>
          <span className="text-[10px] text-slate-400 block mt-1">Inverter Eff: {(t.inverter_efficiency || 97.4).toFixed(1)}%</span>
        </div>
      </div>

      {/* Side by side: Motor Details & Inverter Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border space-y-2.5 text-xs font-mono">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            PMSM Motor Thermal & Electrical Metrics
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Motor Internal Temp:</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">{(t.motor_temperature || 64.2).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Stator Winding Temp:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.motor_stator_temperature || 66.8).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Rotor Magnet Temp:</span>
            <span className="text-slate-700 dark:text-slate-300">{(t.motor_rotor_temperature || 61.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Motor AC Phase Voltage:</span>
            <span className="text-blue-700 dark:text-blue-400">{(t.motor_voltage || 420.0).toFixed(1)} V RMS</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Motor AC Phase Current:</span>
            <span className="text-blue-700 dark:text-blue-400">{(t.motor_current || 88.4).toFixed(1)} A RMS</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Final Drive Gear Ratio:</span>
            <span className="text-slate-700 dark:text-slate-300">5.2 : 1</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border space-y-2.5 text-xs font-mono">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            SiC Traction Inverter Operation
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Gate Drive Enable:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.inverter_enable ? 'ENABLED' : 'DISABLED'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">DC Bus Voltage:</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.inverter_dc_voltage || 654.0).toFixed(1)} V</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">DC Bus Current:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.inverter_dc_current || 89.2).toFixed(1)} A</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">AC Fundamental Frequency:</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{(t.inverter_ac_frequency || 163.3).toFixed(1)} Hz</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">SiC Junction Temp:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(t.inverter_temp || t.inverter_temperature || 49.5).toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Inverter Fault State:</span>
            <span className={t.inverter_fault ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
              {t.inverter_fault ? "FAULT (TRIPPED)" : "NOMINAL"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
