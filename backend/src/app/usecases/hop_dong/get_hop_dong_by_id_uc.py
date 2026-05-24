import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.hop_dong import HopDongResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetHopDongByIdQuery:
    id: str


@dataclass
class GetHopDongByIdResult:
    item: Optional[HopDongResponse]


class GetHopDongByIdUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetHopDongByIdQuery
    ) -> Result[GetHopDongByIdResult, Error]:
        logger.info(f"Getting HopDong by id: {query.id}")

        async with self.unit_of_work as uow:
            item = await uow.hop_dong_repository.find_by_id(query.id)
            if not item:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Hợp đồng không tồn tại",
                        reason="NotFound",
                    )
                )
            resp = HopDongResponse(**serialize_model_to_dict(item))
            return Return.ok(GetHopDongByIdResult(item=resp))
