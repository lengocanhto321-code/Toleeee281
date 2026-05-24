"""
Constants cho Nghỉ phép (Leave Management)
"""

from datetime import date
from typing import Dict, List, Optional, Tuple

# ============================================
# LOẠI NGHỈ PHÉP
# ============================================

LOAI_NGHI: Dict[str, Dict] = {
    "phep_nam": {
        "ten": "Nghỉ phép năm",
        "so_ngay_mac_dinh": 12,
        "bhxh": False,
        "can_giay": False,
        "tinh_cong": True,
    },
    "nghi_om": {
        "ten": "Nghỉ ốm",
        "so_ngay_mac_dinh": 30,
        "bhxh": True,
        "can_giay": True,
        "tinh_cong": True,
    },
    "viec_rieng": {
        "ten": "Nghỉ việc riêng",
        "so_ngay_mac_dinh": 3,
        "bhxh": False,
        "can_giay": False,
        "tinh_cong": True,
    },
    "ket_hon": {
        "ten": "Nghỉ kết hôn",
        "so_ngay_mac_dinh": 3,
        "bhxh": False,
        "can_giay": False,
        "tinh_cong": True,
    },
    "mai_tang": {
        "ten": "Nghỉ ma táng",
        "so_ngay_mac_dinh": 3,
        "bhxh": False,
        "can_giay": False,
        "tinh_cong": True,
    },
    "thai_san": {
        "ten": "Nghỉ thai sản",
        "so_ngay_mac_dinh": 180,
        "bhxh": True,
        "can_giay": True,
        "tinh_cong": True,
    },
    "cong_tac": {
        "ten": "Đi công tác",
        "so_ngay_mac_dinh": None,
        "bhxh": False,
        "can_giay": True,
        "tinh_cong": True,
    },
}

LOAI_NGHI_KEYS = list(LOAI_NGHI.keys())


# ============================================
# TRẠNG THÁI ĐƠN NGHỈ PHÉP
# ============================================

TRANG_THAI_DON = {
    "cho_duyet": "Chờ duyệt",
    "da_duyet": "Đã duyệt",
    "tu_choi": "Từ chối",
    "huy": "Đã hủy",
}

TRANG_THAI_DON_KEYS = list(TRANG_THAI_DON.keys())


# ============================================
# NGÀY LỄ CỐ ĐỊNH (DƯƠNG LỊCH)
# ============================================

FIXED_HOLIDAYS: List[Tuple[int, int, str]] = [
    (1, 1, "Tết Dương lịch"),
    (4, 30, "Ngày Giải phóng miền Nam"),
    (5, 1, "Ngày Quốc tế Lao động"),
    (9, 2, "Ngày Quốc khánh"),
]


# ============================================
# NGÀY LỄ ÂM LỊCH
# ============================================

LUNAR_HOLIDAYS: Dict[str, Tuple[int, int]] = {
    "tet": (1, 1),  # Mùng 1 Tết (Tết Nguyên Đán)
    "giotot": (3, 10),  # Giỗ Tổ Hùng Vương
}


# ============================================
# SỐ NGÀY NGHỈ TẾT NGUYÊN ĐÁN
# Theo Bộ Luật Lao động 2019: 7 ngày
# ============================================

TET_NGUYEN_DAN_SO_NGAY = 7


# ============================================
# GIẤY TỜ CẦN THIẾT THEO LOẠI NGHỈ
# ============================================

GIAY_TO_REQUIRED: Dict[str, str] = {
    "nghi_om": "Giấy xác nhận nghỉ ốm",
    "cong_tac": "Quyết định cử đi công tác",
    "thai_san": "Giấy tờ thai sản",
}


# ============================================
# SỐ NGÀY LÀM VIỆC CHUẨN TRONG THÁNG
# Theo quy định cho THPT: 26 ngày/tháng
# ============================================

SO_NGAY_LAM_VIEC_CHUAN_THANG = 26


# ============================================
# TÊN THÁNG TIẾNG VIỆT
# ============================================

TEN_THANG = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
]
