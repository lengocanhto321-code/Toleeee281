import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.nguoi_than import NguoiThan
from src.domain.models.audit_log import AuditLog
from src.api.schemas.sub_modules import NguoiThanCreateRequest, NguoiThanResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateNguoiThanCommand:
    nhan_vien_id: str
    data: NguoiThanCreateRequest
    actor_id: str


@dataclass
class CreateNguoiThanResult:
    item: NguoiThanResponse


class CreateNguoiThanUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateNguoiThanCommand
    ) -> Result[CreateNguoiThanResult, Error]:
        logger.info(
            f"User {command.actor_id} creating NguoiThan for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            nguoi_than = NguoiThan(
                nhan_vien_id=command.nhan_vien_id,
                **command.data.model_dump(),
            )
            created = await uow.nguoi_than_repository.create(nguoi_than)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="nguoi_than",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu=f"Thêm người thân cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                CreateNguoiThanResult(
                    item=NguoiThanResponse(**serialize_model_to_dict(created))
                )
            )
