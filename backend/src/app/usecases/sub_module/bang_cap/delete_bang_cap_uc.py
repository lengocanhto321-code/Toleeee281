import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteBangCapCommand:
    nhan_vien_id: str
    item_id: str
    actor_id: str


@dataclass
class DeleteBangCapResult:
    item_id: str


class DeleteBangCapUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteBangCapCommand
    ) -> Result[DeleteBangCapResult, Error]:
        logger.info(f"User {command.actor_id} deleting BangCap {command.item_id}")

        async with self.unit_of_work as uow:
            item = await uow.bang_cap_repository.find_by_id(command.item_id)
            if not item or item.nhan_vien_id != command.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy bằng cấp",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(item)
            await uow.bang_cap_repository.delete(item)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="DELETE",
                bang_du_lieu="bang_cap_chung_chi",
                ban_ghi_id=command.item_id,
                du_lieu_cu=old_data,
                du_lieu_moi=None,
                ghi_chu=f"Xóa bằng cấp cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(DeleteBangCapResult(item_id=command.item_id))
