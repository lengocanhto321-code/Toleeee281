"""
API Routes for HR Reports (Thong Ke Bao Cao)
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from fastapi import Request

from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.domain.models.audit_log import AuditLog
from src.service.unit_of_work import UnitOfWork
from src.service.bao_cao_service import BaoCaoService

router = APIRouter(prefix="/bao-cao", tags=["Báo Cáo"])


@router.get("/tong-quan")
async def get_tong_quan(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get executive dashboard KPIs"""
    async with uow:
        service = BaoCaoService(uow.session)
        result = await service.get_tong_quan(thang or 1, nam or 2026)
        return {"message": "OK", "data": result}


@router.get("/hop-dong/sap-het-han")
async def get_hop_dong_sap_het_han(
    ngay_chieu: date = Query(default=None),
    phong_ban_id: Optional[str] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get contracts expiring within 30 days"""
    async with uow:
        service = BaoCaoService(uow.session)
        ngay_chieu = ngay_chieu or date.today()
        result = await service.get_hop_dong_sap_het_han(ngay_chieu, phong_ban_id)
        return {"message": "OK", "data": result}


@router.get("/cham-cong/di-muon")
async def get_di_muon(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get late attendance statistics"""
    async with uow:
        service = BaoCaoService(uow.session)
        now = datetime.now()
        result = await service.get_di_muon(thang or now.month, nam or now.year)
        return {"message": "OK", "data": result}


@router.get("/luong/so-sanh")
async def get_luong_so_sanh(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get salary comparison data"""
    async with uow:
        service = BaoCaoService(uow.session)
        now = datetime.now()
        result = await service.get_luong_so_sanh(thang or now.month, nam or now.year)
        return {"message": "OK", "data": result}


@router.get("/khen-thuong")
async def get_khen_thuong(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get rewards and disciplines statistics"""
    async with uow:
        service = BaoCaoService(uow.session)
        now = datetime.now()
        result = await service.get_khen_thuong(thang or now.month, nam or now.year)
        return {"message": "OK", "data": result}


@router.get("/xu-huong")
async def get_xu_huong(
    so_thang: int = Query(default=12),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Get trend data for last N months"""
    async with uow:
        service = BaoCaoService(uow.session)
        result = await service.get_xu_huong(so_thang)
        return {"message": "OK", "data": result}


@router.post("/export", summary="Ghi log xuất báo cáo")
async def log_export(
    request: Request,
    loai_bao_cao: str = Query(
        ..., description="Loại báo cáo: nhan-su, cham-cong, luong..."
    ),
    dinh_dang: str = Query(..., description="Định dạng: excel, pdf"),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    async with uow:
        audit_log = AuditLog(
            tai_khoan_id=current_user.id,
            hanh_dong="EXPORT",
            bang_du_lieu="bao_cao",
            ban_ghi_id=None,
            du_lieu_cu=None,
            du_lieu_moi={"loai": loai_bao_cao, "dinh_dang": dinh_dang},
            ghi_chu=f"Xuất báo cáo {loai_bao_cao} ({dinh_dang})",
        )
        await uow.audit_log_repository.create(audit_log)
        await uow.commit()
    return {"message": "Đã ghi log xuất báo cáo", "data": None}
