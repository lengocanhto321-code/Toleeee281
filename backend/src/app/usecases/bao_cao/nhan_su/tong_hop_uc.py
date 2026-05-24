from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoNhanSuTongHopResult:
    tong_nhan_vien: int
    dang_lam: int
    nghi_viec: int
    nghi_huu: int
    theo_gioi_tinh: Dict[str, int]
    theo_loai_nv: Dict[str, int]
    theo_phong_ban: List[Dict[str, Any]]


class BaoCaoNhanSuTongHopUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
        loai_nhan_vien: Optional[str] = None,
    ) -> Result[BaoCaoNhanSuTongHopResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_tong_hop_nhan_su(
                phong_ban_id=phong_ban_id,
                loai_nhan_vien=loai_nhan_vien,
            )

            return Return.ok(
                BaoCaoNhanSuTongHopResult(
                    tong_nhan_vien=data["tong_nhan_vien"],
                    dang_lam=data["dang_lam"],
                    nghi_viec=data["nghi_viec"],
                    nghi_huu=data["nghi_huu"],
                    theo_gioi_tinh=data["theo_gioi_tinh"],
                    theo_loai_nv=data["theo_loai_nv"],
                    theo_phong_ban=data["theo_phong_ban"],
                )
            )
