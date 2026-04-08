import logging
from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return
from src.api.schemas.phong_ban import PhongBanDataResponse
from src.api.schemas.common import Metadata

logger = logging.getLogger(__name__)


@dataclass
class GetListPhongBanQuery:
    """Query for listing departments."""
    page: int
    page_size: int
    search: Optional[str] = None
    loai: Optional[str] = None
    trang_thai: Optional[bool] = None
    sort_by: str = "created_at"
    sort_desc: bool = True


@dataclass
class GetListPhongBanResult:
    """Result for listing departments."""
    items: List[PhongBanDataResponse]
    metadata: Metadata


@dataclass
class GetDetailPhongBanQuery:
    """Query for fetching detailed department info."""
    id: str


@dataclass
class GetDetailPhongBanResult:
    """Result for detailed department."""
    phong_ban: PhongBanDataResponse


class GetPhongBanUseCase:
    """Use cases for querying PhongBan."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def get_list(self, query: GetListPhongBanQuery) -> Result[GetListPhongBanResult, Error]:
        """Fetch a paginated list of departments."""
        async with self.unit_of_work as uow:
            repo = uow.phong_ban_repository
            result = await repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                search=query.search,
                loai=query.loai,
                trang_thai=query.trang_thai,
                sort_by=query.sort_by,
                sort_desc=query.sort_desc
            )
            if result.is_err():
                return Return.err(result.err())
            total, rows = result.ok()
            items = [PhongBanDataResponse(**row) for row in rows]
            total_pages = (total + query.page_size - 1) // query.page_size if total > 0 else 0

            metadata = Metadata(
                page=query.page,
                per_page=query.page_size,
                total=total,
                total_pages=total_pages
            )

            return Return.ok(GetListPhongBanResult(items=items, metadata=metadata))

    async def get_detail(self, query: GetDetailPhongBanQuery) -> Result[GetDetailPhongBanResult, Error]:
        """Fetch a single department."""
        async with self.unit_of_work as uow:
            repo = uow.phong_ban_repository
            result = await repo.get_detail_with_stats(query.id)

            if result.is_err():
                return Return.err(result.err())

            resp = result.ok()

            if not resp:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phòng ban.",
                        reason="Not Found"
                    )
                )

            return Return.ok(GetDetailPhongBanResult(phong_ban=PhongBanDataResponse(**resp)))
