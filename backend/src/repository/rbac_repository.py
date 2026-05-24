from typing import Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.domain.models.rbac import Role, Permission, RolePermission, UserRole
from src.domain.models.tai_khoan import TaiKhoan


class RBACRepository:
    """Repository for RBAC operations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_role_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        result = await self._session.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def get_role_by_id(self, id: str) -> Optional[Role]:
        """Get role by ID."""
        result = await self._session.execute(select(Role).where(Role.id == id))
        return result.scalar_one_or_none()

    async def get_all_roles(self) -> list[Role]:
        """Get all roles."""
        result = await self._session.execute(
            select(Role).order_by(Role.priority.desc())
        )
        return list(result.scalars().all())

    async def get_permission_by_code(self, code: str) -> Optional[Permission]:
        """Get permission by code."""
        result = await self._session.execute(
            select(Permission).where(Permission.code == code)
        )
        return result.scalar_one_or_none()

    async def get_permission_by_id(self, id: str) -> Optional[Permission]:
        """Get permission by ID."""
        result = await self._session.execute(
            select(Permission).where(Permission.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all_permissions(self) -> list[Permission]:
        """Get all permissions."""
        result = await self._session.execute(
            select(Permission).order_by(Permission.resource, Permission.action)
        )
        return list(result.scalars().all())

    async def create_role(self, role: Role) -> Role:
        """Create a new role."""
        self._session.add(role)
        await self._session.flush()
        await self._session.refresh(role)
        return role

    async def create_permission(self, permission: Permission) -> Permission:
        """Create a new permission."""
        self._session.add(permission)
        await self._session.flush()
        await self._session.refresh(permission)
        return permission

    async def assign_role_to_user(self, user_id: str, role_id: str) -> UserRole:
        """Assign a role to a user."""
        user_role = UserRole(user_id=user_id, role_id=role_id, is_active=True)
        self._session.add(user_role)
        await self._session.flush()
        await self._session.refresh(user_role)
        return user_role

    async def get_user_roles(self, user_id: str) -> list[Role]:
        """Get all roles assigned to a user."""
        result = await self._session.execute(
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                and_(
                    UserRole.user_id == user_id,
                    UserRole.is_active == True,
                    Role.is_active == True,
                )
            )
        )
        return list(result.scalars().all())

    async def get_user_permissions(self, user_id: str) -> list[Permission]:
        """Get all permissions for a user through their roles."""
        result = await self._session.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                and_(
                    UserRole.user_id == user_id,
                    UserRole.is_active == True,
                    Role.is_active == True,
                    Permission.is_active == True,
                )
            )
            .distinct()
        )
        return list(result.scalars().all())

    async def user_has_permission(self, user_id: str, permission_code: str) -> bool:
        """Check if user has a specific permission."""
        result = await self._session.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                and_(
                    UserRole.user_id == user_id,
                    UserRole.is_active == True,
                    Role.is_active == True,
                    Permission.is_active == True,
                    Permission.code == permission_code,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def role_has_permission(self, role_id: str, permission_id: str) -> bool:
        """Check if a role has a specific permission."""
        result = await self._session.execute(
            select(RolePermission).where(
                and_(
                    RolePermission.role_id == role_id,
                    RolePermission.permission_id == permission_id,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def assign_permission_to_role(
        self, role_id: str, permission_id: str
    ) -> RolePermission:
        """Assign a permission to a role."""
        role_permission = RolePermission(role_id=role_id, permission_id=permission_id)
        self._session.add(role_permission)
        await self._session.flush()
        await self._session.refresh(role_permission)
        return role_permission

    async def get_tai_khoan_by_id(self, id: str) -> Optional[TaiKhoan]:
        """Get TaiKhoan with roles loaded."""
        result = await self._session.execute(
            select(TaiKhoan)
            .options(selectinload(TaiKhoan.roles).selectinload(Role.permissions))
            .where(TaiKhoan.id == id)
        )
        return result.scalar_one_or_none()

    async def get_tai_khoan_by_nhan_vien_id(
        self, nhan_vien_id: str
    ) -> Optional[TaiKhoan]:
        """Get TaiKhoan by nhan_vien_id with roles loaded."""
        result = await self._session.execute(
            select(TaiKhoan)
            .options(selectinload(TaiKhoan.roles).selectinload(Role.permissions))
            .where(TaiKhoan.nhan_vien_id == nhan_vien_id)
        )
        return result.scalar_one_or_none()
