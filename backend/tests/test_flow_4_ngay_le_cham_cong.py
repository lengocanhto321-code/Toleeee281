"""
Luồng test 4: Ngày lễ Tết tính chính xác + tổng hợp chấm công

Kịch bản:
- Tháng 1/2026: có Tết Dương lịch (1/1) + Tết Nguyên Đán
- Tháng 4/2026: có 30/4
- Tháng 5/2026: có 1/5
- Tháng 9/2026: có 2/9
- Các tháng khác: không có lễ (trừ khi Tết rơi vào)
"""

from datetime import date

from src.service.nghi_phep_service import NghiPhepService
from src.service.cham_cong_service import ChamCongService


def test_get_holidays_2026_khong_rong():
    """Danh sách ngày lễ 2026 phải có ít nhất 10 ngày."""
    service = NghiPhepService()
    holidays = service.get_holidays(2026)
    assert len(holidays) >= 10, f"Chỉ có {len(holidays)} ngày lễ trong 2026, quá ít"


def test_ngay_le_co_dinh():
    """Các ngày lễ cố định phải có trong danh sách."""
    service = NghiPhepService()
    holidays = set(service.get_holidays(2026))

    assert date(2026, 1, 1) in holidays, "Thiếu Tết Dương lịch 1/1"
    assert date(2026, 4, 30) in holidays, "Thiếu 30/4"
    assert date(2026, 5, 1) in holidays, "Thiếu 1/5"
    assert date(2026, 9, 2) in holidays, "Thiếu Quốc khánh 2/9"


def test_thang_1_co_ngay_le():
    """Tháng 1 phải có ít nhất 1 ngày lễ (Tết Dương lịch)."""
    service = NghiPhepService()
    holidays = service.get_holidays(2026)
    thang1 = [h for h in holidays if h.month == 1 and h.weekday() < 5]
    assert len(thang1) >= 1, f"Tháng 1 chỉ có {len(thang1)} ngày lễ"


def test_thang_9_co_quoc_khanh():
    """Tháng 9 phải có Quốc khánh."""
    service = NghiPhepService()
    holidays = service.get_holidays(2026)
    thang9 = [h for h in holidays if h.month == 9 and h.weekday() < 5]
    assert len(thang9) >= 1, "Tháng 9 phải có ít nhất 1 ngày lễ (Quốc khánh)"


def test_mock_cham_cong_tinh_ngay_le():
    """Mock generate phải tính ngày lễ Tết chính xác."""
    cc_svc = ChamCongService()
    nghi_phep_svc = NghiPhepService()

    for thang in [1, 4, 5, 9]:
        holidays = nghi_phep_svc.get_holidays(2026)
        so_ngay_le = sum(1 for h in holidays if h.month == thang and h.weekday() < 5)

        so_ngay_lv = cc_svc.tinh_so_ngay_lam_viec_thang(thang, 2026)

        ket_qua = cc_svc.mock_tinh_cham_cong_thang(
            so_ngay_lam_viec_trong_thang=so_ngay_lv,
            danh_sach_nghi=[],
            so_ngay_nghi_le_tet=float(so_ngay_le),
        )

        assert ket_qua["so_ngay_nghi_le_tet"] == float(so_ngay_le), (
            f"Tháng {thang}: expected {so_ngay_le} ngày lễ, got {ket_qua['so_ngay_nghi_le_tet']}"
        )


def test_tinh_so_ngay_nghi_trung_cuoi_tuan():
    """Nghỉ từ T7 đến CN = 2 ngày (đếm cả T7, CN)."""
    service = NghiPhepService()
    tu_ngay = date(2026, 5, 9)
    den_ngay = date(2026, 5, 10)
    so_ngay = service.tinh_so_ngay_nghi(tu_ngay, den_ngay)
    assert so_ngay == 2.0, f"T7-CN phải = 2 ngày, got {so_ngay}"


def test_tinh_so_ngay_nghi_1_ngay():
    """Nghỉ 1 ngày T2."""
    service = NghiPhepService()
    tu_ngay = date(2026, 5, 4)
    den_ngay = date(2026, 5, 4)
    so_ngay = service.tinh_so_ngay_nghi(tu_ngay, den_ngay)
    assert so_ngay == 1.0


def test_nghi_om_tinh_la_vang_co_phep():
    """Nghỉ ốm phải được tính là vắng có phép (hưởng lương)."""
    cc_svc = ChamCongService()

    ket_qua = cc_svc.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=22,
        danh_sach_nghi=[{"loai_nghi": "nghi_om", "so_ngay": 2}],
        so_ngay_nghi_le_tet=0,
    )
    assert ket_qua["so_ngay_vang_co_phep"] == 2.0, (
        f"Nghi om phai la vang co phep, got {ket_qua['so_ngay_vang_co_phep']}"
    )


def test_cong_tac_khong_tinh_vang():
    """Đi công tác không tính vắng, tính riêng."""
    cc_svc = ChamCongService()

    ket_qua = cc_svc.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=22,
        danh_sach_nghi=[{"loai_nghi": "cong_tac", "so_ngay": 3}],
        so_ngay_nghi_le_tet=0,
    )
    assert ket_qua["so_ngay_cong_tac"] == 3.0
    assert ket_qua["so_ngay_vang_co_phep"] == 0.0


def test_hon_hop_nghi():
    """NV nghỉ phép 2 + ốm 1 + công tác 3 → tổng đúng."""
    cc_svc = ChamCongService()

    ket_qua = cc_svc.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=22,
        danh_sach_nghi=[
            {"loai_nghi": "phep_nam", "so_ngay": 2},
            {"loai_nghi": "nghi_om", "so_ngay": 1},
            {"loai_nghi": "cong_tac", "so_ngay": 3},
        ],
        so_ngay_nghi_le_tet=1,
    )
    assert ket_qua["so_ngay_vang_co_phep"] == 3.0  # phep_nam + nghi_om
    assert ket_qua["so_ngay_cong_tac"] == 3.0
    assert ket_qua["so_ngay_nghi_le_tet"] == 1.0
    assert ket_qua["so_ngay_co_mat"] == 22 - 3 - 1  # 18 (khong tru cong_tac)
