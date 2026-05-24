import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.lich_su_chuc_vu import LichSuChucVuResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetDetailLichSuChucVuQuery:
    id: str


@dataclass
class GetDetailLichSuChucVuResult:
    item: Optional[LichSuChucVuResponse]


class GetDetailLichSuChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetDetailLichSuChucVuQuery
    ) -> Result[GetDetailLichSuChucVuResult, Error]:
        logger.info(f"Getting LichSuChucVu detail: {query.id}")

        async with self.unit_of_work as uow:
            repo = uow.lich_su_chuc_vu_repository
            item = await repo.find_by_id(query.id)

            if not item:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Lịch sử chức vụ không tồn tại",
                        reason="NotFound",
                    )
                )

            resp = serialize_model_to_dict(item)
            return Return.ok(
                GetDetailLichSuChucVuResult(item=LichSuChucVuResponse(**resp))
            )
