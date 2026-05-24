from .employee import router as employee_router
from .cham_cong import router as cham_cong_router
from .nghi_phep import router as nv_nghi_phep_router
from .upload import router as nv_upload_router
from .luong import router as nv_luong_router

__all__ = [
    "employee_router",
    "cham_cong_router",
    "nv_nghi_phep_router",
    "nv_upload_router",
    "nv_luong_router",
]
