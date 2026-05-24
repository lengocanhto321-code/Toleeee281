import logging
from dataclasses import dataclass, field
from datetime import date
from typing import List, Dict, Optional

from pydantic import BaseModel, EmailStr, Field, ValidationError

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.app.usecases.nhan_vien.create_nhan_vien_uc import validate_loai_compatibility

logger = logging.getLogger(__name__)


class ImportRowData(BaseModel):
    ho_ten: str = Field(..., min_length=2, max_length=100)
    gioi_tinh: str = Field(default="Nam", pattern="^(Nam|Nữ|Khác)$")
    ngay_sinh: Optional[date] = None
    que_quan: Optional[str] = Field(None, max_length=200)
    dia_chi_thuong_tru: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = Field(None, max_length=100)
    so_cccd: Optional[str] = Field(None, max_length=12)
    noi_sinh: Optional[str] = Field(None, max_length=200)
    dan_toc: Optional[str] = Field(None, max_length=50)
    ton_giao: Optional[str] = Field(None, max_length=50)
    loai_nhan_vien: str = Field(
        default="giao_vien", pattern="^(giao_vien|nhan_vien|can_bo)$"
    )
    cap_hoc: Optional[str] = Field(None, max_length=20)
    mon_day: Optional[str] = Field(None, max_length=100)
    phong_ban_id: Optional[str] = Field(None, max_length=32)
    chuc_vu_id: Optional[str] = Field(None, max_length=32)
    loai_hop_dong: str = Field(default="vien_chuc", max_length=30)
    ngay_vao_lam: Optional[date] = None
    tinh_trang_hon_nhan: Optional[str] = Field(None, max_length=20)
    ghi_chu: Optional[str] = None
    trang_thai: str = Field(
        default="dang_lam", pattern="^(dang_lam|nghi_viec|nghi_huu|da_xoa)$"
    )

    class Config:
        extra = "ignore"


@dataclass
class RowError:
    row: int
    ho_ten: str
    error: str


@dataclass
class ImportNhanVienCommand:
    rows: List[Dict]
    actor_id: str


@dataclass
class ImportNhanVienResult:
    total: int
    success: int
    failed: int
    errors: List[RowError] = field(default_factory=list)
    created_ids: List[str] = field(default_factory=list)


class ImportNhanVienUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: ImportNhanVienCommand
    ) -> Result[ImportNhanVienResult, Error]:
        logger.info(f"User {command.actor_id} importing {len(command.rows)} employees")

        result = ImportNhanVienResult(total=len(command.rows))

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            chuc_vu_repo = uow.chuc_vu_repository
            audit_repo = uow.audit_log_repository

            for idx, raw_row in enumerate(command.rows, start=1):
                try:
                    row_data = ImportRowData(**raw_row)
                except ValidationError as e:
                    msgs = "; ".join(
                        f"{err['loc'][0]}: {err['msg']}" for err in e.errors()
                    )
                    result.errors.append(
                        RowError(
                            row=idx,
                            ho_ten=raw_row.get("ho_ten", "?"),
                            error=msgs,
                        )
                    )
                    result.failed += 1
                    continue

                if row_data.email:
                    existing = await nhan_vien_repo.find_by_email(
                        row_data.email, include_deleted=True
                    )
                    if existing:
                        result.errors.append(
                            RowError(
                                row=idx,
                                ho_ten=row_data.ho_ten,
                                error=f"Email {row_data.email} đã tồn tại",
                            )
                        )
                        result.failed += 1
                        continue

                if row_data.so_cccd:
                    existing = await nhan_vien_repo.find_by_cccd(
                        row_data.so_cccd, include_deleted=True
                    )
                    if existing:
                        result.errors.append(
                            RowError(
                                row=idx,
                                ho_ten=row_data.ho_ten,
                                error=f"CCCD {row_data.so_cccd} đã tồn tại",
                            )
                        )
                        result.failed += 1
                        continue

                # Validate loai_nhan_vien vs loai_chuc_vu compatibility
                if row_data.chuc_vu_id:
                    chuc_vu = await chuc_vu_repo.find_by_id(row_data.chuc_vu_id)
                    if chuc_vu:
                        is_valid, error_msg = validate_loai_compatibility(
                            row_data.loai_nhan_vien, chuc_vu.loai
                        )
                        if not is_valid:
                            result.errors.append(
                                RowError(
                                    row=idx,
                                    ho_ten=row_data.ho_ten,
                                    error=error_msg,
                                )
                            )
                            result.failed += 1
                            continue

                ma_nhan_vien = await nhan_vien_repo.generate_ma_nhan_vien(
                    row_data.loai_nhan_vien
                )

                new_nv = NhanVien(
                    ma_nhan_vien=ma_nhan_vien,
                    ho_ten=row_data.ho_ten,
                    gioi_tinh=row_data.gioi_tinh,
                    ngay_sinh=row_data.ngay_sinh,
                    que_quan=row_data.que_quan,
                    dia_chi_thuong_tru=row_data.dia_chi_thuong_tru,
                    so_dien_thoai=row_data.so_dien_thoai,
                    email=row_data.email,
                    so_cccd=row_data.so_cccd,
                    noi_sinh=row_data.noi_sinh,
                    dan_toc=row_data.dan_toc,
                    ton_giao=row_data.ton_giao,
                    loai_nhan_vien=row_data.loai_nhan_vien,
                    cap_hoc=row_data.cap_hoc,
                    mon_day=row_data.mon_day,
                    phong_ban_id=row_data.phong_ban_id,
                    chuc_vu_id=row_data.chuc_vu_id,
                    loai_hop_dong=row_data.loai_hop_dong,
                    ngay_vao_lam=row_data.ngay_vao_lam,
                    tinh_trang_hon_nhan=row_data.tinh_trang_hon_nhan,
                    ghi_chu=row_data.ghi_chu,
                    trang_thai=row_data.trang_thai,
                )

                try:
                    created_nv = await nhan_vien_repo.create(new_nv)
                except Exception as e:
                    logger.error(f"Error creating NhanVien row {idx}: {str(e)}")
                    result.errors.append(
                        RowError(
                            row=idx,
                            ho_ten=row_data.ho_ten,
                            error=f"Lỗi tạo nhân viên: {str(e)}",
                        )
                    )
                    result.failed += 1
                    continue

                audit_log = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="nhan_vien",
                    ban_ghi_id=created_nv.id,
                    du_lieu_cu=None,
                    du_lieu_moi={
                        "ho_ten": row_data.ho_ten,
                        "ma_nhan_vien": ma_nhan_vien,
                        "import": True,
                    },
                    ghi_chu="Import nhân viên từ Excel",
                )
                await audit_repo.create(audit_log)

                result.success += 1
                result.created_ids.append(created_nv.id)

            return Return.ok(result)
