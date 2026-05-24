#!/usr/bin/env python3
"""
Script khởi tạo RBAC - Roles và Permissions cho hệ thống HR Management

Sử dụng trực tiếp SQLAlchemy async

Usage:
    cd backend
    python scripts/init_rbac.py

Author: HR Management System
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime

import yaml
from sqlalchemy import text, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Load config from env.yaml
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "env.yaml")
if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE) as f:
        env_config = yaml.safe_load(f)
        DATABASE_URL = env_config.get(
            "DB_URI", "postgresql+asyncpg://postgres:123456789@localhost:5432/hr"
        )
else:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:123456789@localhost:5432/hr",
    )

SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "")

ROLES = [
    {
        "name": "ADMIN",
        "description": "Quản trị viên",
        "priority": 100,
        "is_system": True,
    },
    {
        "name": "HIEU_TRUONG",
        "description": "Hiệu trưởng",
        "priority": 90,
        "is_system": True,
    },
    {"name": "HIEU_PHO", "description": "Hiệu phó", "priority": 80, "is_system": True},
    {
        "name": "TO_TRUONG",
        "description": "Tổ trưởng",
        "priority": 70,
        "is_system": True,
    },
    {
        "name": "GIAO_VIEN",
        "description": "Giáo viên",
        "priority": 50,
        "is_system": True,
    },
    {
        "name": "NHAN_VIEN",
        "description": "Nhân viên",
        "priority": 40,
        "is_system": True,
    },
]

PERMISSION_CODES = {
    "nhan_vien:read": "Xem danh sách nhân viên",
    "nhan_vien:create": "Tạo nhân viên mới",
    "nhan_vien:update": "Cập nhật thông tin nhân viên",
    "nhan_vien:delete": "Xóa nhân viên",
    "phong_ban:read": "Xem phòng ban",
    "phong_ban:create": "Tạo phòng ban",
    "phong_ban:update": "Cập nhật phòng ban",
    "phong_ban:delete": "Xóa phòng ban",
    "chuc_vu:read": "Xem chức vụ",
    "chuc_vu:create": "Tạo chức vụ",
    "chuc_vu:update": "Cập nhật chức vụ",
    "chuc_vu:delete": "Xóa chức vụ",
    "luong:read": "Xem bảng lương",
    "luong:manage": "Quản lý lương",
    "luong:export": "Xuất bảng lương",
    "luong:view_own": "Xem lương cá nhân",
    "cham_cong:read": "Xem chấm công",
    "cham_cong:manage": "Quản lý chấm công",
    "cham_cong:export": "Xuất bảng chấm công",
    "cham_cong:view_own": "Xem chấm công cá nhân",
    "nghi_phep:read": "Xem đơn nghỉ phép",
    "nghi_phep:approve": "Duyệt đơn nghỉ phép",
    "nghi_phep:manage": "Quản lý nghỉ phép",
    "nghi_phep:create": "Tạo đơn nghỉ phép",
    "nghi_phep:view_own": "Xem đơn nghỉ phép cá nhân",
    "dashboard:view_admin": "Xem dashboard quản trị",
    "dashboard:view_employee": "Xem dashboard nhân viên",
    "profile:read": "Xem hồ sơ",
    "profile:update": "Cập nhật hồ sơ",
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
        "nghi_phep:read",
        "nghi_phep:approve",
        "nghi_phep:manage",
        "dashboard:view_admin",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
    ],
    "HIEU_TRUONG": [
        "nhan_vien:read",
        "nhan_vien:create",
        "nhan_vien:update",
        "phong_ban:read",
        "luong:read",
        "luong:export",
        "cham_cong:read",
        "cham_cong:manage",
        "cham_cong:export",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
    ],
    "HIEU_PHO": [
        "nhan_vien:read",
        "phong_ban:read",
        "luong:read",
        "cham_cong:read",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
    ],
    "TO_TRUONG": [
        "nhan_vien:read",
        "phong_ban:read",
        "cham_cong:read",
        "cham_cong:manage",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
    ],
    "GIAO_VIEN": [
        "luong:view_own",
        "cham_cong:view_own",
        "nghi_phep:create",
        "nghi_phep:view_own",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
    ],
    "NHAN_VIEN": [
        "luong:view_own",
        "cham_cong:view_own",
        "nghi_phep:create",
        "nghi_phep:view_own",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
    ],
}


def generate_uuid():
    return uuid.uuid4().hex


async def init_rbac():
    print("=" * 60)
    print("HR MANAGEMENT - RBAC INITIALIZATION SCRIPT")
    print("=" * 60)
    print(f"Database: {DATABASE_URL}")

    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        try:
            print("\n[1/4] Tạo RBAC tables...")
            await create_rbac_tables(session)

            print("\n[2/4] Tạo Permissions...")
            permissions = await create_permissions(session)

            print("\n[3/4] Tạo Roles...")
            roles = await create_roles(session)

            print("\n[4/4] Gán Permissions cho Roles...")
            await assign_permissions_to_roles(session, roles, permissions)

            await session.commit()

            print("\n" + "=" * 60)
            print("RBAC INITIALIZATION COMPLETED SUCCESSFULLY!")
            print("=" * 60)

            print("\n--- SUMMARY ---")
            print(f"Total Roles: {len(roles)}")
            print(f"Total Permissions: {len(permissions)}")
            print("\nRoles created:")
            for role in roles:
                print(f"  - {role['name']}: {role['description']}")

            print("\nPermissions by resource:")
            perm_by_resource = {}
            for p in permissions:
                resource = p["code"].split(":")[0]
                if resource not in perm_by_resource:
                    perm_by_resource[resource] = []
                perm_by_resource[resource].append(p["code"])

            for resource, perms in perm_by_resource.items():
                print(f"  {resource}:")
                for p in perms:
                    print(f"    - {p}")

        except Exception as e:
            await session.rollback()
            print(f"\n[ERROR] {e}")
            raise
        finally:
            await engine.dispose()


async def create_rbac_tables(session):
    tables_sql = [
        """
        CREATE TABLE IF NOT EXISTS roles (
            id VARCHAR(32) PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            is_system BOOLEAN NOT NULL DEFAULT FALSE,
            priority INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS permissions (
            id VARCHAR(32) PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            code VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            resource VARCHAR(50) NOT NULL,
            action VARCHAR(20) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS role_permissions (
            id VARCHAR(32) PRIMARY KEY,
            role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
            permission_id VARCHAR(32) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(role_id, permission_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_roles (
            id VARCHAR(32) PRIMARY KEY,
            user_id VARCHAR(32) NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
            role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, role_id)
        )
        """,
    ]

    for sql in tables_sql:
        await session.execute(text(sql))

    index_sqls = [
        "CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)",
        "CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id)",
        "CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id)",
    ]

    for sql in index_sqls:
        try:
            await session.execute(text(sql))
        except:
            pass

    print("  RBAC tables created/verified.")


async def create_permissions(session) -> list:
    permissions = []

    for code, name in PERMISSION_CODES.items():
        resource, action = code.split(":")

        result = await session.execute(
            text("SELECT id FROM permissions WHERE code = :code"), {"code": code}
        )
        existing = result.scalar_one_or_none()

        if existing:
            await session.execute(
                text("""
                    UPDATE permissions 
                    SET name = :name, description = :description, 
                        resource = :resource, action = :action
                    WHERE code = :code
                """),
                {
                    "code": code,
                    "name": name,
                    "description": name,
                    "resource": resource,
                    "action": action,
                },
            )
            print(f"  Updated: {code}")
        else:
            perm_id = generate_uuid()
            await session.execute(
                text("""
                    INSERT INTO permissions (id, name, code, description, resource, action, is_active)
                    VALUES (:id, :name, :code, :description, :resource, :action, TRUE)
                """),
                {
                    "id": perm_id,
                    "name": name,
                    "code": code,
                    "description": name,
                    "resource": resource,
                    "action": action,
                },
            )
            print(f"  Created: {code}")

        permissions.append({"code": code, "name": name, "resource": resource})

    await session.flush()
    return permissions


async def create_roles(session) -> list:
    roles = []

    for role_data in ROLES:
        result = await session.execute(
            text("SELECT id FROM roles WHERE name = :name"), {"name": role_data["name"]}
        )
        existing = result.scalar_one_or_none()

        if existing:
            await session.execute(
                text("""
                    UPDATE roles 
                    SET description = :description, priority = :priority,
                        is_system = :is_system
                    WHERE name = :name
                """),
                {
                    "name": role_data["name"],
                    "description": role_data["description"],
                    "priority": role_data["priority"],
                    "is_system": role_data["is_system"],
                },
            )
            print(f"  Updated: {role_data['name']}")
            roles.append({"id": existing, "name": role_data["name"]})
        else:
            role_id = generate_uuid()
            await session.execute(
                text("""
                    INSERT INTO roles (id, name, description, priority, is_system, is_active)
                    VALUES (:id, :name, :description, :priority, :is_system, TRUE)
                """),
                {
                    "id": role_id,
                    "name": role_data["name"],
                    "description": role_data["description"],
                    "priority": role_data["priority"],
                    "is_system": role_data["is_system"],
                },
            )
            print(f"  Created: {role_data['name']}")
            roles.append({"id": role_id, "name": role_data["name"]})

    await session.flush()
    return roles


async def assign_permissions_to_roles(session, roles, permissions):
    perm_by_code = {p["code"]: p for p in permissions}
    role_by_name = {r["name"]: r for r in roles}

    assigned_count = 0

    for role_name, perm_codes in ROLE_PERMISSIONS.items():
        role = role_by_name.get(role_name)
        if not role:
            print(f"  [WARN] Role {role_name} not found, skipping...")
            continue

        for perm_code in perm_codes:
            perm = perm_by_code.get(perm_code)
            if not perm:
                print(f"  [WARN] Permission {perm_code} not found, skipping...")
                continue

            result = await session.execute(
                text("""
                    SELECT id FROM role_permissions 
                    WHERE role_id = :role_id AND permission_id = :perm_id
                """),
                {
                    "role_id": role["id"],
                    "perm_id": perm["code"],
                },
            )
            existing = result.scalar_one_or_none()

            if not existing:
                await session.execute(
                    text("""
                        INSERT INTO role_permissions (id, role_id, permission_id)
                        VALUES (:id, :role_id, :perm_id)
                    """),
                    {
                        "id": generate_uuid(),
                        "role_id": role["id"],
                        "perm_id": perm["code"],
                    },
                )
                assigned_count += 1

    print(f"  Assigned {assigned_count} role-permission mappings.")


if __name__ == "__main__":
    asyncio.run(init_rbac())
