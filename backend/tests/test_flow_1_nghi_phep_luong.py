"""
Luồng test 1: NV xin nghỉ phép năm → QL duyệt → Chấm công cập nhật → Tính lương giảm

Kịch bản:
- NV có 12 ngày phép năm
- Xin nghỉ phép năm 3 ngày (trong tháng 5/2026)
- QL duyệt đơn → phép giảm còn 9
- Chấm công tháng 5: vắng có phép = 3, có mặt giảm
- Tính lương tháng 5: he_so_ngay_cong < 1.0, lương giảm tương ứng
"""

from datetime import date

from src.service.tinh_luong_service import TinhLuongService
from src.service.cham_cong_service import ChamCongService
from src.service.nghi_phep_service import NghiPhepService


def test_tinh_so_ngay_nghi_3_ngay_trong_tuan():
    """NV xin nghỉ T2-T4 (3 ngày làm việc) → tính đúng 3 ngày."""
    service = NghiPhepService()
    tu_ngay = date(2026, 5, 4)
    den_ngay = date(2026, 5, 6)
    so_ngay = service.tinh_so_ngay_nghi(tu_ngay, den_ngay)
    assert so_ngay == 3.0, f"Sai số ngày nghỉ: expected 3, got {so_ngay}"


def test_kiem_tra_phep_con_lai():
    """NV còn 9 phép, xin 3 → còn đủ."""
    service = NghiPhepService()
    result = service.kiem_tra_phep_con_lai(phep_nam_con_lai=9.0, so_ngay_xin=3.0)
    assert result["duoc_phep"] is True
    assert result["canh_bao"] is None


def test_kiem_tra_phep_vuot_muc():
    """NV còn 2 phép, xin 3 → cảnh báo vượt."""
    service = NghiPhepService()
    result = service.kiem_tra_phep_con_lai(phep_nam_con_lai=2.0, so_ngay_xin=3.0)
    assert result["duoc_phep"] is True
    assert result["canh_bao"] is not None


def test_tinh_phep_con_lai_sau_duyet():
    """Duyệt nghỉ phép năm 3 ngày → phép còn lại giảm 3."""
    service = NghiPhepService()
    con_lai = service.tinh_phep_con_lai_sau_khi_duyet(
        phep_nam_con_lai=12.0, so_ngay=3.0, loai_nghi="phep_nam"
    )
    assert con_lai == 9.0, f"Sai phép còn lại: expected 9, got {con_lai}"


def test_tinh_phep_con_lai_khong_giam_khi_nghi_om():
    """Nghỉ ốm không giảm phép năm."""
    service = NghiPhepService()
    con_lai = service.tinh_phep_con_lai_sau_khi_duyet(
        phep_nam_con_lai=12.0, so_ngay=5.0, loai_nghi="nghi_om"
    )
    assert con_lai == 12.0


def test_cham_cong_cap_nhat_khi_nghi_phep():
    """
    Tháng 5/2026 có ~22 ngày làm việc.
    NV nghỉ phép 3 ngày → vắng có phép = 3.
    ChamCongService tính: co_mat = 22-3 = 19, vang_co_phep = 3.
    """
    service = ChamCongService()
    so_ngay_lam_viec = service.tinh_so_ngay_lam_viec_thang(5, 2026)
    assert so_ngay_lam_viec > 0

    ket_qua = service.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=so_ngay_lam_viec,
        danh_sach_nghi=[{"loai_nghi": "phep_nam", "so_ngay": 3}],
        so_ngay_nghi_le_tet=0,
    )
    assert ket_qua["so_ngay_vang_co_phep"] == 3.0
    assert ket_qua["so_ngay_co_mat"] == so_ngay_lam_viec - 3
    assert ket_qua["so_ngay_cong_tac"] == 0
    assert ket_qua["he_so_ngay_cong"] < 1.0, (
        f"He so phai < 1 khi nghi: {ket_qua['he_so_ngay_cong']}"
    )


def test_luong_giam_khi_nghi_phep():
    """
    So sánh lương khi không nghỉ vs nghỉ 3 ngày.
    Lương phải giảm tương ứng với hệ số ngày công.
    """
    luong_svc = TinhLuongService()

    thong_tin_nhan_vien = {
        "id": "nv1",
        "thang": 5,
        "nam": 2026,
        "ngay_vao": None,
        "so_nguoi_phu_thuoc": 0,
    }
    thong_tin_luong = {
        "he_so_luong": 2.34,
        "phu_cap_chuc_vu": 0,
        "phu_cap_tham_nien_vuot_khung": 0,
        "so_nam_tham_nien": 0,
        "ty_le_pc_uu_dai": 30.0,
        "he_so_khu_vuc": 0,
        "phu_cap_khac": 0,
        "khau_tru_khac": 0,
    }
    thong_tin_cau_hinh = {
        "ngay_tinh": date(2026, 5, 1),
        "luong_co_so": 2340000,
        "he_so_dac_thu": 1.0,
        "ty_le_bhxh": 8.0,
        "ty_le_bhyt": 1.5,
        "ty_le_bhtn": 1.0,
        "muc_giam_tru_ban_than": 11000000,
        "muc_giam_tru_nguoi_phu_thuoc": 4400000,
    }

    ket_qua_full = luong_svc.tinh_luong_nhan_vien(
        thong_tin_nhan_vien=thong_tin_nhan_vien,
        thong_tin_luong=thong_tin_luong,
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 23,
            "so_ngay_nghi_phep": 3,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
        thong_tin_cau_hinh=thong_tin_cau_hinh,
    )

    ket_qua_nghi = luong_svc.tinh_luong_nhan_vien(
        thong_tin_nhan_vien=thong_tin_nhan_vien,
        thong_tin_luong=thong_tin_luong,
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 20,
            "so_ngay_nghi_phep": 3,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 3,
        },
        thong_tin_cau_hinh=thong_tin_cau_hinh,
    )

    assert ket_qua_full["he_so_ngay_cong"] == 1.0
    assert ket_qua_nghi["he_so_ngay_cong"] < 1.0
    assert ket_qua_nghi["luong_thuc_nhan"] < ket_qua_full["luong_thuc_nhan"], (
        f"Luong khi nghi ({ket_qua_nghi['luong_thuc_nhan']}) phai < "
        f"luong full ({ket_qua_full['luong_thuc_nhan']})"
    )


def test_luong_full_khi_khong_co_cham_cong():
    """
    BUG FIXED: Khi KHONG co cham_cong, he_so = 1.0 (full).
    Day la fallback - can canh bao nhung khong tinh sai.
    """
    luong_svc = TinhLuongService()
    ket_qua = luong_svc.tinh_luong_nhan_vien(
        thong_tin_nhan_vien={
            "id": "nv1",
            "thang": 5,
            "nam": 2026,
            "ngay_vao": None,
            "so_nguoi_phu_thuoc": 0,
        },
        thong_tin_luong={
            "he_so_luong": 2.34,
            "phu_cap_chuc_vu": 0,
            "phu_cap_tham_nien_vuot_khung": 0,
            "so_nam_tham_nien": 0,
            "ty_le_pc_uu_dai": 30.0,
            "he_so_khu_vuc": 0,
            "phu_cap_khac": 0,
            "khau_tru_khac": 0,
        },
        thong_tin_cham_cong=None,
        thong_tin_cau_hinh={
            "ngay_tinh": date(2026, 5, 1),
            "luong_co_so": 2340000,
            "he_so_dac_thu": 1.0,
            "ty_le_bhxh": 8.0,
            "ty_le_bhyt": 1.5,
            "ty_le_bhtn": 1.0,
            "muc_giam_tru_ban_than": 11000000,
            "muc_giam_tru_nguoi_phu_thuoc": 4400000,
        },
    )
    assert ket_qua["he_so_ngay_cong"] == 1.0
    assert ket_qua["luong_thuc_nhan"] > 0
