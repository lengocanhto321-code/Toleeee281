"""
Upload API Routes - File upload and document management
"""

import logging
import os
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    Query,
    Path,
)
from fastapi.responses import FileResponse

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.service.upload_service import UploadService
from src.app.usecases.tai_lieu import (
    UploadTaiLieuCommand,
    UploadTaiLieuUseCase,
    GetTaiLieuListQuery,
    GetTaiLieuListUseCase,
    GetTaiLieuByNhanVienQuery,
    GetTaiLieuByNhanVienUseCase,
    GetTaiLieuDetailQuery,
    GetTaiLieuDetailUseCase,
    UpdateTaiLieuCommand,
    UpdateTaiLieuUseCase,
    DeleteTaiLieuCommand,
    DeleteTaiLieuUseCase,
)
from src.api.schemas.upload import (
    TaiLieuUploadResponse,
    TaiLieuUpdateRequest,
    UploadResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.api.error import ClientError, ServerError

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "/home/enles04/hr_management/backend/uploads"


def get_upload_service() -> UploadService:
    return UploadService(upload_dir=UPLOAD_DIR)


@router.post("/files", response_model=APIResponse[UploadResponse])
async def upload_file(
    file: UploadFile = File(..., description="File cần upload"),
    nhan_vien_id: str = Form(..., description="ID nhân viên"),
    loai_tai_lieu: str = Form(..., description="Loại tài liệu"),
    ten_tai_lieu: str = Form(..., description="Tên tài liệu"),
    ho_ten: str = Form(..., description="Họ tên nhân viên"),
    mo_ta: Optional[str] = Form(None, description="Mô tả"),
    ngay_het_han: Optional[str] = Form(None, description="Ngày hết hạn (YYYY-MM-DD)"),
    la_ban_chinh: bool = Form(False, description="Là bản chính"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Upload file tài liệu cho nhân viên."""
    from datetime import date as date_type

    content = await file.read()
    file_size = len(content)
    content_type = file.content_type or "application/octet-stream"

    parsed_ngay_het_han = None
    if ngay_het_han:
        try:
            parsed_ngay_het_han = date_type.fromisoformat(ngay_het_han)
        except ValueError:
            pass

    upload_service = get_upload_service()

    command = UploadTaiLieuCommand(
        nhan_vien_id=nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
        ten_tai_lieu=ten_tai_lieu,
        ho_ten=ho_ten,
        file_content=content,
        original_filename=file.filename or "unknown",
        mo_ta=mo_ta,
        ngay_het_han=parsed_ngay_het_han,
        la_ban_chinh=la_ban_chinh,
    )

    use_case = UploadTaiLieuUseCase(uow, upload_service)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in [
            "invalid_file_type",
            "file_too_large",
            "invalid_loai_tai_lieu",
        ]:
            raise ClientError(base_error=error, status_code=400)
        if error.code == "file_save_error":
            raise ServerError(base_error=error)
        raise ClientError(base_error=error, status_code=400)

    result_value = result.value

    return APIResponse(
        message="Upload file thành công",
        data={
            "url": result_value.url,
            "file_name": result_value.file_name,
            "file_size": result_value.file_size,
            "content_type": result_value.content_type,
            "path": result_value.path,
        },
    )


@router.get(
    "/tai-lieu", response_model=APIResponseWithMetadata[list[TaiLieuUploadResponse]]
)
async def get_list_tai_lieu(
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Số item trên mỗi trang"),
    nhan_vien_id: Optional[str] = Query(None, description="Lọc theo nhân viên"),
    loai_tai_lieu: Optional[str] = Query(None, description="Lọc theo loại tài liệu"),
    trang_thai: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách tài liệu (phân trang)."""
    query = GetTaiLieuListQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
        trang_thai=trang_thai,
        search=search,
    )

    use_case = GetTaiLieuListUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = [TaiLieuUploadResponse(**item) for item in result.value.items]

    return APIResponseWithMetadata(
        message="Lấy danh sách tài liệu thành công",
        data=items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size
            if page_size > 0
            else 0,
        },
    )


@router.get(
    "/tai-lieu/nhan-vien/{nhan_vien_id}",
    response_model=APIResponse[list[TaiLieuUploadResponse]],
)
async def get_tai_lieu_by_nhan_vien(
    nhan_vien_id: str = Path(..., description="ID nhân viên"),
    loai_tai_lieu: Optional[str] = Query(None, description="Lọc theo loại tài liệu"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách tài liệu của một nhân viên."""
    query = GetTaiLieuByNhanVienQuery(
        nhan_vien_id=nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
    )

    use_case = GetTaiLieuByNhanVienUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = [TaiLieuUploadResponse(**item) for item in result.value.items]

    return APIResponse(
        message="Lấy danh sách tài liệu thành công",
        data=items,
    )


@router.get("/tai-lieu/{id}", response_model=APIResponse[TaiLieuUploadResponse])
async def get_detail_tai_lieu(
    id: str = Path(..., description="ID tài liệu"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết một tài liệu."""
    query = GetTaiLieuDetailQuery(id=id)

    use_case = GetTaiLieuDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết tài liệu thành công",
        data=TaiLieuUploadResponse(**result.value.tai_lieu),
    )


@router.put("/tai-lieu/{id}", response_model=APIResponse[TaiLieuUploadResponse])
async def update_tai_lieu(
    id: str = Path(..., description="ID tài liệu"),
    body: TaiLieuUpdateRequest = ...,
    user_context: UserContext = Depends(require_permission("tai_lieu", "update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật thông tin tài liệu."""
    command = UpdateTaiLieuCommand(
        id=id,
        ten_tai_lieu=body.ten_tai_lieu,
        mo_ta=body.mo_ta,
        ngay_het_han=body.ngay_het_han,
        la_ban_chinh=body.la_ban_chinh,
        trang_thai=body.trang_thai,
    )

    use_case = UpdateTaiLieuUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật tài liệu thành công",
        data=TaiLieuUploadResponse(**result.value.tai_lieu),
    )


@router.delete("/tai-lieu/{id}", response_model=APIResponse[dict])
async def delete_tai_lieu(
    id: str = Path(..., description="ID tài liệu"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "delete")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa tài liệu (xóa file vật lý và record)."""
    upload_service = get_upload_service()

    command = DeleteTaiLieuCommand(id=id)

    use_case = DeleteTaiLieuUseCase(uow, upload_service)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Xóa tài liệu thành công",
        data={"id": result.value.id},
    )


@router.get("/files/{file_path:path}")
async def serve_uploaded_file(file_path: str):
    """Serve uploaded files."""
    file_full_path = os.path.join(UPLOAD_DIR, file_path)

    if not os.path.exists(file_full_path) or not os.path.isfile(file_full_path):
        from src.api.error import ClientError
        from libs.result import Error

        raise ClientError(
            base_error=Error(code="file_not_found", message="File không tồn tại"),
            status_code=404,
        )

    return FileResponse(path=file_full_path)
