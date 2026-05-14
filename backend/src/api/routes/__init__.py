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
    lich_cham_cong_router,
)
from .nhan_vien import (
    employee_router,
    cham_cong_router,
    nv_nghi_phep_router,
    nv_upload_router,
    nv_luong_router,
)
from .upload import upload_router
from .thong_ke.bao_cao import router as thong_ke_bao_cao_router

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])

router.include_router(
    phong_ban_router, prefix="/admin/phong-ban", tags=["Admin - Phong Ban"]
)
router.include_router(
    nhan_vien_router, prefix="/admin/nhan-vien", tags=["Admin - Nhan Vien"]
)
router.include_router(
    nhan_vien_sub_router, prefix="/admin/nhan-vien", tags=["Admin - Nhan Vien Sub"]
)
router.include_router(
    nhan_vien_cong_tac_router,
    prefix="/admin/nhan-vien",
    tags=["Admin - Nhan Vien CongTac"],
)
router.include_router(chuc_vu_router, prefix="/admin/chuc-vu", tags=["Admin - Chuc Vu"])
router.include_router(luong_router, prefix="/admin/luong", tags=["Admin - Luong"])
router.include_router(
    nghi_phep_router, prefix="/admin/nghi-phep", tags=["Admin - Nghi Phep"]
)
router.include_router(
    cau_hinh_nghi_phep_router,
    prefix="/admin/nghi-phep",
    tags=["Admin - Nghi Phep Cau Hinh"],
)
router.include_router(upload_router, prefix="/admin/upload", tags=["Admin - Upload"])
router.include_router(
    thong_ke_router, prefix="/admin/thong-ke", tags=["Admin - Thong Ke"]
)
router.include_router(
    thong_ke_bao_cao_router, prefix="/admin/thong-ke", tags=["Admin - Thong Ke Bao Cao"]
)
router.include_router(
    lich_su_chuc_vu_router,
    prefix="/admin/lich-su-chuc-vu",
    tags=["Admin - Lich Su Chuc Vu"],
)
router.include_router(
    cong_tac_router, prefix="/admin/cong-tac", tags=["Admin - Cong Tac"]
)
router.include_router(hop_dong_router, prefix="/admin", tags=["Admin - Hop Dong"])
router.include_router(
    admin_cham_cong_router, prefix="/admin/cham-cong", tags=["Admin - Cham Cong QR"]
)
router.include_router(
    lich_cham_cong_router, prefix="/admin/cham-cong", tags=["Admin - Lich Cham Cong"]
)

router.include_router(employee_router, prefix="/nhan-vien", tags=["NV - Employee"])
router.include_router(
    cham_cong_router, prefix="/nhan-vien/cham-cong", tags=["NV - Cham Cong"]
)
router.include_router(
    nv_nghi_phep_router, prefix="/nhan-vien/nghi-phep", tags=["NV - Nghi Phep"]
)
router.include_router(
    nv_upload_router, prefix="/nhan-vien/upload", tags=["NV - Upload"]
)
router.include_router(nv_luong_router, prefix="/nhan-vien/luong", tags=["NV - Luong"])
