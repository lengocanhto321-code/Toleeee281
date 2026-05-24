from dataclasses import dataclass
from datetime import date
from typing import Optional

from libs.result import Result, Error, Return


@dataclass
class GetSoNgayPhepQuery:
    nhan_vien_id: str
    nam: Optional[int] = None


@dataclass
class GetSoNgayPhepResult:
    nhan_vien_id: str
    nam: int
    phep_nam_duoc_phep: float
    phep_nam_da_su_dung: float
    phep_nam_con_lai: float


class GetSoNgayPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetSoNgayPhepQuery
    ) -> Result[GetSoNgayPhepResult, Error]:
        nam = query.nam or date.today().year

        async with self.unit_of_work as uow:
            so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                query.nhan_vien_id, nam
            )

        return Return.ok(
            GetSoNgayPhepResult(
                nhan_vien_id=so_ngay_phep.nhan_vien_id,
                nam=so_ngay_phep.nam,
                phep_nam_duoc_phep=float(so_ngay_phep.phep_nam_duoc_phep),
                phep_nam_da_su_dung=float(so_ngay_phep.phep_nam_da_su_dung),
                phep_nam_con_lai=float(so_ngay_phep.phep_nam_con_lai),
            )
        )
