import logging
from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return
from src.api.schemas.lich_su_chuc_vu import LichSuChucVuResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListLichSuChucVuQuery:
    nhan_vien_id: Optional[str] = None
    page: int = 1
    page_size: int = 10


@dataclass
class GetListLichSuChucVuResult:
    total: int
    items: List[LichSuChucVuResponse]


class GetListLichSuChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListLichSuChucVuQuery
    ) -> Result[GetListLichSuChucVuResult, Error]:
        logger.info(f"Getting LichSuChucVu list: page={query.page}")

        async with self.unit_of_work as uow:
            repo = uow.lich_su_chuc_vu_repository
            result = await repo.get_paginated(
                nhan_vien_id=query.nhan_vien_id,
                page=query.page,
                page_size=query.page_size,
            )

            if result.is_err():
                return result

            total, items = result.value
            response_items = [LichSuChucVuResponse(**item) for item in items]

            return Return.ok(
                GetListLichSuChucVuResult(total=total, items=response_items)
            )
