import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.chuc_vu import ChucVu
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteChucVuCommand:
    id: str
    actor_id: str


@dataclass
class DeleteChucVuResult:
    chuc_vu: dict


class DeleteChucVuUseCase:
    """Use case for soft-deleting a ChucVu."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: DeleteChucVuCommand) -> Result[DeleteChucVuResult, Error]:
        """Execute delete chuc vu use case."""
        logger.info(f"User {command.actor_id} is deleting ChucVu {command.id}")

        async with self.unit_of_work as uow:
            chuc_vu_repo = uow.chuc_vu_repository
            audit_repo = uow.audit_log_repository

            # Find existing ChucVu
            existing_cv = await chuc_vu_repo.find_by_id(command.id)
            if not existing_cv:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Chức vụ không tồn tại",
                        reason="NotFound"
                    )
                )

            # Store old data for audit log
            old_data = serialize_model_to_dict(existing_cv)

            # Check if in use (has employees assigned)
            employee_count = await chuc_vu_repo.count_employees(command.id, active_only=True)
            if employee_count > 0:
                return Return.err(
                    Error(
                        code="position_in_use",
                        message=f"Chức vụ đang được sử dụng bởi {employee_count} nhân viên",
                        reason="BusinessRuleViolation"
                    )
                )

            # Soft-delete
            deleted_cv = await chuc_vu_repo.delete(existing_cv)

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="DELETE",
                bang_du_lieu="chuc_vu",
                ban_ghi_id=deleted_cv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(deleted_cv),
                ghi_chu="Xóa mềm chức vụ"
            )
            await audit_repo.create(audit_log)

            logger.info(f"ChucVu {deleted_cv.ma_chuc_vu} deleted successfully")
            return Return.ok(DeleteChucVuResult(chuc_vu=serialize_model_to_dict(deleted_cv)))
