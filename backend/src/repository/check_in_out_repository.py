from typing import Optional, List, Tuple
from datetime import date, datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.check_in_out import CheckInOut


class CheckInOutRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, check_in_out: CheckInOut) -> CheckInOut:
        self._session.add(check_in_out)
        await self._session.flush()
        await self._session.refresh(check_in_out)
        return check_in_out

    async def find_by_id(self, id: str) -> Optional[CheckInOut]:
        result = await self._session.execute(
            select(CheckInOut).where(CheckInOut.id == id)
        )
        return result.scalar_one_or_none()

    async def find_today(self, nhan_vien_id: str, ngay: date) -> Optional[CheckInOut]:
        result = await self._session.execute(
            select(CheckInOut).where(
                and_(
                    CheckInOut.nhan_vien_id == nhan_vien_id,
                    CheckInOut.ngay == ngay,
                )
            )
        )
        return result.scalar_one_or_none()

    async def find_today_all(self, nhan_vien_id: str, ngay: date) -> List[CheckInOut]:
        result = await self._session.execute(
            select(CheckInOut)
            .where(
                and_(CheckInOut.nhan_vien_id == nhan_vien_id, CheckInOut.ngay == ngay)
            )
            .order_by(CheckInOut.check_in_time)
        )
        return list(result.scalars().all())

    async def get_by_date(self, ngay: date) -> List[CheckInOut]:
        result = await self._session.execute(
            select(CheckInOut)
            .where(CheckInOut.ngay == ngay)
            .order_by(CheckInOut.check_in_time)
        )
        return list(result.scalars().all())

    async def get_monthly_valid(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> List[CheckInOut]:
        from datetime import date as date_type

        tu_ngay = date_type(nam, thang, 1)
        if thang == 12:
            den_ngay = date_type(nam + 1, 1, 1)
        else:
            den_ngay = date_type(nam, thang + 1, 1)

        result = await self._session.execute(
            select(CheckInOut).where(
                and_(
                    CheckInOut.nhan_vien_id == nhan_vien_id,
                    CheckInOut.ngay >= tu_ngay,
                    CheckInOut.ngay < den_ngay,
                    CheckInOut.check_in_status == "valid",
                )
            )
        )
        return list(result.scalars().all())

    async def get_monthly_count(
        self, nhan_vien_id: str, thang: int, nam: int, loai: str = "check_in"
    ) -> int:
        from datetime import date as date_type

        tu_ngay = date_type(nam, thang, 1)
        if thang == 12:
            den_ngay = date_type(nam + 1, 1, 1)
        else:
            den_ngay = date_type(nam, thang + 1, 1)

        result = await self._session.execute(
            select(func.count(CheckInOut.id)).where(
                and_(
                    CheckInOut.nhan_vien_id == nhan_vien_id,
                    CheckInOut.ngay >= tu_ngay,
                    CheckInOut.ngay < den_ngay,
                    CheckInOut.check_in_status == "valid",
                )
            )
        )
        return result.scalar_one()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nhan_vien_id: Optional[str] = None,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        tu_ngay: Optional[date] = None,
        den_ngay: Optional[date] = None,
    ) -> Tuple[int, List[CheckInOut]]:
        query = select(CheckInOut)
        count_query = select(func.count(CheckInOut.id))

        if nhan_vien_id:
            query = query.where(CheckInOut.nhan_vien_id == nhan_vien_id)
            count_query = count_query.where(CheckInOut.nhan_vien_id == nhan_vien_id)

        if tu_ngay and den_ngay:
            query = query.where(
                and_(CheckInOut.ngay >= tu_ngay, CheckInOut.ngay <= den_ngay)
            )
            count_query = count_query.where(
                and_(CheckInOut.ngay >= tu_ngay, CheckInOut.ngay <= den_ngay)
            )
        elif thang and nam:
            from datetime import date as date_type

            tu = date_type(nam, thang, 1)
            if thang == 12:
                den = date_type(nam + 1, 1, 1)
            else:
                den = date_type(nam, thang + 1, 1)

            query = query.where(and_(CheckInOut.ngay >= tu, CheckInOut.ngay < den))
            count_query = count_query.where(
                and_(CheckInOut.ngay >= tu, CheckInOut.ngay < den)
            )

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(CheckInOut.check_in_time.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def update_status(self, id: str, trang_thai: str) -> Optional[CheckInOut]:
        record = await self.find_by_id(id)
        if record:
            record.trang_thai = trang_thai
            await self._session.flush()
            await self._session.refresh(record)
        return record

    async def update(self, check_in_out: CheckInOut) -> CheckInOut:
        await self._session.flush()
        await self._session.refresh(check_in_out)
        return check_in_out

    async def delete(self, id: str) -> bool:
        record = await self.find_by_id(id)
        if record:
            await self._session.delete(record)
            await self._session.flush()
            return True
        return False

    async def get_vang_mat_by_ngay(
        self,
        ngay: date,
        phong_ban_id: Optional[str] = None,
        loai_vang: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[int, List[CheckInOut]]:
        from src.domain.models.nhan_vien import NhanVien

        statuses = ["vang_mat_co_phep", "vang_mat_khong_phep"]
        if loai_vang == "co_phep":
            statuses = ["vang_mat_co_phep"]
        elif loai_vang == "khong_phep":
            statuses = ["vang_mat_khong_phep"]

        query = select(CheckInOut).where(
            and_(
                CheckInOut.ngay == ngay,
                CheckInOut.trang_thai.in_(statuses),
            )
        )
        count_query = select(func.count(CheckInOut.id)).where(
            and_(
                CheckInOut.ngay == ngay,
                CheckInOut.trang_thai.in_(statuses),
            )
        )

        if phong_ban_id:
            query = query.join(NhanVien, CheckInOut.nhan_vien_id == NhanVien.id).where(
                NhanVien.phong_ban_id == phong_ban_id
            )
            count_query = count_query.join(
                NhanVien, CheckInOut.nhan_vien_id == NhanVien.id
            ).where(NhanVien.phong_ban_id == phong_ban_id)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(CheckInOut.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def count_vang_mat_by_ngay(self, ngay: date) -> dict:
        result = await self._session.execute(
            select(
                CheckInOut.trang_thai,
                func.count(CheckInOut.id),
            )
            .where(
                and_(
                    CheckInOut.ngay == ngay,
                    CheckInOut.trang_thai.in_(
                        ["vang_mat_co_phep", "vang_mat_khong_phep"]
                    ),
                )
            )
            .group_by(CheckInOut.trang_thai)
        )
        counts = {}
        for row in result:
            counts[row[0]] = row[1]
        return counts
