"""
QR Attendance Service - Pure business logic cho Attendance (OTP 6 số)
"""

import secrets
from datetime import datetime, time
from typing import Tuple


def generate_pin() -> str:
    return f"{secrets.randbelow(1000000):06d}"


class QRAttendanceService:
    """Service xử lý Attendance - OTP 6 số, không QR, không GPS."""

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
