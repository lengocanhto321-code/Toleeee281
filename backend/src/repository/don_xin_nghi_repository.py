from typing import Optional, List, Tuple
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.don_xin_nghi import DonXinNghi
from src.constants import TRANG_THAI_DON_KEYS


class DonXinNghiRepository:
    """Repository for DonXinNghi model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, don: DonXinNghi) -> DonXinNghi:
        """Create a new DonXinNghi record."""
        self._session.add(don)
        await self._session.flush()
        await self._session.refresh(don)
        return don

    async def find_by_id(self, id: str) -> Optional[DonXinNghi]:
        """Find DonXinNghi by ID."""
        result = await self._session.execute(
            select(DonXinNghi).where(DonXinNghi.id == id)
        )
        return result.scalar_one_or_none()

    async def find_by_nhan_vien(
        self, nhan_vien_id: str, trang_thai: Optional[str] = None
    ) -> List[DonXinNghi]:
        """Find all DonXinNghi for a nhan_vien."""
        query = select(DonXinNghi).where(DonXinNghi.nhan_vien_id == nhan_vien_id)
        if trang_thai:
            query = query.where(DonXinNghi.trang_thai == trang_thai)
        result = await self._session.execute(
            query.order_by(DonXinNghi.created_at.desc())
        )
        return list(result.scalars().all())

    async def find_by_date_range(
        self,
        nhan_vien_id: str,
        tu_ngay: date,
        den_ngay: date,
        loai_nghi: Optional[str] = None,
    ) -> List[DonXinNghi]:
        """Find DonXinNghi within a date range."""
        query = select(DonXinNghi).where(
            DonXinNghi.nhan_vien_id == nhan_vien_id,
            DonXinNghi.trang_thai == TRANG_THAI_DON_KEYS[1],  # da_duyet
            DonXinNghi.tu_ngay <= den_ngay,
            DonXinNghi.den_ngay >= tu_ngay,
        )
        if loai_nghi:
            query = query.where(DonXinNghi.loai_nghi == loai_nghi)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nhan_vien_id: Optional[str] = None,
        trang_thai: Optional[str] = None,
        loai_nghi: Optional[str] = None,
    ) -> Tuple[int, List[DonXinNghi]]:
        """Get paginated list of DonXinNghi records."""
        query = select(DonXinNghi)
        count_query = select(func.count(DonXinNghi.id))

        if nhan_vien_id:
            query = query.where(DonXinNghi.nhan_vien_id == nhan_vien_id)
            count_query = count_query.where(DonXinNghi.nhan_vien_id == nhan_vien_id)
        if trang_thai:
            query = query.where(DonXinNghi.trang_thai == trang_thai)
            count_query = count_query.where(DonXinNghi.trang_thai == trang_thai)
        if loai_nghi:
            query = query.where(DonXinNghi.loai_nghi == loai_nghi)
            count_query = count_query.where(DonXinNghi.loai_nghi == loai_nghi)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(DonXinNghi.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def update_trang_thai(
        self,
        id: str,
        trang_thai: str,
        nguoi_duyet_id: str,
        ghi_chu: Optional[str] = None,
    ) -> Optional[DonXinNghi]:
        """Update trang_thai of DonXinNghi."""
        from libs.datetime import get_utc_now

        don = await self.find_by_id(id)
        if don:
            don.trang_thai = trang_thai
            don.nguoi_duyet_id = nguoi_duyet_id
            don.ngay_duyet = get_utc_now()
            if ghi_chu:
                don.ghi_chu_duyet = ghi_chu
            await self._session.flush()
            await self._session.refresh(don)
        return don

    async def delete(self, id: str) -> bool:
        """Delete DonXinNghi."""
        don = await self.find_by_id(id)
        if don:
            await self._session.delete(don)
            await self._session.flush()
            return True
        return False

    async def find_overlapping(
        self,
        nhan_vien_id: str,
        tu_ngay: date,
        den_ngay: date,
    ) -> List[DonXinNghi]:
        """Find overlapping leave requests (excluding huy status)."""
        query = select(DonXinNghi).where(
            DonXinNghi.nhan_vien_id == nhan_vien_id,
            DonXinNghi.trang_thai.in_(["cho_duyet", "da_duyet"]),
            DonXinNghi.tu_ngay <= den_ngay,
            DonXinNghi.den_ngay >= tu_ngay,
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def find_all_approved_by_date(self, target_date: date) -> List[DonXinNghi]:
        """Find all approved leave requests covering a specific date."""
        result = await self._session.execute(
            select(DonXinNghi).where(
                DonXinNghi.trang_thai == TRANG_THAI_DON_KEYS[1],
                DonXinNghi.tu_ngay <= target_date,
                DonXinNghi.den_ngay >= target_date,
            )
        )
        return list(result.scalars().all())
