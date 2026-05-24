import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetCurrentCongTacQuery:
    nhan_vien_id: str


@dataclass
class GetCurrentCongTacResult:
    item: Optional[CongTacResponse]


class GetCurrentCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetCurrentCongTacQuery
    ) -> Result[GetCurrentCongTacResult, Error]:
        logger.info(f"Getting current CongTac for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            item = await uow.cong_tac_repository.get_current_by_nhan_vien_id(
                query.nhan_vien_id
            )
            resp = CongTacResponse(**serialize_model_to_dict(item)) if item else None
            return Return.ok(GetCurrentCongTacResult(item=resp))
