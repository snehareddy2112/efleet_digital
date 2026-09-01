import React from 'react';
import { Gauge, Activity, Users, ShieldCheck, Clock, Key, ArrowRight } from 'lucide-react';

export default function VehicleSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <Gauge className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Vehicle Identification, State & Kinematics</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              BUS-001 (ELECTRA-12M) | VIN: {t.vin || 'MA6OL12ME0012026'} | Serial: {t.vehicle_serial_number || 'OL-2026-12M-001'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">Operational State</span>
          <span className="text-xl font-bold text-emerald-400">{t.vehicle_state_name || 'READY'}</span>
          <span className="text-[10px] text-slate-500 block mt-1">VCU State Enum: {t.vehicle_state || 2}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Drive Mode</span>
          <span className="text-xl font-bold text-purple-400">
            {t.drive_mode === 2 ? 'POWER' : (t.drive_mode === 0 ? 'ECO' : 'NORMAL')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Direction: {t.direction || 'FORWARD'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">Selected Gear</span>
          <span className="text-xl font-bold text-amber-400">
            {t.gear_state === 1 ? 'D (Drive)' : (t.gear_state === 3 ? 'P (Park)' : (t.gear_state === 2 ? 'R (Reverse)' : 'N (Neutral)'))}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Parking Brake: {t.parking_brake ? 'ENGAGED' : 'RELEASED'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-slate-400 block text-[11px]">Vehicle Ready</span>
          <span className="text-xl font-bold text-emerald-400">{t.vehicle_ready ? 'TRUE (HV ACTIVE)' : 'FALSE'}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Ignition: {t.ignition_state === 2 ? 'ON' : 'ACC/OFF'}</span>
        </div>
      </div>

      {/* Driver Demands & Masses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Driver Commands & Odometers
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Accelerator Position:</span>
            <span className="text-cyan-300 font-bold">{(t.accelerator_position || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">VCU Validated Accel Request:</span>
            <span className="text-cyan-300 font-bold">{(t.accelerator_command || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Brake Pedal Travel:</span>
            <span className="text-amber-300 font-bold">{(t.brake_pedal_position || 0).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Total Odometer:</span>
            <span className="text-slate-200 font-bold">{(t.odometer || 14250.8).toFixed(2)} km</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Trip Distance:</span>
            <span className="text-emerald-400 font-bold">{(t.trip_distance || 28.4).toFixed(2)} km</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-dark-700 pb-2">
            Vehicle Loading & Passenger Mass Dynamics
          </h3>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Curb Mass (Empty):</span>
            <span className="text-slate-200 font-bold">13,500 kg</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Passenger Count:</span>
            <span className="text-cyan-300 font-bold">{t.passenger_count || 38} / {t.passenger_capacity || 65} pax</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Passenger Live Payload Mass:</span>
            <span className="text-purple-300 font-bold">{(t.vehicle_load_kg || 2584).toFixed(0)} kg</span>
          </div>
          <div className="flex justify-between py-1 border-b border-dark-800">
            <span className="text-slate-400">Gross Vehicle Mass (GVM):</span>
            <span className="text-emerald-400 font-bold">{(t.total_mass_kg || 16084).toFixed(0)} kg</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Operating Hours:</span>
            <span className="text-slate-300 font-bold">{(t.operating_hours || 842.5).toFixed(1)} h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
