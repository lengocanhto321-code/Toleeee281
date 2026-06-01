"""
Employee Attendance API Routes - Dành cho nhân viên check-in/check-out bằng OTP 6 số
"""

import logging
from dataclasses import asdict
from datetime import date

from libs.datetime import get_utc_now
from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel, ConfigDict, Field

from libs.result import is_err, Error
from libs.datetime import get_utc_now
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.app.usecases.cham_cong import (
    CheckInByCodeCommand,
    CheckInByCodeUseCase,
    CheckOutCommand,
    CheckOutUseCase,
    GetMyHistoryQuery,
    GetMyHistoryUseCase,
    GetMyMonthlyQuery,
    GetMyMonthlyUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class CheckOutRequest(BaseModel):
    pass


class CheckInByCodeRequest(BaseModel):
    ma_nhap: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")

    model_config = ConfigDict(str_strip_whitespace=True)


@router.post("/check-in", response_model=APIResponse[dict])
async def check_in_by_code(
    body: CheckInByCodeRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Check-in bằng mã OTP 6 chữ số."""
    if not current_user.nhan_vien_id:
        raise ClientError(
            base_error=Error(
                code="employee_not_linked",
                message="Tài khoản của bạn không được liên kết với hồ sơ nhân viên nào.",
                reason="EmployeeNotLinked",
            ),
            status_code=400,
        )
    command = CheckInByCodeCommand(
        nhan_vien_id=current_user.nhan_vien_id,
        ma_nhap=body.ma_nhap.strip(),
        thoi_gian=get_utc_now().isoformat(),
    )

    use_case = CheckInByCodeUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in [
            "invalid_code",
            "already_checked_in",
            "invalid_time",
        ]:
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Check-in thành công",
        data={
            "id": result.value.id,
            "thoi_gian": result.value.thoi_gian,
            "trang_thai": result.value.trang_thai,
            "is_late": result.value.is_late,
            "message": result.value.message,
        },
    )


@router.post("/check-out", response_model=APIResponse[dict])
async def check_out(
    body: CheckOutRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Check-out."""
    if not current_user.nhan_vien_id:
        raise ClientError(
            base_error=Error(
                code="employee_not_linked",
                message="Tài khoản của bạn không được liên kết với hồ sơ nhân viên nào.",
                reason="EmployeeNotLinked",
            ),
            status_code=400,
        )
    command = CheckOutCommand(
        nhan_vien_id=current_user.nhan_vien_id,
        thoi_gian=get_utc_now().isoformat(),
    )

    use_case = CheckOutUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        if error.code in ["not_checked_in", "already_checked_out", "too_early"]:
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Check-out thành công",
        data={
            "id": result.value.id,
            "thoi_gian": result.value.thoi_gian,
            "trang_thai": result.value.trang_thai,
            "message": result.value.message,
        },
    )


@router.get("/history", response_model=APIResponse[list])
async def get_my_attendance_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tu_ngay: Optional[date] = Query(None),
    den_ngay: Optional[date] = Query(None),
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy lịch sử check-in/check-out của nhân viên hiện tại."""
    query = GetMyHistoryQuery(
        nhan_vien_id=current_user.nhan_vien_id or current_user.user_id,
        page=page,
        page_size=page_size,
        tu_ngay=tu_ngay,
        den_ngay=den_ngay,
    )

    use_case = GetMyHistoryUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    data = result.value
    return APIResponse(
        message="Lấy lịch sử thành công",
        data=data.records,
        metadata={
            "total": data.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (data.total + page_size - 1) // page_size,
        },
    )


@router.get("/monthly", response_model=APIResponse[dict])
async def get_my_monthly_attendance(
    thang: Optional[int] = Query(None, ge=1, le=12),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy tổng hợp chấm công tháng của nhân viên hiện tại."""
    now = get_utc_now()
    thang = thang or now.month
    nam = nam or now.year

    query = GetMyMonthlyQuery(
        nhan_vien_id=current_user.nhan_vien_id or current_user.user_id,
        thang=thang,
        nam=nam,
    )

    use_case = GetMyMonthlyUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy tổng hợp tháng thành công",
        data=asdict(result.value),
    )


@router.get("/active-qr", response_model=APIResponse[dict])
async def get_active_qr(
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy mã OTP chấm công đang hoạt động cho ngày hôm nay."""
    async with uow as ctx:
        active_qr = await ctx.qr_config_repository.find_active_by_ngay(
            date.today(),
            nhan_vien_id=current_user.nhan_vien_id,
        )

        if not active_qr:
            return APIResponse(message="Chưa có mã OTP chấm công hoạt động cho hôm nay", data={})

        data = {
            "id": active_qr.id,
            "ngay": active_qr.ngay.isoformat(),
            "loai": active_qr.loai,
            "ma_nhap": active_qr.ma_nhap,
            "gio_bat_dau": active_qr.gio_bat_dau.strftime("%H:%M") if active_qr.gio_bat_dau else None,
            "gio_ket_thuc": active_qr.gio_ket_thuc.strftime("%H:%M") if active_qr.gio_ket_thuc else None,
            "trang_thai": active_qr.trang_thai,
        }

    return APIResponse(
        message="Lấy mã OTP hoạt động thành công",
        data=data,
    )
