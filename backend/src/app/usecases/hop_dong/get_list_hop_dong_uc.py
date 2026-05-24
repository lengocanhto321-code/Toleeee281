import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.api.schemas.hop_dong import HopDongResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListHopDongQuery:
    nhan_vien_id: str


@dataclass
class GetListHopDongResult:
    items: list[HopDongResponse]


class GetListHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListHopDongQuery
    ) -> Result[GetListHopDongResult, Error]:
        logger.info(f"Getting HopDong list for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            items = await uow.hop_dong_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            response_items = [
                HopDongResponse(**serialize_model_to_dict(i)) for i in items
            ]
            return Return.ok(GetListHopDongResult(items=response_items))
