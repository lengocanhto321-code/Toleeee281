from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.nguoi_than import NguoiThan
from src.domain.models.bang_cap_chung_chi import BangCapChungChi
from src.domain.models.khen_thuong_ky_luat import KhenThuongKyLuat


class NguoiThanRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[NguoiThan]:
        """Alias for get_by_nhan_vien_id."""
        return await self.get_by_nhan_vien_id(nhan_vien_id)

    async def get_by_nhan_vien_id(self, nhan_vien_id: str) -> List[NguoiThan]:
        result = await self._session.execute(
            select(NguoiThan)
            .where(NguoiThan.nhan_vien_id == nhan_vien_id)
            .order_by(NguoiThan.created_at.asc())
        )
        return list(result.scalars().all())

    async def find_by_id(self, id: str) -> Optional[NguoiThan]:
        result = await self._session.execute(
            select(NguoiThan).where(NguoiThan.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, nguoi_than: NguoiThan) -> NguoiThan:
        self._session.add(nguoi_than)
        await self._session.flush()
        await self._session.refresh(nguoi_than)
        return nguoi_than

    async def update(self, nguoi_than: NguoiThan) -> NguoiThan:
        await self._session.flush()
        await self._session.refresh(nguoi_than)
        return nguoi_than

    async def delete(self, nguoi_than: NguoiThan) -> None:
        await self._session.delete(nguoi_than)
        await self._session.flush()


class BangCapRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[BangCapChungChi]:
        """Alias for get_by_nhan_vien_id."""
        return await self.get_by_nhan_vien_id(nhan_vien_id)

    async def get_by_nhan_vien_id(self, nhan_vien_id: str) -> List[BangCapChungChi]:
        result = await self._session.execute(
            select(BangCapChungChi)
            .where(BangCapChungChi.nhan_vien_id == nhan_vien_id)
            .order_by(BangCapChungChi.nam_cap.desc())
        )
        return list(result.scalars().all())

    async def find_by_id(self, id: str) -> Optional[BangCapChungChi]:
        result = await self._session.execute(
            select(BangCapChungChi).where(BangCapChungChi.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, bang_cap: BangCapChungChi) -> BangCapChungChi:
        self._session.add(bang_cap)
        await self._session.flush()
        await self._session.refresh(bang_cap)
        return bang_cap

    async def update(self, bang_cap: BangCapChungChi) -> BangCapChungChi:
        await self._session.flush()
        await self._session.refresh(bang_cap)
        return bang_cap

    async def delete(self, bang_cap: BangCapChungChi) -> None:
        await self._session.delete(bang_cap)
        await self._session.flush()


class KhenThuongKyLuatRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_nhan_vien(self, nhan_vien_id: str) -> List[KhenThuongKyLuat]:
        """Alias for get_by_nhan_vien_id without filtering by loai."""
        return await self.get_by_nhan_vien_id(nhan_vien_id)

    async def get_by_nhan_vien_id(
        self, nhan_vien_id: str, loai: Optional[str] = None
    ) -> List[KhenThuongKyLuat]:
        stmt = select(KhenThuongKyLuat).where(
            KhenThuongKyLuat.nhan_vien_id == nhan_vien_id
        )
        if loai:
            stmt = stmt.where(KhenThuongKyLuat.loai == loai)
        stmt = stmt.order_by(KhenThuongKyLuat.ngay_quyet_dinh.desc())
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_id(self, id: str) -> Optional[KhenThuongKyLuat]:
        result = await self._session.execute(
            select(KhenThuongKyLuat).where(KhenThuongKyLuat.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, kt: KhenThuongKyLuat) -> KhenThuongKyLuat:
        self._session.add(kt)
        await self._session.flush()
        await self._session.refresh(kt)
        return kt

    async def update(self, kt: KhenThuongKyLuat) -> KhenThuongKyLuat:
        await self._session.flush()
        await self._session.refresh(kt)
        return kt

    async def delete(self, kt: KhenThuongKyLuat) -> None:
        await self._session.delete(kt)
        await self._session.flush()
