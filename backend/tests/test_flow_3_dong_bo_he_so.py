"""
Luồng test 3: He so ngay cong dong bo giua 2 service

Verify: TinhLuongService và ChamCongService tính cùng công thức.
"""

from datetime import date

from src.service.tinh_luong_service import TinhLuongService
from src.service.cham_cong_service import ChamCongService


def test_he_so_ngay_cong_giong_nhau_khi_full():
    """Ca 2 service tra ve 1.0 khi day du."""
    luong_svc = TinhLuongService()
    cc_svc = ChamCongService()

    he_so_luong = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=26,
        so_ngay_nghi_phep=0,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
        so_ngay_nghi_khong_phep=0,
    )

    he_so_cc = cc_svc.tinh_he_so_ngay_cong(
        so_ngay_co_mat=26,
        so_ngay_vang_co_phep=0,
        so_ngay_cong_tac=0,
        so_ngay_nghi_le_tet=0,
        so_ngay_lam_chuan=26,
    )

    assert he_so_luong == 1.0
    assert he_so_cc == 1.0


def test_he_so_ngay_cong_giong_nhau_khi_nghi_phep():
    """Nghi 3 ngay phep, ca 2 service phai cho ket qua giong."""
    luong_svc = TinhLuongService()
    cc_svc = ChamCongService()

    he_so_luong = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=23,
        so_ngay_nghi_phep=3,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
        so_ngay_nghi_khong_phep=0,
    )

    he_so_cc = cc_svc.tinh_he_so_ngay_cong(
        so_ngay_co_mat=23,
        so_ngay_vang_co_phep=3,
        so_ngay_cong_tac=0,
        so_ngay_nghi_le_tet=0,
        so_ngay_lam_chuan=26,
    )

    assert he_so_luong == he_so_cc, (
        f"He so khac nhau: TinhLuong={he_so_luong}, ChamCong={he_so_cc}"
    )


def test_he_so_tru_nghi_khong_phep():
    """Nghi khong phep phai bi tru khoi ngay huong loi."""
    luong_svc = TinhLuongService()
    cc_svc = ChamCongService()

    he_so_luong = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=20,
        so_ngay_nghi_phep=3,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
        so_ngay_nghi_khong_phep=3,
    )

    he_so_cc = cc_svc.tinh_he_so_ngay_cong(
        so_ngay_co_mat=20,
        so_ngay_vang_co_phep=3,
        so_ngay_cong_tac=0,
        so_ngay_nghi_le_tet=0,
        so_ngay_lam_chuan=26,
        so_ngay_vang_khong_phep=3,
    )

    assert he_so_luong == he_so_cc, (
        f"He so khac nhau khi nghi KP: TinhLuong={he_so_luong}, ChamCong={he_so_cc}"
    )

    he_so_khong_nghi_kp = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=23,
        so_ngay_nghi_phep=3,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
        so_ngay_nghi_khong_phep=0,
    )
    assert he_so_luong < he_so_khong_nghi_kp, "Nghi khong phep phai giam he so"


def test_he_so_khong_am():
    """He so ngay cong khong the am."""
    luong_svc = TinhLuongService()
    cc_svc = ChamCongService()

    he_so = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=0,
        so_ngay_nghi_phep=0,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
        so_ngay_nghi_khong_phep=30,
    )
    assert he_so >= 0.0

    he_so_cc = cc_svc.tinh_he_so_ngay_cong(
        so_ngay_co_mat=0,
        so_ngay_vang_co_phep=0,
        so_ngay_cong_tac=0,
        so_ngay_nghi_le_tet=0,
        so_ngay_lam_chuan=26,
        so_ngay_vang_khong_phep=30,
    )
    assert he_so_cc >= 0.0


def test_he_so_cap_tai_1():
    """He so khong vuot qua 1.0 ngay ca khi lam them."""
    luong_svc = TinhLuongService()
    he_so = luong_svc.tinh_he_so_ngay_cong(
        so_ngay_lam_chuan=26,
        so_ngay_lam_thuc_te=30,
        so_ngay_nghi_phep=0,
        so_ngay_nghi_om=0,
        so_ngay_cong_tac=0,
        so_ngay_le_tet=0,
    )
    assert he_so == 1.0


def test_cong_thuc_tinh_luong_moi_tu_2026():
    """Tu 01/01/2026, cong thuc moi co he_so_dac_thu."""
    svc = TinhLuongService()
    assert svc.xac_dinh_cong_thuc_ap_dung(date(2026, 1, 1)) == "moi"
    assert svc.xac_dinh_cong_thuc_ap_dung(date(2026, 12, 31)) == "moi"
    assert svc.xac_dinh_cong_thuc_ap_dung(date(2025, 12, 31)) == "cu"


def test_luong_moi_cao_hon_luong_cu():
    """Cong thuc moi co he_so_dac_thu > 1 → lương cao hơn."""
    svc = TinhLuongService()
    luong_cu = svc.tinh_luong_co_ban(
        he_so_luong=2.34,
        luong_co_so=2340000,
        he_so_ngay_cong=1.0,
        loai_cong_thuc="cu",
    )
    luong_moi = svc.tinh_luong_co_ban(
        he_so_luong=2.34,
        luong_co_so=2340000,
        he_so_ngay_cong=1.0,
        loai_cong_thuc="moi",
        he_so_dac_thu=1.5,
    )
    assert luong_moi > luong_cu
