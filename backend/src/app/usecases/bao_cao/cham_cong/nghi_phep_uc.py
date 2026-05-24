from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoNghiPhepResult:
    tong_don: int
    da_duyet: int
    cho_duyet: int
    tong_ngay_nghi: int
    theo_ly_do: List[Dict[str, Any]]
    theo_thang: List[Dict[str, Any]]


class BaoCaoNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoNghiPhepResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_nghi_phep_report(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoNghiPhepResult(
                    tong_don=data["tong_don"],
                    da_duyet=data["da_duyet"],
                    cho_duyet=data["cho_duyet"],
                    tong_ngay_nghi=data["tong_ngay_nghi"],
                    theo_ly_do=data["theo_ly_do"],
                    theo_thang=data["theo_thang"],
                )
            )
