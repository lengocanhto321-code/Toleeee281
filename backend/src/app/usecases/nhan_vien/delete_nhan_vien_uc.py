import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteNhanVienCommand:
    id: str
    actor_id: str


@dataclass
class DeleteNhanVienResult:
    nhan_vien: dict


class DeleteNhanVienUseCase:
    """Use case for soft-deleting a NhanVien."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteNhanVienCommand
    ) -> Result[DeleteNhanVienResult, Error]:
        """Execute delete nhan vien use case."""
        logger.info(f"User {command.actor_id} is deleting NhanVien {command.id}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            audit_repo = uow.audit_log_repository

            # Find existing NhanVien (try ma_nhan_vien first, then id)
            existing_nv = await nhan_vien_repo.find_by_ma(command.id)
            if not existing_nv:
                existing_nv = await nhan_vien_repo.find_by_id(command.id)
            if not existing_nv:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            # Store old data for audit log
            old_data = serialize_model_to_dict(existing_nv)

            # Check if can delete (business rule: can't delete active employees)
            if existing_nv.trang_thai == "dang_lam":
                return Return.err(
                    Error(
                        code="cannot_delete_active_employee",
                        message="Không thể xóa nhân viên đang làm việc",
                        reason="BusinessRuleViolation",
                    )
                )

            # Soft-delete
            deleted_nv = await nhan_vien_repo.delete(existing_nv)

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="DELETE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=deleted_nv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(deleted_nv),
                ghi_chu="Xóa mềm nhân viên",
            )
            await audit_repo.create(audit_log)

            logger.info(f"NhanVien {deleted_nv.ma_nhan_vien} deleted successfully")
            return Return.ok(
                DeleteNhanVienResult(nhan_vien=serialize_model_to_dict(deleted_nv))
            )
