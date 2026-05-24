from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error
from src.domain.models.lich_su_chuc_vu import LichSuChucVu


class LichSuChucVuRepository:
    """Repository for LichSuChucVu model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[LichSuChucVu]:
        """Alias for find_by_nhan_vien_id."""
        return await self.find_by_nhan_vien_id(nhan_vien_id)

    async def create(self, lich_su: LichSuChucVu) -> LichSuChucVu:
        """Create a new LichSuChucVu record."""
        self._session.add(lich_su)
        await self._session.flush()
        await self._session.refresh(lich_su)
        return lich_su

    async def find_by_nhan_vien_id(
        self, nhan_vien_id: str, include_closed: bool = False
    ) -> List[LichSuChucVu]:
        """Find all LichSuChucVu for a nhan_vien."""
        stmt = select(LichSuChucVu).where(LichSuChucVu.nhan_vien_id == nhan_vien_id)
        if not include_closed:
            stmt = stmt.where(LichSuChucVu.den_ngay.is_(None))
        stmt = stmt.order_by(LichSuChucVu.tu_ngay.desc())
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_paginated(
        self,
        nhan_vien_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> Result[Tuple[int, List[dict]], Error]:
        """Get paginated list of LichSuChucVu."""
        base_stmt = select(LichSuChucVu)

        if nhan_vien_id:
            base_stmt = base_stmt.where(LichSuChucVu.nhan_vien_id == nhan_vien_id)

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Pagination
        base_stmt = base_stmt.order_by(LichSuChucVu.tu_ngay.desc())
        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        try:
            result = await self._session.execute(base_stmt)
            items_list = result.scalars().all()

            items = []
            for item in items_list:
                d = {c.key: getattr(item, c.key) for c in item.__table__.columns}
                items.append(d)

            return Return.ok((total, items))
        except Exception as e:
            return Return.err(
                Error(
                    code="database_error",
                    message=f"Lỗi truy vấn: {str(e)}",
                    reason="DatabaseError",
                )
            )

    async def update(self, lich_su: LichSuChucVu) -> LichSuChucVu:
        """Update LichSuChucVu."""
        await self._session.flush()
        await self._session.refresh(lich_su)
        return lich_su

    async def delete(self, lich_su: LichSuChucVu) -> LichSuChucVu:
        """Delete LichSuChucVu."""
        await self._session.delete(lich_su)
        await self._session.flush()
        return lich_su
