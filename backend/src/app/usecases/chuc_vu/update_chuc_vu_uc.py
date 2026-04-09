import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError

from libs.result import Result, Error, Return
from src.domain.models.chuc_vu import ChucVu
from src.domain.models.audit_log import AuditLog
from src.api.schemas.chuc_vu import ChucVuUpdateRequest, ChucVuDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateChucVuCommand:
    id: str
    data: ChucVuUpdateRequest
    actor_id: str


@dataclass
class UpdateChucVuResult:
    chuc_vu: ChucVuDataResponse


class UpdateChucVuUseCase:
    """Use case for updating a ChucVu."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: UpdateChucVuCommand) -> Result[UpdateChucVuResult, Error]:
        """Execute update chuc vu use case."""
        logger.info(f"User {command.actor_id} is updating ChucVu {command.id}")

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

            # Update fields from request
            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing_cv, field, value)

            try:
                updated_cv = await chuc_vu_repo.update(existing_cv)
            except IntegrityError as e:
                await uow.rollback()
                logger.error(f"IntegrityError updating ChucVu: {str(e)}")
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
                bang_du_lieu="chuc_vu",
                ban_ghi_id=updated_cv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated_cv),
                ghi_chu="Cập nhật chức vụ"
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(updated_cv)
            response_data = ChucVuDataResponse(**resp)

            logger.info(f"ChucVu {updated_cv.ma_chuc_vu} updated successfully")
            return Return.ok(UpdateChucVuResult(chuc_vu=response_data))
