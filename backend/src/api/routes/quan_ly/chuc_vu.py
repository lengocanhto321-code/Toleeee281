from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork

from src.api.schemas.chuc_vu import (
    ChucVuCreateRequest,
    ChucVuUpdateRequest,
    ChucVuDataResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.chuc_vu import (
    CreateChucVuUseCase,
    CreateChucVuCommand,
    UpdateChucVuUseCase,
    UpdateChucVuCommand,
    DeleteChucVuUseCase,
    DeleteChucVuCommand,
    GetChucVuUseCase,
    GetListChucVuQuery,
    GetDetailChucVuQuery,
)

from src.api.error import ClientError, ServerError

router = APIRouter()


@router.post(
    "",
    response_model=APIResponse[ChucVuDataResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_chuc_vu(
    body: ChucVuCreateRequest,
    user_context: UserContext = Depends(require_permission("chuc_vu:create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo mới chức vụ."""
    command = CreateChucVuCommand(data=body, actor_id=user_context.user_id)
    use_case = CreateChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "code_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(message="Tạo chức vụ thành công", data=result.value.chuc_vu)


@router.get("", response_model=APIResponseWithMetadata[list[ChucVuDataResponse]])
async def get_list_chuc_vu(
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Số item trên mỗi trang"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo mã, tên chức vụ"),
    trang_thai: Optional[bool] = Query(None, description="Lọc theo trạng thái"),
    loai: Optional[str] = Query(
        None, description="Lọc theo loại: quan_ly, giao_vien, nhan_vien"
    ),
    cap_bac_min: Optional[int] = Query(
        None, ge=1, le=10, description="Lọc theo cấp bậc tối thiểu"
    ),
    cap_bac_max: Optional[int] = Query(
        None, ge=1, le=10, description="Lọc theo cấp bậc tối đa"
    ),
    sort_by: str = Query("cap_bac", description="Sắp xếp theo trường"),
    sort_desc: bool = Query(False, description="Sắp xếp giảm dần"),
    user_context: UserContext = Depends(require_permission("chuc_vu:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách chức vụ (phân trang, mặc định sắp xếp theo cấp bậc)."""
    query = GetListChucVuQuery(
        page=page,
        page_size=page_size,
        search=search,
        trang_thai=trang_thai,
        loai=loai,
        cap_bac_min=cap_bac_min,
        cap_bac_max=cap_bac_max,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )
    use_case = GetChucVuUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách chức vụ thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/{id}", response_model=APIResponse[ChucVuDataResponse])
async def get_detail_chuc_vu(
    id: str = Path(..., description="ID chức vụ"),
    user_context: UserContext = Depends(require_permission("chuc_vu:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết chức vụ."""
    query = GetDetailChucVuQuery(id=id)
    use_case = GetChucVuUseCase(uow)
    result = await use_case.get_detail(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết chức vụ thành công", data=result.value.chuc_vu
    )


@router.put("/{id}", response_model=APIResponse[ChucVuDataResponse])
async def update_chuc_vu(
    id: str = Path(..., description="ID chức vụ"),
    body: ChucVuUpdateRequest = ...,
    user_context: UserContext = Depends(require_permission("chuc_vu:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật chức vụ."""
    command = UpdateChucVuCommand(id=id, data=body, actor_id=user_context.user_id)
    use_case = UpdateChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Cập nhật chức vụ thành công", data=result.value.chuc_vu)


@router.delete("/{id}", response_model=APIResponse[dict])
async def delete_chuc_vu(
    id: str = Path(..., description="ID chức vụ"),
    user_context: UserContext = Depends(require_permission("chuc_vu:delete")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa mềm chức vụ."""
    command = DeleteChucVuCommand(id=id, actor_id=user_context.user_id)
    use_case = DeleteChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "position_in_use":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(message="Xóa chức vụ thành công", data=result.value.chuc_vu)
