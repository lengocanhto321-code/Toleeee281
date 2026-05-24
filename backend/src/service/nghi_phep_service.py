"""
Service cho Nghỉ phép - Pure business logic (không chứa SQLAlchemy)
"""

from datetime import date, timedelta
from typing import Dict, List, Optional

from src.constants import (
    LOAI_NGHI,
    TRANG_THAI_DON,
    FIXED_HOLIDAYS,
    LUNAR_HOLIDAYS,
    TET_NGUYEN_DAN_SO_NGAY,
    GIAY_TO_REQUIRED,
    SO_NGAY_LAM_VIEC_CHUAN_THANG,
)


class NghiPhepService:
    """Service xử lý nghiệp vụ nghỉ phép - không sử dụng SQLAlchemy."""

    _holidays_lib_available: Optional[bool] = None
    _lunardate_available: Optional[bool] = None

    @classmethod
    def _check_lunardate(cls) -> bool:
        """Kiểm tra và cache trạng thái lunardate."""
        if cls._lunardate_available is None:
            try:
                from lunardate import LunarDate

                LunarDate(2025, 1, 1)
                cls._lunardate_available = True
            except ImportError:
                cls._lunardate_available = False
        return cls._lunardate_available

    @classmethod
    def _check_holidays_lib(cls) -> bool:
        """Kiểm tra và cache trạng thái holidays library."""
        if cls._holidays_lib_available is None:
            try:
                import holidays

                holidays.Vietnam(years=2025)
                cls._holidays_lib_available = True
            except ImportError:
                cls._holidays_lib_available = False
        return cls._holidays_lib_available

    def _lunar_to_solar(
        self, lunar_year: int, lunar_month: int, lunar_day: int
    ) -> Optional[date]:
        """Chuyển đổi ngày âm lịch sang dương lịch."""
        if not self._check_lunardate():
            return None
        try:
            from lunardate import LunarDate

            lunar = LunarDate(lunar_year, lunar_month, lunar_day)
            solar = lunar.toSolarDate()
            return date(solar.year, solar.month, solar.day)
        except Exception:
            return None

    def _get_tet_solar(self, year: int) -> Optional[date]:
        """Lấy ngày mùng 1 Tết (đầu năm âm lịch) sang dương lịch."""
        return self._lunar_to_solar(year, *LUNAR_HOLIDAYS["tet"])

    def _get_30_tet_solar(self, year: int) -> Optional[date]:
        """
        Lấy ngày 30 Tết (ngày cuối năm âm lịch liền trước Tết).
        Vì tháng cuối năm có thể có 29 hoặc 30 ngày, cần thử cả hai.
        """
        if not self._check_lunardate():
            return None
        try:
            from lunardate import LunarDate

            for day in [30, 29]:
                try:
                    lunar = LunarDate(year - 1, 12, day)
                    solar = lunar.toSolarDate()
                    return date(solar.year, solar.month, solar.day)
                except Exception:
                    pass
        except Exception:
            pass
        return None

    def _get_tet_holidays_lunar(self, year: int) -> List[date]:
        """
        Tính ngày nghỉ Tết Nguyên Đán theo luật Lao động Việt Nam.
        Nghỉ Tết âm lịch theo cấu hình TET_NGUYEN_DAN_SO_NGAY.
        """
        holidays = []
        start = self._get_30_tet_solar(year)
        if start is None:
            tet = self._get_tet_solar(year)
            if tet:
                start = tet - timedelta(days=1)
            else:
                start = date(year, 1, 27)

        for i in range(TET_NGUYEN_DAN_SO_NGAY):
            holidays.append(start + timedelta(days=i))

        return holidays

    def _get_hung_kings_day_lunar(self, year: int) -> Optional[date]:
        """Giỗ Tổ Hùng Vương - 10/3 âm lịch."""
        return self._lunar_to_solar(year, *LUNAR_HOLIDAYS["giotot"])

    def get_holidays(self, year: int) -> List[date]:
        """
        Lấy danh sách ngày lễ của Việt Nam cho một năm.

        Theo Bộ Luật Lao động 2019:
        - Tết Dương lịch: 1 ngày (1/1)
        - Tết Nguyên Đán: 7 ngày (30 Tết - mùng 6 Tết)
        - Giỗ Tổ Hùng Vương: 1 ngày (10/3 âm lịch)
        - Giải phóng miền Nam: 1 ngày (30/4)
        - Quốc tế Lao động: 1 ngày (1/5)
        - Quốc khánh: 2 ngày (1/9, 2/9)
        """
        holidays_set: set = set()

        if self._check_holidays_lib():
            import holidays

            vn_holidays = holidays.Vietnam(years=year)
            holidays_set.update(d for d in vn_holidays.keys())

            tet_lunar = self._get_tet_holidays_lunar(year)
            holidays_set.update(tet_lunar)

            hung_kings = self._get_hung_kings_day_lunar(year)
            if hung_kings:
                holidays_set.add(hung_kings)
        else:
            for month, day, _ in FIXED_HOLIDAYS:
                holidays_set.add(date(year, month, day))

            tet_holidays = self._get_tet_holidays_lunar(year)
            holidays_set.update(tet_holidays)

            hung_kings = self._get_hung_kings_day_lunar(year)
            if hung_kings:
                holidays_set.add(hung_kings)

        return sorted(list(holidays_set))

    def tinh_so_ngay_nghi(
        self, tu_ngay: date, den_ngay: date, nam: Optional[int] = None
    ) -> float:
        """Tính số ngày nghỉ thực tế (trừ ngày lễ Tết)."""
        if nam is None:
            nam = tu_ngay.year

        ngay_le_tet = set(self.get_holidays(nam))
        so_ngay = 0
        current = tu_ngay
        while current <= den_ngay:
            if current not in ngay_le_tet:
                so_ngay += 1
            current += timedelta(days=1)
        return float(so_ngay)

    def kiem_tra_ho_so(self, loai_nghi: str, files: Optional[List[str]]) -> Dict:
        """Kiểm tra hồ sơ cần thiết cho từng loại nghỉ."""
        loai = LOAI_NGHI.get(loai_nghi)
        if not loai:
            return {"valid": False, "thieu": "Loại nghỉ không hợp lệ"}

        if loai.get("can_giay") and not files:
            ten_giay = GIAY_TO_REQUIRED.get(loai_nghi, "Giấy tờ liên quan")
            return {"valid": False, "thieu": f"Cần upload: {ten_giay}"}

        return {"valid": True, "thieu": None}

    def kiem_tra_phep_con_lai(
        self, phep_nam_con_lai: float, so_ngay_xin: float
    ) -> Dict:
        """Kiểm tra số ngày phép còn lại."""
        if so_ngay_xin > phep_nam_con_lai:
            return {
                "duoc_phep": True,
                "canh_bao": f"Số ngày xin ({so_ngay_xin}) vượt quá số ngày còn lại ({phep_nam_con_lai})",
            }
        return {"duoc_phep": True, "canh_bao": None}

    def tinh_phep_con_lai_sau_khi_duyet(
        self, phep_nam_con_lai: float, so_ngay: float, loai_nghi: str
    ) -> float:
        """Tính số phép còn lại sau khi duyệt đơn."""
        if loai_nghi == "phep_nam":
            return max(0, phep_nam_con_lai - so_ngay)
        return phep_nam_con_lai

    def lay_ten_loai_nghi(self, loai_nghi: str) -> str:
        """Lấy tên hiển thị của loại nghỉ phép."""
        loai = LOAI_NGHI.get(loai_nghi)
        return loai.get("ten", loai_nghi) if loai else loai_nghi

    def lay_ten_trang_thai(self, trang_thai: str) -> str:
        """Lấy tên hiển thị của trạng thái đơn."""
        return TRANG_THAI_DON.get(trang_thai, trang_thai)

    def get_so_ngay_lam_chuan(self) -> int:
        """Lấy số ngày làm việc chuẩn trong tháng."""
        return SO_NGAY_LAM_VIEC_CHUAN_THANG
