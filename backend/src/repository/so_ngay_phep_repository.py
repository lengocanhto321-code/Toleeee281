from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.so_ngay_phep import SoNgayPhep


class SoNgayPhepRepository:
    """Repository for SoNgayPhep model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, so_ngay_phep: SoNgayPhep) -> SoNgayPhep:
        """Create a new SoNgayPhep record."""
        self._session.add(so_ngay_phep)
        await self._session.flush()
        await self._session.refresh(so_ngay_phep)
        return so_ngay_phep

    async def find_by_id(self, id: str) -> Optional[SoNgayPhep]:
        """Find SoNgayPhep by ID."""
        result = await self._session.execute(
            select(SoNgayPhep).where(SoNgayPhep.id == id)
        )
        return result.scalar_one_or_none()

    async def find_by_nhan_vien_nam(
        self, nhan_vien_id: str, nam: int
    ) -> Optional[SoNgayPhep]:
        """Find SoNgayPhep by nhan_vien_id and nam."""
        result = await self._session.execute(
            select(SoNgayPhep).where(
                SoNgayPhep.nhan_vien_id == nhan_vien_id,
                SoNgayPhep.nam == nam,
            )
        )
        return result.scalar_one_or_none()

    async def find_or_create(
        self, nhan_vien_id: str, nam: int, so_ngay_phep_mac_dinh: float = 12
    ) -> SoNgayPhep:
        """Find or create SoNgayPhep for nhan_vien and year."""
        existing = await self.find_by_nhan_vien_nam(nhan_vien_id, nam)
        if existing:
            return existing

        from src.domain.models.base import generate_uuid
        from decimal import Decimal

        so_ngay_phep = SoNgayPhep(
            id=generate_uuid(),
            nhan_vien_id=nhan_vien_id,
            nam=nam,
            phep_nam_duoc_phep=Decimal(str(so_ngay_phep_mac_dinh)),
            phep_nam_da_su_dung=Decimal("0"),
            phep_nam_con_lai=Decimal(str(so_ngay_phep_mac_dinh)),
        )
        return await self.create(so_ngay_phep)

    async def update_con_lai(
        self, id: str, phep_nam_da_su_dung: float, phep_nam_con_lai: float
    ) -> Optional[SoNgayPhep]:
        """Update phep_nam_da_su_dung and phep_nam_con_lai."""
        from decimal import Decimal

        so_ngay_phep = await self.find_by_id(id)
        if so_ngay_phep:
            so_ngay_phep.phep_nam_da_su_dung = Decimal(str(phep_nam_da_su_dung))
            so_ngay_phep.phep_nam_con_lai = Decimal(str(phep_nam_con_lai))
            await self._session.flush()
            await self._session.refresh(so_ngay_phep)
        return so_ngay_phep

    async def get_all_by_nam(self, nam: int) -> List[SoNgayPhep]:
        """Get all SoNgayPhep for a year."""
        result = await self._session.execute(
            select(SoNgayPhep).where(SoNgayPhep.nam == nam)
        )
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nam: Optional[int] = None,
    ) -> Tuple[int, List[SoNgayPhep]]:
        """Get paginated list of SoNgayPhep records."""
        query = select(SoNgayPhep)
        count_query = select(func.count(SoNgayPhep.id))

        if nam:
            query = query.where(SoNgayPhep.nam == nam)
            count_query = count_query.where(SoNgayPhep.nam == nam)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(SoNgayPhep.nam.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items
