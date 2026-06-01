"""
Admin Schedule Config API - Quản lý cấu hình lịch tự động tạo OTP
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from libs.result import Error
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.domain.models.lich_cham_cong import LichChamCong
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


class CreateLichChamCongRequest(BaseModel):
    gio_check_in: str = "07:00"
    gio_check_out: str = "17:00"
    ngay_lam_viec: str = "0,1,2,3,4,5"


class UpdateTrangThaiRequest(BaseModel):
    trang_thai: str


@router.get("/lich", response_model=APIResponse[dict])
async def get_lich_cham_cong(
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    async with uow as ctx:
        config = await ctx.lich_cham_cong_repository.find_active()

    if not config:
        return APIResponse(message="Chưa có cấu hình lịch", data=None)

    return APIResponse(
        message="Lấy cấu hình lịch thành công",
        data=_config_to_dict(config),
    )


@router.post("/lich", response_model=APIResponse[dict])
async def create_or_update_lich_cham_cong(
    body: CreateLichChamCongRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.service.scheduler_service import scheduler_service

    async with uow as ctx:
        existing = await ctx.lich_cham_cong_repository.find_active()
        if existing:
            existing.trang_thai = "inactive"
            await ctx.lich_cham_cong_repository.update(existing)

        gio_check_in = datetime.strptime(body.gio_check_in, "%H:%M").time()
        gio_check_out = datetime.strptime(body.gio_check_out, "%H:%M").time()

        config = LichChamCong(
            gio_check_in=gio_check_in,
            gio_check_out=gio_check_out,
            ngay_lam_viec=body.ngay_lam_viec,
            trang_thai="active",
            created_by=current_user.user_id,
        )

        created = await ctx.lich_cham_cong_repository.create(config)

        # Sync immediately to today's active QR configs
        from datetime import date
        today = date.today()
        existing_qrs = await ctx.qr_config_repository.find_by_ngay(today)
        for qr in existing_qrs:
            qr.gio_bat_dau = gio_check_in
            qr.gio_ket_thuc = gio_check_out
            await ctx.qr_config_repository.update(qr)

    await scheduler_service.reload_config()

    return APIResponse(
        message="Cấu hình lịch đã được lưu",
        data=_config_to_dict(created),
    )


@router.patch("/lich/{config_id}/trang-thai", response_model=APIResponse[dict])
async def toggle_lich_cham_cong(
    config_id: str,
    body: UpdateTrangThaiRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.service.scheduler_service import scheduler_service

    async with uow as ctx:
        config = await ctx.lich_cham_cong_repository.find_by_id(config_id)
        if not config:
            raise ClientError(
                base_error=Error(
                    code="not_found", message="Không tìm thấy cấu hình lịch"
                ),
                status_code=404,
            )

        config.trang_thai = body.trang_thai
        await ctx.lich_cham_cong_repository.update(config)

    if body.trang_thai == "active":
        await scheduler_service.reload_config()
    else:
        await scheduler_service.deactivate()

    return APIResponse(
        message=f"Đã {'bật' if body.trang_thai == 'active' else 'tắt'} lịch tự động",
        data=_config_to_dict(config),
    )


def _config_to_dict(config: LichChamCong) -> dict:
    return {
        "id": config.id,
        "gio_check_in": config.gio_check_in.strftime("%H:%M")
        if config.gio_check_in
        else None,
        "gio_check_out": config.gio_check_out.strftime("%H:%M")
        if config.gio_check_out
        else None,
        "ngay_lam_viec": config.ngay_lam_viec,
        "trang_thai": config.trang_thai,
        "created_by": config.created_by,
        "created_at": config.created_at.isoformat() if config.created_at else None,
        "updated_at": config.updated_at.isoformat() if config.updated_at else None,
    }
