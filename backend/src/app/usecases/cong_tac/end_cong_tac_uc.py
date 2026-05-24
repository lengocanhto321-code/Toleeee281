import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class EndCongTacCommand:
    cong_tac_id: str
    nhan_vien_id: str
    actor_id: str


@dataclass
class EndCongTacResult:
    item: CongTacResponse


class EndCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: EndCongTacCommand
    ) -> Result[EndCongTacResult, Error]:
        logger.info(f"User {command.actor_id} ending CongTac {command.cong_tac_id}")

        async with self.unit_of_work as uow:
            ct = await uow.cong_tac_repository.find_by_id(command.cong_tac_id)
            if not ct or ct.nhan_vien_id != command.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phân công công tác",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(ct)
            ended = await uow.cong_tac_repository.end_assignment(ct)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nhan_vien_cong_tac",
                ban_ghi_id=ended.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(ended),
                ghi_chu=f"Kết thúc phân công công tác cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                EndCongTacResult(item=CongTacResponse(**serialize_model_to_dict(ended)))
            )
