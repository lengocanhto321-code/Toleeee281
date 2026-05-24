from dataclasses import asdict
from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status

from libs.datetime import get_utc_now
from libs.result import is_err
from src.api.auth import (
    UserContext,
    require_permission,
)
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.app.usecases.nghi_phep import (
    CreateDonNghiUseCase,
    CreateDonNghiCommand,
    GetDonNghiQuery,
    GetDonNghiDetailQuery,
    GetListDonNghiUseCase,
    GetDonNghiDetailUseCase,
    DeleteDonNghiUseCase,
    DeleteDonNghiCommand,
)
from src.app.usecases.cham_cong import (
    GetMyMonthlyQuery,
    GetMyMonthlyUseCase,
)

router = APIRouter()


@router.get("/don")
async def nv_get_my_don_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    trang_thai: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetDonNghiQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=user_context.nhan_vien_id,
        trang_thai=trang_thai,
        loai_nghi=None,
    )

    use_case = GetListDonNghiUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Lay danh sach thanh cong",
        "data": result.value.items,
        "metadata": {
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    }


@router.post("/don", status_code=status.HTTP_201_CREATED)
async def nv_create_don_nghi(
    body: dict,
    user_context: UserContext = Depends(
        require_permission("nghi_phep:create", "nghi_phep:view_own")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = CreateDonNghiCommand(
        nhan_vien_id=user_context.nhan_vien_id,
        loai_nghi=body.get("loai_nghi"),
        tu_ngay=body.get("tu_ngay"),
        den_ngay=body.get("den_ngay"),
        ly_do=body.get("ly_do", ""),
        files=body.get("files", []),
        nguoi_tao_id=user_context.user_id,
    )

    use_case = CreateDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in ["invalid_data", "missing_document"]:
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Tao don nghi phep thanh cong", "data": result.value.don}


@router.get("/don/{don_id}")
async def nv_get_don_nghi_detail(
    don_id: str = Path(..., description="ID don nghi phep"),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetDonNghiDetailQuery(don_id=don_id)

    use_case = GetDonNghiDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return {"message": "Lay chi tiet thanh cong", "data": result.value.don}


@router.get("/me")
async def nv_get_my_don_nghi(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    trang_thai: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetDonNghiQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=user_context.nhan_vien_id,
        trang_thai=trang_thai,
        loai_nghi=None,
    )

    use_case = GetListDonNghiUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Lay danh sach thanh cong",
        "data": result.value.items,
        "metadata": {
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    }


@router.get("/cham-cong/me")
async def nv_get_my_cham_cong(
    thang: Optional[int] = Query(None, ge=1, le=12),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    now = get_utc_now()
    thang = thang or now.month
    nam = nam or now.year

    query = GetMyMonthlyQuery(
        nhan_vien_id=user_context.nhan_vien_id,
        thang=thang,
        nam=nam,
    )

    use_case = GetMyMonthlyUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lay du lieu thanh cong",
        data=asdict(result.value),
    )


@router.delete("/don/{don_id}")
async def nv_delete_don_nghi(
    don_id: str = Path(..., description="ID don nghi phep"),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = DeleteDonNghiCommand(
        don_id=don_id,
        nguoi_xoa_id=user_context.user_id,
    )

    use_case = DeleteDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Xoa don nghi phep thanh cong", "data": result.value}
