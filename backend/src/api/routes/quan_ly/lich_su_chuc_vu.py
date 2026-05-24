from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork

from src.api.schemas.lich_su_chuc_vu import (
    LichSuChucVuCreateRequest,
    LichSuChucVuUpdateRequest,
    LichSuChucVuResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.lich_su_chuc_vu import (
    GetListLichSuChucVuUseCase,
    GetListLichSuChucVuQuery,
    GetDetailLichSuChucVuUseCase,
    GetDetailLichSuChucVuQuery,
    CreateLichSuChucVuUseCase,
    CreateLichSuChucVuCommand,
    UpdateLichSuChucVuUseCase,
    UpdateLichSuChucVuCommand,
    DeleteLichSuChucVuUseCase,
    DeleteLichSuChucVuCommand,
)

from src.api.error import ClientError, ServerError

router = APIRouter()


@router.get(
    "",
    response_model=APIResponseWithMetadata[list[LichSuChucVuResponse]],
)
async def get_list_lich_su_chuc_vu(
    nhan_vien_id: Optional[str] = Query(None, description="Lọc theo nhân viên"),
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Số item trên mỗi trang"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách lịch sử chức vụ (phân trang)."""
    query = GetListLichSuChucVuQuery(
        nhan_vien_id=nhan_vien_id,
        page=page,
        page_size=page_size,
    )
    use_case = GetListLichSuChucVuUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách lịch sử chức vụ thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/{id}", response_model=APIResponse[LichSuChucVuResponse])
async def get_detail_lich_su_chuc_vu(
    id: str = Path(..., description="ID lịch sử chức vụ"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết lịch sử chức vụ."""
    query = GetDetailLichSuChucVuQuery(id=id)
    use_case = GetDetailLichSuChucVuUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết lịch sử chức vụ thành công",
        data=result.value.item,
    )


@router.post(
    "",
    response_model=APIResponse[LichSuChucVuResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_lich_su_chuc_vu(
    body: LichSuChucVuCreateRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo mới lịch sử chức vụ."""
    command = CreateLichSuChucVuCommand(
        nhan_vien_id=body.nhan_vien_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = CreateLichSuChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in ["nhan_vien_not_found", "chuc_vu_not_found"]:
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Tạo lịch sử chức vụ thành công",
        data=result.value.item,
    )


@router.put("/{id}", response_model=APIResponse[LichSuChucVuResponse])
async def update_lich_su_chuc_vu(
    id: str = Path(..., description="ID lịch sử chức vụ"),
    body: LichSuChucVuUpdateRequest = ...,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật lịch sử chức vụ."""
    command = UpdateLichSuChucVuCommand(
        id=id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = UpdateLichSuChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật lịch sử chức vụ thành công",
        data=result.value.item,
    )


@router.delete("/{id}", response_model=APIResponse[dict])
async def delete_lich_su_chuc_vu(
    id: str = Path(..., description="ID lịch sử chức vụ"),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa lịch sử chức vụ."""
    command = DeleteLichSuChucVuCommand(
        id=id,
        actor_id=user_context.user_id,
    )
    use_case = DeleteLichSuChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Xóa lịch sử chức vụ thành công", data={"success": True})
