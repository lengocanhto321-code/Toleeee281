import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.nhan_vien import NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListNhanVienQuery:
    page: int = 1
    page_size: int = 10
    search: Optional[str] = None
    trang_thai: Optional[str] = None
    loai_nhan_vien: Optional[str] = None
    phong_ban_id: Optional[str] = None
    sort_by: str = "created_at"
    sort_desc: bool = True


@dataclass
class GetListNhanVienResult:
    total: int
    items: list[NhanVienDataResponse]


@dataclass
class GetDetailNhanVienQuery:
    id: str


@dataclass
class GetDetailNhanVienResult:
    nhan_vien: NhanVienDataResponse


class GetNhanVienUseCase:
    """Use case for getting NhanVien list and detail."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def get_list(self, query: GetListNhanVienQuery) -> Result[GetListNhanVienResult, Error]:
        """Get paginated list of NhanVien."""
        logger.info(f"Getting NhanVien list: page={query.page}, page_size={query.page_size}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository

            result = await nhan_vien_repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                search=query.search,
                trang_thai=query.trang_thai,
                loai_nhan_vien=query.loai_nhan_vien,
                phong_ban_id=query.phong_ban_id,
                sort_by=query.sort_by,
                sort_desc=query.sort_desc
            )

            if result.is_err():
                return result

            total, items = result.value

            # Convert to response objects
            response_items = [NhanVienDataResponse(**item) for item in items]

            logger.info(f"Found {total} NhanVien, returning {len(response_items)} items")
            return Return.ok(GetListNhanVienResult(total=total, items=response_items))

    async def get_detail(self, query: GetDetailNhanVienQuery) -> Result[GetDetailNhanVienResult, Error]:
        """Get detail of a NhanVien. Supports lookup by ma_nhan_vien or id."""
        logger.info(f"Getting NhanVien detail: {query.id}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository

            # Try find by ma_nhan_vien first, then fallback to id
            nhan_vien = await nhan_vien_repo.find_by_ma(query.id)
            if not nhan_vien:
                nhan_vien = await nhan_vien_repo.find_by_id(query.id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound"
                    )
                )

            resp = serialize_model_to_dict(nhan_vien)
            response_data = NhanVienDataResponse(**resp)

            logger.info(f"NhanVien {nhan_vien.ma_nhan_vien} found")
            return Return.ok(GetDetailNhanVienResult(nhan_vien=response_data))
