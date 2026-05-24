import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.sub_modules import NguoiThanUpdateRequest, NguoiThanResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateNguoiThanCommand:
    nhan_vien_id: str
    item_id: str
    data: NguoiThanUpdateRequest
    actor_id: str


@dataclass
class UpdateNguoiThanResult:
    item: NguoiThanResponse


class UpdateNguoiThanUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateNguoiThanCommand
    ) -> Result[UpdateNguoiThanResult, Error]:
        logger.info(f"User {command.actor_id} updating NguoiThan {command.item_id}")

        async with self.unit_of_work as uow:
            item = await uow.nguoi_than_repository.find_by_id(command.item_id)
            if not item or item.nhan_vien_id != command.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy người thân",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(item)

            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(item, field, value)

            updated = await uow.nguoi_than_repository.update(item)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nguoi_than",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu=f"Cập nhật người thân cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                UpdateNguoiThanResult(
                    item=NguoiThanResponse(**serialize_model_to_dict(updated))
                )
            )
