"""
Admin QR Attendance API Routes - Dành cho quản lý tạo QR và xem báo cáo
"""

import logging
from datetime import date, datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.cham_cong import (
    GenerateQRCommand,
    GenerateQRUseCase,
    BulkGenerateQRCommand,
    BulkGenerateQRUseCase,
    AggregateMonthlyCommand,
    AggregateMonthlyUseCase,
    GetQRByDateQuery,
    GetQRByDateUseCase,
    GetQRDetailQuery,
    GetQRDetailUseCase,
    GetDailyReportQuery,
    GetDailyAttendanceReportUseCase,
    GetMonthlySummaryQuery,
    GetMonthlySummaryReportUseCase,
    GetDanhSachVangMatQuery,
    GetDanhSachVangMatUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class ViTriRequest(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    dms: Optional[str] = None
    name: Optional[str] = None
    radius: int = 100

    def to_dict(self) -> Optional[dict]:
        from src.service.qr_attendance_service import parse_dms, parse_coordinate_pair

        lat = self.lat
        lng = self.lng

        if self.dms:
            pair = parse_coordinate_pair(self.dms)
            if pair:
                lat, lng = pair
            else:
                parsed = parse_dms(self.dms)
                if parsed is not None:
                    if lat is None:
                        lat = parsed
                    elif lng is None:
                        lng = parsed

        if lat is None or lng is None:
            return None

        return {"lat": lat, "lng": lng, "name": self.name, "radius": self.radius}


class GenerateQRRequest(BaseModel):
    ngay: str
    loai: str = "all"
    phong_ban_id: Optional[str] = None
    vi_tri: Optional[dict] = None
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"


class BulkGenerateQRRequest(BaseModel):
    tu_ngay: str
    den_ngay: str
    phong_ban_id: Optional[str] = None
    vi_tri: Optional[dict] = None
    exclude_weekends: bool = True


class AggregateMonthlyRequest(BaseModel):
    thang: int
    nam: int
    phong_ban_id: Optional[str] = None


@router.post("/qr/generate", response_model=APIResponse[dict])
async def generate_qr(
    body: GenerateQRRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo QR code cho ngày được chỉ định."""
    command = GenerateQRCommand(
        ngay=body.ngay,
        loai=body.loai,
        phong_ban_id=body.phong_ban_id,
        vi_tri=body.vi_tri,
        gio_bat_dau=body.gio_bat_dau,
        gio_ket_thuc=body.gio_ket_thuc,
    )

    use_case = GenerateQRUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "qr_exists":
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Tạo QR thành công",
        data=result.value.__dict__,
    )


@router.post("/qr/bulk-generate", response_model=APIResponse[dict])
async def bulk_generate_qr(
    body: BulkGenerateQRRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo QR code hàng loạt trong khoảng ngày."""
    command = BulkGenerateQRCommand(
        tu_ngay=body.tu_ngay,
        den_ngay=body.den_ngay,
        phong_ban_id=body.phong_ban_id,
        vi_tri=body.vi_tri,
        exclude_weekends=body.exclude_weekends,
    )

    use_case = BulkGenerateQRUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message=f"Tạo QR: {result.value.created} tạo, {result.value.skipped} bỏ qua",
        data=result.value.__dict__,
    )


@router.get("/qr/by-date", response_model=APIResponse[List[dict]])
async def get_qr_by_date(
    ngay: str = Query(..., description="Ngày cần lấy QR (YYYY-MM-DD)"),
    loai: Optional[str] = Query(None, description="Loại QR (check_in, check_out, all)"),
    current_user: UserContext = Depends(
        require_permission("cham_cong:manage", "cham_cong:view_own")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy QR code theo ngày."""
    query = GetQRByDateQuery(
        ngay=ngay,
        loai=loai,
    )

    use_case = GetQRByDateUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    data = result.value
    return APIResponse(
        message="Lấy QR thành công",
        data=[qr.__dict__ for qr in data.qr_codes],
    )


@router.get("/qr/{qr_id}", response_model=APIResponse[dict])
async def get_qr_detail(
    qr_id: str = Path(..., description="ID QR code"),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết một QR code."""
    query = GetQRDetailQuery(qr_id=qr_id)

    use_case = GetQRDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết QR thành công",
        data=result.value.data,
    )


@router.post("/aggregate-monthly", response_model=APIResponse[dict])
async def aggregate_monthly_attendance(
    body: AggregateMonthlyRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tổng hợp chấm công tháng từ dữ liệu check-in/out."""
    command = AggregateMonthlyCommand(
        thang=body.thang,
        nam=body.nam,
        phong_ban_id=body.phong_ban_id,
    )

    use_case = AggregateMonthlyUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message=f"Tổng hợp chấm công tháng {body.thang}/{body.nam} thành công",
        data=result.value.__dict__,
    )


@router.get("/report/daily", response_model=APIResponse[dict])
async def get_daily_attendance_report(
    ngay: date = Query(..., description="Ngày cần báo cáo"),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy báo cáo chấm công theo ngày."""
    query = GetDailyReportQuery(ngay=ngay)

    use_case = GetDailyAttendanceReportUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy báo cáo ngày thành công",
        data=result.value.summary,
    )


@router.get("/report/monthly-summary", response_model=APIResponse[dict])
async def get_monthly_summary_report(
    thang: int = Query(..., ge=1, le=12),
    nam: int = Query(..., ge=2000, le=2100),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy báo cáo tổng hợp chấm công tháng."""
    query = GetMonthlySummaryQuery(thang=thang, nam=nam)

    use_case = GetMonthlySummaryReportUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message=f"Lấy báo cáo tháng {thang}/{nam} thành công",
        data=result.value.data,
    )


@router.get("/vang-mat", response_model=APIResponseWithMetadata[list[dict]])
async def get_danh_sach_vang_mat(
    ngay: date = Query(default_factory=date.today, description="Ngày cần xem"),
    phong_ban_id: Optional[str] = Query(None, description="Lọc theo phòng ban"),
    loai_vang: Optional[str] = Query(None, description="co_phep / khong_phep"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách nhân viên vắng mặt theo ngày."""
    query = GetDanhSachVangMatQuery(
        ngay=ngay,
        phong_ban_id=phong_ban_id,
        loai_vang=loai_vang,
        page=page,
        page_size=page_size,
    )

    use_case = GetDanhSachVangMatUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    import math

    return APIResponseWithMetadata(
        message="Lấy danh sách vắng mặt thành công",
        data=result.value.items,
        metadata={
            "page": page,
            "per_page": page_size,
            "total": result.value.total,
            "total_pages": math.ceil(result.value.total / page_size)
            if result.value.total > 0
            else 0,
            "thong_ke": result.value.stats,
        },
    )
