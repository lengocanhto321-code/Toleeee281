import uuid
from typing import List, Optional
from libs.datetime import get_utc_now

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.cau_hinh_nghi_phep import CauHinhNghiPhep


class CauHinhNghiPhepRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_all(
        self, trang_thai: Optional[bool] = None
    ) -> List[CauHinhNghiPhep]:
        query = select(CauHinhNghiPhep)
        if trang_thai is not None:
            query = query.where(CauHinhNghiPhep.trang_thai == trang_thai)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def find_by_id(self, id: str) -> Optional[CauHinhNghiPhep]:
        query = select(CauHinhNghiPhep).where(CauHinhNghiPhep.id == id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_loai(self, loai_nghi: str) -> Optional[CauHinhNghiPhep]:
        query = select(CauHinhNghiPhep).where(CauHinhNghiPhep.loai_nghi == loai_nghi)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(
        self,
        loai_nghi: str,
        ten_loai: str,
        so_ngay_moi_nam: float,
        so_ngay_toi_da_mot_lan: Optional[float] = None,
        can_giay_to: bool = False,
        bat_buoc_ghi_ly_do: bool = False,
        trang_thai: bool = True,
        ghi_chu: Optional[str] = None,
    ) -> CauHinhNghiPhep:
        now = get_utc_now()
        item = CauHinhNghiPhep(
            id=str(uuid.uuid4())[:32],
            loai_nghi=loai_nghi,
            ten_loai=ten_loai,
            so_ngay_moi_nam=so_ngay_moi_nam,
            so_ngay_toi_da_mot_lan=so_ngay_toi_da_mot_lan,
            can_giay_to=can_giay_to,
            bat_buoc_ghi_ly_do=bat_buoc_ghi_ly_do,
            trang_thai=trang_thai,
            ghi_chu=ghi_chu,
            created_at=now,
            updated_at=now,
        )
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def update(
        self,
        id: str,
        ten_loai: Optional[str] = None,
        so_ngay_moi_nam: Optional[float] = None,
        so_ngay_toi_da_mot_lan: Optional[float] = None,
        can_giay_to: Optional[bool] = None,
        bat_buoc_ghi_ly_do: Optional[bool] = None,
        trang_thai: Optional[bool] = None,
        ghi_chu: Optional[str] = None,
    ) -> Optional[CauHinhNghiPhep]:
        item = await self.find_by_id(id)
        if not item:
            return None

        update_data = {"updated_at": get_utc_now()}
        if ten_loai is not None:
            item.ten_loai = ten_loai
        if so_ngay_moi_nam is not None:
            item.so_ngay_moi_nam = so_ngay_moi_nam
        if so_ngay_toi_da_mot_lan is not None:
            item.so_ngay_toi_da_mot_lan = so_ngay_toi_da_mot_lan
        if can_giay_to is not None:
            item.can_giay_to = can_giay_to
        if bat_buoc_ghi_ly_do is not None:
            item.bat_buoc_ghi_ly_do = bat_buoc_ghi_ly_do
        if trang_thai is not None:
            item.trang_thai = trang_thai
        if ghi_chu is not None:
            item.ghi_chu = ghi_chu

        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, id: str) -> bool:
        item = await self.find_by_id(id)
        if not item:
            return False
        item.trang_thai = False
        item.updated_at = get_utc_now()
        await self.session.commit()
        return True
