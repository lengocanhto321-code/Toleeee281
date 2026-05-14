from typing import Optional, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.nhan_vien import TaiLieuNhanVien


class TaiLieuRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, tai_lieu: TaiLieuNhanVien) -> TaiLieuNhanVien:
        """Create a new document record."""
        self._session.add(tai_lieu)
        await self._session.flush()
        await self._session.refresh(tai_lieu)
        return tai_lieu

    async def find_by_id(self, id: str) -> Optional[TaiLieuNhanVien]:
        """Find document by ID."""
        stmt = select(TaiLieuNhanVien).where(
            and_(TaiLieuNhanVien.id == id, TaiLieuNhanVien.deleted_at.is_(None))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def find_by_nhan_vien(
        self,
        nhan_vien_id: str,
        loai_tai_lieu: Optional[str] = None,
        trang_thai: Optional[str] = None,
    ) -> List[TaiLieuNhanVien]:
        """Find all documents for a staff member."""
        stmt = select(TaiLieuNhanVien).where(
            and_(
                TaiLieuNhanVien.nhan_vien_id == nhan_vien_id,
                TaiLieuNhanVien.deleted_at.is_(None),
            )
        )

        if loai_tai_lieu:
            stmt = stmt.where(TaiLieuNhanVien.loai_tai_lieu == loai_tai_lieu)
        if trang_thai:
            stmt = stmt.where(TaiLieuNhanVien.trang_thai == trang_thai)

        stmt = stmt.order_by(TaiLieuNhanVien.created_at.desc())
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nhan_vien_id: Optional[str] = None,
        loai_tai_lieu: Optional[str] = None,
        trang_thai: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[int, List[TaiLieuNhanVien]]:
        """Get paginated list of documents."""
        base_stmt = select(TaiLieuNhanVien).where(TaiLieuNhanVien.deleted_at.is_(None))

        if nhan_vien_id:
            base_stmt = base_stmt.where(TaiLieuNhanVien.nhan_vien_id == nhan_vien_id)
        if loai_tai_lieu:
            base_stmt = base_stmt.where(TaiLieuNhanVien.loai_tai_lieu == loai_tai_lieu)
        if trang_thai:
            base_stmt = base_stmt.where(TaiLieuNhanVien.trang_thai == trang_thai)
        if search:
            base_stmt = base_stmt.where(
                TaiLieuNhanVien.ten_tai_lieu.ilike(f"%{search}%")
            )

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        paginated_stmt = (
            base_stmt.order_by(TaiLieuNhanVien.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self._session.execute(paginated_stmt)
        return total, list(result.scalars().all())

    async def update(self, tai_lieu: TaiLieuNhanVien) -> TaiLieuNhanVien:
        """Update document record."""
        await self._session.flush()
        await self._session.refresh(tai_lieu)
        return tai_lieu

    async def delete(self, tai_lieu: TaiLieuNhanVien) -> TaiLieuNhanVien:
        """Soft-delete document by setting deleted_at."""
        from libs.datetime import get_utc_now

        tai_lieu.deleted_at = get_utc_now()
        await self._session.flush()
        await self._session.refresh(tai_lieu)
        return tai_lieu

    async def hard_delete(self, tai_lieu: TaiLieuNhanVien) -> None:
        """Permanently delete document."""
        await self._session.delete(tai_lieu)
        await self._session.flush()
