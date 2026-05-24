import logging
from dataclasses import dataclass
from typing import List

from libs.result import Result, Error, Return
from src.api.schemas.cong_tac import CongTacResponse

logger = logging.getLogger(__name__)


@dataclass
class GetAllCongTacQuery:
    page: int = 1
    page_size: int = 10


@dataclass
class GetAllCongTacResult:
    total: int
    items: List[CongTacResponse]


class GetAllCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetAllCongTacQuery
    ) -> Result[GetAllCongTacResult, Error]:
        logger.info(
            f"Getting all CongTac: page={query.page}, page_size={query.page_size}"
        )

        async with self.unit_of_work as uow:
            result = await uow.cong_tac_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
            )

            if result.is_err():
                return result

            total, items = result.value
            response_items = [CongTacResponse(**item) for item in items]

            return Return.ok(GetAllCongTacResult(total=total, items=response_items))
