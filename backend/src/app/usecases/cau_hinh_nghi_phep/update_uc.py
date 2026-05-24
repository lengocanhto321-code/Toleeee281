from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return


@dataclass
class UpdateCauHinhCommand:
    id: str
    ten_loai: str
    so_ngay_moi_nam: float
    so_ngay_toi_da_mot_lan: Optional[float] = None
    can_giay_to: bool = False
    bat_buoc_ghi_ly_do: bool = False
    trang_thai: bool = True
    ghi_chu: Optional[str] = None


@dataclass
class UpdateCauHinhResult:
    id: str


class UpdateCauHinhNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateCauHinhCommand
    ) -> Result[UpdateCauHinhResult, Error]:
        async with self.unit_of_work as uow:
            item = await uow.cau_hinh_nghi_phep_repository.update(
                id=command.id,
                ten_loai=command.ten_loai,
                so_ngay_moi_nam=command.so_ngay_moi_nam,
                so_ngay_toi_da_mot_lan=command.so_ngay_toi_da_mot_lan,
                can_giay_to=command.can_giay_to,
                bat_buoc_ghi_ly_do=command.bat_buoc_ghi_ly_do,
                trang_thai=command.trang_thai,
                ghi_chu=command.ghi_chu,
            )

            if not item:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy cấu hình")
                )

            return Return.ok(UpdateCauHinhResult(id=item.id))
