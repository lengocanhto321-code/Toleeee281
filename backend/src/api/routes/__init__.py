from .auth import router as auth_router
from .phong_ban import router as phong_ban_router
from .nhan_vien import router as nhan_vien_router
from .chuc_vu import router as chuc_vu_router
from .luong import router as luong_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])
router.include_router(phong_ban_router, prefix="/phong-ban", tags=["Phong Ban"])
router.include_router(nhan_vien_router, prefix="/nhan-vien", tags=["Nhan Vien"])
router.include_router(chuc_vu_router, prefix="/chuc-vu", tags=["Chuc Vu"])
router.include_router(luong_router, prefix="/luong", tags=["Luong"])
