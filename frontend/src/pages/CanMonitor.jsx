import React, { useState, useEffect } from 'react';
import { Cpu, Play, Pause, Eye } from 'lucide-react';
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
      <div className="glass-panel p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Vehicle CAN Bus Network Monitor (CAN 2.0B / 500 kbps)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Observing raw 8-byte CAN binary frames transmitted across CAN0 with bit-level scaling and offset signal decoding.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600 text-slate-700 dark:text-slate-300">
            Total Transmitted: <span className="text-blue-700 dark:text-blue-400 font-bold">{totalFrames}</span> frames
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition border ${
              isPaused 
                ? 'bg-emerald-600 text-white border-emerald-700' 
                : 'bg-amber-600 text-white border-amber-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Frame Stream & Click-to-Decode Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Frame Table */}
        <div className="lg:col-span-2 glass-panel rounded-lg border overflow-hidden">
          <div className="p-3 bg-slate-100 dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>LIVE CAN TRAFFIC STREAM (50 FRAMES FIFO)</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">CLICK ROW TO DECODE</span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-100 dark:bg-dark-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">CAN ID</th>
                  <th className="py-2.5 px-3">Message Name</th>
                  <th className="py-2.5 px-3">Source ECU</th>
                  <th className="py-2.5 px-3">DLC</th>
                  <th className="py-2.5 px-3">Payload (Hex)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-dark-750">
                {frames.map((f, idx) => {
                  const isSelected = selectedFrame && selectedFrame.timestamp === f.timestamp && selectedFrame.can_id === f.can_id;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedFrame(f)}
                      className={`cursor-pointer transition ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200' 
                          : 'hover:bg-slate-50 dark:hover:bg-dark-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 text-[11px]">{f.timestamp_iso?.split(' ')[1] || '11:42:01.000'}</td>
                      <td className="py-2 px-3 font-bold text-blue-700 dark:text-blue-400">{f.can_id}</td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-semibold">{f.message_name}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{f.source_ecu}</td>
                      <td className="py-2 px-3 text-slate-500">{f.dlc}</td>
                      <td className="py-2 px-3 font-bold tracking-wider text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-dark-900/40">
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
        <div className="glass-panel p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>CAN Frame Decoder</span>
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{selectedFrame ? selectedFrame.can_id : '0x100'}</span>
          </div>

          {selectedFrame ? (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Message Name:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedFrame.message_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source ECU:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedFrame.source_ecu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payload Bytes:</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">{selectedFrame.data_hex}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Decoded Signals</h4>
                <div className="space-y-1.5">
                  {selectedFrame.signals && Object.entries(selectedFrame.signals).map(([sigKey, sigVal]) => (
                    <div key={sigKey} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{sigKey}:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {typeof sigVal === 'number' ? (Number.isInteger(sigVal) ? sigVal : sigVal.toFixed(2)) : String(sigVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Click any frame in the live CAN stream to decode its signals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
