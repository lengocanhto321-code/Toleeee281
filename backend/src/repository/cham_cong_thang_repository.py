from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.cham_cong_thang import ChamCongThang


class ChamCongThangRepository:
    """Repository for ChamCongThang model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, cham_cong: ChamCongThang) -> ChamCongThang:
        """Create a new ChamCongThang record."""
        self._session.add(cham_cong)
        await self._session.flush()
        await self._session.refresh(cham_cong)
        return cham_cong

    async def find_by_id(self, id: str) -> Optional[ChamCongThang]:
        """Find ChamCongThang by ID."""
        result = await self._session.execute(
            select(ChamCongThang).where(ChamCongThang.id == id)
        )
        return result.scalar_one_or_none()

    async def find_by_nhan_vien_thang_nam(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> Optional[ChamCongThang]:
        """Find ChamCongThang by nhan_vien_id, thang, and nam."""
        result = await self._session.execute(
            select(ChamCongThang).where(
                ChamCongThang.nhan_vien_id == nhan_vien_id,
                ChamCongThang.thang == thang,
                ChamCongThang.nam == nam,
            )
        )
        return result.scalar_one_or_none()

    async def find_or_create(
        self,
        nhan_vien_id: str,
        thang: int,
        nam: int,
        so_ngay_lam_chuan: float = 26,
    ) -> Tuple[ChamCongThang, bool]:
        """Find or create ChamCongThang. Returns (record, created)."""
        from decimal import Decimal

        existing = await self.find_by_nhan_vien_thang_nam(nhan_vien_id, thang, nam)
        if existing:
            return existing, False

        from src.domain.models.base import generate_uuid

        cham_cong = ChamCongThang(
            id=generate_uuid(),
            nhan_vien_id=nhan_vien_id,
            thang=thang,
            nam=nam,
            so_ngay_lam_chuan=Decimal(str(so_ngay_lam_chuan)),
            so_ngay_co_mat=Decimal("0"),
            so_ngay_vang_co_phep=Decimal("0"),
            so_ngay_vang_khong_phep=Decimal("0"),
            so_ngay_nghi_le_tet=Decimal("0"),
            so_ngay_cong_tac=Decimal("0"),
            he_so_ngay_cong=Decimal("1.0"),
            trang_thai="da_mock",
        )
        return await self.create(cham_cong), True

    async def update(
        self,
        id: str,
        so_ngay_co_mat: float,
        so_ngay_vang_co_phep: float,
        so_ngay_vang_khong_phep: float,
        so_ngay_nghi_le_tet: float,
        so_ngay_cong_tac: float,
        he_so_ngay_cong: float,
    ) -> Optional[ChamCongThang]:
        """Update ChamCongThang."""
        from decimal import Decimal

        cham_cong = await self.find_by_id(id)
        if cham_cong:
            cham_cong.so_ngay_co_mat = Decimal(str(so_ngay_co_mat))
            cham_cong.so_ngay_vang_co_phep = Decimal(str(so_ngay_vang_co_phep))
            cham_cong.so_ngay_vang_khong_phep = Decimal(str(so_ngay_vang_khong_phep))
            cham_cong.so_ngay_nghi_le_tet = Decimal(str(so_ngay_nghi_le_tet))
            cham_cong.so_ngay_cong_tac = Decimal(str(so_ngay_cong_tac))
            cham_cong.he_so_ngay_cong = Decimal(str(he_so_ngay_cong))
            await self._session.flush()
            await self._session.refresh(cham_cong)
        return cham_cong

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nhan_vien_id: Optional[str] = None,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Tuple[int, List[ChamCongThang]]:
        """Get paginated list of ChamCongThang records."""
        query = select(ChamCongThang)
        count_query = select(func.count(ChamCongThang.id))

        if nhan_vien_id:
            query = query.where(ChamCongThang.nhan_vien_id == nhan_vien_id)
            count_query = count_query.where(ChamCongThang.nhan_vien_id == nhan_vien_id)
        if thang:
            query = query.where(ChamCongThang.thang == thang)
            count_query = count_query.where(ChamCongThang.thang == thang)
        if nam:
            query = query.where(ChamCongThang.nam == nam)
            count_query = count_query.where(ChamCongThang.nam == nam)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(ChamCongThang.nam.desc(), ChamCongThang.thang.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def get_all_by_thang_nam(self, thang: int, nam: int) -> List[ChamCongThang]:
        """Get all ChamCongThang for a month."""
        result = await self._session.execute(
            select(ChamCongThang).where(
                ChamCongThang.thang == thang,
                ChamCongThang.nam == nam,
            )
        )
        return list(result.scalars().all())

    async def upsert(
        self,
        nhan_vien_id: str,
        thang: int,
        nam: int,
        so_ngay_co_mat: float,
        so_ngay_vang_co_phep: float,
        so_ngay_vang_khong_phep: float,
        so_ngay_nghi_le_tet: float,
        so_ngay_cong_tac: float,
        he_so_ngay_cong: float,
    ) -> ChamCongThang:
        """Upsert ChamCongThang."""
        from decimal import Decimal

        existing, created = await self.find_or_create(nhan_vien_id, thang, nam)

        if not created:
            return await self.update(
                existing.id,
                so_ngay_co_mat=so_ngay_co_mat,
                so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
                so_ngay_cong_tac=so_ngay_cong_tac,
                he_so_ngay_cong=he_so_ngay_cong,
            )

        existing.so_ngay_co_mat = Decimal(str(so_ngay_co_mat))
        existing.so_ngay_vang_co_phep = Decimal(str(so_ngay_vang_co_phep))
        existing.so_ngay_vang_khong_phep = Decimal(str(so_ngay_vang_khong_phep))
        existing.so_ngay_nghi_le_tet = Decimal(str(so_ngay_nghi_le_tet))
        existing.so_ngay_cong_tac = Decimal(str(so_ngay_cong_tac))
        existing.he_so_ngay_cong = Decimal(str(he_so_ngay_cong))
        await self._session.flush()
        await self._session.refresh(existing)
        return existing
