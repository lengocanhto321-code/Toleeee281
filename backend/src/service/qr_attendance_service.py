"""
QR Attendance Service - Pure business logic cho QR Attendance
"""

import json
import hmac
import hashlib
import base64
import os
import re
import secrets
from datetime import date, datetime, time
from libs.datetime import get_utc_now
from typing import Optional, Dict, Tuple

SECRET_KEY = os.environ.get("QR_SECRET_KEY", "hr-management-qr-secret-key-2026")


def generate_pin() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def parse_dms(dms_str: str) -> Optional[float]:
    """
    Parse DMS string to decimal degrees.
    Supports formats:
      - 21°00'24.1"N
      - 105°46'41.7"E
      - 21 00 24.1 N
      - -21.00669 (decimal)

    Returns decimal degrees or None if invalid.
    """
    if not dms_str:
        return None
    dms_str = dms_str.strip()

    try:
        return float(dms_str)
    except ValueError:
        pass

    pattern = r"""
        (?P<deg>[\d.]+)\s*[°]\s*
        (?P<min>[\d.]+)\s*['′]\s*
        (?P<sec>[\d.]+)\s*["″]?\s*
        (?P<dir>[NSEWnsew])
    """
    m = re.match(pattern, dms_str, re.VERBOSE)
    if not m:
        m = re.match(
            r"(?P<deg>[\d.]+)\s+(?P<min>[\d.]+)\s+(?P<sec>[\d.]+)\s*(?P<dir>[NSEWnsew])",
            dms_str,
        )
    if not m:
        return None

    deg = float(m.group("deg"))
    minutes = float(m.group("min"))
    sec = float(m.group("sec"))
    direction = m.group("dir").upper()

    decimal = deg + minutes / 60.0 + sec / 3600.0
    if direction in ("S", "W"):
        decimal = -decimal

    return decimal


def parse_coordinate_pair(coord_str: str) -> Optional[Tuple[float, float]]:
    """
    Parse a coordinate string containing both lat and lng in DMS or decimal.
    Examples:
      - '21°00'24.1"N 105°46'41.7"E'
      - '21.0285, 105.8542'

    Returns (lat, lng) or None.
    """
    if not coord_str:
        return None

    parts = re.split(r"[,\s]+", coord_str.strip(), maxsplit=1)
    if len(parts) == 2:
        lat = parse_dms(parts[0])
        lng = parse_dms(parts[1])
        if lat is not None and lng is not None:
            return (lat, lng)

    dms_pattern = r"([\d.]+[°]\s*[\d.]+['′]\s*[\d.]+[\"″]?\s*[NSEWnsew])"
    matches = re.findall(dms_pattern, coord_str)
    if len(matches) >= 2:
        lat = parse_dms(matches[0])
        lng = parse_dms(matches[1])
        if lat is not None and lng is not None:
            return (lat, lng)

    return None


class QRAttendanceService:
    """Service xử lý QR Attendance - không sử dụng SQLAlchemy."""

    @staticmethod
    def generate_qr_payload(
        ngay: date,
        phong_ban_id: Optional[str] = None,
        vi_tri: Optional[Dict] = None,
        loai: str = "all",
    ) -> str:
        """
        Generate QR payload với HMAC signature.

        Args:
            ngay: Ngày QR có hiệu lực
            phong_ban_id: ID phòng ban (optional)
            vi_tri: Dict với {lat, lng, name, radius}
            loai: check_in, check_out, all

        Returns:
            Base64 encoded QR payload
        """
        payload = {
            "v": 1,
            "ngay": ngay.isoformat(),
            "pb_id": phong_ban_id,
            "loai": loai,
        }

        if vi_tri:
            payload["loc"] = vi_tri

        data_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            SECRET_KEY.encode(), data_str.encode(), hashlib.sha256
        ).hexdigest()

        payload["sig"] = signature

        return base64.b64encode(json.dumps(payload).encode()).decode()

    @staticmethod
    def validate_qr(qr_data: str) -> Tuple[bool, Dict, str]:
        """
        Validate QR data và signature.

        Args:
            qr_data: Base64 encoded QR payload

        Returns:
            (is_valid, payload, error_message)
        """
        try:
            decoded = base64.b64decode(qr_data).decode()
            payload = json.loads(decoded)

            if payload.get("v") != 1:
                return False, {}, "QR version not supported"

            sig = payload.pop("sig", None)
            if not sig:
                return False, {}, "Missing signature"

            data_str = json.dumps(payload, sort_keys=True)
            expected = hmac.new(
                SECRET_KEY.encode(), data_str.encode(), hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(sig, expected):
                return False, {}, "Invalid signature"

            payload["sig"] = sig
            return True, payload, ""

        except Exception as e:
            return False, {}, f"Invalid QR data: {str(e)}"

    @staticmethod
    def validate_check_in_time(
        thoi_gian: datetime,
        gio_bat_dau: time,
        gio_ket_thuc: time,
    ) -> Tuple[bool, str]:
        """
        Validate thời gian check-in.

        Args:
            thoi_gian: Thời gian check-in
            gio_bat_dau: Giờ bắt đầu cho phép
            gio_ket_thuc: Giờ kết thúc cho phép

        Returns:
            (is_valid, error_message)
        """
        check_time = thoi_gian.time()

        if check_time < gio_bat_dau:
            return False, f"Chưa đến giờ check-in (trước {gio_bat_dau.strftime('%H:%M')})"

        if check_time < time(5, 0):
            return False, "Chưa đến giờ check-in"

        if check_time > time(23, 0):
            return False, "Đã quá giờ check-in"

        if check_time > gio_ket_thuc:
            return False, f"Đã quá giờ check-in (sau {gio_ket_thuc.strftime('%H:%M')})"

        return True, ""

    @staticmethod
    def is_late(thoi_gian: datetime, standard_time: time = time(7, 30)) -> bool:
        """Phát hiện đi muộn."""
        return thoi_gian.time() > standard_time

    @staticmethod
    def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Tính khoảng cách Haversine giữa 2 điểm (mét).

        Args:
            lat1, lng1: Tọa độ điểm 1
            lat2, lng2: Tọa độ điểm 2

        Returns:
            Khoảng cách tính bằng mét
        """
        from math import radians, sin, cos, sqrt, atan2

        R = 6371000

        lat1_rad = radians(lat1)
        lat2_rad = radians(lat2)
        delta_lat = radians(lat2 - lat1)
        delta_lng = radians(lng2 - lng1)

        a = (
            sin(delta_lat / 2) ** 2
            + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng / 2) ** 2
        )
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return R * c

    @staticmethod
    def validate_location(
        current_lat: float,
        current_lng: float,
        qr_location: Dict,
    ) -> Tuple[bool, float, str]:
        """
        Validate vị trí GPS.

        Args:
            current_lat, current_lng: Tọa độ hiện tại
            qr_location: Dict với {lat, lng, radius}

        Returns:
            (is_valid, distance_meters, error_message)
        """
        if not qr_location:
            return True, 0, ""

        qr_lat = qr_location.get("lat")
        qr_lng = qr_location.get("lng")
        radius = qr_location.get("radius", 100)

        if qr_lat is None or qr_lng is None:
            return True, 0, ""

        distance = QRAttendanceService.calculate_distance(
            current_lat, current_lng, qr_lat, qr_lng
        )

        if distance > radius:
            return False, distance, f"Cách vị trí {distance:.0f}m (tối đa {radius}m)"

        return True, distance, ""

    @staticmethod
    def generate_user_qr(user_id: str, ngay: date) -> str:
        """
        Generate QR cá nhân cho user (per-user QR).

        Args:
            user_id: ID của user từ JWT token
            ngay: Ngày hiện tại

        Returns:
            Base64 encoded QR payload với user_id
        """
        payload = {
            "v": 2,
            "uid": user_id,
            "ngay": ngay.isoformat(),
            "timestamp": int(get_utc_now().timestamp()),
        }

        data_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            SECRET_KEY.encode(), data_str.encode(), hashlib.sha256
        ).hexdigest()

        payload["sig"] = signature

        return base64.b64encode(json.dumps(payload).encode()).decode()

    @staticmethod
    def validate_user_qr(qr_data: str, current_date: date) -> Tuple[bool, Dict, str]:
        """
        Validate QR cá nhân.

        Args:
            qr_data: Base64 encoded QR payload
            current_date: Ngày hiện tại để validate

        Returns:
            (is_valid, payload, error_message)
        """
        try:
            decoded = base64.b64decode(qr_data).decode()
            payload = json.loads(decoded)

            if payload.get("v") != 2:
                return False, {}, "QR version not supported"

            # Validate ngày
            qr_ngay = payload.get("ngay")
            if qr_ngay != current_date.isoformat():
                return False, {}, "QR đã hết hạn (khác ngày)"

            sig = payload.pop("sig", None)
            if not sig:
                return False, {}, "Missing signature"

            data_str = json.dumps(payload, sort_keys=True)
            expected = hmac.new(
                SECRET_KEY.encode(), data_str.encode(), hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(sig, expected):
                return False, {}, "Invalid signature"

            payload["sig"] = sig
            return True, payload, ""

        except Exception as e:
            return False, {}, f"Invalid QR data: {str(e)}"
