"""
GPS Transit Route Engine
Simulates continuous geographic movement along Hyderabad-Warangal Transit Corridor TS-HYD-WGL-101.
Provides road elevation/gradient %, speed limits, bus stop dwell times, and passenger count variation.
"""

import math
from typing import Dict, Any, List

class RouteSimulator:
    # Waypoints along NH-163 Corridor (Hyderabad to Warangal)
    WAYPOINTS = [
        {"name": "MGBS Central Bus Station", "lat": 17.3780, "lng": 78.4810, "alt": 505.0, "speed_limit": 40.0, "is_stop": True, "stop_id": "STOP-MGBS"},
        {"name": "Secunderabad JBS", "lat": 17.4420, "lng": 78.5020, "alt": 542.0, "speed_limit": 50.0, "is_stop": True, "stop_id": "STOP-SECUNDERABAD"},
        {"name": "Uppal Ring Road", "lat": 17.4010, "lng": 78.5600, "alt": 515.0, "speed_limit": 60.0, "is_stop": False, "stop_id": "WP-UPPAL"},
        {"name": "Ghatkesar Highway", "lat": 17.4480, "lng": 78.6820, "alt": 490.0, "speed_limit": 80.0, "is_stop": False, "stop_id": "WP-GHATKESAR"},
        {"name": "Bhongir Fort Transit Hub", "lat": 17.5110, "lng": 78.8890, "alt": 460.0, "speed_limit": 50.0, "is_stop": True, "stop_id": "STOP-BHONGIR"},
        {"name": "Alair Highway Point", "lat": 17.6320, "lng": 79.0340, "alt": 420.0, "speed_limit": 80.0, "is_stop": False, "stop_id": "WP-ALAIR"},
        {"name": "Jangaon Bus Terminal", "lat": 17.7280, "lng": 79.1620, "alt": 380.0, "speed_limit": 45.0, "is_stop": True, "stop_id": "STOP-JANGAON"},
        {"name": "Ghanpur Station", "lat": 17.8540, "lng": 79.3890, "alt": 330.0, "speed_limit": 75.0, "is_stop": False, "stop_id": "WP-GHANPUR"},
        {"name": "Kazipet Central Plaza", "lat": 17.9780, "lng": 79.5240, "alt": 285.0, "speed_limit": 50.0, "is_stop": True, "stop_id": "STOP-KAZIPET"},
        {"name": "Warangal CBS Bus Station", "lat": 17.9980, "lng": 79.5960, "alt": 270.0, "speed_limit": 40.0, "is_stop": True, "stop_id": "STOP-WARANGAL"}
    ]

    def __init__(self, route_id: str = "TS-HYD-WGL-101"):
        self.route_id = route_id
        self.waypoint_index = 0
        self.progress_between_wps = 0.0 # 0.0 to 1.0
        self.current_lat = self.WAYPOINTS[0]["lat"]
        self.current_lng = self.WAYPOINTS[0]["lng"]
        self.current_alt = self.WAYPOINTS[0]["alt"]
        self.heading_deg = 45.0
        self.stop_dwell_remaining_s = 0
        self.passenger_count = 38
        self.is_at_stop = False

    def step(self, vehicle_speed_kmh: float, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Calculates next geographic coordinates based on actual distance traveled.
        """
        curr_wp = self.WAYPOINTS[self.waypoint_index]
        next_idx = (self.waypoint_index + 1) % len(self.WAYPOINTS)
        next_wp = self.WAYPOINTS[next_idx]

        # Calculate vector between waypoints
        d_lat = next_wp["lat"] - curr_wp["lat"]
        d_lng = next_wp["lng"] - curr_wp["lng"]
        segment_dist_km = math.sqrt((d_lat * 111.0)**2 + (d_lng * 111.0 * math.cos(math.radians(curr_wp["lat"])))**2)
        segment_dist_km = max(1.0, segment_dist_km)

        # Distance traveled in this tick
        dist_traveled_km = (vehicle_speed_kmh * dt_seconds) / 3600.0

        # Advance along segment
        if self.stop_dwell_remaining_s > 0:
            self.stop_dwell_remaining_s -= int(dt_seconds)
            self.is_at_stop = True
        else:
            self.is_at_stop = False
            self.progress_between_wps += (dist_traveled_km / segment_dist_km)
            if self.progress_between_wps >= 1.0:
                self.progress_between_wps = 0.0
                self.waypoint_index = next_idx
                curr_wp = self.WAYPOINTS[self.waypoint_index]
                if curr_wp.get("is_stop"):
                    self.is_at_stop = True
                    self.stop_dwell_remaining_s = 15 # 15s stop dwell
                    # Passenger ingress / egress
                    self.passenger_count = max(12, min(62, self.passenger_count + int((self.waypoint_index % 7) - 3) * 4))

        # Interpolate coordinates
        t = self.progress_between_wps
        self.current_lat = round(curr_wp["lat"] + t * d_lat, 6)
        self.current_lng = round(curr_wp["lng"] + t * d_lng, 6)
        self.current_alt = round(curr_wp["alt"] + t * (next_wp["alt"] - curr_wp["alt"]), 1)

        # Heading calculation
        y = math.sin(math.radians(d_lng)) * math.cos(math.radians(next_wp["lat"]))
        x = math.cos(math.radians(curr_wp["lat"])) * math.sin(math.radians(next_wp["lat"])) - \
            math.sin(math.radians(curr_wp["lat"])) * math.cos(math.radians(next_wp["lat"])) * math.cos(math.radians(d_lng))
        self.heading_deg = round((math.degrees(math.atan2(y, x)) + 360.0) % 360.0, 1)

        # Road gradient estimation from elevation change
        elev_delta_m = next_wp["alt"] - curr_wp["alt"]
        road_gradient_pct = round((elev_delta_m / (segment_dist_km * 1000.0)) * 100.0, 2)
        road_gradient_pct = max(-6.0, min(6.0, road_gradient_pct))

        return {
            "latitude": self.current_lat,
            "longitude": self.current_lng,
            "altitude": self.current_alt,
            "heading": self.heading_deg,
            "speed_limit_kmh": curr_wp["speed_limit"],
            "road_gradient_pct": road_gradient_pct,
            "route_id": self.route_id,
            "stop_id": curr_wp["stop_id"],
            "is_at_bus_stop": self.is_at_stop,
            "passenger_count": self.passenger_count,
            "passenger_capacity": 65,
            "vehicle_load_kg": round(self.passenger_count * 68.0, 1)
        }
