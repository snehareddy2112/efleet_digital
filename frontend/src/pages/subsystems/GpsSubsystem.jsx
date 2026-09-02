import React from 'react';
import { MapPin } from 'lucide-react';

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
      <div className="glass-panel p-4 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-dark-600">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">GPS Navigation, Transit Waypoints & Elevation Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Route: {t.transit_route_name || 'NH-163 Telangana Corridor'} | Next Stop: {t.next_stop_name || 'STOP-SECUNDERABAD'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Coordinate Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Latitude / Longitude</span>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
            {(t.latitude || 17.3850).toFixed(4)}°, {(t.longitude || 78.4867).toFixed(4)}°
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">HDOP: {t.gps_hdop || 1.1}</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Altitude Elevation</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{(t.altitude_m || t.altitude || 542).toFixed(1)} m</span>
          <span className="text-[10px] text-slate-400 block mt-1">Road Grade: {(t.road_gradient_pct || 0.0).toFixed(1)}%</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Compass Heading</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(t.heading_deg || t.heading || 94.5).toFixed(1)}°</span>
          <span className="text-[10px] text-slate-400 block mt-1">Satellites: {t.gps_satellites || 14}</span>
        </div>

        <div className="glass-panel p-3.5 rounded-lg border">
          <span className="text-slate-500 block text-[11px]">Passengers on Board</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.passenger_count || 38} pax</span>
          <span className="text-[10px] text-slate-400 block mt-1">Next: {t.distance_to_next_stop_m ? (t.distance_to_next_stop_m / 1000).toFixed(1) : 4.2} km</span>
        </div>
      </div>

      {/* Corridor Waypoints Table */}
      <div className="glass-panel p-4 rounded-lg border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-700 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            NH-163 Transit Route Waypoints & Topography
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">142.0 km Corridor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-dark-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-dark-700 text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Waypoint / Station</th>
                <th className="py-2 px-3">Stop ID</th>
                <th className="py-2 px-3">Coordinates</th>
                <th className="py-2 px-3">Altitude</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-dark-750">
              {waypoints.map((wp, idx) => {
                const isCurrent = t.stop_id === wp.stop;
                return (
                  <tr key={idx} className={isCurrent ? "bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold" : "hover:bg-slate-50 dark:hover:bg-dark-800/50 text-slate-700 dark:text-slate-300"}>
                    <td className="py-2 px-3">{wp.name}</td>
                    <td className="py-2 px-3 text-blue-700 dark:text-blue-400">{wp.stop}</td>
                    <td className="py-2 px-3 text-slate-500">{wp.lat.toFixed(4)}°, {wp.lng.toFixed(4)}°</td>
                    <td className="py-2 px-3">{wp.alt} m</td>
                    <td className="py-2 px-3 text-right">
                      {isCurrent ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px]">
                          CURRENT POSITION
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">CORRIDOR POINT</span>
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
