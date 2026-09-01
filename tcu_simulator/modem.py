"""
TCU Modem & GNSS Receiver Simulation
Models 4G/5G radio conditions (RSRP, RSRQ, SINR, Serving Cell, IMEI, ICCID) and GPS receiver statistics.
"""

import random
from typing import Dict, Any

class TCUModem:
    def __init__(self,
                 imei: str = "862901048291048",
                 iccid: str = "8991404000291048123F",
                 operator: str = "Airtel IoT 5G"):
        self.imei = imei
        self.iccid = iccid
        self.operator = operator
        self.network_type = "5G_NR_NSA" # 5G_NR_NSA, LTE_ADVANCED, 3G_FALLBACK, NO_SERVICE
        self.sim_status = "READY"
        self.is_cellular_connected = True

        # Radio metrics
        self.rsrp_dbm = -85.4
        self.rsrq_db = -9.8
        self.sinr_db = 18.2
        self.csq_signal = 28
        self.serving_cell_id = "404-45-78219"

        # GNSS receiver
        self.gps_fix_status = "3D_FIX"
        self.satellites_in_view = 16
        self.hdop = 0.8
        self.vdop = 1.0
        self.gps_accuracy_m = 1.1

    def step(self, lat: float, lng: float, current_speed_kmh: float) -> Dict[str, Any]:
        """
        Updates cellular signal fluctuations and GPS fix stats.
        """
        if not self.is_cellular_connected:
            self.network_type = "NO_SERVICE"
            self.rsrp_dbm = -140.0
            self.rsrq_db = -20.0
            self.sinr_db = -10.0
            self.csq_signal = 0
            return self.get_telemetry()

        # Micro fluctuations in cellular signal
        self.network_type = "5G_NR_NSA"
        self.rsrp_dbm = round(-84.0 + random.uniform(-3.5, 3.0), 1)
        self.rsrq_db = round(-9.5 + random.uniform(-1.0, 1.0), 1)
        self.sinr_db = round(18.0 + random.uniform(-2.0, 2.5), 1)
        self.csq_signal = max(10, min(31, int(28 + random.uniform(-2, 2))))

        # GPS accuracy slightly affected by speed/urban canyons
        self.gps_accuracy_m = round(1.0 + (current_speed_kmh * 0.008) + random.uniform(-0.1, 0.2), 2)
        self.hdop = round(0.8 + random.uniform(-0.05, 0.1), 2)

        return self.get_telemetry()

    def get_telemetry(self) -> Dict[str, Any]:
        return {
            "network_type": self.network_type,
            "network_operator": self.operator,
            "signal_strength": self.csq_signal,
            "rsrp": self.rsrp_dbm,
            "rsrq": self.rsrq_db,
            "sinr": self.sinr_db,
            "cell_id": self.serving_cell_id,
            "imei": self.imei,
            "iccid": self.iccid,
            "sim_status": self.sim_status,
            "gps_fix": self.gps_fix_status,
            "satellite_count": self.satellites_in_view,
            "hdop": self.hdop,
            "vdop": self.vdop,
            "gps_accuracy": self.gps_accuracy_m,
            "gps_signal": round(min(100.0, (self.csq_signal / 31.0) * 100.0), 1)
        }
