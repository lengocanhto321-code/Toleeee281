"""
Employee QR Attendance API Routes - Dành cho nhân viên check-in/check-out bằng QR
"""

import logging
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.app.usecases.cham_cong import (
    CheckInCommand,
    CheckInUseCase,
    CheckOutCommand,
    CheckOutUseCase,
    GetMyHistoryQuery,
    GetMyHistoryUseCase,
    GetMyMonthlyQuery,
    GetMyMonthlyUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Employee - Chấm công QR"])


class CheckInRequest(BaseModel):
    qr_data: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CheckOutRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@router.post("/check-in", response_model=APIResponse[dict])
async def check_in(
    body: CheckInRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Check-in bằng QR code."""
    command = CheckInCommand(
        user_id=current_user.user_id,
        qr_data=body.qr_data,
        latitude=body.latitude,
        longitude=body.longitude,
    )

    use_case = CheckInUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        if error.code in ["invalid_qr", "already_checked_in", "outside_geo_fence"]:
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Check-in thành công",
        data=result.value.to_dict(),
    )


@router.post("/check-out", response_model=APIResponse[dict])
async def check_out(
    body: CheckOutRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Check-out (sử dụng QR code từ lần check-in gần nhất)."""
    command = CheckOutCommand(
        user_id=current_user.user_id,
        latitude=body.latitude,
        longitude=body.longitude,
    )

    use_case = CheckOutUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        if error.code in ["not_checked_in", "already_checked_out", "outside_geo_fence"]:
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Check-out thành công",
        data=result.value.to_dict(),
    )


@router.get("/history", response_model=APIResponse[dict])
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
        user_id=current_user.user_id,
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
    now = datetime.now()
    thang = thang or now.month
    nam = nam or now.year

    query = GetMyMonthlyQuery(
        user_id=current_user.user_id,
        thang=thang,
        nam=nam,
    )

    use_case = GetMyMonthlyUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy tổng hợp tháng thành công",
        data=result.value.to_dict(),
    )


@router.get("/my-qr", response_model=APIResponse[dict])
async def get_my_qr(
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
):
    """Lấy QR code cá nhân của user đang login."""
    from src.service.qr_attendance_service import QRAttendanceService

    qr_service = QRAttendanceService()
    qr_data = qr_service.generate_user_qr(
        user_id=current_user.user_id, ngay=date.today()
    )

    return APIResponse(
        message="Lấy QR cá nhân thành công",
        data={
            "qr_data": qr_data,
            "expires_at": datetime.utcnow().isoformat(),
        },
    )
