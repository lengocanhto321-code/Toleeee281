from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoThueBHXHResult:
    tong_bhxh: float
    tong_bhyt: float
    tong_thue_tncn: float
    tong_cong: float
    phan_bo: List[Dict[str, Any]]
    theo_thang: List[Dict[str, Any]]


class BaoCaoThueBHXHUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoThueBHXHResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_thue_bhxh(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoThueBHXHResult(
                    tong_bhxh=data["tong_bhxh"],
                    tong_bhyt=data["tong_bhyt"],
                    tong_thue_tncn=data["tong_thue_tncn"],
                    tong_cong=data["tong_cong"],
                    phan_bo=data["phan_bo"],
                    theo_thang=data["theo_thang"],
                )
            )
