import React, { useState } from 'react';
import { 
  Gauge, 
  Battery, 
  Cpu, 
  Zap, 
  Activity, 
  Wind, 
  Disc, 
  Layers, 
  Radio, 
  MessageSquare, 
  AlertTriangle, 
  MapPin, 
  List, 
  Share2, 
  Wifi, 
  WifiOff,
  Sliders,
  Thermometer,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, isWsConnected, telemetry, onOpenTraceModal }) {
  const [subsystemDropdownOpen, setSubsystemDropdownOpen] = useState(false);
  const [pipelineDropdownOpen, setPipelineDropdownOpen] = useState(false);

  const t = telemetry || {};
  const speed = t.vehicle_speed || 0;
  const soc = t.total_battery_soc || 0;
  const power = t.total_battery_power || 0;
  const stateName = t.vehicle_state_name || 'READY';

  // Primary top-level navigation items
  const mainTabs = [
    { id: 'cockpit', label: 'BUS-001 Cockpit', icon: Gauge },
    { id: 'telemetry', label: 'All Telemetry (280+)', icon: List },
    { id: 'can', label: 'CAN Monitor', icon: Cpu },
    { id: 'tcu', label: 'TCU-001 Device', icon: Radio },
    { id: 'mqtt', label: 'MQTT Console', icon: MessageSquare },
    { id: 'diagnostics', label: 'Diagnostics & DTCs', icon: AlertTriangle },
    { id: 'architecture', label: 'Data Pipeline E2E', icon: Layers }
  ];

  // Subsystems for detailed drill-down
  const subsystems = [
    { id: 'sub-vehicle', label: 'Vehicle & Kinematics', icon: Gauge, desc: 'Speed, Gear, Odometer, Mass, Driver' },
    { id: 'sub-batteries', label: 'Dual Battery Packs', icon: Battery, desc: 'Pack A & Pack B 160 kWh LFP, Contactors' },
    { id: 'sub-bms', label: 'BMS & Cell Matrix', icon: Layers, desc: '200s Cell Voltages, Balancing, Gradients' },
    { id: 'sub-powertrain', label: 'Motor & Inverter', icon: Zap, desc: '250 kW PMSM, Torque, SiC Inverter' },
    { id: 'sub-dynamics', label: 'Dynamics & 6-DOF IMU', icon: Activity, desc: 'Accelerometers, Gyro, Wheel Speeds, Slip' },
    { id: 'sub-brakes', label: 'Brakes & Regeneration', icon: Disc, desc: 'Regen Power, Pneumatic Air, ABS/ESC' },
    { id: 'sub-hvac', label: 'Dual-Zone HVAC', icon: Wind, desc: 'Cabin AC, Scroll Compressor, Temperatures' },
    { id: 'sub-charging', label: 'Charging & 24V Aux', icon: Zap, desc: 'CCS2 Fast Charging, DC-DC Converter' },
    { id: 'sub-thermal', label: 'Thermal Management', icon: Thermometer, desc: 'Dual Coolant Loops, Pumps, Radiator' },
    { id: 'sub-gps', label: 'GPS Route & Elevation', icon: MapPin, desc: 'Corridor Coordinates, Stops, Elevation' }
  ];

  const isSubsystemActive = subsystems.some(s => s.id === activePage);

  return (
    <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-dark-600">
      {/* Top Cockpit Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-dark-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40">
            <Zap className="w-5 h-5 text-ev-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                OLECTRA DIGITAL TWIN
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800/60">
                BUS-001
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-2 font-mono">
              <span>Model: <strong>ELECTRA-12M</strong></span>
              <span>•</span>
              <span>TCU: <strong>TCU-001</strong></span>
              <span>•</span>
              <span>LFP 320 kWh</span>
            </div>
          </div>
        </div>

        {/* Live Cockpit Status Strip */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-dark-800/90 border border-dark-600 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">STATE:</span>
              <span className="text-emerald-400 font-bold">{stateName}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">SPEED:</span>
              <span className="text-cyan-400 font-bold">{speed.toFixed(1)} km/h</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">SOC:</span>
              <span className="text-amber-400 font-bold">{soc.toFixed(1)}%</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">POWER:</span>
              <span className="text-purple-400 font-bold">{power.toFixed(1)} kW</span>
            </div>
          </div>

          <button
            onClick={onOpenTraceModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trace Live Message</span>
          </button>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {isWsConnected ? (
              <span className="flex items-center text-emerald-400 space-x-1 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold">1 Hz LIVE</span>
              </span>
            ) : (
              <span className="flex items-center text-rose-400 space-x-1 px-2 py-1 rounded bg-rose-950/60 border border-rose-800">
                <WifiOff className="w-3 h-3" />
                <span className="text-[11px] font-bold">OFFLINE</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subsystem & Navigation Bar */}
      <div className="px-4 flex items-center justify-between overflow-x-auto py-1.5 gap-2 border-b border-dark-700/30">
        {/* Main tabs */}
        <div className="flex items-center space-x-1">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subsystem Drilldown Selector */}
        <div className="flex items-center space-x-1 pl-2 border-l border-dark-700">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 hidden lg:inline">Subsystems:</span>
          <div className="flex items-center space-x-1 overflow-x-auto">
            {subsystems.slice(0, 5).map((sub) => {
              const Icon = sub.icon;
              const isActive = activePage === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActivePage(sub.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{sub.label.split(' ')[0]}</span>
                </button>
              );
            })}

            {/* More Subsystems Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSubsystemDropdownOpen(!subsystemDropdownOpen)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition ${
                  isSubsystemActive && !subsystems.slice(0, 5).some(s => s.id === activePage)
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-dark-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>More Subsystems</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {subsystemDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-dark-800 border border-dark-600 shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                  {subsystems.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActivePage(sub.id);
                          setSubsystemDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center space-x-2 transition ${
                          activePage === sub.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-dark-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold">{sub.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{sub.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
