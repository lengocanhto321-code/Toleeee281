from .auth import router as auth_router
from .phong_ban import router as phong_ban_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])
router.include_router(phong_ban_router, prefix="/phong-ban", tags=["Phong Ban"])
