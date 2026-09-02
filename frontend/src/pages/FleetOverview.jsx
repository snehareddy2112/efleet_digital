import React from 'react';
import { Bus, Zap, Battery, Activity, Route, MapPin, Gauge, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function FleetOverview({ telemetry, onSelectBus }) {
  const kpis = [
    { label: 'Total Fleet Size', value: '100 Buses', sub: 'E-Fleet Network', icon: Bus, color: 'text-blue-600', border: 'border-slate-200' },
    { label: 'Active Telematics Units', value: '1 Active (BUS-001)', sub: 'Full Physics & CAN Sims', icon: Zap, color: 'text-emerald-600', border: 'border-slate-200' },
    { label: 'Average Fleet SOC', value: `${(telemetry?.total_battery_soc || 81.8).toFixed(1)}%`, sub: '320 kWh LFP Dual-Pack', icon: Battery, color: 'text-amber-600', border: 'border-slate-200' },
    { label: 'Active Transit Corridors', value: '8 Highways', sub: 'Telangana State TSRTC', icon: Route, color: 'text-purple-600', border: 'border-slate-200' }
  ];

  const routes = [
    { id: 'TS-HYD-WGL-101', name: 'Hyderabad (MGBS) → Warangal (CBS)', dist: '145 km', via: 'Secunderabad, Bhongir, Jangaon', buses: 'BUS-001 (Active Ref)', speed: '55 km/h' },
    { id: 'TS-HYD-KMN-202', name: 'Hyderabad (JBS) → Karimnagar (CBS)', dist: '165 km', via: 'Shamirpet, Pragnapur, Siddipet', buses: 'BUS-002', speed: '58 km/h' },
    { id: 'TS-HYD-LOOP-707', name: 'Hyderabad Smart City Ring Expressway', dist: '95 km', via: 'Miyapur, Hitec City, RGIA Airport', buses: 'BUS-003', speed: '62 km/h' },
    { id: 'TS-HYD-NZB-303', name: 'Hyderabad (MGBS) → Nizamabad', dist: '175 km', via: 'Medchal, Kamareddy, Dichpally', buses: 'Ready to Deploy', speed: '60 km/h' }
  ];

  const chargingHubs = [
    { name: 'Miyapur Central Bus Depot EV Hub', guns: '8x 180 kW CCS2 Dual-Gun', status: 'ONLINE', pwr: '1440 kW' },
    { name: 'LB Nagar Metro Interchange EV Hub', guns: '6x 150 kW CCS2 Fast Chargers', status: 'ONLINE', pwr: '900 kW' },
    { name: 'Shamshabad Airport EV Fast Hub (RGIA)', guns: '8x 240 kW Ultra-Fast HPC', status: 'ONLINE', pwr: '1920 kW' },
    { name: 'Warangal Kazipet Central EV Plaza', guns: '6x 180 kW Dual-Gun Hub', status: 'ONLINE', pwr: '1080 kW' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`glass-panel p-4 rounded-lg border ${kpi.border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className="p-2 rounded bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Focus: BUS-001 Reference Banner */}
      <div className="glass-panel p-5 rounded-lg border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Primary Vehicle: BUS-001 + TCU-001</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-mono border border-blue-200 dark:border-blue-800">
                100% High-Fidelity Physics & CAN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous telemetry stream through <strong>ECUs → CAN Bus → TCU-001 → MQTT Broker → Cloud Ingestion → Operations Dashboard</strong>.
            </p>
          </div>

          <button
            onClick={() => onSelectBus('cockpit')}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
          >
            <span>Open BUS-001 Cockpit</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Transit Corridors & Charging Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telangana Transit Routes */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Route className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-slate-200">Inter-City Transit Corridors (NH-163 & SH-1)</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">8 Total Routes</span>
          </div>

          <div className="space-y-2.5">
            {routes.map((rt) => (
              <div key={rt.id} className="p-3 rounded-lg bg-dark-800/60 border border-dark-700/80 hover:border-cyan-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">{rt.id}</span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{rt.buses}</span>
                </div>
                <div className="text-xs text-slate-200 font-medium mt-1">{rt.name}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Via: {rt.via}</span>
                  <span className="font-mono">{rt.dist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EV Fast Charging Hubs */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-slate-200">Depot & Highway Fast Charging Hubs</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">12 Stations</span>
          </div>

          <div className="space-y-2.5">
            {chargingHubs.map((hub, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-dark-800/60 border border-dark-700/80 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{hub.name}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{hub.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1 font-mono">
                  <span>{hub.guns}</span>
                  <span className="text-amber-400">{hub.pwr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
