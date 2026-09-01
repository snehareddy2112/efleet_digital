import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Battery, 
  Gauge, 
  Thermometer, 
  Activity, 
  Wind, 
  ShieldCheck, 
  Radio, 
  Navigation, 
  RotateCw,
  Sliders,
  TrendingUp,
  Cpu,
  Layers
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

export default function BusDigitalTwin({ telemetry }) {
  const [historySeries, setHistorySeries] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadSeries = async () => {
      try {
        const data = await fetchTelemetrySeries('BUS-001', 30);
        if (isMounted && data) {
          const formatted = data.map((d, i) => ({
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
    const interval = setInterval(loadSeries, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const t = telemetry || {};

  return (
    <div className="space-y-6">
      {/* Top Cockpit Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3 rounded-lg border border-cyan-500/30">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Speed</div>
          <div className="text-xl font-bold font-mono text-cyan-300">{(t.vehicle_speed || 0).toFixed(1)} <span className="text-xs text-slate-400">km/h</span></div>
          <div className="text-[10px] text-slate-400">Limit: {t.speed_limit_kmh || 50} km/h</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-emerald-500/30">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total SOC</div>
          <div className="text-xl font-bold font-mono text-emerald-300">{(t.total_battery_soc || 0).toFixed(1)} <span className="text-xs text-slate-400">%</span></div>
          <div className="text-[10px] text-slate-400">SOH: {(t.total_battery_soh || 98.3).toFixed(1)}%</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-amber-500/30">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Battery Power</div>
          <div className="text-xl font-bold font-mono text-amber-300">{(t.total_battery_power || 0).toFixed(1)} <span className="text-xs text-slate-400">kW</span></div>
          <div className="text-[10px] text-slate-400">{(t.total_battery_current || 0).toFixed(1)} A @ {(t.total_battery_voltage || 650).toFixed(1)} V</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-purple-500/30">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Motor Torque</div>
          <div className="text-xl font-bold font-mono text-purple-300">{(t.motor_torque || 0).toFixed(0)} <span className="text-xs text-slate-400">Nm</span></div>
          <div className="text-[10px] text-slate-400">{t.motor_rpm || 0} RPM</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-blue-500/30">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Est. Range</div>
          <div className="text-xl font-bold font-mono text-blue-300">{(t.estimated_range || 298.5).toFixed(0)} <span className="text-xs text-slate-400">km</span></div>
          <div className="text-[10px] text-slate-400">{(t.total_energy_remaining || 262).toFixed(1)} kWh rem.</div>
        </div>

        <div className="glass-panel p-3 rounded-lg border border-dark-600">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Cabin Temp</div>
          <div className="text-xl font-bold font-mono text-slate-100">{(t.cabin_temperature || 23.8).toFixed(1)} <span className="text-xs text-slate-400">°C</span></div>
          <div className="text-[10px] text-slate-400">Ambient: {(t.outside_temperature || 34.5).toFixed(1)} °C</div>
        </div>
      </div>

      {/* Grid: Dual Battery Packs A & B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery Pack A */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Battery Pack A (BAT-001-A)</h3>
                <p className="text-[10px] text-slate-400">160 kWh LFP (200s Cell Configuration)</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/60">
              {(t.pack_a_soc || 82.4).toFixed(1)}% SOC
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Voltage</span>
              <span className="text-cyan-300 font-bold">{(t.pack_a_voltage || 654.2).toFixed(1)} V</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Current</span>
              <span className="text-amber-300 font-bold">{(t.pack_a_current || 45.2).toFixed(1)} A</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Power</span>
              <span className="text-purple-300 font-bold">{(t.pack_a_power || 29.57).toFixed(2)} kW</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Avg Temp</span>
              <span className="text-emerald-300 font-bold">{(t.pack_a_temperature || 29.8).toFixed(1)} °C</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Cell Delta V</span>
              <span className="text-slate-200 font-bold">{(t.pack_a_cell_voltage_delta || 20.0).toFixed(0)} mV</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Balancing</span>
              <span className={t.pack_a_balancing_active ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {t.pack_a_balancing_active ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-dark-700/60 pt-2 font-mono">
            <span>Cell Min: {t.pack_a_cell_min_voltage || 3.285}V</span>
            <span>Cell Max: {t.pack_a_cell_max_voltage || 3.305}V</span>
            <span>Isolation: {t.pack_a_isolation_resistance || 2450} kΩ</span>
          </div>
        </div>

        {/* Battery Pack B */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Battery Pack B (BAT-001-B)</h3>
                <p className="text-[10px] text-slate-400">160 kWh LFP (200s Cell Configuration)</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/60">
              {(t.pack_b_soc || 81.9).toFixed(1)}% SOC
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Voltage</span>
              <span className="text-cyan-300 font-bold">{(t.pack_b_voltage || 653.8).toFixed(1)} V</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Current</span>
              <span className="text-amber-300 font-bold">{(t.pack_b_current || 45.8).toFixed(1)} A</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Power</span>
              <span className="text-purple-300 font-bold">{(t.pack_b_power || 29.94).toFixed(2)} kW</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Avg Temp</span>
              <span className="text-emerald-300 font-bold">{(t.pack_b_temperature || 30.2).toFixed(1)} °C</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Cell Delta V</span>
              <span className="text-slate-200 font-bold">{(t.pack_b_cell_voltage_delta || 26.0).toFixed(0)} mV</span>
            </div>
            <div className="p-2.5 rounded bg-dark-900/80 border border-dark-700">
              <span className="text-[10px] text-slate-400 block">Balancing</span>
              <span className={t.pack_b_balancing_active ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {t.pack_b_balancing_active ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-dark-700/60 pt-2 font-mono">
            <span>Cell Min: {t.pack_b_cell_min_voltage || 3.282}V</span>
            <span>Cell Max: {t.pack_b_cell_max_voltage || 3.308}V</span>
            <span>Isolation: {t.pack_b_isolation_resistance || 2420} kΩ</span>
          </div>
        </div>
      </div>

      {/* Grid: Powertrain & Thermal Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 250 kW PMSM Motor */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100">250 kW PMSM Motor</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{t.motor_rpm || 0} RPM</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Shaft Torque:</span>
              <span className="text-purple-300 font-bold">{(t.motor_torque || 0).toFixed(1)} Nm</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Mechanical Power:</span>
              <span className="text-cyan-300 font-bold">{(t.motor_power || 0).toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Efficiency:</span>
              <span className="text-emerald-300 font-bold">{(t.motor_efficiency || 94.2).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Stator Temp:</span>
              <span className="text-amber-300 font-bold">{(t.motor_stator_temperature || 66.8).toFixed(1)} °C</span>
            </div>
          </div>
        </div>

        {/* SiC Traction Inverter */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">SiC Traction Inverter</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{t.inverter_state || 'ENABLED'}</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">DC Bus Voltage:</span>
              <span className="text-cyan-300 font-bold">{(t.inverter_dc_voltage || 654.0).toFixed(1)} V</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">DC Current:</span>
              <span className="text-amber-300 font-bold">{(t.inverter_dc_current || 89.2).toFixed(1)} A</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">AC Frequency:</span>
              <span className="text-purple-300 font-bold">{(t.inverter_ac_frequency || 163.3).toFixed(1)} Hz</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Junction Temp:</span>
              <span className="text-emerald-300 font-bold">{(t.inverter_temperature || 49.5).toFixed(1)} °C</span>
            </div>
          </div>
        </div>

        {/* Dual-Zone HVAC & Thermal Loop */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Dual-Zone HVAC & Thermal</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{t.hvac_mode || 'AUTO_COOL'}</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Compressor Power:</span>
              <span className="text-cyan-300 font-bold">{(t.compressor_power || 4.6).toFixed(2)} kW</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Battery Coolant Temp:</span>
              <span className="text-emerald-300 font-bold">{(t.battery_coolant_temperature || 26.5).toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Motor Coolant Temp:</span>
              <span className="text-amber-300 font-bold">{(t.motor_coolant_temperature || 48.2).toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-dark-900">
              <span className="text-slate-400">Radiator Fan Speed:</span>
              <span className="text-purple-300 font-bold">{(t.radiator_fan_speed || 40.0).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Real-Time Charts Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed & Power Real-Time Rolling Chart */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Speed & Net Electrical Power (Last 30 Ticks)</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">1-Sec Stream</span>
          </div>

          <div className="h-48 w-full">
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

        {/* SOC & Temperature Real-Time Rolling Chart */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
          <div className="flex items-center justify-between border-b border-dark-700 pb-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-emerald-400" />
              <span>Battery SOC & Powertrain Temperature</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">1-Sec Stream</span>
          </div>

          <div className="h-48 w-full">
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
