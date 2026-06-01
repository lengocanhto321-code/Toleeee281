from typing import Optional, List, Tuple
from datetime import date, time
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.qr_config import QRConfig


class QRConfigRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, qr_config: QRConfig) -> QRConfig:
        self._session.add(qr_config)
        await self._session.flush()
        await self._session.refresh(qr_config)
        return qr_config

    async def find_by_id(self, id: str) -> Optional[QRConfig]:
        result = await self._session.execute(select(QRConfig).where(QRConfig.id == id))
        return result.scalar_one_or_none()

    async def find_by_ngay(
        self, ngay: date, loai: Optional[str] = None
    ) -> List[QRConfig]:
        query = select(QRConfig).where(QRConfig.ngay == ngay)
        if loai and loai != "all":
            query = query.where(QRConfig.loai == loai)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def find_active_by_ngay(
        self,
        ngay: date,
        phong_ban_id: Optional[str] = None,
        nhan_vien_id: Optional[str] = None,
    ) -> Optional[QRConfig]:
        base_query = select(QRConfig).where(
            and_(QRConfig.ngay == ngay, QRConfig.trang_thai == "active")
        )

        if nhan_vien_id:
            result = await self._session.execute(
                base_query.where(QRConfig.nhan_vien_id == nhan_vien_id)
            )
            qr = result.scalars().first()
            if qr:
                return qr

        if phong_ban_id:
            result = await self._session.execute(
                base_query.where(QRConfig.phong_ban_id == phong_ban_id)
            )
            qr = result.scalars().first()
            if qr:
                return qr

        result = await self._session.execute(
            base_query.where(
                QRConfig.phong_ban_id.is_(None),
                QRConfig.nhan_vien_id.is_(None),
            )
        )
        qr = result.scalars().first()
        if qr:
            return qr

        result = await self._session.execute(base_query)
        return result.scalars().first()

    async def find_by_ma_nhap(
        self,
        ma_nhap: str,
        phong_ban_id: Optional[str] = None,
        nhan_vien_id: Optional[str] = None,
    ) -> Optional[QRConfig]:
        query = select(QRConfig).where(
            and_(QRConfig.ma_nhap == ma_nhap, QRConfig.trang_thai == "active")
        )

        if phong_ban_id is not None or nhan_vien_id is not None:
            scope_conditions = [
                and_(QRConfig.phong_ban_id.is_(None), QRConfig.nhan_vien_id.is_(None)),
            ]
            if phong_ban_id is not None:
                scope_conditions.append(QRConfig.phong_ban_id == phong_ban_id)
            if nhan_vien_id is not None:
                scope_conditions.append(QRConfig.nhan_vien_id == nhan_vien_id)
            query = query.where(or_(*scope_conditions))

        result = await self._session.execute(query)
        return result.scalars().first()

    async def find_by_date_range(self, tu_ngay: date, den_ngay: date) -> List[QRConfig]:
        result = await self._session.execute(
            select(QRConfig)
            .where(and_(QRConfig.ngay >= tu_ngay, QRConfig.ngay <= den_ngay))
            .order_by(QRConfig.ngay)
        )
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        tu_ngay: Optional[date] = None,
        den_ngay: Optional[date] = None,
        trang_thai: Optional[str] = None,
    ) -> Tuple[int, List[QRConfig]]:
        query = select(QRConfig)
        count_query = select(func.count(QRConfig.id))

        if tu_ngay:
            query = query.where(QRConfig.ngay >= tu_ngay)
            count_query = count_query.where(QRConfig.ngay >= tu_ngay)
        if den_ngay:
            query = query.where(QRConfig.ngay <= den_ngay)
            count_query = count_query.where(QRConfig.ngay <= den_ngay)
        if trang_thai:
            query = query.where(QRConfig.trang_thai == trang_thai)
            count_query = count_query.where(QRConfig.trang_thai == trang_thai)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(QRConfig.ngay.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def update_status(self, id: str, trang_thai: str) -> Optional[QRConfig]:
        qr = await self.find_by_id(id)
        if qr:
            qr.trang_thai = trang_thai
            await self._session.flush()
            await self._session.refresh(qr)
        return qr

    async def update(self, qr_config: QRConfig) -> QRConfig:
        await self._session.flush()
        await self._session.refresh(qr_config)
        return qr_config

    async def delete(self, id: str) -> bool:
        qr = await self.find_by_id(id)
        if qr:
            await self._session.delete(qr)
            await self._session.flush()
            return True
        return False
