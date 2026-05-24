import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.bang_cap_chung_chi import BangCapChungChi
from src.domain.models.audit_log import AuditLog
from src.api.schemas.sub_modules import BangCapCreateRequest, BangCapResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateBangCapCommand:
    nhan_vien_id: str
    data: BangCapCreateRequest
    actor_id: str


@dataclass
class CreateBangCapResult:
    item: BangCapResponse


class CreateBangCapUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateBangCapCommand
    ) -> Result[CreateBangCapResult, Error]:
        logger.info(
            f"User {command.actor_id} creating BangCap for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            bang_cap = BangCapChungChi(
                nhan_vien_id=command.nhan_vien_id,
                **command.data.model_dump(),
            )
            created = await uow.bang_cap_repository.create(bang_cap)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="bang_cap_chung_chi",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu=f"Thêm bằng cấp cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                CreateBangCapResult(
                    item=BangCapResponse(**serialize_model_to_dict(created))
                )
            )
