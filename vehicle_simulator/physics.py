"""
Realistic Longitudinal Vehicle Dynamics & Physics Engine for 12m Electric Transit Bus
Calculates forces, motor coupling, wheel speeds, inertial accelerations, and kinematics.
"""

import math
from typing import Dict, Any, Tuple

class VehiclePhysics:
    def __init__(self,
                 curb_mass_kg: float = 13500.0,
                 frontal_area_m2: float = 7.2,
                 drag_coefficient: float = 0.65,
                 rolling_resistance_coeff: float = 0.010,
                 wheel_radius_m: float = 0.485,
                 final_drive_ratio: float = 5.2,
                 max_speed_kmh: float = 85.0):
        self.curb_mass_kg = curb_mass_kg
        self.frontal_area_m2 = frontal_area_m2
        self.drag_coefficient = drag_coefficient
        self.rolling_resistance_coeff = rolling_resistance_coeff
        self.wheel_radius_m = wheel_radius_m
        self.final_drive_ratio = final_drive_ratio
        self.max_speed_kmh = max_speed_kmh
        self.air_density = 1.18  # kg/m3 at 30°C
        self.gravity = 9.81      # m/s2

        # Dynamic state
        self.speed_ms = 0.0
        self.acceleration_ms2 = 0.0
        self.prev_acceleration_ms2 = 0.0
        self.jerk_ms3 = 0.0
        self.road_gradient_pct = 0.0
        self.passenger_count = 38
        self.passenger_mass_avg_kg = 68.0

    @property
    def total_mass_kg(self) -> float:
        return self.curb_mass_kg + (self.passenger_count * self.passenger_mass_avg_kg)

    @property
    def speed_kmh(self) -> float:
        return self.speed_ms * 3.6

    @property
    def motor_rpm(self) -> int:
        return self.speed_to_motor_rpm(self.speed_ms)

    def speed_to_motor_rpm(self, speed_ms: float) -> int:
        if speed_ms <= 0:
            return 0
        wheel_rot_rad_s = speed_ms / self.wheel_radius_m
        motor_rot_rad_s = wheel_rot_rad_s * self.final_drive_ratio
        rpm = int(motor_rot_rad_s * (60.0 / (2.0 * math.pi)))
        return min(rpm, 10000)

    def motor_torque_to_wheel_force(self, motor_torque_nm: float) -> float:
        """Converts motor shaft torque into tractive force at the tire contact patch"""
        return (motor_torque_nm * self.final_drive_ratio * 0.96) / self.wheel_radius_m

    def step(self,
             motor_torque_nm: float,
             brake_force_kn: float,
             road_gradient_pct: float,
             dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Advances the vehicle dynamics by dt_seconds based on motor torque, braking force, and road incline.
        """
        self.road_gradient_pct = road_gradient_pct
        mass = self.total_mass_kg
        effective_mass = mass * 1.06  # Includes rotational inertia factor

        slope_rad = math.atan(road_gradient_pct / 100.0)

        # 1. Aerodynamic drag: 0.5 * rho * Cd * A * v^2
        f_aero = 0.5 * self.air_density * self.drag_coefficient * self.frontal_area_m2 * (self.speed_ms ** 2)

        # 2. Rolling resistance: Crr * m * g * cos(theta)
        f_rr = self.rolling_resistance_coeff * mass * self.gravity * math.cos(slope_rad) if self.speed_ms > 0.05 else 0.0

        # 3. Gradient resistance: m * g * sin(theta)
        f_grade = mass * self.gravity * math.sin(slope_rad)

        # 4. Tractive propulsion force from motor
        f_traction = self.motor_torque_to_wheel_force(motor_torque_nm)

        # 5. Total braking resistance force
        f_brake = brake_force_kn * 1000.0

        # Net force
        if self.speed_ms <= 0.01 and f_traction <= (f_rr + f_grade):
            # Vehicle stopped and not enough torque to overcome static/slope resistance
            f_net = 0.0
            self.speed_ms = 0.0
            self.acceleration_ms2 = 0.0
        else:
            # Net force driving or opposing motion
            if f_traction > 0:
                f_net = f_traction - f_aero - f_rr - f_grade - f_brake
            else:
                # Negative motor torque (regen) acts as braking force
                f_net = f_traction - f_aero - f_rr - f_grade - f_brake

            self.prev_acceleration_ms2 = self.acceleration_ms2
            self.acceleration_ms2 = f_net / effective_mass
            self.jerk_ms3 = (self.acceleration_ms2 - self.prev_acceleration_ms2) / max(dt_seconds, 0.01)

            # Update velocity
            self.speed_ms += self.acceleration_ms2 * dt_seconds
            if self.speed_ms < 0:
                self.speed_ms = 0.0
                self.acceleration_ms2 = 0.0

            # Cap max velocity
            max_ms = self.max_speed_kmh / 3.6
            if self.speed_ms > max_ms:
                self.speed_ms = max_ms
                self.acceleration_ms2 = 0.0

        motor_rpm = self.speed_to_motor_rpm(self.speed_ms)

        # 4 individual wheel speeds with micro road variations
        v_kmh = self.speed_kmh
        wheel_fl = max(0.0, v_kmh + 0.02 * math.sin(motor_rpm * 0.1))
        wheel_fr = max(0.0, v_kmh + 0.03 * math.cos(motor_rpm * 0.1))
        wheel_rl = max(0.0, v_kmh - 0.01 * math.sin(motor_rpm * 0.1))
        wheel_rr = max(0.0, v_kmh + 0.01 * math.cos(motor_rpm * 0.1))

        # IMU Accelerometer 3-Axis
        accel_x = round(self.acceleration_ms2, 2)
        accel_y = round(0.05 * math.sin(self.speed_ms * 0.5), 2)
        accel_z = round(self.gravity * math.cos(slope_rad), 2)

        pitch_deg = round(math.degrees(slope_rad) + (0.5 * self.acceleration_ms2), 1)
        roll_deg = round(0.2 * math.sin(self.speed_ms * 0.3), 1)

        return {
            "speed_ms": self.speed_ms,
            "speed_kmh": round(self.speed_kmh, 2),
            "motor_rpm": motor_rpm,
            "acceleration_ms2": round(self.acceleration_ms2, 3),
            "jerk_ms3": round(self.jerk_ms3, 3),
            "f_traction_n": round(f_traction, 1),
            "f_aero_n": round(f_aero, 1),
            "f_rr_n": round(f_rr, 1),
            "f_grade_n": round(f_grade, 1),
            "total_mass_kg": self.total_mass_kg,
            "wheel_speed_fl": round(wheel_fl, 2),
            "wheel_speed_fr": round(wheel_fr, 2),
            "wheel_speed_rl": round(wheel_rl, 2),
            "wheel_speed_rr": round(wheel_rr, 2),
            "accel_x": accel_x,
            "accel_y": accel_y,
            "accel_z": accel_z,
            "pitch_deg": pitch_deg,
            "roll_deg": roll_deg
        }
