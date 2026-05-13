from typing import Optional, List

from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork

router = APIRouter(tags=["Nhan Vien"])

from src.api.schemas.nhan_vien import (
    NhanVienCreateRequest,
    NhanVienUpdateRequest,
    NhanVienDataResponse,
)
from src.api.schemas.nhan_vien_detail import (
    NhanVienDetailResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.nhan_vien import (
    CreateNhanVienUseCase,
    CreateNhanVienCommand,
    UpdateNhanVienUseCase,
    UpdateNhanVienCommand,
    DeleteNhanVienUseCase,
    DeleteNhanVienCommand,
    RestoreNhanVienUseCase,
    RestoreNhanVienCommand,
    GetNhanVienUseCase,
    GetListNhanVienQuery,
    GetDetailNhanVienQuery,
    ImportNhanVienUseCase,
    ImportNhanVienCommand,
)

from src.api.error import ClientError, ServerError
from src.app.usecases.nhan_vien import (
    CreateNhanVienUseCase,
    CreateNhanVienCommand,
    UpdateNhanVienUseCase,
    UpdateNhanVienCommand,
    DeleteNhanVienUseCase,
    DeleteNhanVienCommand,
    RestoreNhanVienUseCase,
    RestoreNhanVienCommand,
    GetListNhanVienUseCase,
    GetListNhanVienQuery,
    GetListNhanVienResult,
    GetDetailNhanVienUseCase,
    GetDetailNhanVienQuery,
    GetDetailNhanVienResult,
    ImportNhanVienUseCase,
    ImportNhanVienCommand,
    ImportNhanVienResult,
)


@router.post("", response_model=APIResponse[NhanVienDataResponse])
async def create_nhan_vien(
    body: NhanVienCreateRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:create")),
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

    return APIResponse(message="Tạo nhân viên thành công", data=result.value.nhan_vien)


class ImportRequest(BaseModel):
    rows: List[dict]


@router.post("/import", response_model=APIResponse[dict])
async def import_nhan_vien(
    body: ImportRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Import nhân viên từ file Excel (frontend parsed JSON rows)."""
    command = ImportNhanVienCommand(rows=body.rows, actor_id=user_context.user_id)
    use_case = ImportNhanVienUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message=f"Import hoàn tất: {r.success} thành công, {r.failed} thất bại",
        data={
            "total": r.total,
            "success": r.success,
            "failed": r.failed,
            "errors": [
                {"row": e.row, "ho_ten": e.ho_ten, "error": e.error} for e in r.errors
            ],
        },
    )


from src.repository.nhan_vien_repository import NhanVienFilterParams


@router.get("", response_model=APIResponseWithMetadata[list[NhanVienDataResponse]])
async def get_list_nhan_vien(
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(20, ge=1, le=100, description="Số item trên mỗi trang"),
    search: Optional[str] = Query(
        None, description="Tìm kiếm theo mã, tên, email, SĐT, CCCD, môn dạy"
    ),
    trang_thai: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    loai_nhan_vien: Optional[str] = Query(None, description="Lọc theo loại nhân viên"),
    gioi_tinh: Optional[str] = Query(None, description="Lọc theo giới tính"),
    cap_hoc: Optional[str] = Query(None, description="Lọc theo cấp học"),
    phong_ban_id: Optional[str] = Query(None, description="Lọc theo phòng ban"),
    loai_hop_dong: Optional[str] = Query(None, description="Lọc theo loại hợp đồng"),
    hang_chuc_danh: Optional[str] = Query(None, description="Lọc theo hạng chức danh"),
    ngay_vao_lam_tu: Optional[str] = Query(
        None, description="Ngày vào làm từ (YYYY-MM-DD)"
    ),
    ngay_vao_lam_den: Optional[str] = Query(
        None, description="Ngày vào làm đến (YYYY-MM-DD)"
    ),
    ngay_sinh_tu: Optional[str] = Query(None, description="Ngày sinh từ (YYYY-MM-DD)"),
    ngay_sinh_den: Optional[str] = Query(
        None, description="Ngày sinh đến (YYYY-MM-DD)"
    ),
    he_so_luong_tu: Optional[float] = Query(None, description="Hệ số lương từ"),
    he_so_luong_den: Optional[float] = Query(None, description="Hệ số lương đến"),
    la_dang_vien: Optional[bool] = Query(None, description="Lọc đảng viên"),
    la_doan_vien: Optional[bool] = Query(None, description="Lọc đoàn viên"),
    co_bhxh: Optional[bool] = Query(None, description="Có BHXH"),
    co_ngan_hang: Optional[bool] = Query(None, description="Có tài khoản ngân hàng"),
    sort_by: str = Query("created_at", description="Sắp xếp theo trường"),
    sort_desc: bool = Query(True, description="Sắp xếp giảm dần"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    filters = NhanVienFilterParams(
        search=search,
        trang_thai=trang_thai,
        loai_nhan_vien=loai_nhan_vien,
        gioi_tinh=gioi_tinh,
        cap_hoc=cap_hoc,
        phong_ban_id=phong_ban_id,
        loai_hop_dong=loai_hop_dong,
        hang_chuc_danh=hang_chuc_danh,
        ngay_vao_lam_tu=ngay_vao_lam_tu,
        ngay_vao_lam_den=ngay_vao_lam_den,
        ngay_sinh_tu=ngay_sinh_tu,
        ngay_sinh_den=ngay_sinh_den,
        he_so_luong_tu=he_so_luong_tu,
        he_so_luong_den=he_so_luong_den,
        la_dang_vien=la_dang_vien,
        la_doan_vien=la_doan_vien,
        co_bhxh=co_bhxh,
        co_ngan_hang=co_ngan_hang,
    )
    query = GetListNhanVienQuery(
        page=page,
        page_size=page_size,
        filters=filters,
        sort_by=sort_by,
        sort_desc=sort_desc,
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
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/{id}", response_model=APIResponse[NhanVienDetailResponse])
async def get_detail_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết nhân viên + toàn bộ dữ liệu liên quan."""
    query = GetDetailNhanVienQuery(id=id)
    use_case = GetNhanVienUseCase(uow)
    result = await use_case.get_detail(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    # Convert GetDetailNhanVienResult to NhanVienDetailResponse
    detail_result = result.value
    response_data = NhanVienDetailResponse(
        **detail_result.nhan_vien.dict(),
        hop_dongs=detail_result.hop_dongs,
        cong_tacs=detail_result.cong_tacs,
        lich_su_chuc_vu=detail_result.lich_su_chuc_vu,
        nguoi_thans=detail_result.nguoi_thans,
        bang_caps=detail_result.bang_caps,
        khen_thuongs=detail_result.khen_thuongs,
        ky_luats=detail_result.ky_luats,
        luong_hien_tai=detail_result.luong_hien_tai,
    )

    return APIResponse(
        message="Lấy chi tiết nhân viên thành công",
        data=response_data,
    )


@router.put("/{id}", response_model=APIResponse[NhanVienDataResponse])
async def update_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    body: NhanVienUpdateRequest = ...,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
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
        message="Cập nhật nhân viên thành công", data=result.value.nhan_vien
    )


@router.delete("/{id}", response_model=APIResponse[dict])
async def delete_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:delete")),
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

    return APIResponse(message="Xóa nhân viên thành công", data=result.value.nhan_vien)


@router.post("/{id}/restore", response_model=APIResponse[NhanVienDataResponse])
async def restore_nhan_vien(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Khôi phục nhân viên đã xóa mềm."""
    command = RestoreNhanVienCommand(id=id, actor_id=user_context.user_id)
    use_case = RestoreNhanVienUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "not_deleted":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Khôi phục nhân viên thành công",
        data=result.value.nhan_vien,
    )
