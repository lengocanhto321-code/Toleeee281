from fastapi import APIRouter, Depends

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponse
from src.api.error import ServerError
from src.app.usecases.dashboard import GetAdminDashboardUseCase

router = APIRouter()


@router.get("/dashboard", response_model=APIResponse[dict])
async def get_admin_dashboard(
    user_context: UserContext = Depends(require_permission("dashboard:view_admin")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = GetAdminDashboardUseCase(uow)
    result = await use_case.execute()

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy thống kê dashboard thành công",
        data={
            "tong_nhan_vien": r.tong_nhan_vien,
            "nhan_vien_dang_lam": r.nhan_vien_dang_lam,
            "nhan_vien_nghi_viec": r.nhan_vien_nghi_viec,
            "nhan_vien_nghi_huu": r.nhan_vien_nghi_huu,
            "so_phong_ban": r.so_phong_ban,
            "so_chuc_vu": r.so_chuc_vu,
            "giao_vien": r.giao_vien,
            "can_bo": r.can_bo,
            "nhan_vien_loai": r.nhan_vien_loai,
            "don_nghi_phep_cho_duyet": r.don_nghi_phep_cho_duyet,
            "nhan_vien_moi_thang_nay": r.nhan_vien_moi_thang_nay,
            "phong_ban_summary": r.phong_ban_summary,
            "hoat_dong_gan_day": r.hoat_dong_gan_day,
        },
    )
