import React, { useState, useEffect } from 'react';
import { Cpu, Play, Pause, Trash2, Eye, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { fetchRecentCanFrames, fetchCanDictionary } from '../api';

export default function CanMonitor() {
  const [frames, setFrames] = useState([]);
  const [dictionary, setDictionary] = useState({});
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);

  useEffect(() => {
    fetchCanDictionary().then(dict => {
      if (dict) setDictionary(dict);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchRecentCanFrames('BUS-001', 50);
        if (res && res.frames) {
          setFrames(res.frames);
          setTotalFrames(res.total_frames_transmitted || res.frames.length);
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="glass-panel p-4 rounded-xl border border-dark-600 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Simulated Vehicle CAN Bus Network Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Observing raw 8-byte CAN frames moving across simulated CAN0 (250 kbps / 500 kbps arbitration bus).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-mono px-3 py-1.5 rounded bg-dark-900 border border-dark-700 text-slate-300">
            Total Transmitted: <span className="text-cyan-400 font-bold">{totalFrames}</span> frames
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              isPaused 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Frame Stream & Click-to-Decode Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frame Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-dark-600 overflow-hidden">
          <div className="p-3 bg-dark-800/80 border-b border-dark-700 flex justify-between items-center text-xs font-bold text-slate-300">
            <span>LIVE CAN TRAFFIC (FIFO 50 FRAMES)</span>
            <span className="text-[10px] text-cyan-400 font-mono">CLICK FRAME TO DECODE SIGNALS</span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-dark-900 text-slate-400 border-b border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">CAN ID</th>
                  <th className="py-2.5 px-3">Message Name</th>
                  <th className="py-2.5 px-3">Source ECU</th>
                  <th className="py-2.5 px-3">DLC</th>
                  <th className="py-2.5 px-3">Raw Data (Hex)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {frames.map((f, idx) => {
                  const isSelected = selectedFrame && selectedFrame.timestamp === f.timestamp && selectedFrame.can_id === f.can_id;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedFrame(f)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-200' : 'hover:bg-dark-800/60 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{f.timestamp_iso?.split(' ')[1] || '11:42:01.000'}</td>
                      <td className="py-2 px-3 font-bold text-cyan-400">{f.can_id}</td>
                      <td className="py-2 px-3 text-purple-300 font-semibold">{f.message_name}</td>
                      <td className="py-2 px-3 text-amber-300">{f.source_ecu}</td>
                      <td className="py-2 px-3 text-slate-400">{f.dlc}</td>
                      <td className="py-2 px-3 font-bold tracking-wider text-emerald-400 bg-dark-900/40">
                        {f.data_hex}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decode Inspector Drawer */}
        <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>CAN Frame Decoder</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">{selectedFrame ? selectedFrame.can_id : '0x100'}</span>
          </div>

          {selectedFrame ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Message Name:</span>
                  <span className="text-purple-300 font-bold">{selectedFrame.message_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Source ECU:</span>
                  <span className="text-amber-300 font-bold">{selectedFrame.source_ecu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payload Bytes:</span>
                  <span className="text-emerald-400 font-bold">{selectedFrame.data_hex}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Bit-Level Signal Breakdown</h4>
                {dictionary[selectedFrame.can_id] ? (
                  <div className="space-y-2">
                    {Object.entries(dictionary[selectedFrame.can_id].signals).map(([sigKey, sigDef]) => (
                      <div key={sigKey} className="p-2.5 rounded bg-dark-900/70 border border-dark-700/80 text-xs font-mono space-y-1">
                        <div className="flex justify-between font-bold text-cyan-300">
                          <span>{sigKey}</span>
                          <span className="text-slate-400">{sigDef.unit || '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>Byte: {sigDef.start_byte} (Len: {sigDef.length_bytes})</span>
                          <span>Type: {sigDef.type}</span>
                          <span>Scale: {sigDef.scale}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No dictionary entry found for this ID.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>Select any CAN frame in the live stream table to inspect its bit positions, scaling factors, and decoded physical engineering values.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
