from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoBienDongResult:
    tong_vao: int
    tong_ra: int
    tong_chuyen: int
    ly_do: List[Dict[str, Any]]
    theo_thang: List[Dict[str, Any]]


class BaoCaoBienDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoBienDongResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_bien_dong_nhan_su(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoBienDongResult(
                    tong_vao=data["tong_vao"],
                    tong_ra=data["tong_ra"],
                    tong_chuyen=data["tong_chuyen"],
                    ly_do=data["ly_do"],
                    theo_thang=data["theo_thang"],
                )
            )
