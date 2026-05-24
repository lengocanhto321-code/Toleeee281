#!/usr/bin/env python3
"""
Master setup script - Khoi tao toan bo database cho HR Management System.

Usage:
    cd backend
    uv run python scripts/setup_database.py

Steps:
    1. Alembic upgrade head (tao tables)
    2. Add missing columns (ORM can nhung migration thieu)
    3. Seed RBAC (2 roles, 30 permissions)
    4. Seed admin account (admin / Admin123!)
    5. Seed cau hinh luong (2 config, 18 he so THPT, 1 phu cap)
    6. Seed cau hinh nghi phep (6 loai nghi)
    7. Seed phong ban (15 phong/to bo mon THPT)
    8. Seed chuc vu (8 chuc vu)
"""

import asyncio
import os
import subprocess
import sys
import uuid
from pathlib import Path

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

BACKEND_DIR = Path(__file__).parent.parent

ROLES = [
    {
        "name": "ADMIN",
        "description": "Quan tri vien",
        "priority": 100,
        "is_system": True,
    },
    {
        "name": "NHAN_VIEN",
        "description": "Nhan vien",
        "priority": 40,
        "is_system": True,
    },
]

PERMISSION_CODES = {
    "nhan_vien:read": "Xem danh sach nhan vien",
    "nhan_vien:create": "Tao nhan vien moi",
    "nhan_vien:update": "Cap nhat thong tin nhan vien",
    "nhan_vien:delete": "Xoa nhan vien",
    "phong_ban:read": "Xem phong ban",
    "phong_ban:create": "Tao phong ban",
    "phong_ban:update": "Cap nhat phong ban",
    "phong_ban:delete": "Xoa phong ban",
    "chuc_vu:read": "Xem chuc vu",
    "chuc_vu:create": "Tao chuc vu",
    "chuc_vu:update": "Cap nhat chuc vu",
    "chuc_vu:delete": "Xoa chuc vu",
    "luong:read": "Xem bang luong",
    "luong:manage": "Quan ly luong",
    "luong:export": "Xuat bang luong",
    "luong:view_own": "Xem luong ca nhan",
    "cham_cong:read": "Xem cham cong",
    "cham_cong:manage": "Quan ly cham cong",
    "cham_cong:export": "Xuat bang cham cong",
    "cham_cong:view_own": "Xem cham cong ca nhan",
    "nghi_phep:read": "Xem don nghi phep",
    "nghi_phep:approve": "Duyet don nghi phep",
    "nghi_phep:manage": "Quan ly nghi phep",
    "nghi_phep:create": "Tao don nghi phep",
    "nghi_phep:view_own": "Xem don nghi phep ca nhan",
    "dashboard:view_admin": "Xem dashboard quan tri",
    "dashboard:view_employee": "Xem dashboard nhan vien",
    "profile:read": "Xem ho so",
    "profile:update": "Cap nhat ho so",
    "tai_lieu:read": "Xem tai lieu",
    "tai_lieu:create": "Tao tai lieu",
    "tai_lieu:update": "Cap nhat tai lieu",
    "tai_lieu:delete": "Xoa tai lieu",
    "cham_cong:check_in": "Check-in cham cong",
    "cham_cong:approve": "Duyet cham cong",
    "nghi_phep:delete": "Xoa don nghi phep",
    "thong_ke:read": "Xem thong ke",
    "bao_cao:read": "Xem bao cao",
    "bao_cao:export": "Xuat bao cao",
}

ROLE_PERMISSIONS = {
    "ADMIN": [
        "nhan_vien:read",
        "nhan_vien:create",
        "nhan_vien:update",
        "nhan_vien:delete",
        "phong_ban:read",
        "phong_ban:create",
        "phong_ban:update",
        "phong_ban:delete",
        "chuc_vu:read",
        "chuc_vu:create",
        "chuc_vu:update",
        "chuc_vu:delete",
        "luong:read",
        "luong:manage",
        "luong:export",
        "cham_cong:read",
        "cham_cong:manage",
        "cham_cong:export",
        "cham_cong:check_in",
        "cham_cong:approve",
        "nghi_phep:read",
        "nghi_phep:approve",
        "nghi_phep:manage",
        "nghi_phep:delete",
        "dashboard:view_admin",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
        "tai_lieu:read",
        "tai_lieu:create",
        "tai_lieu:update",
        "tai_lieu:delete",
        "bao_cao:read",
        "bao_cao:export",
        "thong_ke:read",
    ],
    "NHAN_VIEN": [
        "luong:view_own",
        "cham_cong:view_own",
        "cham_cong:check_in",
        "nghi_phep:create",
        "nghi_phep:view_own",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
        "tai_lieu:read",
        "tai_lieu:create",
    ],
}

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin123!"
ADMIN_EMAIL = "admin@thpt-thanglong.edu.vn"

SALARY_CONFIGS = [
    {
        "id": "cfg001",
        "ngay_ap_dung": "2025-01-01",
        "luong_co_so": 2340000,
        "he_so_dac_thu": 1.00,
        "ty_le_quy_thuong": 10.00,
        "ty_le_bhxh": 8.00,
        "ty_le_bhyt": 1.50,
        "ty_le_bhtn": 1.00,
        "muc_giam_tru_ban_than": 11000000,
        "muc_giam_tru_nguoi_phu_thuoc": 4400000,
        "trang_thai": "dang_ap_dung",
        "ghi_chu": "Cau hinh luong co so 2025",
    },
    {
        "id": "cfg002",
        "ngay_ap_dung": "2026-01-01",
        "luong_co_so": 2340000,
        "he_so_dac_thu": 1.15,
        "ty_le_quy_thuong": 10.00,
        "ty_le_bhxh": 8.00,
        "ty_le_bhyt": 1.50,
        "ty_le_bhtn": 1.00,
        "muc_giam_tru_ban_than": 11000000,
        "muc_giam_tru_nguoi_phu_thuoc": 4400000,
        "trang_thai": "sap_hieu_luc",
        "ghi_chu": "Cau hinh luong 2026 - co he so dac thu",
    },
]

SALARY_COEFFICIENTS = [
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 1, 4.40),
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 2, 4.92),
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 3, 5.44),
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 4, 5.96),
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 5, 6.48),
    ("V.07.04.01", "Giao vien THPT hang I", "thpt", 6, 7.00),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 1, 2.34),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 2, 2.67),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 3, 3.00),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 4, 3.33),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 5, 3.66),
    ("V.07.04.02", "Giao vien THPT hang II", "thpt", 6, 3.99),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 1, 2.10),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 2, 2.41),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 3, 2.72),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 4, 3.03),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 5, 3.34),
    ("V.07.04.03", "Giao vien THPT hang III", "thpt", 6, 3.65),
]

LEAVE_TYPES = [
    {
        "loai_nghi": "phep_nam",
        "ten_loai": "Nghi phep nam",
        "so_ngay_moi_nam": 12.0,
        "so_ngay_toi_da_mot_lan": 5.0,
        "can_giay_to": False,
        "bat_buoc_ghi_ly_do": False,
    },
    {
        "loai_nghi": "viec_rieng",
        "ten_loai": "Nghi viec rieng",
        "so_ngay_moi_nam": 3.0,
        "so_ngay_toi_da_mot_lan": 3.0,
        "can_giay_to": False,
        "bat_buoc_ghi_ly_do": False,
    },
    {
        "loai_nghi": "nghi_om",
        "ten_loai": "Nghi om",
        "so_ngay_moi_nam": 0.0,
        "so_ngay_toi_da_mot_lan": 30.0,
        "can_giay_to": True,
        "bat_buoc_ghi_ly_do": True,
    },
    {
        "loai_nghi": "ket_hon",
        "ten_loai": "Nghi ket hon",
        "so_ngay_moi_nam": 3.0,
        "so_ngay_toi_da_mot_lan": 3.0,
        "can_giay_to": True,
        "bat_buoc_ghi_ly_do": False,
    },
    {
        "loai_nghi": "mai_tang",
        "ten_loai": "Nghi ma tang",
        "so_ngay_moi_nam": 3.0,
        "so_ngay_toi_da_mot_lan": 3.0,
        "can_giay_to": True,
        "bat_buoc_ghi_ly_do": False,
    },
    {
        "loai_nghi": "thai_san",
        "ten_loai": "Nghi thai san",
        "so_ngay_moi_nam": 180.0,
        "so_ngay_toi_da_mot_lan": 180.0,
        "can_giay_to": True,
        "bat_buoc_ghi_ly_do": True,
    },
]

DEPARTMENTS = [
    ("PB01", "Van phong", "hanh_chinh", "Phong hanh chinh tong hop"),
    ("PB02", "To Toan", "chuyen_mon", "To bo mon Toan"),
    ("PB03", "To Ngu Van", "chuyen_mon", "To bo mon Ngu Van"),
    ("PB04", "To Ngoai ngu", "chuyen_mon", "To bo mon Ngoai ngu"),
    ("PB05", "To Vat ly", "chuyen_mon", "To bo mon Vat ly"),
    ("PB06", "To Hoa hoc", "chuyen_mon", "To bo mon Hoa hoc"),
    ("PB07", "To Sinh hoc", "chuyen_mon", "To bo mon Sinh hoc"),
    ("PB08", "To Su - Dia", "chuyen_mon", "To bo mon Su - Dia"),
    ("PB09", "To GDCD", "chuyen_mon", "To bo mon GDCD"),
    ("PB10", "To Tin hoc", "chuyen_mon", "To bo mon Tin hoc"),
    ("PB11", "To The duc", "chuyen_mon", "To bo mon The duc"),
    ("PB12", "To Cong nghe", "chuyen_mon", "To bo mon Cong nghe"),
    ("PB13", "To Am nhac - My thuat", "chuyen_mon", "To bo mon Am nhac - My thuat"),
    ("PB14", "Ke toan", "hanh_chinh", "Phong Ke toan"),
    ("PB15", "Thu vien", "hanh_chinh", "Thu vien truong hoc"),
]

POSITIONS = [
    (
        "CV001",
        "Hieu truong",
        10,
        1.30,
        "quan_ly",
        "Nguoi dung dau truong hoc",
        "Thac si tro len, 10 nam KN",
    ),
    (
        "CV002",
        "Pho Hieu truong",
        9,
        1.00,
        "quan_ly",
        "Phu trach CM hoac CSVC",
        "Thac si, 8 nam KN",
    ),
    (
        "CV003",
        "To truong",
        7,
        0.50,
        "giao_vien",
        "Truong to chuyen mon",
        "GV gioi cap truong",
    ),
    ("CV004", "To pho", 6, 0.30, "giao_vien", "Pho to chuyen mon", "GV co kinh nghiem"),
    ("CV005", "Giao vien", 4, 0.00, "giao_vien", "Giao vien bo mon", "Cu nhan su pham"),
    (
        "CV006",
        "Giao vien tap su",
        2,
        0.00,
        "giao_vien",
        "Giao vien thu viec",
        "Cu nhan su pham",
    ),
    (
        "CV007",
        "Truong phong",
        8,
        0.70,
        "quan_ly",
        "Truong phong hanh chinh",
        "5 nam KN quan ly",
    ),
    (
        "CV008",
        "Nhan vien van phong",
        3,
        0.00,
        "nhan_vien",
        "Nhan vien hanh chinh",
        "Cao dang tro len",
    ),
]

LICH_CHAM_CONG_DEFAULT = {
    "gio_check_in": "07:00",
    "gio_check_out": "17:00",
    "ngay_lam_viec": "0,1,2,3,4,5",
    "bat_gps": False,
    "ban_kinh_cho_phep": 100,
    "trang_thai": "active",
}

CAU_HINH_THUONG_TET_DEFAULT = {
    "nam": 2026,
    "ty_le_thuong": 1.00,
    "bat_len": False,
    "ngay_ap_dung": "2026-01-01",
    "ghi_chu": "Thuong Tet Am lich 2026",
}

MISSING_NV_COLUMNS = [
    ("dia_chi_tam_tru", "VARCHAR(255)"),
    ("email_ca_nhan", "VARCHAR(100)"),
    ("ngay_cap_cccd", "DATE"),
    ("noi_cap_cccd", "VARCHAR(200)"),
    ("cccd_front", "VARCHAR(500)"),
    ("cccd_back", "VARCHAR(500)"),
    ("noi_sinh", "VARCHAR(200)"),
    ("dan_toc", "VARCHAR(50)"),
    ("ton_giao", "VARCHAR(50)"),
    ("cap_hoc", "VARCHAR(20)"),
    ("ngach_luong", "VARCHAR(50)"),
    ("bac_luong", "INTEGER"),
    ("he_so_luong", "VARCHAR(10)"),
    ("so_nam_tham_nien", "INTEGER"),
    ("phong_ban_id", "VARCHAR(32)"),
    ("chuc_vu_id", "VARCHAR(32)"),
    ("hinh_thuc_tuyen_dung", "VARCHAR(100)"),
    ("noi_ky_hop_dong", "VARCHAR(200)"),
    ("phu_cap_chuc_vu", "VARCHAR(20)"),
    ("ngay_bo_nhiem_chuc_vu", "DATE"),
    ("ngay_vao_dang", "DATE"),
    ("ngay_vao_doan", "DATE"),
    ("tinh_trang_hon_nhan", "VARCHAR(20)"),
]

MISSING_CONG_TAC_COLUMNS = [
    ("is_primary", "BOOLEAN DEFAULT FALSE"),
    ("he_so_luong", "NUMERIC(5,2)"),
    ("bac_luong", "VARCHAR(10)"),
    ("ghi_chu", "TEXT"),
    ("trang_thai", "VARCHAR(20) DEFAULT 'dang_cong_tac'"),
]


def _p(step, total, msg):
    print(f"\n{BLUE}[{step}/{total}]{RESET} {msg}")


def _ok(msg):
    print(f"{GREEN}OK{RESET} {msg}")


def _err(msg):
    print(f"{RED}FAIL{RESET} {msg}")


def _warn(msg):
    print(f"{YELLOW}WARN{RESET} {msg}")


def _load_env():
    import yaml

    env_path = BACKEND_DIR / "env.yaml"
    if env_path.exists():
        with open(env_path) as f:
            return yaml.safe_load(f)
    return {}


def _get_db_uri(env):
    return env.get(
        "DB_URI", "postgresql+asyncpg://postgres:123456789@localhost:5432/hr"
    )


def _run(cmd, cwd=None):
    print(f"  > {cmd}")
    r = subprocess.run(
        cmd,
        shell=True,
        cwd=cwd or BACKEND_DIR,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        _err(f"Command failed: {cmd}")
        if r.stderr:
            print(f"  {r.stderr.strip()}")
        return False
    if r.stdout:
        print(f"  {r.stdout.strip()}")
    return True


async def _step_missing_columns(env, total):
    _p(2, total, "Adding missing columns...")

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        for col_name, col_type in MISSING_NV_COLUMNS:
            try:
                await conn.execute(
                    text(
                        f"ALTER TABLE nhan_vien ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    )
                )
            except Exception:
                pass

        for col_name, col_type in MISSING_CONG_TAC_COLUMNS:
            try:
                await conn.execute(
                    text(
                        f"ALTER TABLE nhan_vien_cong_tac ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    )
                )
            except Exception:
                pass

        try:
            await conn.execute(
                text("""
                ALTER TABLE nhan_vien DROP CONSTRAINT IF EXISTS nhan_vien_phong_ban_id_fkey,
                ADD CONSTRAINT nhan_vien_phong_ban_id_fkey
                FOREIGN KEY (phong_ban_id) REFERENCES phong_ban(id) ON DELETE SET NULL
            """)
            )
        except Exception:
            pass

        try:
            await conn.execute(
                text("""
                ALTER TABLE nhan_vien DROP CONSTRAINT IF EXISTS nhan_vien_chuc_vu_id_fkey,
                ADD CONSTRAINT nhan_vien_chuc_vu_id_fkey
                FOREIGN KEY (chuc_vu_id) REFERENCES chuc_vu(id) ON DELETE SET NULL
            """)
            )
        except Exception:
            pass

        try:
            await conn.execute(
                text("ALTER TABLE qr_config ADD COLUMN IF NOT EXISTS bat_gps BOOLEAN DEFAULT TRUE")
            )
        except Exception:
            pass

    await engine.dispose()
    _ok("Missing columns added")


async def _step_rbac(env, total):
    _p(3, total, "Seeding RBAC (roles & permissions)...")

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS roles (
                id VARCHAR(32) PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                is_system BOOLEAN NOT NULL DEFAULT FALSE,
                priority INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        )
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS permissions (
                id VARCHAR(32) PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                code VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                resource VARCHAR(50) NOT NULL,
                action VARCHAR(20) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        )
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS role_permissions (
                id VARCHAR(32) PRIMARY KEY,
                role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
                permission_id VARCHAR(32) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(role_id, permission_id)
            )
        """)
        )
        await conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS user_roles (
                id VARCHAR(32) PRIMARY KEY,
                user_id VARCHAR(32) NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
                role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, role_id)
            )
        """)
        )

        for role in ROLES:
            await conn.execute(
                text("""
                INSERT INTO roles (id, name, description, priority, is_system, is_active)
                VALUES (:id, :name, :description, :priority, :is_system, TRUE)
                ON CONFLICT (name) DO UPDATE SET
                    description = EXCLUDED.description, priority = EXCLUDED.priority
            """),
                {"id": uuid.uuid4().hex, **role},
            )

        for code, name in PERMISSION_CODES.items():
            resource, action = code.split(":")
            await conn.execute(
                text("""
                INSERT INTO permissions (id, name, code, description, resource, action, is_active)
                VALUES (:id, :name, :code, :desc, :resource, :action, TRUE)
                ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
            """),
                {
                    "id": uuid.uuid4().hex,
                    "name": name,
                    "code": code,
                    "desc": name,
                    "resource": resource,
                    "action": action,
                },
            )

        for role_name, perm_codes in ROLE_PERMISSIONS.items():
            result = await conn.execute(
                text("SELECT id FROM roles WHERE name = :name"), {"name": role_name}
            )
            role_id = result.scalar_one_or_none()
            if not role_id:
                continue

            for perm_code in perm_codes:
                result = await conn.execute(
                    text("SELECT id FROM permissions WHERE code = :code"),
                    {"code": perm_code},
                )
                perm_id = result.scalar_one_or_none()
                if perm_id:
                    await conn.execute(
                        text("""
                        INSERT INTO role_permissions (id, role_id, permission_id)
                        VALUES (:id, :role_id, :perm_id)
                        ON CONFLICT DO NOTHING
                    """),
                        {
                            "id": uuid.uuid4().hex,
                            "role_id": role_id,
                            "perm_id": perm_id,
                        },
                    )

    await engine.dispose()
    _ok(f"{len(ROLES)} roles, {len(PERMISSION_CODES)} permissions seeded")


async def _step_admin(env, total):
    _p(4, total, "Creating admin account...")

    import bcrypt
    from datetime import date
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SELECT id FROM tai_khoan WHERE ten_dang_nhap = :u"),
            {"u": ADMIN_USERNAME},
        )
        if result.scalar_one_or_none():
            _warn(f"User '{ADMIN_USERNAME}' already exists, skipping")
            await engine.dispose()
            return

        result = await conn.execute(text("SELECT id FROM roles WHERE name = 'ADMIN'"))
        admin_role_id = result.scalar_one_or_none()
        if not admin_role_id:
            _err("ADMIN role not found. Run RBAC seed first.")
            await engine.dispose()
            return

        password_hash = bcrypt.hashpw(
            ADMIN_PASSWORD.encode(), bcrypt.gensalt()
        ).decode()
        user_id = uuid.uuid4().hex

        await conn.execute(
            text("""
            INSERT INTO tai_khoan (id, ten_dang_nhap, mat_khau_hash, email, vai_tro, trang_thai, created_at, updated_at)
            VALUES (:id, :u, :pw, :email, 'admin', TRUE, NOW(), NOW())
        """),
            {
                "id": user_id,
                "u": ADMIN_USERNAME,
                "pw": password_hash,
                "email": ADMIN_EMAIL,
            },
        )

        await conn.execute(
            text("""
            INSERT INTO user_roles (id, user_id, role_id, is_active)
            VALUES (:id, :uid, :rid, TRUE)
        """),
            {"id": uuid.uuid4().hex, "uid": user_id, "rid": admin_role_id},
        )

        nhan_vien_id = uuid.uuid4().hex
        result = await conn.execute(
            text("SELECT id FROM phong_ban ORDER BY created_at LIMIT 1")
        )
        pb_id = result.scalar_one_or_none()
        result = await conn.execute(
            text("SELECT id FROM chuc_vu WHERE ma_chuc_vu = 'CV007' LIMIT 1")
        )
        cv_id = result.scalar_one_or_none()

        await conn.execute(
            text("""
            INSERT INTO nhan_vien (id, ma_nhan_vien, ho_ten, gioi_tinh, ngay_sinh, email,
                loai_nhan_vien, loai_hop_dong, trang_thai, la_dang_vien, la_doan_vien, created_at, updated_at)
            VALUES (:id, :ma, :ten, :gt, :ns, :email, 'nhan_vien', 'vien_chuc', 'dang_lam', FALSE, FALSE, NOW(), NOW())
        """),
            {
                "id": nhan_vien_id,
                "ma": "ADMIN001",
                "ten": "Administrator",
                "gt": "Nam",
                "ns": date(1990, 1, 1),
                "email": ADMIN_EMAIL,
            },
        )

        # Link tai_khoan -> nhan_vien
        await conn.execute(
            text("UPDATE tai_khoan SET nhan_vien_id = :nvid WHERE id = :uid"),
            {"nvid": nhan_vien_id, "uid": user_id},
        )

    await engine.dispose()
    _ok(f"Admin: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")


async def _step_salary(env, total):
    _p(5, total, "Seeding salary configuration...")

    from datetime import date
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SELECT COUNT(*) FROM cau_hinh_he_thong_luong")
        )
        if result.scalar() == 0:
            for cfg in SALARY_CONFIGS:
                await conn.execute(
                    text("""
                    INSERT INTO cau_hinh_he_thong_luong
                    (id, ngay_ap_dung, luong_co_so, he_so_dac_thu, ty_le_quy_thuong,
                     ty_le_bhxh, ty_le_bhyt, ty_le_bhtn, muc_giam_tru_ban_than,
                     muc_giam_tru_nguoi_phu_thuoc, trang_thai, ghi_chu, created_at, updated_at)
                    VALUES (:id, :ngay, :lcb, :hsdt, :tlt,
                            :bhxh, :bhyt, :bhtn, :mtbt,
                            :mtnpt, :tt, :gc, NOW(), NOW())
                """),
                    {
                        "id": cfg["id"],
                        "ngay": date.fromisoformat(cfg["ngay_ap_dung"]),
                        "lcb": cfg["luong_co_so"],
                        "hsdt": cfg["he_so_dac_thu"],
                        "tlt": cfg["ty_le_quy_thuong"],
                        "bhxh": cfg["ty_le_bhxh"],
                        "bhyt": cfg["ty_le_bhyt"],
                        "bhtn": cfg["ty_le_bhtn"],
                        "mtbt": cfg["muc_giam_tru_ban_than"],
                        "mtnpt": cfg["muc_giam_tru_nguoi_phu_thuoc"],
                        "tt": cfg["trang_thai"],
                        "gc": cfg["ghi_chu"],
                    },
                )
        else:
            _warn("cau_hinh_he_thong_luong already has data, skipping")

        result = await conn.execute(text("SELECT COUNT(*) FROM he_so_luong_danh_muc"))
        if result.scalar() == 0:
            for ma_ngach, ten_ngach, cap_hoc, bac, he_so in SALARY_COEFFICIENTS:
                await conn.execute(
                    text("""
                    INSERT INTO he_so_luong_danh_muc
                    (id, ma_ngach, ten_ngach, cap_hoc, bac, he_so, ngay_ap_dung, created_at, updated_at)
                    VALUES (:id, :mn, :tn, :ch, :bac, :hs, '2025-01-01', NOW(), NOW())
                """),
                    {
                        "id": uuid.uuid4().hex,
                        "mn": ma_ngach,
                        "tn": ten_ngach,
                        "ch": cap_hoc,
                        "bac": bac,
                        "hs": he_so,
                    },
                )
        else:
            _warn("he_so_luong_danh_muc already has data, skipping")

        result = await conn.execute(text("SELECT COUNT(*) FROM phu_cap_theo_cap_hoc"))
        if result.scalar() == 0:
            await conn.execute(
                text("""
                INSERT INTO phu_cap_theo_cap_hoc
                (id, cap_hoc, ty_le_pc_uu_dai, he_so_khu_vuc, ngay_ap_dung, ghi_chu, created_at, updated_at)
                VALUES (:id, 'thpt', 30.00, 0.00, '2025-01-01', 'THPT - vung thuong', NOW(), NOW())
            """),
                {"id": uuid.uuid4().hex},
            )
        else:
            _warn("phu_cap_theo_cap_hoc already has data, skipping")

    await engine.dispose()
    _ok("Salary config: 2 configs, 18 coefficients, 1 allowance")


async def _step_leave(env, total):
    _p(6, total, "Seeding leave configuration...")

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM cau_hinh_nghi_phep"))
        if result.scalar() > 0:
            _warn("cau_hinh_nghi_phep already has data, skipping")
            await engine.dispose()
            return

        for lt in LEAVE_TYPES:
            await conn.execute(
                text("""
                INSERT INTO cau_hinh_nghi_phep
                (id, loai_nghi, ten_loai, so_ngay_moi_nam, so_ngay_toi_da_mot_lan,
                 can_giay_to, bat_buoc_ghi_ly_do, trang_thai, created_at, updated_at)
                VALUES (:id, :ln, :tl, :snmn, :sntdml, :cgt, :bbgld, TRUE, NOW(), NOW())
            """),
                {
                    "id": uuid.uuid4().hex,
                    "ln": lt["loai_nghi"],
                    "tl": lt["ten_loai"],
                    "snmn": lt["so_ngay_moi_nam"],
                    "sntdml": lt["so_ngay_toi_da_mot_lan"],
                    "cgt": lt["can_giay_to"],
                    "bbgld": lt["bat_buoc_ghi_ly_do"],
                },
            )

    await engine.dispose()
    _ok(f"{len(LEAVE_TYPES)} leave types seeded")


async def _step_departments(env, total):
    _p(7, total, "Seeding departments...")

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM phong_ban"))
        if result.scalar() > 0:
            _warn("phong_ban already has data, skipping")
            await engine.dispose()
            return

        for ma, ten, loai, mo_ta in DEPARTMENTS:
            await conn.execute(
                text("""
                INSERT INTO phong_ban (id, ma_phong_ban, ten_phong_ban, loai, mo_ta, trang_thai, created_at, updated_at)
                VALUES (:id, :ma, :ten, :loai, :mo_ta, TRUE, NOW(), NOW())
            """),
                {
                    "id": uuid.uuid4().hex,
                    "ma": ma,
                    "ten": ten,
                    "loai": loai,
                    "mo_ta": mo_ta,
                },
            )

    await engine.dispose()
    _ok(f"{len(DEPARTMENTS)} departments seeded")


async def _step_positions(env, total):
    _p(8, total, "Seeding positions...")

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM chuc_vu"))
        if result.scalar() > 0:
            _warn("chuc_vu already has data, skipping")
            await engine.dispose()
            return

        for ma, ten, cap_bac, hspc, loai, mo_ta, tieu_chuan in POSITIONS:
            await conn.execute(
                text("""
                INSERT INTO chuc_vu
                (id, ma_chuc_vu, ten_chuc_vu, he_so_phu_cap, mo_ta, tieu_chuan, trang_thai, cap_bac, loai, created_at, updated_at)
                VALUES (:id, :ma, :ten, :hspc, :mo_ta, :tc, TRUE, :cb, :loai, NOW(), NOW())
            """),
                {
                    "id": uuid.uuid4().hex,
                    "ma": ma,
                    "ten": ten,
                    "hspc": hspc,
                    "mo_ta": mo_ta,
                    "tc": tieu_chuan,
                    "cb": cap_bac,
                    "loai": loai,
                },
            )

    await engine.dispose()
    _ok(f"{len(POSITIONS)} positions seeded")


async def _step_lich_cham_cong(env, total):
    _p(9, total, "Seeding attendance schedule...")

    from datetime import time
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM lich_cham_cong"))
        if result.scalar() > 0:
            _warn("lich_cham_cong already has data, skipping")
            await engine.dispose()
            return

        await conn.execute(
            text("""
            INSERT INTO lich_cham_cong
            (id, gio_check_in, gio_check_out, ngay_lam_viec, bat_gps, ban_kinh_cho_phep, trang_thai, created_at, updated_at)
            VALUES (:id, :gin, :gout, :nlv, :gps, :bkph, :tt, NOW(), NOW())
        """),
            {
                "id": uuid.uuid4().hex,
                "gin": time.fromisoformat(LICH_CHAM_CONG_DEFAULT["gio_check_in"]),
                "gout": time.fromisoformat(LICH_CHAM_CONG_DEFAULT["gio_check_out"]),
                "nlv": LICH_CHAM_CONG_DEFAULT["ngay_lam_viec"],
                "gps": LICH_CHAM_CONG_DEFAULT["bat_gps"],
                "bkph": LICH_CHAM_CONG_DEFAULT["ban_kinh_cho_phep"],
                "tt": LICH_CHAM_CONG_DEFAULT["trang_thai"],
            },
        )

    await engine.dispose()
    _ok("Default attendance schedule created")


async def _step_thuong_tet(env, total):
    _p(10, total, "Seeding Tet bonus configuration...")

    from datetime import date
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    engine = create_async_engine(_get_db_uri(env), echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT COUNT(*) FROM cau_hinh_thuong_tet"))
        if result.scalar() > 0:
            _warn("cau_hinh_thuong_tet already has data, skipping")
            await engine.dispose()
            return

        await conn.execute(
            text("""
            INSERT INTO cau_hinh_thuong_tet
            (id, nam, ty_le_thuong, bat_len, ngay_ap_dung, ghi_chu, created_at, updated_at)
            VALUES (:id, :nam, :tlt, :bl, :nad, :gc, NOW(), NOW())
        """),
            {
                "id": uuid.uuid4().hex,
                "nam": CAU_HINH_THUONG_TET_DEFAULT["nam"],
                "tlt": CAU_HINH_THUONG_TET_DEFAULT["ty_le_thuong"],
                "bl": CAU_HINH_THUONG_TET_DEFAULT["bat_len"],
                "nad": date.fromisoformat(CAU_HINH_THUONG_TET_DEFAULT["ngay_ap_dung"]) if CAU_HINH_THUONG_TET_DEFAULT["ngay_ap_dung"] else None,
                "gc": CAU_HINH_THUONG_TET_DEFAULT["ghi_chu"],
            },
        )

    await engine.dispose()
    _ok("Default Tet bonus config created")


async def main():
    total = 10
    env = _load_env()

    print(f"\n{'=' * 60}")
    print("  HR MANAGEMENT - DATABASE INITIALIZATION")
    print(f"{'=' * 60}")

    _p(1, total, "Running Alembic migrations...")
    _run("alembic upgrade head")

    await _step_missing_columns(env, total)
    await _step_rbac(env, total)
    await _step_admin(env, total)
    await _step_salary(env, total)
    await _step_leave(env, total)
    await _step_departments(env, total)
    await _step_positions(env, total)
    await _step_lich_cham_cong(env, total)
    await _step_thuong_tet(env, total)

    print(f"\n{'=' * 60}")
    _ok("INITIALIZATION COMPLETED!")
    print(f"{'=' * 60}")
    print(f"""
  Next steps:
    1. cd backend && uv run python main.py
    2. cd frontend && npm run dev
    3. Login: {ADMIN_USERNAME} / {ADMIN_PASSWORD}
    """)


if __name__ == "__main__":
    asyncio.run(main())
