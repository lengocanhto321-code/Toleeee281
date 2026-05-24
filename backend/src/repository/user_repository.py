from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.tai_khoan import TaiKhoan


class UserRepository:
    """Repository for TaiKhoan (User Account) model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, tai_khoan: TaiKhoan) -> TaiKhoan:
        """Create a new TaiKhoan."""
        self._session.add(tai_khoan)
        await self._session.flush()
        await self._session.refresh(tai_khoan)
        return tai_khoan

    async def find_by_id(self, id: str) -> Optional[TaiKhoan]:
        """Find user by ID."""
        result = await self._session.execute(select(TaiKhoan).where(TaiKhoan.id == id))
        return result.scalar_one_or_none()

    async def find_by_username(self, username: str) -> Optional[TaiKhoan]:
        """Find user by username (ten_dang_nhap)."""
        result = await self._session.execute(
            select(TaiKhoan).where(TaiKhoan.ten_dang_nhap == username)
        )
        return result.scalar_one_or_none()

    async def find_by_email(self, email: str) -> Optional[TaiKhoan]:
        result = await self._session.execute(
            select(TaiKhoan).where(TaiKhoan.email == email)
        )
        return result.scalar_one_or_none()

    async def find_by_nhan_vien_id(self, nhan_vien_id: str) -> Optional[TaiKhoan]:
        result = await self._session.execute(
            select(TaiKhoan).where(TaiKhoan.nhan_vien_id == nhan_vien_id)
        )
        return result.scalar_one_or_none()

    async def username_exists(self, username: str) -> bool:
        """Check if username already exists."""
        result = await self._session.execute(
            select(TaiKhoan.id).where(TaiKhoan.ten_dang_nhap == username)
        )
        return result.scalar_one_or_none() is not None

    async def email_exists(self, email: str) -> bool:
        """Check if email already exists."""
        result = await self._session.execute(
            select(TaiKhoan.id).where(TaiKhoan.email == email)
        )
        return result.scalar_one_or_none() is not None

    async def find_by_role(self, vai_tro: str, limit: int = 100) -> list[TaiKhoan]:
        """Find users by role (vai_tro)."""
        result = await self._session.execute(
            select(TaiKhoan).where(TaiKhoan.vai_tro == vai_tro).limit(limit)
        )
        return list(result.scalars().all())

    async def find_active_users(self, limit: int = 100) -> list[TaiKhoan]:
        """Find all active users."""
        result = await self._session.execute(
            select(TaiKhoan).where(TaiKhoan.trang_thai == True).limit(limit)
        )
        return list(result.scalars().all())

    async def find_admins(self) -> list[TaiKhoan]:
        """Find all admin users."""
        return await self.find_by_role("admin")
