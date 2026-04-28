from typing import Optional
from fastapi import APIRouter, Depends, Path, status
from pydantic import BaseModel

from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse


router = APIRouter(tags=["Cấu hình nghỉ phép"])


class CauHinhNghiPhepRequest(BaseModel):
    loai_nghi: str
    ten_loai: str
    so_ngay_moi_nam: float
    so_ngay_toi_da_mot_lan: Optional[float] = None
    can_giay_to: bool = False
    bat_buoc_ghi_ly_do: bool = False
    trang_thai: bool = True
    ghi_chu: Optional[str] = None


class InitAnnualRequest(BaseModel):
    nam: int


@router.get("")
async def get_list(
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách cấu hình nghỉ phép."""
    async with uow:
        items = await uow.cau_hinh_nghi_phep_repository.find_all()
        return {
            "message": "Lấy danh sách thành công",
            "data": [
                {
                    "id": item.id,
                    "loai_nghi": item.loai_nghi,
                    "ten_loai": item.ten_loai,
                    "so_ngay_moi_nam": item.so_ngay_moi_nam,
                    "so_ngay_toi_da_mot_lan": item.so_ngay_toi_da_mot_lan,
                    "can_giay_to": item.can_giay_to,
                    "bat_buoc_ghi_ly_do": item.bat_buoc_ghi_ly_do,
                    "trang_thai": item.trang_thai,
                    "ghi_chu": item.ghi_chu,
                }
                for item in items
            ],
        }


@router.post("")
async def create(
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo cấu hình nghỉ phép."""
    async with uow:
        existing = await uow.cau_hinh_nghi_phep_repository.find_by_loai(body.loai_nghi)
        if existing:
            raise ClientError(
                base_error=type(
                    "Error",
                    (),
                    {"code": "exists", "message": "Loại nghỉ phép đã tồn tại"},
                )(),
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        item = await uow.cau_hinh_nghi_phep_repository.create(
            loai_nghi=body.loai_nghi,
            ten_loai=body.ten_loai,
            so_ngay_moi_nam=body.so_ngay_moi_nam,
            so_ngay_toi_da_mot_lan=body.so_ngay_toi_da_mot_lan,
            can_giay_to=body.can_giay_to,
            bat_buoc_ghi_ly_do=body.bat_buoc_ghi_ly_do,
            trang_thai=body.trang_thai,
            ghi_chu=body.ghi_chu,
        )

        return {"message": "Tạo cấu hình thành công", "data": {"id": item.id}}


@router.put("/{id}")
async def update(
    id: str,
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật cấu hình nghỉ phép."""
    async with uow:
        item = await uow.cau_hinh_nghi_phep_repository.update(
            id=id,
            ten_loai=body.ten_loai,
            so_ngay_moi_nam=body.so_ngay_moi_nam,
            so_ngay_toi_da_mot_lan=body.so_ngay_toi_da_mot_lan,
            can_giay_to=body.can_giay_to,
            bat_buoc_ghi_ly_do=body.bat_buoc_ghi_ly_do,
            trang_thai=body.trang_thai,
            ghi_chu=body.ghi_chu,
        )

        if not item:
            raise ClientError(
                base_error=type(
                    "Error",
                    (),
                    {"code": "not_found", "message": "Không tìm thấy cấu hình"},
                )(),
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return {"message": "Cập nhật thành công", "data": {"id": item.id}}


@router.delete("/{id}")
async def delete(
    id: str = Path(..., description="ID cấu hình"),
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa cấu hình nghỉ phép."""
    async with uow:
        success = await uow.cau_hinh_nghi_phep_repository.delete(id)

        if not success:
            raise ClientError(
                base_error=type(
                    "Error",
                    (),
                    {"code": "not_found", "message": "Không tìm thấy cấu hình"},
                )(),
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return {"message": "Xóa cấu hình thành công"}


@router.post("/init-annual")
async def init_annual_leave(
    body: InitAnnualRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Khởi tạo số ngày phép năm mới cho tất cả nhân viên."""
    async with uow:
        from src.repository.nhan_vien_repository import NhanVienRepository
        from src.repository.so_ngay_phep_repository import SoNgayPhepRepository
        from src.repository.cau_hinh_nghi_phep_repository import (
            CauHinhNghiPhepRepository,
        )

        nhan_vien_repo = NhanVienRepository(session=uow.session)
        so_ngay_phep_repo = SoNgayPhepRepository(session=uow.session)
        cau_hinh_repo = CauHinhNghiPhepRepository(session=uow.session)

        phep_nam_config = await cau_hinh_repo.find_by_loai("phep_nam")
        so_ngay = phep_nam_config.so_ngay_moi_nam if phep_nam_config else 12.0

        nhan_viens = await nhan_vien_repo.find_by_trang_thai("dang_lam")

        created = 0
        skipped = 0

        for nv in nhan_viens:
            existing = await so_ngay_phep_repo.find_by_nhan_vien_and_year(
                nv.id, body.nam
            )
            if existing:
                skipped += 1
                continue

            await so_ngay_phep_repo.create(
                nhan_vien_id=nv.id,
                nam=body.nam,
                phep_nam_duoc_phep=so_ngay,
                phep_nam_da_su_dung=0.0,
                phep_nam_con_lai=so_ngay,
            )
            created += 1

        return {
            "message": f"Khởi tạo thành công",
            "data": {"created": created, "skipped": skipped},
        }
