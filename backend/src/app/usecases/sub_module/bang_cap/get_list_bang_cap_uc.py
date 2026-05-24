import logging
from dataclasses import dataclass
from typing import List

from libs.result import Result, Error, Return
from src.api.schemas.sub_modules import BangCapResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListBangCapQuery:
    nhan_vien_id: str


@dataclass
class GetListBangCapResult:
    items: List[BangCapResponse]


class GetListBangCapUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListBangCapQuery
    ) -> Result[GetListBangCapResult, Error]:
        logger.info(f"Getting BangCap list for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            items = await uow.bang_cap_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            response_items = [
                BangCapResponse(**serialize_model_to_dict(i)) for i in items
            ]
            return Return.ok(GetListBangCapResult(items=response_items))
