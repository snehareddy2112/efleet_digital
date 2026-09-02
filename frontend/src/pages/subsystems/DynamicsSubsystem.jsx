import React from 'react';
import { Activity } from 'lucide-react';

export default function DynamicsSubsystem({ telemetry }) {
  const t = telemetry || {};

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Vehicle Dynamics & 6-DOF Inertial Measurement (IMU)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              3-Axis Accelerometer, 3-Axis Gyroscope Rates, 4 Wheel Speeds, Tire Slip & Pitch/Roll Angles
            </p>
          </div>
        </div>
      </div>

      {/* 3-Axis Accel & Angle Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Longitudinal Accel (X)</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{(t.accel_x_mps2 || t.acceleration_x || 0.42).toFixed(2)} m/s²</span>
          <span className="text-[10px] text-slate-400 block mt-1">Jerk: {(t.jerk_x || 0.05).toFixed(2)} m/s³</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Lateral Accel (Y)</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(t.accel_y_mps2 || t.acceleration_y || 0.08).toFixed(2)} m/s²</span>
          <span className="text-[10px] text-slate-400 block mt-1">Roll Rate: {(t.angular_velocity_x || 0.1).toFixed(1)}°/s</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Pitch Angle</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.pitch_angle_deg || t.pitch_deg || 0.5).toFixed(1)}°</span>
          <span className="text-[10px] text-slate-400 block mt-1">Road Grade: {(t.road_gradient_pct || 0.0).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Roll Angle</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{(t.roll_angle_deg || t.roll_deg || 0.2).toFixed(1)}°</span>
          <span className="text-[10px] text-slate-400 block mt-1">Yaw Rate: {(t.yaw_rate_degps || t.angular_velocity_z || 0.4).toFixed(1)}°/s</span>
        </div>
      </div>

      {/* 4 Independent Wheel Speeds & Resistive Forces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            4-Wheel Speed Sensors & Tire Slip
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">Front Left (FL)</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{(t.wheel_speed_fl_kmh || t.wheel_speed_fl || t.vehicle_speed || 42.3).toFixed(1)} km/h</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">Front Right (FR)</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{(t.wheel_speed_fr_kmh || t.wheel_speed_fr || t.vehicle_speed || 42.4).toFixed(1)} km/h</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">Rear Left (RL)</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{(t.wheel_speed_rl_kmh || t.wheel_speed_rl || t.vehicle_speed || 42.2).toFixed(1)} km/h</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700">
              <span className="text-[10px] text-slate-500 block">Rear Right (RR)</span>
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">{(t.wheel_speed_rr_kmh || t.wheel_speed_rr || t.vehicle_speed || 42.3).toFixed(1)} km/h</span>
            </div>
          </div>
          <div className="flex justify-between py-1 border-t border-slate-100 dark:border-dark-800 pt-2">
            <span className="text-slate-500">Tire Slip Ratio:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(t.wheel_slip_ratio_fl || t.wheel_slip || 0.8).toFixed(1)}%</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-lg border space-y-2.5 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-dark-700 pb-2">
            Longitudinal Force Decomposition
          </h3>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Tractive Force (F_trac):</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">{(t.f_traction_n || 2150).toFixed(0)} N</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Aerodynamic Drag (F_aero):</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{(t.f_aero_n || 480).toFixed(0)} N</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Rolling Resistance (F_rr):</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.f_rr_n || 1580).toFixed(0)} N</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-800">
            <span className="text-slate-500">Road Grade Resistance (F_grade):</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{(t.f_grade_n || 0).toFixed(0)} N</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Traction Control:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.abs_active ? 'ABS ACTIVE' : 'NOMINAL'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
