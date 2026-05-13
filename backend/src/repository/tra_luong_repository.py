from typing import Optional, List, Tuple
from datetime import date, datetime
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.cau_hinh_luong import KyLuong
from src.domain.models.tra_luong import TraLuong


class KyLuongRepository:
    """Repository for KyLuong (salary period) model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, ky_luong: KyLuong) -> KyLuong:
        """Create a new KyLuong record."""
        self._session.add(ky_luong)
        await self._session.flush()
        await self._session.refresh(ky_luong)
        return ky_luong

    async def find_by_id(self, id: str) -> Optional[KyLuong]:
        """Find KyLuong by ID."""
        result = await self._session.execute(select(KyLuong).where(KyLuong.id == id))
        return result.scalar_one_or_none()

    async def find_by_thang_nam(self, thang: int, nam: int) -> Optional[KyLuong]:
        """Find KyLuong by thang and nam."""
        result = await self._session.execute(
            select(KyLuong).where(
                KyLuong.thang == thang,
                KyLuong.nam == nam,
            )
        )
        return result.scalar_one_or_none()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        trang_thai: Optional[str] = None,
    ) -> Tuple[int, List[KyLuong]]:
        """Get paginated list of KyLuong."""
        query = select(KyLuong)

        if thang:
            query = query.where(KyLuong.thang == thang)
        if nam:
            query = query.where(KyLuong.nam == nam)
        if trang_thai:
            query = query.where(KyLuong.trang_thai == trang_thai)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar() or 0

        items_query = (
            query.order_by(KyLuong.nam.desc(), KyLuong.thang.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._session.execute(items_query)
        items = list(result.scalars().all())

        return total, items

    async def update_trang_thai(
        self, ky_luong_id: str, trang_thai: str, **kwargs
    ) -> Optional[KyLuong]:
        """Update KyLuong status and related fields."""
        ky_luong = await self.find_by_id(ky_luong_id)
        if ky_luong:
            ky_luong.trang_thai = trang_thai
            if "ngay_duyet" in kwargs:
                ky_luong.ngay_duyet = kwargs["ngay_duyet"]
            if "nguoi_duyet_id" in kwargs:
                ky_luong.nguoi_duyet_id = kwargs["nguoi_duyet_id"]
            if "ngay_chot" in kwargs:
                ky_luong.ngay_chot = kwargs["ngay_chot"]
            await self._session.flush()
            await self._session.refresh(ky_luong)
        return ky_luong


class TraLuongRepository:
    """Repository for TraLuong (salary slip) model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, tra_luong: TraLuong) -> TraLuong:
        """Create a new TraLuong record."""
        self._session.add(tra_luong)
        await self._session.flush()
        await self._session.refresh(tra_luong)
        return tra_luong

    async def create_many(self, tra_luongs: List[TraLuong]) -> List[TraLuong]:
        """Create multiple TraLuong records."""
        self._session.add_all(tra_luongs)
        await self._session.flush()
        return tra_luongs

    async def find_by_id(self, id: str) -> Optional[TraLuong]:
        """Find TraLuong by ID."""
        result = await self._session.execute(select(TraLuong).where(TraLuong.id == id))
        return result.scalar_one_or_none()

    async def find_by_ky_luong(self, ky_luong_id: str) -> List[TraLuong]:
        """Find all TraLuong records by ky_luong_id."""
        result = await self._session.execute(
            select(TraLuong).where(TraLuong.ky_luong_id == ky_luong_id)
        )
        return list(result.scalars().all())

    async def find_by_nhan_vien_thang_nam(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> Optional[TraLuong]:
        """Find TraLuong for a specific nhan_vien, thang, nam."""
        result = await self._session.execute(
            select(TraLuong).where(
                TraLuong.nhan_vien_id == nhan_vien_id,
                TraLuong.thang == thang,
                TraLuong.nam == nam,
            )
        )
        return result.scalar_one_or_none()

    async def get_paginated_by_ky_luong(
        self, ky_luong_id: str, page: int = 1, page_size: int = 10
    ) -> Tuple[int, List[TraLuong]]:
        """Get paginated TraLuong by ky_luong_id."""
        query = select(TraLuong).where(TraLuong.ky_luong_id == ky_luong_id)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar() or 0

        items_query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(items_query)
        items = list(result.scalars().all())

        return total, items

    async def update_trang_thai_by_ky_luong(
        self, ky_luong_id: str, trang_thai: str
    ) -> int:
        """Update all TraLuong status for a ky_luong."""
        result = await self._session.execute(
            update(TraLuong)
            .where(TraLuong.ky_luong_id == ky_luong_id)
            .values(trang_thai=trang_thai)
        )
        await self._session.flush()
        return result.rowcount
