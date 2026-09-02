import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Sliders } from 'lucide-react';
import { controlSimulator } from '../api';

export default function SimControls({ simStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const isPaused = simStatus?.is_paused || false;
  const currentSpeed = simStatus?.speed_multiplier || 1.0;
  const currentScenario = simStatus?.active_scenario || 'Normal Route';

  const handleAction = async (action, value = null) => {
    setLoading(true);
    try {
      const res = await controlSimulator(action, value);
      if (onStatusChange) onStatusChange(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const speedOptions = [0.5, 1.0, 2.0, 5.0, 10.0];
  const scenarios = [
    'Normal Route',
    'Heavy Acceleration',
    'Heavy Braking',
    'Charging',
    'HVAC Heavy Load'
  ];

  return (
    <div className="glass-panel rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition">
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
          <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>SIMULATION CLOCK</span>
        </span>

        {isPaused ? (
          <button
            onClick={() => handleAction('resume')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction('pause')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-sm"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        <button
          onClick={() => handleAction('reset')}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700 border border-slate-300 dark:border-dark-600 transition"
          title="Reset Bus State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Speed Multipliers */}
      <div className="flex items-center space-x-1.5">
        <span className="text-slate-500 dark:text-slate-400 mr-1 flex items-center space-x-1">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          <span>Rate:</span>
        </span>
        <div className="flex bg-slate-100 dark:bg-dark-800 p-0.5 rounded border border-slate-300 dark:border-dark-600">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => handleAction('set_speed', spd)}
              className={`px-2 py-0.5 rounded text-xs transition font-semibold ${
                currentSpeed === spd
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-slate-500 dark:text-slate-400">Scenario:</span>
        <div className="flex flex-wrap gap-1">
          {scenarios.map((sc) => (
            <button
              key={sc}
              onClick={() => handleAction('set_scenario', sc)}
              className={`px-2.5 py-1 rounded transition font-medium border ${
                currentScenario === sc
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold'
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-700'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
