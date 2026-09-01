import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Sliders, ShieldAlert } from 'lucide-react';
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
    <div className="glass-panel rounded-lg p-3 flex flex-wrap items-center justify-between gap-4 border border-dark-600">
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Simulation Engine</span>
        </span>

        {isPaused ? (
          <button
            onClick={() => handleAction('resume')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 text-xs font-medium transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction('pause')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 text-xs font-medium transition"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        <button
          onClick={() => handleAction('reset')}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-dark-700 text-slate-300 hover:text-white hover:bg-dark-600 text-xs transition"
          title="Reset Bus State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Speed Multipliers */}
      <div className="flex items-center space-x-1.5">
        <span className="text-xs text-slate-400 mr-1 flex items-center space-x-1">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          <span>Speed:</span>
        </span>
        {speedOptions.map((spd) => (
          <button
            key={spd}
            onClick={() => handleAction('set_speed', spd)}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition ${
              currentSpeed === spd
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-dark-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {spd}x
          </button>
        ))}
      </div>

      {/* Scenarios Dropdown */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400">Scenario:</span>
        <div className="flex flex-wrap gap-1">
          {scenarios.map((sc) => (
            <button
              key={sc}
              onClick={() => handleAction('set_scenario', sc)}
              className={`px-2.5 py-1 rounded text-xs transition font-medium ${
                currentScenario === sc
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-dark-800 text-slate-400 hover:text-slate-200'
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
