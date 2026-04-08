import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.phong_ban.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeletePhongBanCommand:
    """Command for deleting a branch/department."""
    id: str
    actor_id: str


@dataclass
class DeletePhongBanResult:
    """Result of successful deletion."""
    success: bool


class DeletePhongBanUseCase:
    """Use case for deleting a PhongBan."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: DeletePhongBanCommand) -> Result[DeletePhongBanResult, Error]:
        """Execute delete phong ban use case."""
        logger.info(f"User {command.actor_id} is deleting PhongBan {command.id}")

        async with self.unit_of_work as uow:
            phong_ban_repo = uow.phong_ban_repository
            audit_repo = uow.audit_log_repository

            # Get existing
            existing = await phong_ban_repo.find_by_id(command.id)
            if not existing:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phòng ban.",
                        reason="Not Found"
                    )
                )

            # Rule: Cannot delete if any employees exist
            total_count = await phong_ban_repo.count_employees(command.id, active_only=False)
            if total_count > 0:
                return Return.err(
                    Error(
                        code="employees_exist",
                        message="Không thể xoá phòng ban đã có nhân sự (kể cả đã nghỉ).",
                        reason="Conflict"
                    )
                )

            # Store old data for audit
            old_data = serialize_model_to_dict(existing)

            # Delete
            await phong_ban_repo.delete(existing)

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="DELETE",
                bang_du_lieu="phong_ban",
                ban_ghi_id=command.id,
                du_lieu_cu=old_data,
                du_lieu_moi=None,
                ghi_chu="Xoá phòng ban"
            )
            await audit_repo.create(audit_log)

            return Return.ok(DeletePhongBanResult(success=True))
