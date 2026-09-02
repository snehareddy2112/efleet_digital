import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SimControls from './components/SimControls';
import TraceModal from './components/TraceModal';

import BusCockpit from './pages/BusCockpit';
import LiveTelemetry from './pages/LiveTelemetry';
import CanMonitor from './pages/CanMonitor';
import TcuMonitor from './pages/TcuMonitor';
import MqttConsole from './pages/MqttConsole';
import Diagnostics from './pages/Diagnostics';
import SystemArchitecture from './pages/SystemArchitecture';

// Subsystem Deep-Dive Views
import VehicleSubsystem from './pages/subsystems/VehicleSubsystem';
import BatteriesSubsystem from './pages/subsystems/BatteriesSubsystem';
import BmsCellsSubsystem from './pages/subsystems/BmsCellsSubsystem';
import PowertrainSubsystem from './pages/subsystems/PowertrainSubsystem';
import DynamicsSubsystem from './pages/subsystems/DynamicsSubsystem';
import BrakesSubsystem from './pages/subsystems/BrakesSubsystem';
import HvacSubsystem from './pages/subsystems/HvacSubsystem';
import ChargingSubsystem from './pages/subsystems/ChargingSubsystem';
import ThermalSubsystem from './pages/subsystems/ThermalSubsystem';
import GpsSubsystem from './pages/subsystems/GpsSubsystem';

import { fetchBusTelemetry, createTelemetryWebSocket } from './api';

export default function App() {
  const [activePage, setActivePage] = useState('cockpit');
  const [telemetry, setTelemetry] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [simStatus, setSimStatus] = useState({
    is_paused: false,
    speed_multiplier: 1.0,
    active_scenario: 'Normal Route'
  });
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

  useEffect(() => {
    fetchBusTelemetry('BUS-001').then(data => {
      if (data) setTelemetry(data);
    }).catch(console.error);

    let ws = null;
    const connectWs = () => {
      ws = createTelemetryWebSocket(
        (msg) => {
          if (msg.type === 'TELEMETRY_UPDATE' || msg.type === 'INITIAL_SNAPSHOT') {
            setTelemetry(msg.data);
          }
        },
        () => setIsWsConnected(true),
        () => {
          setIsWsConnected(false);
          setTimeout(connectWs, 2000);
        }
      );
    };

    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Cockpit Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isWsConnected={isWsConnected}
        telemetry={telemetry}
        onOpenTraceModal={() => setIsTraceModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Simulation Control Deck */}
        <SimControls
          simStatus={simStatus}
          onStatusChange={(newStatus) => setSimStatus(newStatus)}
        />

        {/* Primary Views */}
        {activePage === 'cockpit' && (
          <BusCockpit
            telemetry={telemetry}
            onNavigateSubsystem={(subId) => setActivePage(subId)}
          />
        )}

        {activePage === 'telemetry' && (
          <LiveTelemetry telemetry={telemetry} />
        )}

        {activePage === 'can' && (
          <CanMonitor />
        )}

        {activePage === 'tcu' && (
          <TcuMonitor telemetry={telemetry} />
        )}

        {activePage === 'mqtt' && (
          <MqttConsole telemetry={telemetry} />
        )}

        {activePage === 'diagnostics' && (
          <Diagnostics telemetry={telemetry} />
        )}

        {activePage === 'architecture' && (
          <SystemArchitecture
            telemetry={telemetry}
            onOpenTraceModal={() => setIsTraceModalOpen(true)}
          />
        )}

        {/* Subsystem Deep-Dive Drilldowns */}
        {activePage === 'sub-vehicle' && (
          <VehicleSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-batteries' && (
          <BatteriesSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-bms' && (
          <BmsCellsSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-powertrain' && (
          <PowertrainSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-dynamics' && (
          <DynamicsSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-brakes' && (
          <BrakesSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-hvac' && (
          <HvacSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-charging' && (
          <ChargingSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-thermal' && (
          <ThermalSubsystem telemetry={telemetry} />
        )}

        {activePage === 'sub-gps' && (
          <GpsSubsystem telemetry={telemetry} />
        )}
      </main>

      {/* Global E2E Live Message Tracer Modal */}
      <TraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        telemetry={telemetry}
      />

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200 dark:border-dark-700 text-center text-xs text-slate-500 font-mono">
        E-FLEET DIGITAL — BUS-001 Vehicle Telematics & Operations Platform (ELECTRA-12M / TCU-001)
      </footer>
    </div>
  );
}
