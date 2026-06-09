#!/usr/bin/env python3
"""Seed sample employee data into the HR database.

This script creates multiple NhanVien records and associated TaiKhoan accounts
using the existing CreateNhanVien use case.

Usage:
    cd backend
    python scripts/seed_nhan_vien.py
"""

import asyncio
import random
import sys
from datetime import date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from config import config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from src.app.usecases.nhan_vien.create_nhan_vien_uc import (
    CreateNhanVienCommand,
    CreateNhanVienUseCase,
)
from src.api.schemas.nhan_vien import NhanVienCreateRequest
from src.service.storage.postgres import create_session_factory
from src.service.unit_of_work import UnitOfWork


FIRST_NAMES = [
    "An",
    "Binh",
    "Chi",
    "Dung",
    "Hieu",
    "Hoa",
    "Hung",
    "Khanh",
    "Lan",
    "Linh",
    "Minh",
    "Nga",
    "Ngoc",
    "Phuong",
    "Quang",
    "Sinh",
    "Thao",
    "Tien",
    "Trang",
    "Tuan",
    "Van",
    "Vy",
    "Xuan",
    "Yen",
]
LAST_NAMES = [
    "Nguyen",
    "Tran",
    "Le",
    "Pham",
    "Hoang",
    "Pham",
    "Vu",
    "Ngo",
    "Do",
    "Dang",
    "Bui",
    "Trinh",
    "Pham",
]
QUE_QUANS = [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Huế",
]
ADDRESSES = [
    "123 Đường A, Quận 1",
    "456 Đường B, Quận 3",
    "789 Đường C, Quận 5",
    "10 Đường D, Quận 7",
    "22 Đường E, Quận Tân Bình",
    "33 Đường F, Quận 2",
]
GENDERS = ["Nam", "Nữ"]
MARITAL_STATUSES = ["Độc thân", "Đã kết hôn"]
CAP_HOCES = ["Cao đẳng", "Đại học", "Thạc sĩ"]


def random_date(start_year: int = 1985, end_year: int = 1998) -> date:
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 28)
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


def random_cccd(existing: set[str]) -> str:
    while True:
        value = f"{random.randint(100000000000, 999999999999)}"
        if value not in existing:
            existing.add(value)
            return value


def random_phone(existing: set[str]) -> str:
    while True:
        value = f"09{random.randint(10000000, 99999999)}"
        if value not in existing:
            existing.add(value)
            return value


async def get_seed_ids(engine):
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT id FROM tai_khoan WHERE ten_dang_nhap = 'admin' LIMIT 1")
        )
        admin_id = result.scalar_one_or_none()

        result = await conn.execute(
            text("SELECT id FROM chuc_vu WHERE loai = 'nhan_vien' AND trang_thai = TRUE LIMIT 1")
        )
        chuc_vu_id = result.scalar_one_or_none()

        result = await conn.execute(
            text("SELECT id FROM phong_ban WHERE trang_thai = TRUE ORDER BY created_at LIMIT 1")
        )
        phong_ban_id = result.scalar_one_or_none()

    if not chuc_vu_id or not phong_ban_id:
        raise RuntimeError(
            "Không tìm thấy dữ liệu phòng ban/chức vụ hợp lệ. Hãy chạy scripts/setup_database.py trước."
        )

    return admin_id, phong_ban_id, chuc_vu_id


def build_employee_payload(i: int, phong_ban_id: str, chuc_vu_id: str, used_cccd: set[str], used_phone: set[str]) -> dict:
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    ho_ten = f"{last} {first} {i+1}"
    gender = random.choice(GENDERS)
    ngay_sinh = random_date(1986, 1997)
    so_cccd = random_cccd(used_cccd)
    so_dien_thoai = random_phone(used_phone)
    email = f"{last.lower()}.{first.lower()}.{i+1}@example.com"

    return {
        "ho_ten": ho_ten,
        "gioi_tinh": gender,
        "ngay_sinh": ngay_sinh,
        "que_quan": random.choice(QUE_QUANS),
        "dia_chi_thuong_tru": random.choice(ADDRESSES),
        "dia_chi_tam_tru": random.choice(ADDRESSES),
        "so_dien_thoai": so_dien_thoai,
        "email": email,
        "email_ca_nhan": f"{first.lower()}.{last.lower()}.{i+1}@gmail.com",
        "so_cccd": so_cccd,
        "ngay_cap_cccd": date(2021, random.randint(1, 12), random.randint(1, 28)),
        "noi_cap_cccd": "CA TP. Hồ Chí Minh",
        "noi_sinh": random.choice(QUE_QUANS),
        "dan_toc": "Kinh",
        "ton_giao": "Không",
        "loai_nhan_vien": "nhan_vien",
        "cap_hoc": random.choice(CAP_HOCES),
        "mon_day": "Hành chính",
        "hang_chuc_danh": "Nhân viên",
        "ngach_luong": "N1",
        "bac_luong": random.randint(1, 3),
        "he_so_luong": str(round(random.uniform(1.0, 2.5), 2)),
        "so_nam_tham_nien": random.randint(0, 5),
        "phong_ban_id": phong_ban_id,
        "chuc_vu_id": chuc_vu_id,
        "loai_hop_dong": "vien_chuc",
        "so_hop_dong": f"HD-{i+1:03d}",
        "ngay_vao_lam": date(2024, random.randint(1, 12), random.randint(1, 28)),
        "tinh_trang_hon_nhan": random.choice(MARITAL_STATUSES),
        "ghi_chu": "Seed data",
        "trang_thai": "dang_lam",
    }


async def main():
    print("Bắt đầu seed dữ liệu nhân viên...")
    engine = create_async_engine(config.DB_URI, echo=False)
    async_session_factory = create_session_factory(config.DB_URI)

    admin_id, phong_ban_id, chuc_vu_id = await get_seed_ids(engine)
    actor_id = admin_id or None

    async with async_session_factory() as session:
        uow = UnitOfWork(session_factory=async_session_factory)
        use_case = CreateNhanVienUseCase(uow)

        used_cccd: set[str] = set()
        used_phone: set[str] = set()
        count_success = 0
        count_error = 0
        total = 30

        for i in range(total):
            payload = build_employee_payload(i, phong_ban_id, chuc_vu_id, used_cccd, used_phone)
            try:
                data = NhanVienCreateRequest(**payload)
            except Exception as e:
                print(f"Lỗi validate payload {i+1}: {e}")
                count_error += 1
                continue

            command = CreateNhanVienCommand(data=data, actor_id=actor_id)
            result = await use_case.execute(command)
            if result.is_ok():
                nv = result.ok().nhan_vien
                print(f"Tạo nhân viên thành công: {nv.ma_nhan_vien} - {nv.ho_ten}")
                count_success += 1
            else:
                error = result.err()
                print(f"Lỗi tạo nhân viên {i+1}: {error.code} - {error.message}")
                count_error += 1

        print("--- Kết quả ---")
        print(f"Thành công: {count_success}")
        print(f"Lỗi: {count_error}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
