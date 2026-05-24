from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoTrinhDoResult:
    trinh_do_hoc_van: List[Dict[str, Any]]
    chuyen_mon: List[Dict[str, Any]]


class BaoCaoTrinhDoUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoTrinhDoResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_trinh_do(
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoTrinhDoResult(
                    trinh_do_hoc_van=data["trinh_do_hoc_van"],
                    chuyen_mon=data["chuyen_mon"],
                )
            )
