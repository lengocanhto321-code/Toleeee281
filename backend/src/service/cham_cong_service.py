"""
Service cho Chấm công - Pure business logic (không chứa SQLAlchemy)
"""

from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, List

from src.constants import (
    LOAI_NGHI_KEYS,
    SO_NGAY_LAM_VIEC_CHUAN_THANG,
)


class ChamCongService:
    """Service xử lý chấm công - không sử dụng SQLAlchemy."""

    LOAI_NGHI_VANG_CO_PHEP = [
        "phep_nam",
        "nghi_om",
        "viec_rieng",
        "ket_hon",
        "mai_tang",
        "thai_san",
    ]

    TRANG_THAI_COLORS = {
        "chua_chot": "bg-amber-100 text-amber-700",
        "da_xac_nhan": "bg-blue-100 text-blue-700",
        "da_duyet": "bg-emerald-100 text-emerald-700",
        "da_chot": "bg-purple-100 text-purple-700",
        "da_mock": "bg-slate-100 text-slate-500",
    }

    SO_NGAY_LAM_CHUAN = SO_NGAY_LAM_VIEC_CHUAN_THANG

    def tinh_he_so_ngay_cong(
        self,
        so_ngay_co_mat: float,
        so_ngay_vang_co_phep: float,
        so_ngay_cong_tac: float,
        so_ngay_nghi_le_tet: float,
        so_ngay_lam_chuan: float = SO_NGAY_LAM_VIEC_CHUAN_THANG,
        so_ngay_vang_khong_phep: float = 0,
    ) -> float:
        """
        Tính hệ số ngày công.

        Hệ số = (Ngày có mặt + Vắng có phép + Công tác + Lễ Tết) / Số ngày chuẩn

        Args:
            so_ngay_co_mat: Số ngày có mặt
            so_ngay_vang_co_phep: Số ngày vắng có phép
            so_ngay_cong_tac: Số ngày đi công tác
            so_ngay_nghi_le_tet: Số ngày nghỉ lễ Tết
            so_ngay_lam_chuan: Số ngày làm chuẩn (mặc định 26)

        Returns:
            Hệ số ngày công (0.0 - 1.0)
        """
        ngay_huong_loi = (
            so_ngay_co_mat
            + so_ngay_vang_co_phep
            + so_ngay_cong_tac
            + so_ngay_nghi_le_tet
            - so_ngay_vang_khong_phep
        )
        ngay_huong_loi = max(0, ngay_huong_loi)

        if so_ngay_lam_chuan <= 0:
            return 0.0

        he_so = min(1.0, ngay_huong_loi / so_ngay_lam_chuan)
        return round(he_so, 4)

    def tinh_cham_cong_tu_don_nghi(
        self,
        tu_ngay: date,
        den_ngay: date,
        loai_nghi: str,
        ngay_le_tet: List[date],
    ) -> Dict:
        """
        Tính số ngày nghỉ từ đơn nghỉ.

        Args:
            tu_ngay: Ngày bắt đầu nghỉ
            den_ngay: Ngày kết thúc nghỉ
            loai_nghi: Loại nghỉ phép
            ngay_le_tet: Danh sách ngày lễ Tết trong năm

        Returns:
            Dict với số ngày theo từng loại
        """
        ngay_le_tet_nghi = 0
        ngay_vang_co_phep = 0
        ngay_cong_tac = 0

        current = tu_ngay
        while current <= den_ngay:
            weekday = current.weekday()
            if weekday >= 5:
                current += timedelta(days=1)
                continue

            if current in ngay_le_tet:
                ngay_le_tet_nghi += 1
            elif loai_nghi == "cong_tac":
                ngay_cong_tac += 1
            elif loai_nghi in self.LOAI_NGHI_VANG_CO_PHEP:
                ngay_vang_co_phep += 1
            current += timedelta(days=1)

        return {
            "ngay_le_tet": ngay_le_tet_nghi,
            "vang_co_phep": ngay_vang_co_phep,
            "cong_tac": ngay_cong_tac,
        }

    def mock_tinh_cham_cong_thang(
        self,
        so_ngay_lam_viec_trong_thang: int,
        danh_sach_nghi: List[Dict],
        so_ngay_nghi_le_tet: float = 0,
    ) -> Dict:
        """
        Mock tính chấm công tháng dựa trên đơn nghỉ.

        Args:
            so_ngay_lam_viec_trong_thang: Số ngày làm việc trong tháng (sau khi trừ T7, CN)
            danh_sach_nghi: Danh sách đơn nghỉ đã duyệt
            so_ngay_nghi_le_tet: Số ngày nghỉ lễ Tết

        Returns:
            Dict chứa số ngày theo từng loại và hệ số
        """
        tong_vang_co_phep = 0.0
        tong_cong_tac = 0.0
        tong_vang_khong_phep = 0.0

        for nghi in danh_sach_nghi:
            loai_nghi = nghi.get("loai_nghi", "")
            so_ngay = float(nghi.get("so_ngay", 0))

            if loai_nghi == "cong_tac":
                tong_cong_tac += so_ngay
            elif loai_nghi in self.LOAI_NGHI_VANG_CO_PHEP:
                tong_vang_co_phep += so_ngay

        so_ngay_co_mat = (
            so_ngay_lam_viec_trong_thang
            - tong_vang_co_phep
            - tong_vang_khong_phep
            - so_ngay_nghi_le_tet
        )
        so_ngay_co_mat = max(0, so_ngay_co_mat)

        he_so = self.tinh_he_so_ngay_cong(
            so_ngay_co_mat=so_ngay_co_mat,
            so_ngay_vang_co_phep=tong_vang_co_phep,
            so_ngay_cong_tac=tong_cong_tac,
            so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
            so_ngay_lam_chuan=SO_NGAY_LAM_VIEC_CHUAN_THANG,
        )

        return {
            "so_ngay_lam_chuan": SO_NGAY_LAM_VIEC_CHUAN_THANG,
            "so_ngay_co_mat": so_ngay_co_mat,
            "so_ngay_vang_co_phep": tong_vang_co_phep,
            "so_ngay_vang_khong_phep": tong_vang_khong_phep,
            "so_ngay_nghi_le_tet": so_ngay_nghi_le_tet,
            "so_ngay_cong_tac": tong_cong_tac,
            "he_so_ngay_cong": he_so,
        }

    def tinh_so_ngay_lam_viec_thang(self, thang: int, nam: int) -> int:
        """
        Tính số ngày làm việc trong tháng (trừ T7, CN).

        Args:
            thang: Tháng (1-12)
            nam: Năm

        Returns:
            Số ngày làm việc trong tháng
        """
        from calendar import monthrange

        _, so_ngay_trong_thang = monthrange(nam, thang)
        ngay_dau = date(nam, thang, 1)
        ngay_cuoi = date(nam, thang, so_ngay_trong_thang)

        so_ngay_lam_viec = 0
        current = ngay_dau
        while current <= ngay_cuoi:
            if current.weekday() < 5:
                so_ngay_lam_viec += 1
            current += timedelta(days=1)

        return so_ngay_lam_viec

    def lay_mau_trang_thai(self, trang_thai: str) -> str:
        """Lấy màu trạng thái cho UI."""
        return self.TRANG_THAI_COLORS.get(trang_thai, "bg-slate-100 text-slate-700")
