import logging
from dataclasses import dataclass, field
from typing import Optional, List

from libs.result import Result, Error, Return
from src.api.schemas.nhan_vien import NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.repository.nhan_vien_repository import NhanVienFilterParams

logger = logging.getLogger(__name__)


@dataclass
class GetListNhanVienQuery:
    page: int = 1
    page_size: int = 10
    filters: NhanVienFilterParams = field(default_factory=NhanVienFilterParams)
    sort_by: str = "created_at"
    sort_desc: bool = True


@dataclass
class GetListNhanVienResult:
    total: int
    items: List = field(default_factory=list)


class GetListNhanVienUseCase:
    """Use case for getting paginated NhanVien list."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListNhanVienQuery
    ) -> Result[GetListNhanVienResult, Error]:
        logger.info(
            f"Getting NhanVien list: page={query.page}, page_size={query.page_size}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository

            result = await nhan_vien_repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                filters=query.filters,
                sort_by=query.sort_by,
                sort_desc=query.sort_desc,
            )

            if result.is_err():
                return result

            total, items = result.value
            response_items = [NhanVienDataResponse(**item) for item in items]

            logger.info(
                f"Found {total} NhanVien, returning {len(response_items)} items"
            )
            return Return.ok(GetListNhanVienResult(total=total, items=response_items))
