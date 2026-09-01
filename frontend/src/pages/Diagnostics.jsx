import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Zap, Flame, Thermometer, Cpu, Radio } from 'lucide-react';
import { fetchDiagnostics, injectFault } from '../api';

export default function Diagnostics({ telemetry }) {
  const [diagData, setDiagData] = useState(null);
  const [activeFaults, setActiveFaults] = useState({});
  const [loadingFault, setLoadingFault] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchDiagnostics('BUS-001');
      if (data) {
        setDiagData(data);
        const map = {};
        data.active_dtcs.forEach(d => { map[d.fault_name] = true; });
        setActiveFaults(map);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFault = async (faultName) => {
    setLoadingFault(faultName);
    const newStatus = !activeFaults[faultName];
    try {
      await injectFault('BUS-001', faultName, newStatus);
      setActiveFaults(prev => ({ ...prev, [faultName]: newStatus }));
      await loadData();
    } finally {
      setLoadingFault(null);
    }
  };

  const supportedFaults = [
    { name: 'Battery Over Temperature', desc: 'Forces Pack A/B temp to 62.5°C, BMS warnings & current derating', ecu: 'BMS_A / BMS_B', severity: 'CRITICAL', icon: Thermometer },
    { name: 'Battery Over Voltage', desc: 'Forces Pack A voltage to 745V, inhibits regen braking', ecu: 'BMS_A', severity: 'CRITICAL', icon: Zap },
    { name: 'Battery Under Voltage', desc: 'Drops cell voltage below 2.65V, torque clamping', ecu: 'BMS_A', severity: 'WARNING', icon: Zap },
    { name: 'Battery Over Current', desc: 'Spikes discharge current to 420A', ecu: 'BMS_A', severity: 'CRITICAL', icon: Zap },
    { name: 'BMS Fault', desc: 'Simulates BMS micro-controller CRC error & vehicle emergency state', ecu: 'BMS_A / BMS_B', severity: 'CRITICAL', icon: ShieldAlert },
    { name: 'Motor Fault', desc: 'Simulates stator winding overheat >130°C', ecu: 'MOTOR_ECU', severity: 'WARNING', icon: Cpu },
    { name: 'Inverter Fault', desc: 'Simulates SiC gate drive desaturation trip', ecu: 'INVERTER_ECU', severity: 'CRITICAL', icon: Cpu },
    { name: 'HVAC Fault', desc: 'Simulates AC scroll compressor lockout', ecu: 'HVAC_ECU', severity: 'WARNING', icon: AlertTriangle },
    { name: 'Charger Fault', desc: 'Simulates CCS2 inlet pin over-temp >90°C', ecu: 'CHARGER_ECU', severity: 'CRITICAL', icon: Flame },
    { name: 'HV Isolation Fault', desc: 'Drops chassis insulation resistance to 180 kΩ (<500 Ω/V)', ecu: 'SAFETY_ECU', severity: 'CRITICAL', icon: ShieldAlert },
    { name: 'CAN Communication Loss', desc: 'Disables simulated CAN arbitration bus', ecu: 'CAN_NETWORK', severity: 'CRITICAL', icon: Radio },
    { name: 'GPS Loss', desc: 'Simulates GNSS signal satellite lock loss & dead reckoning', ecu: 'TCU_GPS', severity: 'WARNING', icon: AlertTriangle },
    { name: 'MQTT Loss', desc: 'Simulates cellular MQTT transport failure & queues into store-forward buffer', ecu: 'TCU_MODEM', severity: 'CRITICAL', icon: Radio },
    { name: 'TCU Fault', desc: 'Simulates TCU edge microcontroller watchdog exception', ecu: 'TCU_HARDWARE', severity: 'CRITICAL', icon: ShieldAlert }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Active DTC Summary Strip */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <AlertTriangle className={`w-6 h-6 ${(diagData?.active_dtc_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Vehicle Diagnostics & Fault Injection Rack</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live OBD-II / J1939 Diagnostic Trouble Codes (DTCs), severity classification, and active simulation overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-dark-900 border border-dark-700">
            Active DTCs: <span className="text-rose-400 font-bold">{diagData?.active_dtc_count || 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-dark-900 border border-dark-700">
            Critical: <span className="text-rose-400 font-bold">{diagData?.critical_fault_count || 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-dark-900 border border-dark-700">
            Warnings: <span className="text-amber-400 font-bold">{diagData?.warning_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Active DTC Alert Table */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Active Diagnostic Trouble Codes (DTCs)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">SAE J2012 / J1939 Compliant</span>
        </div>

        {(diagData?.active_dtcs?.length || 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-900 text-slate-400 border-b border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">DTC Code</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Subsystem</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Remedial Action</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {diagData.active_dtcs.map((dtc, idx) => (
                  <tr key={idx} className="hover:bg-dark-800/60 transition">
                    <td className="py-2.5 px-3 font-bold text-rose-400">{dtc.dtc_code}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dtc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {dtc.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{dtc.subsystem}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans">{dtc.description}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{dtc.action}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{dtc.timestamp_iso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-dark-900/60 rounded-lg flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Active Faults or Diagnostic Trouble Codes. Vehicle systems nominal.</span>
          </div>
        )}
      </div>

      {/* Fault Injection Matrix */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Interactive Fault Injection Matrix (Test System Resilience)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">10 Configurable Scenarios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportedFaults.map((f) => {
            const Icon = f.icon;
            const isInject = activeFaults[f.name];
            return (
              <div key={f.name} className={`p-4 rounded-xl border transition flex items-center justify-between ${
                isInject ? 'bg-rose-950/40 border-rose-500/60' : 'bg-dark-900/70 border-dark-700 hover:border-dark-500'
              }`}>
                <div className="space-y-1 max-w-[70%]">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${isInject ? 'text-rose-400' : 'text-slate-400'}`} />
                    <h4 className="text-xs font-bold text-slate-100">{f.name}</h4>
                    <span className="text-[10px] font-mono text-cyan-400">[{f.ecu}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.desc}</p>
                </div>

                <button
                  onClick={() => handleToggleFault(f.name)}
                  disabled={loadingFault === f.name}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                    isInject
                      ? 'bg-rose-500 hover:bg-rose-400 text-dark-900 shadow-md shadow-rose-900/50'
                      : 'bg-dark-800 text-slate-300 hover:bg-dark-700 hover:text-white border border-dark-600'
                  }`}
                >
                  {isInject ? 'CLEAR FAULT' : 'INJECT'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
