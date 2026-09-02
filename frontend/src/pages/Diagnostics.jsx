import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Zap, Flame, Thermometer, Cpu, Radio } from 'lucide-react';
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
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <AlertTriangle className={`w-5 h-5 ${(diagData?.active_dtc_count || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Vehicle Diagnostics & Fault Injection Rack</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live OBD-II / J1939 Diagnostic Trouble Codes (DTCs), severity levels, and interactive simulation overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-850 border border-slate-300 dark:border-dark-700">
            Active DTCs: <span className="text-rose-600 dark:text-rose-400 font-bold">{diagData?.active_dtc_count || 0}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-850 border border-slate-300 dark:border-dark-700">
            Critical: <span className="text-rose-600 dark:text-rose-400 font-bold">{diagData?.critical_fault_count || 0}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-850 border border-slate-300 dark:border-dark-700">
            Warnings: <span className="text-amber-600 dark:text-amber-400 font-bold">{diagData?.warning_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Active DTC Alert Table */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Active Diagnostic Trouble Codes (DTCs)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">SAE J2012 / J1939 Compliant</span>
        </div>

        {(diagData?.active_dtcs?.length || 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-dark-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">DTC Code</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Subsystem</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Remedial Action</th>
                  <th className="py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-dark-750">
                {diagData.active_dtcs.map((dtc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition">
                    <td className="py-2 px-3 font-bold text-rose-600 dark:text-rose-400">{dtc.dtc_code}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        dtc.severity === 'CRITICAL' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {dtc.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-blue-700 dark:text-blue-400 font-semibold">{dtc.subsystem}</td>
                    <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-sans">{dtc.description}</td>
                    <td className="py-2 px-3 text-slate-500 font-sans text-[11px]">{dtc.action}</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{dtc.timestamp_iso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-xs text-slate-500 bg-slate-50 dark:bg-dark-850 rounded flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No active Diagnostic Trouble Codes. Vehicle electronic subsystems nominal.</span>
          </div>
        )}
      </div>

      {/* Fault Injection Matrix */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              14-Scenario Hardware & Environmental Fault Injection Matrix
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Toggle specific sensor anomalies to evaluate VCU derating, battery isolation, and thermal response.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportedFaults.map((f) => {
            const isActive = !!activeFaults[f.name];
            const Icon = f.icon;
            return (
              <div
                key={f.name}
                className={`p-3 rounded-lg border transition flex items-start justify-between gap-3 ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-dark-850 border-slate-200 dark:border-dark-700'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className={`p-2 rounded mt-0.5 ${isActive ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600' : 'bg-slate-200 dark:bg-dark-800 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{f.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        f.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      }`}>
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans leading-tight">{f.desc}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">ECU: {f.ecu}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFault(f.name)}
                  disabled={loadingFault === f.name}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition flex-shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                      : 'bg-slate-200 dark:bg-dark-750 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-dark-700'
                  }`}
                >
                  {isActive ? 'TRIPPED' : 'INJECT'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
