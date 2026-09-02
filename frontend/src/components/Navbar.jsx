import React, { useState, useRef, useEffect } from 'react';
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
  Thermometer,
  ChevronDown,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activePage, setActivePage, isWsConnected, telemetry, onOpenTraceModal }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [subsystemsDropdownOpen, setSubsystemsDropdownOpen] = useState(false);

  const themeRef = useRef(null);
  const subsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
      if (subsRef.current && !subsRef.current.contains(e.target)) {
        setSubsystemsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = telemetry || {};
  const speed = t.vehicle_speed || 0;
  const soc = t.total_battery_soc || 0;
  const power = t.total_battery_power || 0;
  const stateName = t.vehicle_state_name || 'READY';

  // Primary top navigation items
  const mainNavItems = [
    { id: 'cockpit', label: 'BUS-001 Cockpit', icon: Gauge },
    { id: 'telemetry', label: 'Telemetry (322)', icon: List },
    { id: 'can', label: 'CAN Monitor', icon: Cpu },
    { id: 'tcu', label: 'TCU-001', icon: Radio },
    { id: 'mqtt', label: 'MQTT Console', icon: MessageSquare },
    { id: 'diagnostics', label: 'Diagnostics & DTCs', icon: AlertTriangle },
    { id: 'architecture', label: 'Data Pipeline E2E', icon: Layers }
  ];

  // Detailed Subsystem views
  const subsystemCategories = [
    {
      group: 'ENERGY & BATTERY',
      items: [
        { id: 'sub-batteries', label: 'Dual Battery Packs', desc: 'Pack A & Pack B 160 kWh LFP, Contactors', icon: Battery },
        { id: 'sub-bms', label: 'BMS & 200s Cell Matrix', desc: 'Cell Voltages, Active Shunts, Thermal Gradients', icon: Layers },
        { id: 'sub-charging', label: 'CCS2 Charging & 24V Aux', desc: 'Fast DC Charging, DC-DC Converter', icon: Zap },
        { id: 'sub-thermal', label: 'Thermal Management', desc: 'Dual Coolant Loops, Pumps, Radiator', icon: Thermometer },
      ]
    },
    {
      group: 'POWERTRAIN & DYNAMICS',
      items: [
        { id: 'sub-powertrain', label: '250 kW Motor & Inverter', desc: 'PMSM Torque, RPM, SiC Inverter Efficiency', icon: Zap },
        { id: 'sub-brakes', label: 'Brakes & Regeneration', desc: 'Regen Energy Recovery, Pneumatic Reservoir', icon: Disc },
        { id: 'sub-dynamics', label: 'Dynamics & 6-DOF IMU', desc: 'Accelerometers, Gyro, Wheel Slip Ratios', icon: Activity },
        { id: 'sub-vehicle', label: 'Vehicle & Kinematics', desc: 'Speed, Mass, Passenger Load, Pedals', icon: Gauge },
        { id: 'sub-hvac', label: 'Dual-Zone HVAC', desc: 'Cabin Climate, Scroll Compressor Power', icon: Wind },
        { id: 'sub-gps', label: 'GPS Route & Elevation', desc: 'Telangana NH-163 Corridor, Waypoints', icon: MapPin },
      ]
    }
  ];

  const allSubsystemItems = subsystemCategories.flatMap(g => g.items);
  const activeSubsystem = allSubsystemItems.find(s => s.id === activePage);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-slate-200 dark:border-dark-700 transition-colors">
      {/* Top Operations Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80 dark:border-dark-750">
        {/* Branding & Vehicle Metadata */}
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600 flex items-center space-x-2">
            <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-slate-100">
              E-FLEET
            </span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              BUS-001
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Model: <strong className="text-slate-700 dark:text-slate-300">ELECTRA-12M</strong></span>
            <span>•</span>
            <span>TCU: <strong className="text-slate-700 dark:text-slate-300">TCU-001</strong></span>
            <span>•</span>
            <span>Pack: <strong className="text-slate-700 dark:text-slate-300">Dual LFP 320 kWh</strong></span>
          </div>
        </div>

        {/* Live Operations Telemetry Strip */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">STATE:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stateName}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">SPEED:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{speed.toFixed(1)} km/h</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">SOC:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{soc.toFixed(1)}%</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400">POWER:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{power.toFixed(1)} kW</span>
            </div>
          </div>

          {/* Trace Live Message Trigger */}
          <button
            onClick={onOpenTraceModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 border border-slate-300 dark:border-dark-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Trace Data Path</span>
          </button>

          {/* Theme Switcher Widget */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              title="Switch Theme"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 border border-slate-300 dark:border-dark-600 text-slate-700 dark:text-slate-300 text-xs font-mono transition"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="capitalize hidden sm:inline">{theme}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 rounded bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-650 shadow-lg py-1 z-50 text-xs font-mono">
                <button
                  onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                  className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 transition ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-750'}`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                  className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 transition ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-750'}`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setThemeDropdownOpen(false); }}
                  className={`w-full px-3 py-1.5 text-left flex items-center space-x-2 transition ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-750'}`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {isWsConnected ? (
              <span className="flex items-center text-emerald-700 dark:text-emerald-400 space-x-1.5 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse" />
                <span className="text-[11px] font-bold">1 Hz LIVE</span>
              </span>
            ) : (
              <span className="flex items-center text-rose-700 dark:text-rose-400 space-x-1.5 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
                <WifiOff className="w-3 h-3" />
                <span className="text-[11px] font-bold">OFFLINE</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subsystem & Navigation Tabs */}
      <div className="px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-2">
        {/* Main Navigation Tabs */}
        <div className="flex items-center space-x-1">
          {mainNavItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-200 dark:bg-dark-750 text-blue-700 dark:text-blue-400 font-bold border border-slate-300 dark:border-dark-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 10 Subsystem Drilldown Dropdown Menu */}
        <div className="relative" ref={subsRef}>
          <button
            onClick={() => setSubsystemsDropdownOpen(!subsystemsDropdownOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition border ${
              activeSubsystem
                ? 'bg-blue-50 dark:bg-dark-750 text-blue-700 dark:text-blue-400 font-bold border-blue-300 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-dark-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{activeSubsystem ? activeSubsystem.label : 'Subsystem Drilldowns (10)'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {subsystemsDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 rounded bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-650 shadow-xl py-2 z-50 text-xs">
              {subsystemCategories.map((cat, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-2 pt-2 border-t border-slate-100 dark:border-dark-750' : ''}>
                  <div className="px-3 py-1 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {cat.group}
                  </div>
                  {cat.items.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activePage === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { setActivePage(sub.id); setSubsystemsDropdownOpen(false); }}
                        className={`w-full px-3 py-2 text-left flex items-start space-x-2.5 transition ${
                          isSubActive
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-750'
                        }`}
                      >
                        <SubIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-medium">{sub.label}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{sub.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
