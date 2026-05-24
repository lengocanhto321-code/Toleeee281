import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetCongTacByIdQuery:
    id: str


@dataclass
class GetCongTacByIdResult:
    item: Optional[CongTacResponse]


class GetCongTacByIdUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetCongTacByIdQuery
    ) -> Result[GetCongTacByIdResult, Error]:
        logger.info(f"Getting CongTac by id: {query.id}")

        async with self.unit_of_work as uow:
            item = await uow.cong_tac_repository.find_by_id(query.id)
            if not item:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phân công công tác",
                        reason="NotFound",
                    )
                )

            resp = serialize_model_to_dict(item)
            return Return.ok(GetCongTacByIdResult(item=CongTacResponse(**resp)))
