import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Battery, 
  Zap, 
  Activity, 
  Wind, 
  Disc, 
  Radio, 
  Thermometer, 
  ShieldCheck, 
  Layers, 
  MapPin,
  TrendingUp,
  Cpu,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { fetchTelemetrySeries } from '../api';

export default function BusCockpit({ telemetry, onNavigateSubsystem }) {
  const [historySeries, setHistorySeries] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadSeries = async () => {
      try {
        const data = await fetchTelemetrySeries('BUS-001', 30);
        if (isMounted && data) {
          const formatted = data.map((d) => ({
            time: new Date(d.device_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            speed: d.vehicle_speed || 0,
            soc: d.total_battery_soc || 0,
            power: d.total_battery_power || 0,
            current: d.total_battery_current || 0,
            motor_rpm: d.motor_rpm || 0,
            motor_temp: d.motor_temperature || 0,
            bat_temp: d.battery_temperature || 0,
            regen_power: d.regen_power_kw || 0,
            hvac_power: d.hvac_power_kw || 0
          }));
          setHistorySeries(formatted);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSeries();
    const interval = setInterval(loadSeries, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const t = telemetry || {};

  // Subsystem Cards for Quick Jump
  const subsystemCards = [
    { id: 'sub-batteries', title: 'Dual Battery Packs', sub: '320 kWh LFP', value: `${(t.total_battery_soc || 82.1).toFixed(1)}% SOC`, extra: `${(t.total_battery_voltage || 654).toFixed(1)} V | ${(t.total_battery_current || 0).toFixed(1)} A`, icon: Battery, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { id: 'sub-bms', title: 'BMS & Cell Matrix', sub: '200s Cell Gradients', value: `${t.pack_a_cell_voltage_delta || 20} mV Delta`, extra: `Min: ${t.pack_a_cell_min_voltage || 3.285}V | Max: ${t.pack_a_cell_max_voltage || 3.305}V`, icon: Layers, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { id: 'sub-powertrain', title: 'Motor & Inverter', sub: '250 kW PMSM + SiC', value: `${(t.motor_torque || 0).toFixed(0)} Nm`, extra: `${t.motor_rpm || 0} RPM | ${(t.motor_power || 0).toFixed(1)} kW`, icon: Zap, color: 'text-purple-400', border: 'border-purple-500/30' },
    { id: 'sub-brakes', title: 'Brakes & Regen', sub: 'Blended Deceleration', value: `${(t.regen_power_kw || 0).toFixed(1)} kW Regen`, extra: `Air: ${(t.brake_pressure_bar || 8.5).toFixed(1)} bar | ${(t.regen_energy || 14.8).toFixed(1)} kWh cap.`, icon: Disc, color: 'text-amber-400', border: 'border-amber-500/30' },
    { id: 'sub-hvac', title: 'Dual-Zone HVAC', sub: 'Cabin Climate', value: `${(t.cabin_temperature || 23.8).toFixed(1)} °C`, extra: `Target: ${t.target_cabin_temperature || 22}°C | ${(t.hvac_power_kw || 4.6).toFixed(1)} kW`, icon: Wind, color: 'text-blue-400', border: 'border-blue-500/30' },
    { id: 'sub-dynamics', title: 'Dynamics & 6-DOF IMU', sub: 'Longitudinal Kinematics', value: `${(t.acceleration_x || 0.42).toFixed(2)} m/s²`, extra: `Pitch: ${(t.pitch_deg || 0.5).toFixed(1)}° | Roll: ${(t.roll_deg || 0.2).toFixed(1)}°`, icon: Activity, color: 'text-rose-400', border: 'border-rose-500/30' },
    { id: 'sub-charging', title: 'Charging & 24V Aux', sub: 'CCS2 Fast Charging', value: t.charger_connected ? 'CONNECTED' : 'STANDBY', extra: `LV: ${(t.lv_battery_voltage || 27.6).toFixed(1)} V | ${(t.dc_dc_power_kw || 1.7).toFixed(1)} kW`, icon: Zap, color: 'text-amber-400', border: 'border-amber-500/30' },
    { id: 'sub-thermal', title: 'Thermal Loops', sub: 'Battery & Powertrain', value: `${(t.battery_temperature || 29.8).toFixed(1)} °C`, extra: `Motor Coolant: ${(t.motor_coolant_temperature || 48.2).toFixed(1)} °C`, icon: Thermometer, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { id: 'sub-gps', title: 'GPS & Corridor Route', sub: 'TS-HYD-WGL-101', value: `${(t.vehicle_speed || 0).toFixed(0)} km/h`, extra: `Alt: ${(t.altitude || 542).toFixed(0)} m | Pax: ${t.passenger_count || 38}`, icon: MapPin, color: 'text-purple-400', border: 'border-purple-500/30' },
    { id: 'tcu', title: 'TCU-001 Gateway', sub: '5G NR NSA & Buffer', value: t.tcu_status || 'ONLINE', extra: `RSRP: ${t.rsrp || -85.4} dBm | Seq: #${t.sequence_number || 1}`, icon: Radio, color: 'text-cyan-400', border: 'border-cyan-500/30' }
  ];

  return (
    <div className="space-y-6">
      {/* Cockpit Gauges & Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Vehicle Speed</div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {(t.vehicle_speed || 0).toFixed(1)} <span className="text-xs text-slate-400">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Speed Limit: {t.speed_limit_kmh || 50} km/h</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Battery Total SOC</div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {(t.total_battery_soc || 82.1).toFixed(1)} <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">SOH: {(t.total_battery_soh || 98.3).toFixed(1)}%</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Net HV Power</div>
          <div className="text-2xl font-black font-mono text-amber-300">
            {(t.total_battery_power || 0).toFixed(1)} <span className="text-xs text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{(t.total_battery_current || 0).toFixed(1)} A @ {(t.total_battery_voltage || 654).toFixed(0)}V</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-purple-500/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Motor Torque</div>
          <div className="text-2xl font-black font-mono text-purple-300">
            {(t.motor_torque || 0).toFixed(0)} <span className="text-xs text-slate-400">Nm</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{t.motor_rpm || 0} RPM (PMSM)</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-blue-500/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Driving Range</div>
          <div className="text-2xl font-black font-mono text-blue-300">
            {(t.estimated_range || 298).toFixed(0)} <span className="text-xs text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{(t.total_energy_remaining || 262).toFixed(1)} kWh usable</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-dark-600">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Efficiency</div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {(t.energy_consumption_per_km || 0.88).toFixed(2)} <span className="text-xs text-slate-400">kWh/km</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Regen: {(t.regen_percentage || 25.9).toFixed(0)}%</div>
        </div>
      </div>

      {/* Interactive Subsystem Matrix Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>BUS-001 Physical Systems & Electronic Controllers (ECUs)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any subsystem below to deep-dive into its telemetry, cell matrix, thermodynamic curves, or control parameters.
            </p>
          </div>
        </div>

        {/* Subsystems Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {subsystemCards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => onNavigateSubsystem(c.id)}
                className={`glass-panel p-4 rounded-xl border text-left transition hover:border-cyan-500/60 hover:bg-dark-800/80 group ${c.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">{c.title}</span>
                  <Icon className={`w-4 h-4 ${c.color} group-hover:scale-110 transition`} />
                </div>
                <div className="text-sm font-extrabold font-mono text-slate-100 group-hover:text-cyan-300 transition">{c.value}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">{c.extra}</div>
                <div className="flex items-center space-x-1 text-[10px] text-cyan-400 mt-2 font-medium">
                  <span>Drill down</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Real-Time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed & Battery Power Rolling Chart */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Speed & Battery Power (1 Hz Rolling 30 Ticks)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Live Ingestion</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d44" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#00f0ff" tick={{ fontSize: 10 }} domain={[0, 90]} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1522', borderColor: '#1e2d44', fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#00f0ff" strokeWidth={2} dot={false} name="Speed (km/h)" />
                <Line yAxisId="right" type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} dot={false} name="Power (kW)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOC & Powertrain Temperature Chart */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-emerald-400" />
              <span>Battery SOC & Motor Temperature</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Live Ingestion</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d44" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10 }} domain={[0, 120]} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1522', borderColor: '#1e2d44', fontSize: '11px' }} />
                <Area yAxisId="left" type="monotone" dataKey="soc" stroke="#10b981" fill="#10b98122" strokeWidth={2} name="SOC (%)" />
                <Line yAxisId="right" type="monotone" dataKey="motor_temp" stroke="#f43f5e" strokeWidth={2} dot={false} name="Motor Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
