import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteLichSuChucVuCommand:
    id: str
    actor_id: str


@dataclass
class DeleteLichSuChucVuResult:
    success: bool


class DeleteLichSuChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteLichSuChucVuCommand
    ) -> Result[DeleteLichSuChucVuResult, Error]:
        logger.info(f"User {command.actor_id} deleting LichSuChucVu {command.id}")

        async with self.unit_of_work as uow:
            repo = uow.lich_su_chuc_vu_repository
            audit_repo = uow.audit_log_repository

            existing = await repo.find_by_id(command.id)
            if not existing:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Lịch sử chức vụ không tồn tại",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(existing)

            await repo.delete(existing)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="DELETE",
                bang_du_lieu="lich_su_chuc_vu",
                ban_ghi_id=command.id,
                du_lieu_cu=old_data,
                du_lieu_moi=None,
                ghi_chu="Xóa lịch sử chức vụ",
            )
            await audit_repo.create(audit_log)

            return Return.ok(DeleteLichSuChucVuResult(success=True))
