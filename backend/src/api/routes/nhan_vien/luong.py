from typing import Optional

from fastapi import APIRouter, Depends, Query

from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponseWithMetadata
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

router = APIRouter()


@router.get("/me", response_model=APIResponseWithMetadata[list[dict]])
async def nv_get_my_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("luong:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    async with uow:
        total, tra_luongs = await uow.tra_luong_repository.get_paginated_by_nhan_vien(
            nhan_vien_id=user_context.nhan_vien_id,
            page=page,
            page_size=page_size,
            nam=nam,
        )

    items = []
    for tl in tra_luongs:
        d = serialize_model_to_dict(tl)
        items.append(d)

    return APIResponseWithMetadata(
        message="Lay danh sach luong thanh cong",
        data=items,
        metadata={
            "total": total,
            "page": page,
            "per_page": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        },
    )
