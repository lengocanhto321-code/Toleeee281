from fastapi import APIRouter

from .auth import router as auth_router
from .quan_ly import (
    nhan_vien_router,
    nhan_vien_sub_router,
    nhan_vien_cong_tac_router,
    phong_ban_router,
    chuc_vu_router,
    luong_router,
    nghi_phep_router,
    thong_ke_router,
    lich_su_chuc_vu_router,
    cong_tac_router,
    hop_dong_router,
    cham_cong_router as admin_cham_cong_router,
    cau_hinh_nghi_phep_router,
)
from .nhan_vien import employee_router, cham_cong_router
from .upload import upload_router
from .thong_ke.bao_cao import router as thong_ke_bao_cao_router

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])
router.include_router(phong_ban_router, prefix="/phong-ban", tags=["Phong Ban"])
router.include_router(nhan_vien_router, prefix="/nhan-vien", tags=["Nhan Vien"])
router.include_router(nhan_vien_sub_router, prefix="/nhan-vien", tags=["Nhan Vien Sub"])
router.include_router(
    nhan_vien_cong_tac_router, prefix="/nhan-vien", tags=["Nhan Vien CongTac"]
)
router.include_router(chuc_vu_router, prefix="/chuc-vu", tags=["Chuc Vu"])
router.include_router(luong_router, prefix="/luong", tags=["Luong"])
router.include_router(nghi_phep_router, prefix="/nghi-phep", tags=["Nghi Phep"])
router.include_router(
    cau_hinh_nghi_phep_router, prefix="/nghi-phep", tags=["Nghi Phep - Cau Hinh"]
)
router.include_router(employee_router, prefix="/employee", tags=["Employee"])
router.include_router(upload_router, prefix="/upload", tags=["Upload"])
router.include_router(thong_ke_router, prefix="/thong-ke", tags=["Thong Ke"])
router.include_router(
    lich_su_chuc_vu_router, prefix="/lich-su-chuc-vu", tags=["Lich Su Chuc Vu"]
)
router.include_router(cong_tac_router, prefix="/cong-tac", tags=["Cong Tac"])
router.include_router(hop_dong_router, tags=["Hop Dong"])

router.include_router(
    cham_cong_router, prefix="/nv/cham-cong", tags=["Employee - Cham Cong QR"]
)
router.include_router(
    admin_cham_cong_router, prefix="/ql/cham-cong", tags=["Admin - Cham Cong QR"]
)

# Thong Ke Bao Cao routes
router.include_router(
    thong_ke_bao_cao_router, prefix="/thong-ke", tags=["Thong Ke - Bao Cao"]
)
