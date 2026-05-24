import os
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    Query,
)

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.service.upload_service import UploadService
from src.app.usecases.tai_lieu import (
    UploadTaiLieuCommand,
    UploadTaiLieuUseCase,
    GetTaiLieuByNhanVienQuery,
    GetTaiLieuByNhanVienUseCase,
)
from src.api.schemas.upload import (
    TaiLieuUploadResponse,
    UploadResponse,
)
from src.api.schemas.common import APIResponse
from src.api.error import ClientError, ServerError

router = APIRouter()

UPLOAD_DIR = "/home/enles04/hr_management/backend/uploads"


def get_upload_service() -> UploadService:
    return UploadService(upload_dir=UPLOAD_DIR)


@router.post("/files", response_model=APIResponse[UploadResponse])
async def nv_upload_file(
    file: UploadFile = File(..., description="File can upload"),
    loai_tai_lieu: str = Form(..., description="Loai tai lieu"),
    ten_tai_lieu: str = Form(..., description="Ten tai lieu"),
    mo_ta: Optional[str] = Form(None, description="Mo ta"),
    ngay_het_han: Optional[str] = Form(None, description="Ngay het han (YYYY-MM-DD)"),
    la_ban_chinh: bool = Form(False, description="La ban chinh"),
    user_context: UserContext = Depends(require_permission("tai_lieu:create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from datetime import date as date_type

    content = await file.read()
    content_type = file.content_type or "application/octet-stream"

    parsed_ngay_het_han = None
    if ngay_het_han:
        try:
            parsed_ngay_het_han = date_type.fromisoformat(ngay_het_han)
        except ValueError:
            pass

    upload_service = get_upload_service()

    command = UploadTaiLieuCommand(
        nhan_vien_id=user_context.nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
        ten_tai_lieu=ten_tai_lieu,
        ho_ten=user_context.nhan_vien_id,
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
        message="Upload file thanh cong",
        data={
            "url": result_value.url,
            "file_name": result_value.file_name,
            "file_size": result_value.file_size,
            "content_type": result_value.content_type,
            "path": result_value.path,
        },
    )


@router.get(
    "/tai-lieu",
    response_model=APIResponse[list[TaiLieuUploadResponse]],
)
async def nv_get_my_tai_lieu(
    loai_tai_lieu: Optional[str] = Query(None, description="Loc theo loai tai lieu"),
    user_context: UserContext = Depends(require_permission("tai_lieu:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetTaiLieuByNhanVienQuery(
        nhan_vien_id=user_context.nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
    )

    use_case = GetTaiLieuByNhanVienUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = [TaiLieuUploadResponse(**item) for item in result.value.items]

    return APIResponse(
        message="Lay danh sach tai lieu thanh cong",
        data=items,
    )
