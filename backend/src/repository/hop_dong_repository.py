from typing import Optional, List
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.hop_dong import HopDong


class HopDongRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def generate_so_hop_dong(self) -> str:
        year = date.today().year
        prefix = f"HD-{year}-"
        result = await self._session.execute(select(func.count()).select_from(HopDong))
        count = (result.scalar() or 0) + 1
        return f"{prefix}{count:03d}"

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[HopDong]:
        """Alias for get_by_nhan_vien_id - get all contracts by employee ID."""
        return await self.get_by_nhan_vien_id(nhan_vien_id)

    async def get_by_nhan_vien_id(self, nhan_vien_id: str) -> List[HopDong]:
        result = await self._session.execute(
            select(HopDong)
            .where(HopDong.nhan_vien_id == nhan_vien_id)
            .order_by(HopDong.ngay_bat_dau.desc())
        )
        return list(result.scalars().all())

    async def get_dang_hieu_luc_by_nhan_vien(self, nhan_vien_id: str) -> List[HopDong]:
        result = await self._session.execute(
            select(HopDong)
            .where(
                HopDong.nhan_vien_id == nhan_vien_id,
                HopDong.trang_thai == "dang_hieu_luc",
            )
            .order_by(HopDong.ngay_bat_dau.desc())
        )
        return list(result.scalars().all())

    async def find_by_id(self, id: str) -> Optional[HopDong]:
        result = await self._session.execute(select(HopDong).where(HopDong.id == id))
        return result.scalar_one_or_none()

    async def create(self, hop_dong: HopDong) -> HopDong:
        self._session.add(hop_dong)
        await self._session.flush()
        await self._session.refresh(hop_dong)
        return hop_dong

    async def update(self, hop_dong: HopDong) -> HopDong:
        await self._session.flush()
        await self._session.refresh(hop_dong)
        return hop_dong

    async def delete(self, id: str) -> bool:
        hop_dong = await self.find_by_id(id)
        if hop_dong:
            await self._session.delete(hop_dong)
            await self._session.flush()
            return True
        return False

    async def get_paginated(
        self,
        nhan_vien_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> tuple[int, List[dict]]:
        base_stmt = select(HopDong)

        if nhan_vien_id:
            base_stmt = base_stmt.where(HopDong.nhan_vien_id == nhan_vien_id)

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Pagination and ordering
        base_stmt = base_stmt.order_by(HopDong.ngay_bat_dau.desc())
        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self._session.execute(base_stmt)
        items = result.scalars().all()
        return total, list(items)
