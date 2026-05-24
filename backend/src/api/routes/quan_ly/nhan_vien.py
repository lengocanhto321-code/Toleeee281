from typing import Optional, List

from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel

from libs.result import is_err, Error
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.app.usecases.auth.reset_password_uc import (
    ResetPasswordCommand,
    ResetPasswordUseCase,
)

router = APIRouter()

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
    ImportNhanVienResult,
)
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
from src.app.usecases.nhan_vien.batch_phan_bo_uc import (
    BatchPhanBoUseCase,
    BatchPhanBoCommand,
)
from src.app.usecases.nhan_vien.batch_phan_bo_chuc_vu_uc import (
    BatchPhanBoChucVuUseCase,
    BatchPhanBoChucVuCommand,
)
from src.app.usecases.nhan_vien.batch_bo_nhiem_uc import (
    BatchBoNhiemUseCase,
    BatchBoNhiemCommand,
)
from src.app.usecases.dieu_chuyen.transfer_employee_uc import (
    TransferEmployeeUseCase,
    TransferEmployeeCommand,
    GetEmployeeTransferHistoryQuery,
    GetTransferOptionsQuery,
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

    return APIResponse(
        message="Tạo nhân viên thành công",
        data={
            **result.value.nhan_vien.dict(),
            "tai_khoan": result.value.tai_khoan,
        },
    )


class ImportRequest(BaseModel):
    rows: List[dict]


class BatchPhanBoRequest(BaseModel):
    nhan_vien_ids: List[str]
    phong_ban_id: str


class BatchPhanBoChucVuRequest(BaseModel):
    nhan_vien_ids: List[str]
    chuc_vu_id: str


class BatchBoNhiemRequest(BaseModel):
    nhan_vien_ids: List[str]
    chuc_vu_id: str
    ngay_bo_nhiem: str
    so_quyet_dinh: Optional[str] = None


class TransferEmployeeRequest(BaseModel):
    nhan_vien_id: str
    phong_ban_id_moi: str
    chuc_vu_id_moi: str
    ngay_dieu_chuyen: str
    ly_do: Optional[str] = None
    so_quyet_dinh: Optional[str] = None
    ghi_chu: Optional[str] = None


@router.post("/batch-phan-bo", response_model=APIResponse[dict])
async def batch_phan_bo(
    body: BatchPhanBoRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Phân bổ hàng loạt nhân viên vào phòng ban."""
    command = BatchPhanBoCommand(
        nhan_vien_ids=body.nhan_vien_ids,
        phong_ban_id=body.phong_ban_id,
        actor_id=user_context.user_id,
    )
    use_case = BatchPhanBoUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message=f"Phân bổ thành công {r.success_count} nhân viên"
        + (f", {len(r.failed_ids)} thất bại" if r.failed_ids else ""),
        data={
            "success_count": r.success_count,
            "failed_ids": r.failed_ids,
        },
    )


@router.post("/batch-phan-bo-chuc-vu", response_model=APIResponse[dict])
async def batch_phan_bo_chuc_vu(
    body: BatchPhanBoChucVuRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Phân bổ chức vụ hàng loạt cho nhân viên."""
    command = BatchPhanBoChucVuCommand(
        nhan_vien_ids=body.nhan_vien_ids,
        chuc_vu_id=body.chuc_vu_id,
        actor_id=user_context.user_id,
    )
    use_case = BatchPhanBoChucVuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message=f"Phân bổ thành công {r.success_count} nhân viên"
        + (f", {len(r.failed_ids)} thất bại" if r.failed_ids else ""),
        data={
            "success_count": r.success_count,
            "failed_ids": r.failed_ids,
        },
    )


@router.post("/batch-bo-nhiem", response_model=APIResponse[dict])
async def batch_bo_nhiem(
    body: BatchBoNhiemRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Bổ nhiệm chức vụ hàng loạt cho nhân viên."""
    from datetime import datetime as dt

    ngay = dt.strptime(body.ngay_bo_nhiem, "%Y-%m-%d").date()
    command = BatchBoNhiemCommand(
        nhan_vien_ids=body.nhan_vien_ids,
        chuc_vu_id=body.chuc_vu_id,
        ngay_bo_nhiem=ngay,
        so_quyet_dinh=body.so_quyet_dinh,
        actor_id=user_context.user_id,
    )
    use_case = BatchBoNhiemUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message=f"Bổ nhiệm thành công {r.success_count} nhân viên"
        + (f", {len(r.failed_ids)} thất bại" if r.failed_ids else ""),
        data={
            "success_count": r.success_count,
            "failed_ids": r.failed_ids,
        },
    )


@router.post("/dieu-chuyen", response_model=APIResponse[dict])
async def dieu_chuyen_nhan_vien(
    body: TransferEmployeeRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Điều chuyển nhân viên sang phòng ban/chức vụ mới."""
    command = TransferEmployeeCommand(
        nhan_vien_id=body.nhan_vien_id,
        phong_ban_id_moi=body.phong_ban_id_moi,
        chuc_vu_id_moi=body.chuc_vu_id_moi,
        ngay_dieu_chuyen=body.ngay_dieu_chuyen,
        ly_do=body.ly_do,
        so_quyet_dinh=body.so_quyet_dinh,
        ghi_chu=body.ghi_chu,
        actor_id=user_context.user_id,
    )
    use_case = TransferEmployeeUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in (
            "nhan_vien_not_found",
            "phong_ban_not_found",
            "chuc_vu_not_found",
        ):
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in (
            "invalid_status",
            "phong_ban_inactive",
            "chuc_vu_inactive",
            "loai_mismatch",
        ):
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    r = result.value
    return APIResponse(
        message="Điều chuyển nhân viên thành công",
        data={
            "nhan_vien_id": r.nhan_vien_id,
            "phong_ban_cu": r.phong_ban_cu,
            "phong_ban_moi": r.phong_ban_moi,
            "chuc_vu_cu": r.chuc_vu_cu,
            "chuc_vu_moi": r.chuc_vu_moi,
            "ngay_dieu_chuyen": r.ngay_dieu_chuyen,
            "cong_tac_moi_id": r.cong_tac_moi_id,
            "lich_su_chuc_vu_id": r.lich_su_chuc_vu_id,
        },
    )


@router.get("/{id}/dieu-chuyen/lich-su", response_model=APIResponse[dict])
async def get_dieu_chuyen_lich_su(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy lịch sử điều chuyển của nhân viên."""
    query = GetEmployeeTransferHistoryQuery(nhan_vien_id=id)
    use_case = TransferEmployeeUseCase(uow)
    result = await use_case.get_history(query)

    if is_err(result):
        error = result.value
        if error.code == "nhan_vien_not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy lịch sử điều chuyển thành công",
        data={"items": result.value.items},
    )


@router.get("/{id}/dieu-chuyen/tuy-chon", response_model=APIResponse[dict])
async def get_dieu_chuyen_tuy_chon(
    id: str = Path(..., description="ID nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách phòng ban/chức vụ khả dụng để điều chuyển."""
    query = GetTransferOptionsQuery(nhan_vien_id=id)
    use_case = TransferEmployeeUseCase(uow)
    result = await use_case.get_options(query)

    if is_err(result):
        error = result.value
        if error.code == "nhan_vien_not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    r = result.value
    return APIResponse(
        message="Lấy tùy chọn điều chuyển thành công",
        data={
            "phong_ban_hien_tai": r.phong_ban_hien_tai,
            "chuc_vu_hien_tai": r.chuc_vu_hien_tai,
            "phong_ban_kha_dung": r.phong_ban_kha_dung,
            "chuc_vu_kha_dung": r.chuc_vu_kha_dung,
            "loai_nhan_vien": r.loai_nhan_vien,
        },
    )


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
            "thong_ke": result.value.thong_ke,
            "phong_ban_list": result.value.phong_ban_list,
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


@router.post("/{id}/reset-mat-khau", response_model=APIResponse[dict])
async def reset_mat_khau(
    id: str = Path(..., description="ID hoặc mã nhân viên"),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Đặt lại mật khẩu cho nhân viên. Trả về mật khẩu mới (chỉ hiện 1 lần)."""
    async with uow as ctx:
        nv = await ctx.nhan_vien_repository.find_by_id(id)
        if not nv:
            nv = await ctx.nhan_vien_repository.find_by_ma(id)
        if not nv:
            raise ClientError(
                base_error=Error(code="not_found", message="Không tìm thấy nhân viên"),
                status_code=404,
            )

    command = ResetPasswordCommand(nhan_vien_id=nv.id)
    use_case = ResetPasswordUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Đặt lại mật khẩu thành công",
        data={
            "ten_dang_nhap": result.value.ten_dang_nhap,
            "mat_khau_moi": result.value.mat_khau_moi,
        },
    )
