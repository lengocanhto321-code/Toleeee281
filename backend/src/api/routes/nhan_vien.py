from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import get_current_admin, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork

from src.api.schemas.nhan_vien import (
    NhanVienCreateRequest,
    NhanVienUpdateRequest,
    NhanVienDataResponse
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.nhan_vien import (
    CreateNhanVienUseCase,
    CreateNhanVienCommand,
    UpdateNhanVienUseCase,
    UpdateNhanVienCommand,
    DeleteNhanVienUseCase,
    DeleteNhanVienCommand,
    GetNhanVienUseCase,
    GetListNhanVienQuery,
    GetDetailNhanVienQuery,
)

from src.api.error import ClientError, ServerError

router = APIRouter(tags=["NhanVien"])


@router.post("", response_model=APIResponse[NhanVienDataResponse], status_code=status.HTTP_201_CREATED)
async def create_nhan_vien(
    body: NhanVienCreateRequest,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo mới nhân viên."""
    command = CreateNhanVienCommand(data=body, actor_id=user_context.user_id)
    use_case = CreateNhanVienUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "email_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        if error.code == "cccd_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        if error.code == "code_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Tạo nhân viên thành công",
        data=result.value.nhan_vien
    )


@router.get("", response_model=APIResponseWithMetadata[list[NhanVienDataResponse]])
async def get_list_nhan_vien(
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Số item trên mỗi trang"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo mã, tên, email, SĐT"),
    trang_thai: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    loai_nhan_vien: Optional[str] = Query(None, description="Lọc theo loại nhân viên"),
    phong_ban_id: Optional[str] = Query(None, description="Lọc theo phòng ban"),
    sort_by: str = Query("created_at", description="Sắp xếp theo trường"),
    sort_desc: bool = Query(True, description="Sắp xếp giảm dần"),
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách nhân viên (phân trang)."""
    query = GetListNhanVienQuery(
        page=page,
        page_size=page_size,
        search=search,
        trang_thai=trang_thai,
        loai_nhan_vien=loai_nhan_vien,
        phong_ban_id=phong_ban_id,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    use_case = GetNhanVienUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách nhân viên thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size
        }
    )


@router.get("/{id}", response_model=APIResponse[NhanVienDataResponse])
async def get_detail_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết nhân viên."""
    query = GetDetailNhanVienQuery(id=id)
    use_case = GetNhanVienUseCase(uow)
    result = await use_case.get_detail(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết nhân viên thành công",
        data=result.value.nhan_vien
    )


@router.put("/{id}", response_model=APIResponse[NhanVienDataResponse])
async def update_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    body: NhanVienUpdateRequest = ...,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật nhân viên."""
    command = UpdateNhanVienCommand(id=id, data=body, actor_id=user_context.user_id)
    use_case = UpdateNhanVienUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "email_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        if error.code == "cccd_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật nhân viên thành công",
        data=result.value.nhan_vien
    )


@router.delete("/{id}", response_model=APIResponse[dict])
async def delete_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa mềm nhân viên."""
    command = DeleteNhanVienCommand(id=id, actor_id=user_context.user_id)
    use_case = DeleteNhanVienUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "cannot_delete_active_employee":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Xóa nhân viên thành công",
        data=result.value.nhan_vien
    )
