"""
API Routes for HR Reports (Thong Ke Bao Cao)
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import date, datetime

from fastapi import Request

from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ServerError
from src.api.schemas.common import APIResponse
from src.app.usecases.bao_cao import (
    GetTongQuanBaoCaoUseCase,
    GetHopDongSapHetHanUseCase,
    GetDiMuonBaoCaoUseCase,
    GetLuongSoSanhUseCase,
    GetKhenThuongUseCase,
    GetXuHuongUseCase,
    BaoCaoBienDongUseCase,
    BaoCaoDemoGraphicsUseCase,
    BaoCaoTrinhDoUseCase,
    BaoCaoChamCongTongHopUseCase,
    BaoCaoNghiPhepUseCase,
    BaoCaoChiPhiUseCase,
    BaoCaoThueBHXHUseCase,
    LogExportBaoCaoUseCase,
    LogExportCommand,
)

router = APIRouter(prefix="/bao-cao")


def _derive_month_year(start_date: Optional[date], end_date: Optional[date]):
    ref = end_date or start_date or date.today()
    return ref.month, ref.year


@router.get("/tong-quan")
async def get_tong_quan(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = GetTongQuanBaoCaoUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/hop-dong/sap-het-han")
async def get_hop_dong_sap_het_han(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    phong_ban_id: Optional[str] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    ngay_chieu = end_date or date.today()
    use_case = GetHopDongSapHetHanUseCase(uow)
    result = await use_case.execute(ngay_chieu=ngay_chieu, phong_ban_id=phong_ban_id)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/cham-cong/di-muon")
async def get_di_muon(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = GetDiMuonBaoCaoUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/luong/so-sanh")
async def get_luong_so_sanh(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = GetLuongSoSanhUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/khen-thuong")
async def get_khen_thuong(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = GetKhenThuongUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/xu-huong")
async def get_xu_huong(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    so_thang: int = Query(default=12),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = GetXuHuongUseCase(uow)
    result = await use_case.execute(so_thang=so_thang)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value}


@router.get("/nhan-su/bien-dong")
async def get_nhan_su_bien_dong(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = BaoCaoBienDongUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/nhan-su/demo")
async def get_nhan_su_demo(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoDemoGraphicsUseCase(uow)
    result = await use_case.execute(phong_ban_id=None)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/nhan-su/trinh-do")
async def get_nhan_su_trinh_do(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoTrinhDoUseCase(uow)
    result = await use_case.execute(phong_ban_id=None)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/cham-cong/tong-hop")
async def get_cham_cong_tong_hop(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = BaoCaoChamCongTongHopUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/cham-cong/nghi-phep")
async def get_cham_cong_nghi_phep(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = BaoCaoNghiPhepUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/luong/chi-phi")
async def get_luong_chi_phi(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = BaoCaoChiPhiUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


@router.get("/luong/thue-bhxh")
async def get_luong_thue_bhxh(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: UserContext = Depends(require_permission("thong_ke:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    thang, nam = _derive_month_year(start_date, end_date)
    use_case = BaoCaoThueBHXHUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "OK", "data": result.value.__dict__}


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
    command = LogExportCommand(
        tai_khoan_id=current_user.id,
        loai_bao_cao=loai_bao_cao,
        dinh_dang=dinh_dang,
    )
    use_case = LogExportBaoCaoUseCase(uow)
    result = await use_case.execute(command)
    if is_err(result):
        raise ServerError(base_error=result.value)
    return {"message": "Đã ghi log xuất báo cáo", "data": None}
