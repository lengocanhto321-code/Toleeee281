import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.audit_log import AuditLog
from src.api.schemas.nhan_vien import NhanVienCreateRequest, NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateNhanVienCommand:
    data: NhanVienCreateRequest
    actor_id: str


@dataclass
class CreateNhanVienResult:
    nhan_vien: NhanVienDataResponse


class CreateNhanVienUseCase:
    """Use case for creating a NhanVien."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: CreateNhanVienCommand) -> Result[CreateNhanVienResult, Error]:
        """Execute create nhan vien use case."""
        logger.info(f"User {command.actor_id} is creating NhanVien {command.data.ma_nhan_vien}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            audit_repo = uow.audit_log_repository

            # Check duplicate email
            if command.data.email:
                existing_by_email = await nhan_vien_repo.find_by_email(command.data.email, include_deleted=True)
                if existing_by_email:
                    return Return.err(
                        Error(
                            code="email_exists",
                            message="Email đã tồn tại trong hệ thống",
                            reason="Conflict"
                        )
                    )

            # Check duplicate CCCD
            if command.data.so_cccd:
                existing_by_cccd = await nhan_vien_repo.find_by_cccd(command.data.so_cccd, include_deleted=True)
                if existing_by_cccd:
                    return Return.err(
                        Error(
                            code="cccd_exists",
                            message="CCCD đã tồn tại trong hệ thống",
                            reason="Conflict"
                        )
                    )

            # Auto-generate ma_nhan_vien
            ma_nhan_vien = await nhan_vien_repo.generate_ma_nhan_vien(command.data.loai_nhan_vien)

            # Create new NhanVien
            new_nv = NhanVien(
                ma_nhan_vien=ma_nhan_vien,
                ho_ten=command.data.ho_ten,
                gioi_tinh=command.data.gioi_tinh,
                ngay_sinh=command.data.ngay_sinh,
                que_quan=command.data.que_quan,
                dia_chi_thuong_tru=command.data.dia_chi_thuong_tru,
                so_dien_thoai=command.data.so_dien_thoai,
                email=command.data.email,
                so_cccd=command.data.so_cccd,
                anh_dai_dien=command.data.anh_dai_dien,
                loai_nhan_vien=command.data.loai_nhan_vien,
                mon_day=command.data.mon_day,
                hang_chuc_danh=command.data.hang_chuc_danh,
                loai_hop_dong=command.data.loai_hop_dong,
                so_hop_dong=command.data.so_hop_dong,
                ngay_vao_lam=command.data.ngay_vao_lam,
                ngay_het_hop_dong=command.data.ngay_het_hop_dong,
                la_dang_vien=command.data.la_dang_vien,
                la_doan_vien=command.data.la_doan_vien,
                ghi_chu=command.data.ghi_chu,
                trang_thai=command.data.trang_thai,
            )

            try:
                created_nv = await nhan_vien_repo.create(new_nv)
            except IntegrityError as e:
                await uow.rollback()
                logger.error(f"IntegrityError creating NhanVien: {str(e)}")
                return Return.err(
                    Error(
                        code="code_exists",
                        message="Mã nhân viên đã tồn tại",
                        reason="Conflict"
                    )
                )

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=created_nv.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu="Tạo mới nhân viên"
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(created_nv)
            response_data = NhanVienDataResponse(**resp)

            logger.info(f"NhanVien {created_nv.ma_nhan_vien} created successfully")
            return Return.ok(CreateNhanVienResult(nhan_vien=response_data))
