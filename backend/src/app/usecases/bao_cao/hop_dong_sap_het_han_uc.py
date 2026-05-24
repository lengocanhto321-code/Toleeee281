from datetime import date
from typing import Optional

from libs.result import Result, Error, Return


class GetHopDongSapHetHanUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, ngay_chieu: date, phong_ban_id: Optional[str] = None
    ) -> Result[dict, Error]:
        async with self.unit_of_work as uow:
            from src.service.bao_cao_service import BaoCaoService

            service = BaoCaoService(uow.session)
            result = await service.get_hop_dong_sap_het_han(ngay_chieu, phong_ban_id)
            return Return.ok(result)
