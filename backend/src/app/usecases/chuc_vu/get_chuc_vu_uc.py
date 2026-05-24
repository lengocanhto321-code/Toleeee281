import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.chuc_vu import ChucVuDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListChucVuQuery:
    page: int = 1
    page_size: int = 10
    search: Optional[str] = None
    trang_thai: Optional[bool] = None
    loai: Optional[str] = None
    cap_bac_min: Optional[int] = None
    cap_bac_max: Optional[int] = None
    sort_by: str = "cap_bac"
    sort_desc: bool = False


@dataclass
class GetListChucVuResult:
    total: int
    items: list[ChucVuDataResponse]


@dataclass
class GetDetailChucVuQuery:
    id: str


@dataclass
class GetDetailChucVuResult:
    chuc_vu: ChucVuDataResponse


class GetChucVuUseCase:
    """Use case for getting ChucVu list and detail."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def get_list(
        self, query: GetListChucVuQuery
    ) -> Result[GetListChucVuResult, Error]:
        """Get paginated list of ChucVu sorted by cap_bac."""
        logger.info(
            f"Getting ChucVu list: page={query.page}, page_size={query.page_size}"
        )

        async with self.unit_of_work as uow:
            chuc_vu_repo = uow.chuc_vu_repository

            result = await chuc_vu_repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                search=query.search,
                trang_thai=query.trang_thai,
                loai=query.loai,
                cap_bac_min=query.cap_bac_min,
                cap_bac_max=query.cap_bac_max,
                sort_by=query.sort_by,
                sort_desc=query.sort_desc,
            )

            if result.is_err():
                return result

            total, items = result.value

            # Convert to response objects
            response_items = [ChucVuDataResponse(**item) for item in items]

            logger.info(f"Found {total} ChucVu, returning {len(response_items)} items")
            return Return.ok(GetListChucVuResult(total=total, items=response_items))

    async def get_detail(
        self, query: GetDetailChucVuQuery
    ) -> Result[GetDetailChucVuResult, Error]:
        """Get detail of a ChucVu."""
        logger.info(f"Getting ChucVu detail: {query.id}")

        async with self.unit_of_work as uow:
            chuc_vu_repo = uow.chuc_vu_repository

            chuc_vu = await chuc_vu_repo.find_by_id(query.id)
            if not chuc_vu:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Chức vụ không tồn tại",
                        reason="NotFound",
                    )
                )

            resp = serialize_model_to_dict(chuc_vu)
            response_data = ChucVuDataResponse(**resp)

            logger.info(f"ChucVu {chuc_vu.ma_chuc_vu} found")
            return Return.ok(GetDetailChucVuResult(chuc_vu=response_data))
