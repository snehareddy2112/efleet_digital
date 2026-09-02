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
  Layers, 
  MapPin, 
  ArrowRight
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
import { useTheme } from '../context/ThemeContext';

export default function BusCockpit({ telemetry, onNavigateSubsystem }) {
  const { resolvedTheme } = useTheme();
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
  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';

  // Subsystem Cards for Quick Jump
  const subsystemCards = [
    { id: 'sub-batteries', title: 'Dual Battery Packs', sub: '320 kWh LFP', value: `${(t.total_battery_soc || 82.1).toFixed(1)}% SOC`, extra: `${(t.total_battery_voltage || 654).toFixed(1)} V | ${(t.total_battery_current || 0).toFixed(1)} A`, icon: Battery },
    { id: 'sub-bms', title: 'BMS & Cell Matrix', sub: '200s Cell Gradients', value: `${t.pack_a_cell_voltage_delta || 20} mV Delta`, extra: `Min: ${t.pack_a_cell_min_voltage || 3.285}V | Max: ${t.pack_a_cell_max_voltage || 3.305}V`, icon: Layers },
    { id: 'sub-powertrain', title: 'Motor & Inverter', sub: '250 kW PMSM + SiC', value: `${(t.motor_torque || 0).toFixed(0)} Nm`, extra: `${t.motor_rpm || 0} RPM | ${(t.motor_power || 0).toFixed(1)} kW`, icon: Zap },
    { id: 'sub-brakes', title: 'Brakes & Regen', sub: 'Blended Deceleration', value: `${(t.regen_power_kw || 0).toFixed(1)} kW Regen`, extra: `Air: ${(t.brake_pressure_bar || 8.5).toFixed(1)} bar | ${(t.regen_energy || 14.8).toFixed(1)} kWh`, icon: Disc },
    { id: 'sub-hvac', title: 'Dual-Zone HVAC', sub: 'Cabin Climate', value: `${(t.cabin_temperature || 23.8).toFixed(1)} °C`, extra: `Target: ${t.target_cabin_temperature || 22}°C | ${(t.hvac_power_kw || 4.6).toFixed(1)} kW`, icon: Wind },
    { id: 'sub-dynamics', title: 'Dynamics & 6-DOF IMU', sub: 'Longitudinal Kinematics', value: `${(t.acceleration_x || 0.42).toFixed(2)} m/s²`, extra: `Pitch: ${(t.pitch_deg || 0.5).toFixed(1)}° | Roll: ${(t.roll_deg || 0.2).toFixed(1)}°`, icon: Activity },
    { id: 'sub-charging', title: 'Charging & 24V Aux', sub: 'CCS2 Fast Charging', value: t.charger_connected ? 'CONNECTED' : 'STANDBY', extra: `LV: ${(t.lv_battery_voltage || 27.6).toFixed(1)} V | ${(t.dc_dc_power_kw || 1.7).toFixed(1)} kW`, icon: Zap },
    { id: 'sub-thermal', title: 'Thermal Loops', sub: 'Battery & Powertrain', value: `${(t.battery_temperature || 29.8).toFixed(1)} °C`, extra: `Motor Coolant: ${(t.motor_coolant_temperature || 48.2).toFixed(1)} °C`, icon: Thermometer },
    { id: 'sub-gps', title: 'GPS Route', sub: 'Telangana NH-163', value: `${(t.vehicle_speed || 0).toFixed(0)} km/h`, extra: `Alt: ${(t.altitude || 542).toFixed(0)} m | Pax: ${t.passenger_count || 38}`, icon: MapPin },
    { id: 'tcu', title: 'TCU-001 Gateway', sub: '5G NR NSA & Buffer', value: t.tcu_status || 'ONLINE', extra: `RSRP: ${t.rsrp || -85.4} dBm | Seq: #${t.sequence_number || 1}`, icon: Radio }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speed</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(t.vehicle_speed || 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Limit: {t.speed_limit_kmh || 50} km/h</div>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total SOC</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {(t.total_battery_soc || 82.1).toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">SOH: {(t.total_battery_soh || 98.3).toFixed(1)}%</div>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HV Power</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(t.total_battery_power || 0).toFixed(1)} <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">{(t.total_battery_current || 0).toFixed(1)} A @ {(t.total_battery_voltage || 654).toFixed(0)}V</div>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Motor Torque</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(t.motor_torque || 0).toFixed(0)} <span className="text-xs font-normal text-slate-500">Nm</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">{t.motor_rpm || 0} RPM (PMSM)</div>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Range Est.</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(t.estimated_range || 298).toFixed(0)} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">{(t.total_energy_remaining || 262).toFixed(1)} kWh usable</div>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Efficiency</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {(t.energy_consumption_per_km || 0.88).toFixed(2)} <span className="text-xs font-normal text-slate-500">kWh/km</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Regen: {(t.regen_percentage || 25.9).toFixed(0)}%</div>
        </div>
      </div>

      {/* Subsystem Quick Nav Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>BUS-001 Subsystems & Electronic Control Units</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any vehicle subsystem to inspect cell gradients, thermodynamic loops, and electronic control parameters.
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
                className="glass-panel p-3.5 rounded-lg border text-left transition hover:border-blue-400 dark:hover:border-blue-500 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider truncate">{c.title}</span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{c.value}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1 truncate">{c.extra}</div>
                <div className="flex items-center space-x-1 text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Engineering Rolling Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Speed & Battery Power Rolling Chart */}
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Speed & Battery Power (1 Hz Rolling 30 Ticks)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Live Ingestion</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#2563eb" tick={{ fontSize: 10 }} domain={[0, 90]} />
                <YAxis yAxisId="right" orientation="right" stroke="#d97706" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, fontSize: '11px', color: isDark ? '#f8fafc' : '#0f172a' }} />
                <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#2563eb" strokeWidth={2} dot={false} name="Speed (km/h)" />
                <Line yAxisId="right" type="monotone" dataKey="power" stroke="#d97706" strokeWidth={2} dot={false} name="Power (kW)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOC & Powertrain Temperature Chart */}
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Battery SOC & Motor Temperature</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Live Ingestion</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#16a34a" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#dc2626" tick={{ fontSize: 10 }} domain={[0, 120]} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, fontSize: '11px', color: isDark ? '#f8fafc' : '#0f172a' }} />
                <Area yAxisId="left" type="monotone" dataKey="soc" stroke="#16a34a" fill="#16a34a18" strokeWidth={2} name="SOC (%)" />
                <Line yAxisId="right" type="monotone" dataKey="motor_temp" stroke="#dc2626" strokeWidth={2} dot={false} name="Motor Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
