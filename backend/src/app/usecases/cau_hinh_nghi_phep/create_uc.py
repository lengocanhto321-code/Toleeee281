from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return


@dataclass
class CreateCauHinhCommand:
    loai_nghi: str
    ten_loai: str
    so_ngay_moi_nam: float
    so_ngay_toi_da_mot_lan: Optional[float] = None
    can_giay_to: bool = False
    bat_buoc_ghi_ly_do: bool = False
    trang_thai: bool = True
    ghi_chu: Optional[str] = None


@dataclass
class CreateCauHinhResult:
    id: str


class CreateCauHinhNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateCauHinhCommand
    ) -> Result[CreateCauHinhResult, Error]:
        async with self.unit_of_work as uow:
            existing = await uow.cau_hinh_nghi_phep_repository.find_by_loai(
                command.loai_nghi
            )
            if existing:
                return Return.err(
                    Error(code="exists", message="Loại nghỉ phép đã tồn tại")
                )

            item = await uow.cau_hinh_nghi_phep_repository.create(
                loai_nghi=command.loai_nghi,
                ten_loai=command.ten_loai,
                so_ngay_moi_nam=command.so_ngay_moi_nam,
                so_ngay_toi_da_mot_lan=command.so_ngay_toi_da_mot_lan,
                can_giay_to=command.can_giay_to,
                bat_buoc_ghi_ly_do=command.bat_buoc_ghi_ly_do,
                trang_thai=command.trang_thai,
                ghi_chu=command.ghi_chu,
            )

            return Return.ok(CreateCauHinhResult(id=item.id))
