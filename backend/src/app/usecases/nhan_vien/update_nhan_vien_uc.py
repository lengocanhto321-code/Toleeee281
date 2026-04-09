import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.audit_log import AuditLog
from src.api.schemas.nhan_vien import NhanVienUpdateRequest, NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateNhanVienCommand:
    id: str
    data: NhanVienUpdateRequest
    actor_id: str


@dataclass
class UpdateNhanVienResult:
    nhan_vien: NhanVienDataResponse


class UpdateNhanVienUseCase:
    """Use case for updating a NhanVien."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: UpdateNhanVienCommand) -> Result[UpdateNhanVienResult, Error]:
        """Execute update nhan vien use case."""
        logger.info(f"User {command.actor_id} is updating NhanVien {command.id}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            audit_repo = uow.audit_log_repository

            # Find existing NhanVien
            existing_nv = await nhan_vien_repo.find_by_id(command.id)
            if not existing_nv:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound"
                    )
                )

            # Store old data for audit log
            old_data = serialize_model_to_dict(existing_nv)

            # Check duplicate email if changing
            if command.data.email and command.data.email != existing_nv.email:
                existing_by_email = await nhan_vien_repo.find_by_email(command.data.email, include_deleted=True)
                if existing_by_email and existing_by_email.id != command.id:
                    return Return.err(
                        Error(
                            code="email_exists",
                            message="Email đã tồn tại trong hệ thống",
                            reason="Conflict"
                        )
                    )

            # Check duplicate CCCD if changing
            if command.data.so_cccd and command.data.so_cccd != existing_nv.so_cccd:
                existing_by_cccd = await nhan_vien_repo.find_by_cccd(command.data.so_cccd, include_deleted=True)
                if existing_by_cccd and existing_by_cccd.id != command.id:
                    return Return.err(
                        Error(
                            code="cccd_exists",
                            message="CCCD đã tồn tại trong hệ thống",
                            reason="Conflict"
                        )
                    )

            # Update fields from request
            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing_nv, field, value)

            try:
                updated_nv = await nhan_vien_repo.update(existing_nv)
            except IntegrityError as e:
                await uow.rollback()
                logger.error(f"IntegrityError updating NhanVien: {str(e)}")
                return Return.err(
                    Error(
                        code="integrity_error",
                        message="Lỗi toàn vẹn dữ liệu",
                        reason="IntegrityError"
                    )
                )

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=updated_nv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated_nv),
                ghi_chu="Cập nhật nhân viên"
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(updated_nv)
            response_data = NhanVienDataResponse(**resp)

            logger.info(f"NhanVien {updated_nv.ma_nhan_vien} updated successfully")
            return Return.ok(UpdateNhanVienResult(nhan_vien=response_data))
