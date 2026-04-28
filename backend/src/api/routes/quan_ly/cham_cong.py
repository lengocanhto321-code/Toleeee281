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
from src.api.schemas.common import APIResponse
from src.app.usecases.cham_cong import (
    GenerateQRCommand,
    GenerateQRUseCase,
    BulkGenerateQRCommand,
    BulkGenerateQRUseCase,
    AggregateMonthlyCommand,
    AggregateMonthlyUseCase,
    GetQRByDateQuery,
    GetQRByDateUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Admin - Chấm công QR"])


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
    async with uow:
        qr = await uow.qr_config_repository.find_by_id(qr_id)

        if not qr:
            raise ClientError(
                base_error=None,
                code="not_found",
                message="Không tìm thấy QR code",
                status_code=404,
            )

        return APIResponse(
            message="Lấy chi tiết QR thành công",
            data=qr.to_dict(),
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
    async with uow:
        from src.repository.check_in_out_repository import CheckInOutRepository
        from src.repository.nhan_vien_repository import NhanVienRepository

        check_in_repo = CheckInOutRepository(uow.session)
        nhan_vien_repo = NhanVienRepository(uow.session)

        records = await check_in_repo.get_by_date(ngay)
        nhan_vien_result = await nhan_vien_repo.get_paginated(
            page=1, page_size=1000, trang_thai="dang_lam"
        )

        if is_err(nhan_vien_result):
            raise ServerError(base_error=nhan_vien_result.value)

        _, nhan_vien_list = nhan_vien_result.value

        nhan_vien_map = {nv["id"]: nv for nv in nhan_vien_list}
        checked_in_ids = {r.nhan_vien_id for r in records if r.check_in_time}

        summary = {
            "ngay": ngay.isoformat(),
            "tong_nhan_vien": len(nhan_vien_list),
            "so_check_in": len(checked_in_ids),
            "chua_check_in": len(nhan_vien_list) - len(checked_in_ids),
            "details": [],
        }

        for nv in nhan_vien_list:
            record = next((r for r in records if r.nhan_vien_id == nv["id"]), None)
            summary["details"].append(
                {
                    "nhan_vien_id": nv["id"],
                    "ho_ten": nv.get("ho_ten"),
                    "ma_nhan_vien": nv.get("ma_nhan_vien"),
                    "check_in": record.check_in_time.isoformat()
                    if record and record.check_in_time
                    else None,
                    "check_out": record.check_out_time.isoformat()
                    if record and record.check_out_time
                    else None,
                    "trang_thai": "checked_in"
                    if record and record.check_in_time
                    else "chua_check_in",
                }
            )

        return APIResponse(
            message="Lấy báo cáo ngày thành công",
            data=summary,
        )


@router.get("/report/monthly-summary", response_model=APIResponse[dict])
async def get_monthly_summary_report(
    thang: int = Query(..., ge=1, le=12),
    nam: int = Query(..., ge=2000, le=2100),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy báo cáo tổng hợp chấm công tháng."""
    async with uow:
        from src.repository.cham_cong_thang_repository import ChamCongThangRepository

        repo = ChamCongThangRepository(uow.session)
        records = await repo.get_by_month_year(thang, nam)

        tong_co_mat = sum(r.so_ngay_co_mat for r in records)
        tong_vang_co_phep = sum(r.so_ngay_vang_co_phep for r in records)
        tong_vang_khong_phep = sum(r.so_ngay_vang_khong_phep for r in records)

        return APIResponse(
            message=f"Lấy báo cáo tháng {thang}/{nam} thành công",
            data={
                "thang": thang,
                "nam": nam,
                "tong_nhan_vien": len(records),
                "tong_so_ngay_co_mat": tong_co_mat,
                "tong_so_ngay_vang_co_phep": tong_vang_co_phep,
                "tong_so_ngay_vang_khong_phep": tong_vang_khong_phep,
                "trung_binh_so_ngay_cong": round(tong_co_mat / len(records), 2)
                if records
                else 0,
                "details": [
                    {
                        "nhan_vien_id": r.nhan_vien_id,
                        "ho_ten": r.nhan_vien.ho_ten if r.nhan_vien else None,
                        "so_ngay_co_mat": r.so_ngay_co_mat,
                        "so_ngay_vang": r.so_ngay_vang_co_phep
                        + r.so_ngay_vang_khong_phep,
                        "he_so_ngay_cong": r.he_so_ngay_cong,
                        "trang_thai": r.trang_thai,
                    }
                    for r in records
                ],
            },
        )
