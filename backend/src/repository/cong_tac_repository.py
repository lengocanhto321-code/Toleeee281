from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error

from src.domain.models.cong_tac import CongTac


class CongTacRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[CongTac]:
        """Alias for get_by_nhan_vien_id."""
        return await self.get_by_nhan_vien_id(nhan_vien_id)

    async def get_by_nhan_vien_id(self, nhan_vien_id: str) -> List[CongTac]:
        result = await self._session.execute(
            select(CongTac)
            .where(CongTac.nhan_vien_id == nhan_vien_id)
            .order_by(CongTac.ngay_bat_dau.desc())
        )
        return list(result.scalars().all())

    async def get_current_by_nhan_vien_id(self, nhan_vien_id: str) -> Optional[CongTac]:
        result = await self._session.execute(
            select(CongTac).where(
                CongTac.nhan_vien_id == nhan_vien_id,
                CongTac.is_primary == True,
                CongTac.trang_thai == "dang_cong_tac",
            )
        )
        return result.scalar_one_or_none()

    async def find_by_id(self, id: str) -> Optional[CongTac]:
        result = await self._session.execute(select(CongTac).where(CongTac.id == id))
        return result.scalar_one_or_none()

    async def create(self, cong_tac: CongTac) -> CongTac:
        self._session.add(cong_tac)
        await self._session.flush()
        await self._session.refresh(cong_tac)
        return cong_tac

    async def update(self, cong_tac: CongTac) -> CongTac:
        await self._session.flush()
        await self._session.refresh(cong_tac)
        return cong_tac

    async def end_assignment(self, cong_tac: CongTac) -> CongTac:
        from libs.datetime import get_utc_now

        cong_tac.ngay_ket_thuc = get_utc_now()
        cong_tac.trang_thai = "da_chuyen"
        cong_tac.is_primary = False
        await self._session.flush()
        await self._session.refresh(cong_tac)
        return cong_tac

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
    ) -> Result[Tuple[int, List[dict]], Error]:
        """Get paginated list of all CongTac."""
        base_stmt = select(CongTac)

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Pagination and ordering
        base_stmt = base_stmt.order_by(CongTac.ngay_bat_dau.desc())
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
