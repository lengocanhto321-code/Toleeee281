from dataclasses import dataclass
from typing import List, Dict, Any

from libs.result import Result, Error, Return


@dataclass
class GetListCauHinhResult:
    items: List[Dict[str, Any]]


class GetListCauHinhNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self) -> Result[GetListCauHinhResult, Error]:
        async with self.unit_of_work as uow:
            items = await uow.cau_hinh_nghi_phep_repository.find_all()
            return Return.ok(
                GetListCauHinhResult(
                    items=[
                        {
                            "id": item.id,
                            "loai_nghi": item.loai_nghi,
                            "ten_loai": item.ten_loai,
                            "so_ngay_moi_nam": item.so_ngay_moi_nam,
                            "so_ngay_toi_da_mot_lan": item.so_ngay_toi_da_mot_lan,
                            "can_giay_to": item.can_giay_to,
                            "bat_buoc_ghi_ly_do": item.bat_buoc_ghi_ly_do,
                            "trang_thai": item.trang_thai,
                            "ghi_chu": item.ghi_chu,
                        }
                        for item in items
                    ]
                )
            )
