import React from 'react';
import { MapPin, Compass, Navigation, Users, ArrowUpRight, Activity } from 'lucide-react';

export default function GpsSubsystem({ telemetry }) {
  const t = telemetry || {};

  const waypoints = [
    { name: "MGBS Central Bus Station", lat: 17.3780, lng: 78.4810, alt: 505.0, stop: "STOP-MGBS" },
    { name: "Secunderabad JBS", lat: 17.4420, lng: 78.5020, alt: 542.0, stop: "STOP-SECUNDERABAD" },
    { name: "Uppal Ring Road", lat: 17.4010, lng: 78.5600, alt: 515.0, stop: "WP-UPPAL" },
    { name: "Ghatkesar Highway", lat: 17.4480, lng: 78.6820, alt: 490.0, stop: "WP-GHATKESAR" },
    { name: "Bhongir Fort Transit Hub", lat: 17.5110, lng: 78.8890, alt: 460.0, stop: "STOP-BHONGIR" },
    { name: "Alair Highway Point", lat: 17.6320, lng: 79.0340, alt: 420.0, stop: "WP-ALAIR" },
    { name: "Jangaon Bus Terminal", lat: 17.7280, lng: 79.1620, alt: 380.0, stop: "STOP-JANGAON" },
    { name: "Kazipet Central Plaza", lat: 17.9780, lng: 79.5240, alt: 285.0, stop: "STOP-KAZIPET" },
    { name: "Warangal CBS Bus Station", lat: 17.9980, lng: 79.5960, alt: 270.0, stop: "STOP-WARANGAL" }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-dark-800 border border-dark-600">
            <MapPin className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">GPS Navigation, Transit Waypoints & Elevation Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Route: {t.route_id || 'TS-HYD-WGL-101'} (NH-163 Corridor) | Active Waypoint: {t.stop_id || 'STOP-SECUNDERABAD'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Coordinate Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-purple-500/30">
          <span className="text-slate-400 block text-[11px]">Latitude / Longitude</span>
          <span className="text-sm font-bold text-purple-300">
            {(t.latitude || 17.3850).toFixed(4)}°, {(t.longitude || 78.4867).toFixed(4)}°
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Fix: {t.gps_fix || '3D_FIX'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-slate-400 block text-[11px]">Altitude Elevation</span>
          <span className="text-xl font-bold text-cyan-300">{(t.altitude || 542).toFixed(1)} m</span>
          <span className="text-[10px] text-slate-500 block mt-1">Road Grade: {(t.road_gradient_pct || 0.0).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-slate-400 block text-[11px]">Compass Heading</span>
          <span className="text-xl font-bold text-emerald-300">{(t.heading || 94.5).toFixed(1)}°</span>
          <span className="text-[10px] text-slate-500 block mt-1">Speed Limit: {t.speed_limit_kmh || 50} km/h</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-slate-400 block text-[11px]">Passengers on Board</span>
          <span className="text-xl font-bold text-amber-300">{t.passenger_count || 38} pax</span>
          <span className="text-[10px] text-slate-500 block mt-1">Payload: {(t.vehicle_load_kg || 2584).toFixed(0)} kg</span>
        </div>
      </div>

      {/* Corridor Waypoints Table */}
      <div className="glass-panel p-5 rounded-xl border border-dark-600 space-y-3">
        <div className="flex items-center justify-between border-b border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            NH-163 Transit Route Waypoints & Topography
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">145.0 km Inter-City Route</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-900 text-slate-400 border-b border-dark-700 text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Waypoint / Station</th>
                <th className="py-2 px-3">Stop ID</th>
                <th className="py-2 px-3">Coordinates</th>
                <th className="py-2 px-3">Altitude</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60">
              {waypoints.map((wp, idx) => {
                const isCurrent = t.stop_id === wp.stop;
                return (
                  <tr key={idx} className={isCurrent ? "bg-purple-500/20 text-purple-200 font-bold" : "hover:bg-dark-800/60 text-slate-300"}>
                    <td className="py-2 px-3">{wp.name}</td>
                    <td className="py-2 px-3 text-cyan-400">{wp.stop}</td>
                    <td className="py-2 px-3 text-slate-400">{wp.lat.toFixed(4)}°, {wp.lng.toFixed(4)}°</td>
                    <td className="py-2 px-3">{wp.alt} m</td>
                    <td className="py-2 px-3 text-right">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
                          CURRENT POSITION
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">ROUTE POINT</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
