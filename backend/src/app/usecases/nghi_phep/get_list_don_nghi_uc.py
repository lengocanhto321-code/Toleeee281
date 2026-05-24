from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return
from src.service.nghi_phep_service import NghiPhepService


@dataclass
class GetDonNghiQuery:
    page: int = 1
    page_size: int = 10
    nhan_vien_id: Optional[str] = None
    trang_thai: Optional[str] = None
    loai_nghi: Optional[str] = None


@dataclass
class GetDonNghiResult:
    total: int
    items: list[dict]


class GetListDonNghiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = NghiPhepService()

    async def execute(self, query: GetDonNghiQuery) -> Result[GetDonNghiResult, Error]:
        async with self.unit_of_work as uow:
            total, items = await uow.don_xin_nghi_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                nhan_vien_id=query.nhan_vien_id,
                trang_thai=query.trang_thai,
                loai_nghi=query.loai_nghi,
            )

        response_items = []
        for item in items:
            nhan_vien = None
            async with self.unit_of_work as uow:
                nhan_vien = await uow.nhan_vien_repository.find_by_id(item.nhan_vien_id)

            response_items.append(
                {
                    "id": item.id,
                    "nhan_vien_id": item.nhan_vien_id,
                    "nhan_vien_ho_ten": nhan_vien.ho_ten if nhan_vien else None,
                    "loai_nghi": item.loai_nghi,
                    "ten_loai_nghi": self.service.lay_ten_loai_nghi(item.loai_nghi),
                    "tu_ngay": str(item.tu_ngay),
                    "den_ngay": str(item.den_ngay),
                    "so_ngay": float(item.so_ngay),
                    "ly_do": item.ly_do,
                    "trang_thai": item.trang_thai,
                    "ngay_duyet": str(item.ngay_duyet) if item.ngay_duyet else None,
                    "created_at": str(item.created_at),
                }
            )

        return Return.ok(GetDonNghiResult(total=total, items=response_items))
