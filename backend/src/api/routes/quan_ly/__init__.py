from .nhan_vien import router as nhan_vien_router
from .nhan_vien_sub_modules import router as nhan_vien_sub_router
from .nhan_vien_cong_tac import router as nhan_vien_cong_tac_router
from .phong_ban import router as phong_ban_router
from .chuc_vu import router as chuc_vu_router
from .luong import router as luong_router
from .nghi_phep import router as nghi_phep_router
from .thong_ke import router as thong_ke_router
from .lich_su_chuc_vu import router as lich_su_chuc_vu_router
from .cong_tac import router as cong_tac_router
from .hop_dong import router as hop_dong_router
from .cham_cong import router as cham_cong_router
from .cau_hinh_nghi_phep import router as cau_hinh_nghi_phep_router

__all__ = [
    "nhan_vien_router",
    "nhan_vien_sub_router",
    "nhan_vien_cong_tac_router",
    "phong_ban_router",
    "chuc_vu_router",
    "luong_router",
    "nghi_phep_router",
    "thong_ke_router",
    "lich_su_chuc_vu_router",
    "cong_tac_router",
    "hop_dong_router",
    "cham_cong_router",
    "cau_hinh_nghi_phep_router",
]
