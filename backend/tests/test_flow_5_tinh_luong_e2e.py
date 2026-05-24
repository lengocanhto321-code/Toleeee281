"""
Luồng test 5: Tinh luong end-to-end (phan mem)

Simulate toàn bộ flow: nhân viên → lương cơ bản → phụ cấp → bảo hiểm → thuế → thực nhận
"""

from datetime import date

from src.service.tinh_luong_service import TinhLuongService


def test_tinh_luong_co_ban_cong_thuc_moi():
    """He so 2.34, luong co so 2,340,000, dac thu 1.0 → luong CB = 2.34 * 2340000 * 1.0 = 5,475,600."""
    svc = TinhLuongService()
    luong = svc.tinh_luong_co_ban(
        he_so_luong=2.34,
        luong_co_so=2340000,
        he_so_ngay_cong=1.0,
        loai_cong_thuc="moi",
        he_so_dac_thu=1.0,
    )
    assert luong == 5475600, f"Expected 5,475,600 got {luong}"


def test_tinh_luong_co_ban_nghi_giam():
    """He so ngay cong 0.9 → luong giam con 90%."""
    svc = TinhLuongService()
    luong_full = svc.tinh_luong_co_ban(
        he_so_luong=2.34,
        luong_co_so=2340000,
        he_so_ngay_cong=1.0,
        loai_cong_thuc="moi",
        he_so_dac_thu=1.0,
    )
    luong_90 = svc.tinh_luong_co_ban(
        he_so_luong=2.34,
        luong_co_so=2340000,
        he_so_ngay_cong=0.9,
        loai_cong_thuc="moi",
        he_so_dac_thu=1.0,
    )
    assert luong_90 < luong_full
    expected_90 = int(round(5475600 * 0.9))
    assert luong_90 == expected_90


def test_phu_cap_tham_nien_du_5_nam():
    """5 năm thâm niên → tỷ lệ = 5%, tính phụ cấp."""
    svc = TinhLuongService()
    pc = svc.tinh_phu_cap_tham_nien(
        he_so_luong=2.34,
        phu_cap_chuc_vu=0,
        phu_cap_tham_nien_vuot_khung=0,
        luong_co_so=2340000,
        so_nam_tham_nien=5,
        he_so_ngay_cong=1.0,
    )
    assert pc > 0, f"5 nam tham nien phai co phu cap, got {pc}"


def test_phu_cap_tham_nien_chua_du_5_nam():
    """4 năm → chưa đủ → phụ cấp = 0."""
    svc = TinhLuongService()
    pc = svc.tinh_phu_cap_tham_nien(
        he_so_luong=2.34,
        phu_cap_chuc_vu=0,
        phu_cap_tham_nien_vuot_khung=0,
        luong_co_so=2340000,
        so_nam_tham_nien=4,
        he_so_ngay_cong=1.0,
    )
    assert pc == 0


def test_bao_hiem_tinh_dung():
    """BHXH 8%, BHYT 1.5%, BHTN 1% trên lương CB (không nhân hệ số ngày công)."""
    svc = TinhLuongService()
    bh = svc.tinh_bao_hiem(
        he_so_luong=2.34,
        luong_co_so=2340000,
        ty_le_bhxh=8.0,
        ty_le_bhyt=1.5,
        ty_le_bhtn=1.0,
    )
    muc_dong = 2.34 * 2340000  # 5,475,600
    assert bh["bhxh"] == int(round(muc_dong * 8 / 100))
    assert bh["bhyt"] == int(round(muc_dong * 1.5 / 100))
    assert bh["bhtn"] == int(round(muc_dong * 1 / 100))


def test_thue_tncn_thu_nhap_thap():
    """Thu nhập < 11 triệu (sau trừ BH) → thuế = 0."""
    svc = TinhLuongService()
    thue = svc.tinh_thue_tncn(
        tong_thu_nhap=10000000,
        tong_bao_hiem=1000000,
        muc_giam_tru_ban_than=11000000,
        muc_giam_tru_nguoi_phu_thuoc=4400000,
        so_nguoi_phu_thuoc=0,
    )
    assert thue == 0


def test_thue_tncn_thu_nhap_cao():
    """Thu nhập cao → thuế > 0."""
    svc = TinhLuongService()
    thue = svc.tinh_thue_tncn(
        tong_thu_nhap=20000000,
        tong_bao_hiem=2000000,
        muc_giam_tru_ban_than=11000000,
        muc_giam_tru_nguoi_phu_thuoc=4400000,
        so_nguoi_phu_thuoc=0,
    )
    assert thue > 0, f"Thuế phải > 0 cho thu nhập 20M, got {thue}"


def test_luong_thuc_nhan_duong():
    """Luong thuc nhan phai > 0 cho NV luong trung binh."""
    svc = TinhLuongService()
    ket_qua = svc.tinh_luong_nhan_vien(
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
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 26,
            "so_ngay_nghi_phep": 0,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
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
    assert ket_qua["luong_thuc_nhan"] > 0
    assert ket_qua["tong_thu_nhap"] > ket_qua["tong_khau_tru"]


def test_tam_dinh_chi_giam_luong():
    """Tam dinh chi 50% → luong thuc nhan giam 50%."""
    svc = TinhLuongService()
    ket_qua_bth = svc.tinh_luong_nhan_vien(
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
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 26,
            "so_ngay_nghi_phep": 0,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
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

    ket_qua_tdc = svc.tinh_luong_nhan_vien(
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
        thong_tin_cham_cong={
            "so_ngay_lam_chuan": 26,
            "so_ngay_lam_thuc_te": 26,
            "so_ngay_nghi_phep": 0,
            "so_ngay_nghi_om": 0,
            "so_ngay_cong_tac": 0,
            "so_ngay_le_tet": 0,
            "so_ngay_nghi_khong_phep": 0,
        },
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
        thong_tin_tam_dinh_chi={
            "co_tam_dinh_chi": True,
            "id": "tdc1",
            "ty_le_huong_luong": 50.0,
        },
    )

    assert ket_qua_tdc["luong_thuc_nhan"] == int(
        ket_qua_bth["luong_thuc_nhan"] * 0.5
    ), (
        f"Tam dinh chi 50%: expected {int(ket_qua_bth['luong_thuc_nhan'] * 0.5)}, "
        f"got {ket_qua_tdc['luong_thuc_nhan']}"
    )
