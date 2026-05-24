from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService


@dataclass
class GetChamCongThangQuery:
    page: int = 1
    page_size: int = 10
    nhan_vien_id: Optional[str] = None
    thang: Optional[int] = None
    nam: Optional[int] = None


@dataclass
class GetChamCongThangResult:
    total: int
    items: list[dict]


class GetListChamCongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, query: GetChamCongThangQuery
    ) -> Result[GetChamCongThangResult, Error]:
        async with self.unit_of_work as uow:
            total, items = await uow.cham_cong_thang_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                nhan_vien_id=query.nhan_vien_id,
                thang=query.thang,
                nam=query.nam,
            )

        response_items = []
        async with self.unit_of_work as uow:
            for item in items:
                nhan_vien = await uow.nhan_vien_repository.find_by_id(item.nhan_vien_id)

                response_items.append(
                    {
                        "id": item.id,
                        "nhan_vien_id": item.nhan_vien_id,
                        "nhan_vien_ho_ten": nhan_vien.ho_ten if nhan_vien else None,
                        "thang": item.thang,
                        "nam": item.nam,
                        "so_ngay_lam_chuan": float(item.so_ngay_lam_chuan),
                        "so_ngay_co_mat": float(item.so_ngay_co_mat),
                        "so_ngay_vang_co_phep": float(item.so_ngay_vang_co_phep),
                        "so_ngay_vang_khong_phep": float(item.so_ngay_vang_khong_phep),
                        "so_ngay_nghi_le_tet": float(item.so_ngay_nghi_le_tet),
                        "so_ngay_cong_tac": float(item.so_ngay_cong_tac),
                        "he_so_ngay_cong": float(item.he_so_ngay_cong),
                        "trang_thai": item.trang_thai,
                        "mau_trang_thai": self.service.lay_mau_trang_thai(
                            item.trang_thai
                        ),
                    }
                )

        return Return.ok(GetChamCongThangResult(total=total, items=response_items))
