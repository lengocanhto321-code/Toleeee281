import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.api.schemas.lich_su_chuc_vu import (
    LichSuChucVuUpdateRequest,
    LichSuChucVuResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateLichSuChucVuCommand:
    id: str
    data: LichSuChucVuUpdateRequest
    actor_id: str


@dataclass
class UpdateLichSuChucVuResult:
    item: LichSuChucVuResponse


class UpdateLichSuChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateLichSuChucVuCommand
    ) -> Result[UpdateLichSuChucVuResult, Error]:
        logger.info(f"User {command.actor_id} updating LichSuChucVu {command.id}")

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

            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing, field, value)

            updated = await repo.update(existing)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="lich_su_chuc_vu",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu="Cập nhật lịch sử chức vụ",
            )
            await audit_repo.create(audit_log)

            resp = serialize_model_to_dict(updated)
            return Return.ok(
                UpdateLichSuChucVuResult(item=LichSuChucVuResponse(**resp))
            )
