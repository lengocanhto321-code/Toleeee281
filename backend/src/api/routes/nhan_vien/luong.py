from typing import Optional

from fastapi import APIRouter, Depends, Query

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponseWithMetadata
from src.api.error import ServerError
from src.app.usecases.luong import (
    GetListLuongQuery,
    GetListLuongUseCase,
)

router = APIRouter()


@router.get("/me", response_model=APIResponseWithMetadata[list[dict]])
async def nv_get_my_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("luong:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetListLuongQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=user_context.nhan_vien_id,
        hieu_luc=None,
    )

    use_case = GetListLuongUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = []
    for luong in result.value.items:
        items.append(
            {
                "id": luong.id,
                "thang": luong.thang,
                "nam": luong.nam,
                "nhan_vien_id": luong.nhan_vien_id,
                "nhan_vien_ho_ten": luong.nhan_vien.ho_ten if luong.nhan_vien else None,
                "tong_thu_nhap": luong.tong_thu_nhap,
                "tong_khau_tru": luong.tong_khau_tru,
                "luong_thuc_nhan": luong.luong_thuc_nhan,
                "ngay_thanh_toan": luong.ngay_thanh_toan,
                "chi_tiet": {
                    "luong_co_ban": luong.luong_co_ban,
                    "phu_cap": luong.phu_cap_chuc_vu + luong.phu_cap_khac,
                    "thuong": luong.thuong,
                    "bao_hiem": luong.bhxh + luong.bhyt + luong.bhtn,
                    "thue": luong.thue_tncn,
                    "khac": luong.khau_tru_khac,
                },
            }
        )

    return APIResponseWithMetadata(
        message="Lay danh sach luong thanh cong",
        data=items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )
