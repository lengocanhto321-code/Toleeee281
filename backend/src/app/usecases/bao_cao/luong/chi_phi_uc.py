from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoChiPhiResult:
    tong_chi_phi: float
    tong_luong_co_ban: float
    so_nhan_vien: int
    chi_phi_tb: float
    theo_phong_ban: List[Dict[str, Any]]
    theo_thang: List[Dict[str, Any]]


class BaoCaoChiPhiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoChiPhiResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_chi_phi_nhan_su(
                thang=thang,
                nam=nam,
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoChiPhiResult(
                    tong_chi_phi=data["tong_chi_phi"],
                    tong_luong_co_ban=data["tong_luong_co_ban"],
                    so_nhan_vien=data["so_nhan_vien"],
                    chi_phi_tb=data["chi_phi_tb"],
                    theo_phong_ban=data["theo_phong_ban"],
                    theo_thang=data["theo_thang"],
                )
            )
