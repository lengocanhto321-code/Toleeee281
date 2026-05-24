from typing import Optional
from fastapi import APIRouter, Depends, Path, status
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.app.usecases.cau_hinh_nghi_phep import (
    GetListCauHinhNghiPhepUseCase,
    CreateCauHinhNghiPhepUseCase,
    CreateCauHinhCommand,
    UpdateCauHinhNghiPhepUseCase,
    UpdateCauHinhCommand,
    DeleteCauHinhNghiPhepUseCase,
    DeleteCauHinhCommand,
    InitAnnualLeaveUseCase,
    InitAnnualLeaveCommand,
)


router = APIRouter()


class CauHinhNghiPhepRequest(BaseModel):
    loai_nghi: str
    ten_loai: str
    so_ngay_moi_nam: float
    so_ngay_toi_da_mot_lan: Optional[float] = None
    can_giay_to: bool = False
    bat_buoc_ghi_ly_do: bool = False
    trang_thai: bool = True
    ghi_chu: Optional[str] = None


class InitAnnualRequest(BaseModel):
    nam: int


@router.get("")
async def get_list(
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách cấu hình nghỉ phép."""
    use_case = GetListCauHinhNghiPhepUseCase(uow)
    result = await use_case.execute()

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(message="Lấy danh sách thành công", data=result.value.items)


@router.post("")
async def create(
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo cấu hình nghỉ phép."""
    command = CreateCauHinhCommand(
        loai_nghi=body.loai_nghi,
        ten_loai=body.ten_loai,
        so_ngay_moi_nam=body.so_ngay_moi_nam,
        so_ngay_toi_da_mot_lan=body.so_ngay_toi_da_mot_lan,
        can_giay_to=body.can_giay_to,
        bat_buoc_ghi_ly_do=body.bat_buoc_ghi_ly_do,
        trang_thai=body.trang_thai,
        ghi_chu=body.ghi_chu,
    )

    use_case = CreateCauHinhNghiPhepUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "exists":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(message="Tạo cấu hình thành công", data={"id": result.value.id})


@router.put("/{id}")
async def update(
    id: str,
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật cấu hình nghỉ phép."""
    command = UpdateCauHinhCommand(
        id=id,
        ten_loai=body.ten_loai,
        so_ngay_moi_nam=body.so_ngay_moi_nam,
        so_ngay_toi_da_mot_lan=body.so_ngay_toi_da_mot_lan,
        can_giay_to=body.can_giay_to,
        bat_buoc_ghi_ly_do=body.bat_buoc_ghi_ly_do,
        trang_thai=body.trang_thai,
        ghi_chu=body.ghi_chu,
    )

    use_case = UpdateCauHinhNghiPhepUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Cập nhật thành công", data={"id": result.value.id})


@router.delete("/{id}")
async def delete(
    id: str = Path(..., description="ID cấu hình"),
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa cấu hình nghỉ phép."""
    command = DeleteCauHinhCommand(id=id)

    use_case = DeleteCauHinhNghiPhepUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Xóa cấu hình thành công")


@router.post("/init-annual")
async def init_annual_leave(
    body: InitAnnualRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Khởi tạo số ngày phép năm mới cho tất cả nhân viên."""
    command = InitAnnualLeaveCommand(nam=body.nam)

    use_case = InitAnnualLeaveUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Khởi tạo thành công",
        data={"created": result.value.created, "skipped": result.value.skipped},
    )
