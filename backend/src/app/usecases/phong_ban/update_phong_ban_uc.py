import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.phong_ban import PhongBanUpdateRequest, PhongBanDataResponse
from src.app.usecases.phong_ban.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdatePhongBanCommand:
    """Command for updating a branch/department."""
    id: str
    data: PhongBanUpdateRequest
    actor_id: str


@dataclass
class UpdatePhongBanResult:
    """Result of successful update."""
    phong_ban: PhongBanDataResponse


class UpdatePhongBanUseCase:
    """Use case for updating a PhongBan."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: UpdatePhongBanCommand) -> Result[UpdatePhongBanResult, Error]:
        """Execute update phong ban use case."""
        logger.info(f"User {command.actor_id} is updating PhongBan {command.id}")

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

            # Store old data for audit
            old_data = serialize_model_to_dict(existing)

            # Rule: If trang_thai -> False, check active employees
            if existing.trang_thai and command.data.trang_thai is False:
                active_count = await phong_ban_repo.count_employees(command.id, active_only=True)
                if active_count > 0:
                    return Return.err(
                        Error(
                            code="active_employees_exist",
                            message="Không thể vô hiệu hoá phòng ban đang có nhân viên làm việc.",
                            reason="Conflict"
                        )
                    )

            # Update fields based on exclude_unset
            update_data = command.data.model_dump(exclude_unset=True)
            for k, v in update_data.items():
                setattr(existing, k, v)

            updated_pb = await phong_ban_repo.update(existing)
            new_data = serialize_model_to_dict(updated_pb)

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="phong_ban",
                ban_ghi_id=updated_pb.id,
                du_lieu_cu=old_data,
                du_lieu_moi=new_data,
                ghi_chu="Cập nhật phòng ban"
            )
            await audit_repo.create(audit_log)

            await uow.commit()

            resp = await phong_ban_repo.get_detail_with_stats(command.id)
            response_data = PhongBanDataResponse(**resp)
            return Return.ok(UpdatePhongBanResult(phong_ban=response_data))
