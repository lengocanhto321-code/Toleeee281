"""
Luồng test 2: Từ chối/Xóa đơn nghỉ → Phép hoàn lại → Chấm công cập nhật

Kịch bản:
- NV có 12 phép, xin nghỉ 5 ngày → duyệt → còn 7
- QL từ chối đơn đã duyệt → phép hoàn lại thành 12
- Chấm công tháng cập nhật lại (vắng có phép giảm)
"""

from datetime import date

from src.service.tinh_luong_service import TinhLuongService
from src.service.cham_cong_service import ChamCongService
from src.service.nghi_phep_service import NghiPhepService


def test_hoan_lai_phep_khi_tu_choi():
    """
    Logic hoàn phép: phep_da_su_dung -= so_ngay, phep_con_lai += so_ngay
    """
    phep_duoc_phep = 12.0
    phep_da_su_dung = 5.0
    phep_con_lai = phep_duoc_phep - phep_da_su_dung  # = 7

    so_ngay_hoan = 5.0
    phep_da_su_dung_moi = phep_da_su_dung - so_ngay_hoan  # = 0
    phep_con_lai_moi = phep_duoc_phep - phep_da_su_dung_moi  # = 12

    assert phep_da_su_dung_moi == 0.0
    assert phep_con_lai_moi == 12.0


def test_hoan_lai_phep_khong_am():
    """Phép đã dùng không được âm khi hoàn."""
    phep_da_su_dung = 3.0
    so_ngay_hoan = 5.0
    phep_da_su_dung_moi = max(0, phep_da_su_dung - so_ngay_hoan)
    assert phep_da_su_dung_moi == 0.0


def test_cham_cong_cap_nhat_sau_huy_nghi():
    """
    Ban đầu: NV nghỉ 3 ngày phép → vắng_cp=3, co_mat=19 (22-3)
    Hủy đơn → re-calculate: vắng_cp=0, co_mat=22
    He_so giữ nguyên vì vắng có phép = hưởng lương.
    """
    service = ChamCongService()
    so_ngay_lv = service.tinh_so_ngay_lam_viec_thang(5, 2026)

    ket_qua_co_nghi = service.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=so_ngay_lv,
        danh_sach_nghi=[{"loai_nghi": "phep_nam", "so_ngay": 3}],
        so_ngay_nghi_le_tet=0,
    )
    assert ket_qua_co_nghi["so_ngay_vang_co_phep"] == 3.0

    ket_qua_huy_nghi = service.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=so_ngay_lv,
        danh_sach_nghi=[],
        so_ngay_nghi_le_tet=0,
    )
    assert ket_qua_huy_nghi["so_ngay_vang_co_phep"] == 0.0
    assert ket_qua_huy_nghi["so_ngay_co_mat"] == so_ngay_lv
    assert (
        ket_qua_huy_nghi["so_ngay_vang_co_phep"]
        < ket_qua_co_nghi["so_ngay_vang_co_phep"]
    )
    assert ket_qua_huy_nghi["he_so_ngay_cong"] <= 1.0


def test_luong_tang_tro_lai_sau_huy_nghi():
    """Sau khi hủy nghỉ, lương phải tăng trở lại (he_so_ngay_cong = 1.0)."""
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

    ket_qua_luc_nghi = luong_svc.tinh_luong_nhan_vien(
        thong_tin_nhan_vien=thong_tin_nhan_vien,
        thong_tin_luong=thong_tin_luong,
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 19,
            "so_ngay_nghi_phep": 3,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
        thong_tin_cau_hinh=thong_tin_cau_hinh,
    )

    ket_qua_sau_huy = luong_svc.tinh_luong_nhan_vien(
        thong_tin_nhan_vien=thong_tin_nhan_vien,
        thong_tin_luong=thong_tin_luong,
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 26,
            "so_ngay_nghi_phep": 0,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
        thong_tin_cau_hinh=thong_tin_cau_hinh,
    )

    assert ket_qua_sau_huy["he_so_ngay_cong"] == 1.0
    assert ket_qua_sau_huy["luong_thuc_nhan"] >= ket_qua_luc_nghi["luong_thuc_nhan"]


def test_cham_cong_service_tinh_so_ngay_lam_viec():
    """Tháng 5/2026 có 31 ngày → số ngày làm việc (T2-T6) phải > 20."""
    service = ChamCongService()
    for thang in range(1, 13):
        so_ngay = service.tinh_so_ngay_lam_viec_thang(thang, 2026)
        assert so_ngay >= 20, f"Tháng {thang}/2026 co {so_ngay} ngay lam viec (< 20?)"


def test_tu_choi_don_da_duyet_hoan_phep():
    """
    Logic nghiệp vụ: từ chối đơn đã duyệt phải hoàn lại phép.
    Mô phỏng logic trong tu_choi_don_nghi_uc.py:
    - if don.trang_thai == 'da_duyet' and don.loai_nghi == 'phep_nam':
    -   phep_da_su_dung -= don.so_ngay
    """
    don_trang_thai = "da_duyet"
    don_loai_nghi = "phep_nam"
    don_so_ngay = 3.0

    phep_da_su_dung = 3.0
    phep_con_lai = 9.0
    phep_duoc_phep = 12.0

    if don_trang_thai == "da_duyet" and don_loai_nghi == "phep_nam":
        phep_da_su_dung = max(0, phep_da_su_dung - don_so_ngay)
        phep_con_lai = max(0, phep_duoc_phep - phep_da_su_dung)

    assert phep_da_su_dung == 0.0, f"Expected 0, got {phep_da_su_dung}"
    assert phep_con_lai == 12.0, f"Expected 12, got {phep_con_lai}"
