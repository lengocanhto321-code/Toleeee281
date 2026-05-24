from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoDemoGraphicsResult:
    gioi_tinh: List[Dict[str, Any]]
    do_tuoi: List[Dict[str, Any]]
    loai_nhan_vien: List[Dict[str, Any]]


class BaoCaoDemoGraphicsUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoDemoGraphicsResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_demo_graphics(
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoDemoGraphicsResult(
                    gioi_tinh=data["gioi_tinh"],
                    do_tuoi=data["do_tuoi"],
                    loai_nhan_vien=data["loai_nhan_vien"],
                )
            )
