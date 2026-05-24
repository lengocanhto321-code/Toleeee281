from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoChamCongTongHopResult:
    tong_co_mat: int
    tong_chuan: int
    tong_nhan_vien: int
    ty_le_co_mat: float
    theo_phong_ban: List[Dict[str, Any]]


class BaoCaoChamCongTongHopUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoChamCongTongHopResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_tong_hop_cham_cong(
                thang=thang,
                nam=nam,
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoChamCongTongHopResult(
                    tong_co_mat=data["tong_co_mat"],
                    tong_chuan=data["tong_chuan"],
                    tong_nhan_vien=data["tong_nhan_vien"],
                    ty_le_co_mat=data["ty_le_co_mat"],
                    theo_phong_ban=data["theo_phong_ban"],
                )
            )
