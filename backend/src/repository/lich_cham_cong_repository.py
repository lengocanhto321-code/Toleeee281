from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.lich_cham_cong import LichChamCong


class LichChamCongRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, config: LichChamCong) -> LichChamCong:
        self._session.add(config)
        await self._session.flush()
        await self._session.refresh(config)
        return config

    async def find_by_id(self, id: str) -> Optional[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong).where(LichChamCong.id == id)
        )
        return result.scalar_one_or_none()

    async def find_active(self) -> Optional[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong)
            .where(LichChamCong.trang_thai == "active")
            .order_by(LichChamCong.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def find_all(self) -> list[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong).order_by(LichChamCong.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, config: LichChamCong) -> LichChamCong:
        await self._session.flush()
        await self._session.refresh(config)
        return config

    async def delete(self, id: str) -> bool:
        config = await self.find_by_id(id)
        if config:
            await self._session.delete(config)
            await self._session.flush()
            return True
        return False
