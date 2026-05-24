"""
Service tính lương - Pure business logic (không chứa SQLAlchemy)
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Dict, List, Any


class TinhLuongService:
    """Service tính lương với logic đầy đủ - không sử dụng SQLAlchemy."""

    NGAY_AP_DUNG_HE_SO_DAC_THU = date(2026, 1, 1)

    def xac_dinh_cong_thuc_ap_dung(self, ngay_tinh: date) -> str:
        """Xác định công thức áp dụng: 'cu' (trước 01/01/2026) hoặc 'moi' (từ 01/01/2026)."""
        if ngay_tinh >= self.NGAY_AP_DUNG_HE_SO_DAC_THU:
            return "moi"
        return "cu"

    def tinh_he_so_ngay_cong(
        self,
        so_ngay_lam_chuan: int,
        so_ngay_lam_thuc_te: int,
        so_ngay_nghi_phep: int,
        so_ngay_nghi_om: int,
        so_ngay_cong_tac: int,
        so_ngay_le_tet: int,
        so_ngay_nghi_khong_phep: int = 0,
    ) -> float:
        """
        Tính hệ số ngày công.

        Công thức:
        - Tổng ngày được tính = Ngày làm + Nghỉ phép + Nghỉ ốm + Công tác + Lễ tết - Nghỉ không phép
        - Hệ số = min(1.0, Tổng / Số ngày chuẩn)
        """
        ngay_duoc_tinh = (
            so_ngay_lam_thuc_te
            + so_ngay_nghi_phep
            + so_ngay_nghi_om
            + so_ngay_cong_tac
            + so_ngay_le_tet
            - so_ngay_nghi_khong_phep
        )
        ngay_duoc_tinh = max(0, ngay_duoc_tinh)

        he_so = (
            min(1.0, ngay_duoc_tinh / so_ngay_lam_chuan)
            if so_ngay_lam_chuan > 0
            else 0.0
        )
        return round(he_so, 4)

    def tinh_luong_co_ban(
        self,
        he_so_luong: float,
        luong_co_so: int,
        he_so_ngay_cong: float,
        loai_cong_thuc: str,
        he_so_dac_thu: float = 1.0,
    ) -> int:
        """
        Tính lương cơ bản.

        Công thức cũ: Hệ số lương × Lương cơ sở × Hệ số ngày công
        Công thức mới (từ 01/01/2026): Hệ số lương × Lương cơ sở × Hệ số đặc thù × Hệ số ngày công
        """
        if loai_cong_thuc == "moi":
            he_so_dac_thu_ap_dung = he_so_dac_thu
        else:
            he_so_dac_thu_ap_dung = 1.0

        luong_co_ban = (
            float(he_so_luong)
            * int(luong_co_so)
            * float(he_so_dac_thu_ap_dung)
            * float(he_so_ngay_cong)
        )
        return int(round(luong_co_ban))

    def tinh_phu_cap_chuc_vu(
        self,
        phu_cap_chuc_vu: int,
        he_so_ngay_cong: float,
    ) -> int:
        """Tính phụ cấp chức vụ."""
        return int(round(int(phu_cap_chuc_vu) * float(he_so_ngay_cong)))

    def tinh_phu_cap_tham_nien(
        self,
        he_so_luong: float,
        phu_cap_chuc_vu: int,
        phu_cap_tham_nien_vuot_khung: int,
        luong_co_so: int,
        so_nam_tham_nien: int,
        he_so_ngay_cong: float,
    ) -> int:
        """
        Tính phụ cấp thâm niên.

        Công thức: [5% + (năm - 1) × 1%] × (Hệ số lương + PC chức vụ + PC thâm niên vượt khung) × Lương cơ sở × Hệ số ngày công

        Điều kiện: Đủ 5 năm (60 tháng) giảng dạy có đóng BHXH
        """
        if so_nam_tham_nien < 5:
            return 0

        ty_le = 5.0 + (so_nam_tham_nien - 1) * 1.0
        ty_le = min(ty_le, 15.0)

        co_so_tinh = (
            he_so_luong
            + phu_cap_chuc_vu / luong_co_so
            + phu_cap_tham_nien_vuot_khung / luong_co_so
        )

        phu_cap = (
            float(co_so_tinh)
            * int(luong_co_so)
            * (float(ty_le) / 100)
            * float(he_so_ngay_cong)
        )
        return int(round(phu_cap))

    def tinh_phu_cap_uu_dai(
        self,
        he_so_luong: float,
        phu_cap_chuc_vu: int,
        phu_cap_tham_nien_vuot_khung: int,
        luong_co_so: int,
        ty_le_pc_uu_dai: float,
        he_so_ngay_cong: float,
    ) -> int:
        """
        Tính phụ cấp ưu đãi nghề.

        Công thức: (Hệ số lương + PC chức vụ + PC thâm niên vượt khung) × Lương cơ sở × Tỷ lệ % × Hệ số ngày công
        """
        co_so_tinh = (
            he_so_luong
            + phu_cap_chuc_vu / luong_co_so
            + phu_cap_tham_nien_vuot_khung / luong_co_so
        )

        phu_cap = (
            float(co_so_tinh)
            * int(luong_co_so)
            * (float(ty_le_pc_uu_dai) / 100)
            * float(he_so_ngay_cong)
        )
        return int(round(phu_cap))

    def tinh_phu_cap_khu_vuc(
        self,
        he_so_khu_vuc: float,
        luong_co_so: int,
        he_so_ngay_cong: float,
    ) -> int:
        """Tính phụ cấp khu vực."""
        phu_cap = float(he_so_khu_vuc) * int(luong_co_so) * float(he_so_ngay_cong)
        return int(round(phu_cap))

    def tinh_bao_hiem(
        self,
        he_so_luong: float,
        luong_co_so: int,
        ty_le_bhxh: float,
        ty_le_bhyt: float,
        ty_le_bhtn: float,
    ) -> Dict[str, int]:
        """
        Tính bảo hiểm.

        Lưu ý: Căn cứ đóng BH = Lương cơ bản (không nhân hệ số ngày công)
        """
        luong_co_ban = float(he_so_luong) * int(luong_co_so)

        return {
            "bhxh": int(round(luong_co_ban * ty_le_bhxh / 100)),
            "bhyt": int(round(luong_co_ban * ty_le_bhyt / 100)),
            "bhtn": int(round(luong_co_ban * ty_le_bhtn / 100)),
        }

    def tinh_thue_tncn(
        self,
        tong_thu_nhap: int,
        tong_bao_hiem: int,
        muc_giam_tru_ban_than: int,
        muc_giam_tru_nguoi_phu_thuoc: int,
        so_nguoi_phu_thuoc: int,
    ) -> int:
        """
        Tính thuế TNCN theo biểu thuế lũy tiến.

        Thu nhập tính thuế = Tổng thu nhập – Tổng bảo hiểm – Giảm trừ bản thân – (Giảm trừ người phụ thuộc × số người)
        """
        thu_nhap_tinh_thue = (
            tong_thu_nhap
            - tong_bao_hiem
            - muc_giam_tru_ban_than
            - muc_giam_tru_nguoi_phu_thuoc * so_nguoi_phu_thuoc
        )

        if thu_nhap_tinh_thue <= 0:
            return 0

        bang_thue = [
            (5000000, 0.05, 0),
            (10000000, 0.10, 250000),
            (18000000, 0.15, 750000),
            (32000000, 0.20, 1650000),
            (52000000, 0.25, 3250000),
            (80000000, 0.30, 5850000),
            (float("inf"), 0.35, 8950000),
        ]

        thue = 0
        thu_nhap_con_lai = thu_nhap_tinh_thue
        bac_truoc = 0

        for muc_toi_da, ty_le, thue_tich_luy in bang_thue:
            if thu_nhap_con_lai <= 0:
                break
            if bac_truoc >= thu_nhap_tinh_thue:
                break

            thu_nhap_bac = min(thu_nhap_con_lai, muc_toi_da - bac_truoc)
            thu_nhap_bac = max(0, thu_nhap_bac)

            thue += thu_nhap_bac * ty_le
            thu_nhap_con_lai -= thu_nhap_bac
            bac_truoc = muc_toi_da

        return int(round(thue))

    def tinh_luong_thuc_nhan(
        self,
        tong_thu_nhap: int,
        bhxh: int,
        bhyt: int,
        bhtn: int,
        thue_tncn: int,
        khau_tru_khac: int,
    ) -> int:
        """Tính lương thực nhận."""
        tong_khau_tru = bhxh + bhyt + bhtn + thue_tncn + khau_tru_khac
        return tong_thu_nhap - tong_khau_tru

    def tinh_luong_nhan_vien(
        self,
        thong_tin_nhan_vien: Dict[str, Any],
        thong_tin_luong: Dict[str, Any],
        thong_tin_cham_cong: Optional[Dict[str, Any]],
        thong_tin_cau_hinh: Dict[str, Any],
        thong_tin_tam_dinh_chi: Optional[Dict[str, Any]] = None,
        thong_tin_ky_luat: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Tính lương đầy đủ cho một nhân viên.

        Args:
            thong_tin_nhan_vien: Dict chứa thông tin nhân viên
            thong_tin_luong: Dict chứa thông tin lương
            thong_tin_cham_cong: Dict chứa thông tin chấm công (có thể None)
            thong_tin_cau_hinh: Dict chứa cấu hình hệ thống lương
            thong_tin_tam_dinh_chi: Dict thông tin tạm đình chỉ (có thể None)
            thong_tin_ky_luat: Dict thông tin kỷ luật (có thể None)
        """
        ngay_tinh = thong_tin_cau_hinh.get("ngay_tinh", date.today())
        loai_cong_thuc = self.xac_dinh_cong_thuc_ap_dung(ngay_tinh)

        if thong_tin_cham_cong:
            he_so_ngay_cong = self.tinh_he_so_ngay_cong(
                so_ngay_lam_chuan=thong_tin_cham_cong.get("so_ngay_lam_chuan", 22),
                so_ngay_lam_thuc_te=thong_tin_cham_cong.get("so_ngay_lam_thuc_te", 0),
                so_ngay_nghi_phep=thong_tin_cham_cong.get("so_ngay_nghi_phep", 0),
                so_ngay_nghi_om=thong_tin_cham_cong.get("so_ngay_nghi_om", 0),
                so_ngay_cong_tac=thong_tin_cham_cong.get("so_ngay_cong_tac", 0),
                so_ngay_le_tet=thong_tin_cham_cong.get("so_ngay_le_tet", 0),
                so_ngay_nghi_khong_phep=thong_tin_cham_cong.get(
                    "so_ngay_nghi_khong_phep", 0
                ),
            )
            so_ngay_cong_chuan = thong_tin_cham_cong.get("so_ngay_lam_chuan", 0)
            so_ngay_cong_thuc_te = thong_tin_cham_cong.get("so_ngay_lam_thuc_te", 0)
        else:
            he_so_ngay_cong = 0.0
            so_ngay_cong_chuan = 0
            so_ngay_cong_thuc_te = 0

        he_so_dac_thu = float(thong_tin_cau_hinh.get("he_so_dac_thu", 1.0))
        luong_co_so = int(thong_tin_cau_hinh.get("luong_co_so", 1800000))

        luong_co_ban = self.tinh_luong_co_ban(
            he_so_luong=float(thong_tin_luong.get("he_so_luong", 1.0)),
            luong_co_so=luong_co_so,
            he_so_ngay_cong=he_so_ngay_cong,
            loai_cong_thuc=loai_cong_thuc,
            he_so_dac_thu=he_so_dac_thu,
        )

        pc_chuc_vu = self.tinh_phu_cap_chuc_vu(
            phu_cap_chuc_vu=int(thong_tin_luong.get("phu_cap_chuc_vu", 0)),
            he_so_ngay_cong=he_so_ngay_cong,
        )

        pc_tham_nien = self.tinh_phu_cap_tham_nien(
            he_so_luong=float(thong_tin_luong.get("he_so_luong", 1.0)),
            phu_cap_chuc_vu=int(thong_tin_luong.get("phu_cap_chuc_vu", 0)),
            phu_cap_tham_nien_vuot_khung=int(
                thong_tin_luong.get("phu_cap_tham_nien_vuot_khung", 0)
            ),
            luong_co_so=luong_co_so,
            so_nam_tham_nien=int(thong_tin_luong.get("so_nam_tham_nien", 0)),
            he_so_ngay_cong=he_so_ngay_cong,
        )

        pc_uu_dai = self.tinh_phu_cap_uu_dai(
            he_so_luong=float(thong_tin_luong.get("he_so_luong", 1.0)),
            phu_cap_chuc_vu=int(thong_tin_luong.get("phu_cap_chuc_vu", 0)),
            phu_cap_tham_nien_vuot_khung=int(
                thong_tin_luong.get("phu_cap_tham_nien_vuot_khung", 0)
            ),
            luong_co_so=luong_co_so,
            ty_le_pc_uu_dai=float(thong_tin_luong.get("ty_le_pc_uu_dai", 30.0)),
            he_so_ngay_cong=he_so_ngay_cong,
        )

        pc_khu_vuc = self.tinh_phu_cap_khu_vuc(
            he_so_khu_vuc=float(thong_tin_luong.get("he_so_khu_vuc", 0)),
            luong_co_so=luong_co_so,
            he_so_ngay_cong=he_so_ngay_cong,
        )

        pc_tham_nien_vk = int(
            float(thong_tin_luong.get("phu_cap_tham_nien_vuot_khung", 0))
            * float(he_so_ngay_cong)
        )
        pc_khac = int(
            float(thong_tin_luong.get("phu_cap_khac", 0)) * float(he_so_ngay_cong)
        )

        tong_phu_cap = (
            pc_chuc_vu
            + pc_tham_nien
            + pc_uu_dai
            + pc_khu_vuc
            + pc_tham_nien_vk
            + pc_khac
        )
        tong_thu_nhap = luong_co_ban + tong_phu_cap

        bao_hiem = self.tinh_bao_hiem(
            he_so_luong=float(thong_tin_luong.get("he_so_luong", 1.0)),
            luong_co_so=luong_co_so,
            ty_le_bhxh=float(thong_tin_cau_hinh.get("ty_le_bhxh", 8.0)),
            ty_le_bhyt=float(thong_tin_cau_hinh.get("ty_le_bhyt", 1.5)),
            ty_le_bhtn=float(thong_tin_cau_hinh.get("ty_le_bhtn", 1.0)),
        )

        thue_tncn = self.tinh_thue_tncn(
            tong_thu_nhap=tong_thu_nhap,
            tong_bao_hiem=bao_hiem["bhxh"] + bao_hiem["bhyt"] + bao_hiem["bhtn"],
            muc_giam_tru_ban_than=int(
                thong_tin_cau_hinh.get("muc_giam_tru_ban_than", 11000000)
            ),
            muc_giam_tru_nguoi_phu_thuoc=int(
                thong_tin_cau_hinh.get("muc_giam_tru_nguoi_phu_thuoc", 4400000)
            ),
            so_nguoi_phu_thuoc=int(thong_tin_nhan_vien.get("so_nguoi_phu_thuoc", 0)),
        )

        khau_tru_khac = int(thong_tin_luong.get("khau_tru_khac", 0))

        luong_thuc_nhan = self.tinh_luong_thuc_nhan(
            tong_thu_nhap=tong_thu_nhap,
            bhxh=bao_hiem["bhxh"],
            bhyt=bao_hiem["bhyt"],
            bhtn=bao_hiem["bhtn"],
            thue_tncn=thue_tncn,
            khau_tru_khac=khau_tru_khac,
        )

        if thong_tin_tam_dinh_chi and thong_tin_tam_dinh_chi.get("co_tam_dinh_chi"):
            ty_le_tam_ung = thong_tin_tam_dinh_chi.get("ty_le_huong_luong", 50) / 100
            luong_thuc_nhan = int(luong_thuc_nhan * ty_le_tam_ung)

        return {
            "nhan_vien_id": thong_tin_nhan_vien.get("id"),
            "thang": thong_tin_nhan_vien.get("thang"),
            "nam": thong_tin_nhan_vien.get("nam"),
            "ngay_vao": thong_tin_nhan_vien.get("ngay_vao"),
            "ngay_nghi": thong_tin_nhan_vien.get("ngay_nghi"),
            "loai_cong_thuc": loai_cong_thuc,
            "he_so_dac_thu_ap_dung": he_so_dac_thu if loai_cong_thuc == "moi" else 1.0,
            "so_ngay_cong_chuan": so_ngay_cong_chuan,
            "so_ngay_cong_thuc_te": so_ngay_cong_thuc_te,
            "he_so_ngay_cong": he_so_ngay_cong,
            "luong_co_ban": luong_co_ban,
            "phu_cap_chuc_vu": pc_chuc_vu,
            "phu_cap_tham_nien": pc_tham_nien,
            "phu_cap_uu_dai": pc_uu_dai,
            "phu_cap_khu_vuc": pc_khu_vuc,
            "phu_cap_tham_nien_vuot_khung": pc_tham_nien_vk,
            "phu_cap_khac": pc_khac,
            "tong_phu_cap": tong_phu_cap,
            "bhxh": bao_hiem["bhxh"],
            "bhyt": bao_hiem["bhyt"],
            "bhtn": bao_hiem["bhtn"],
            "thue_tncn": thue_tncn,
            "khau_tru_khac": khau_tru_khac,
            "tong_thu_nhap": tong_thu_nhap,
            "tong_khau_tru": bao_hiem["bhxh"]
            + bao_hiem["bhyt"]
            + bao_hiem["bhtn"]
            + thue_tncn
            + khau_tru_khac,
            "luong_thuc_nhan": luong_thuc_nhan,
            "co_tam_dinh_chi": thong_tin_tam_dinh_chi.get("co_tam_dinh_chi", False)
            if thong_tin_tam_dinh_chi
            else False,
            "tam_dinh_chi_id": thong_tin_tam_dinh_chi.get("id")
            if thong_tin_tam_dinh_chi
            else None,
            "co_ky_luat": thong_tin_ky_luat is not None,
            "ky_luat_id": thong_tin_ky_luat.get("id") if thong_tin_ky_luat else None,
            "hinh_thuc_ky_luat": thong_tin_ky_luat.get("hinh_thuc")
            if thong_tin_ky_luat
            else None,
        }
