import logging
from dataclasses import dataclass
from datetime import datetime

from libs.datetime import get_utc_now
from libs.result import Result, Error, Return
from src.domain.models.cong_tac import CongTac
from src.domain.models.audit_log import AuditLog
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.app.usecases.nhan_vien.create_nhan_vien_uc import validate_loai_compatibility

logger = logging.getLogger(__name__)


@dataclass
class CreateCongTacCommand:
    nhan_vien_id: str
    data: dict
    actor_id: str


@dataclass
class CreateCongTacResult:
    item: CongTacResponse


class CreateCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateCongTacCommand
    ) -> Result[CreateCongTacResult, Error]:
        logger.info(
            f"User {command.actor_id} creating CongTac for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            chuc_vu = await uow.chuc_vu_repository.find_by_id(
                command.data["chuc_vu_id"]
            )
            if not chuc_vu:
                return Return.err(
                    Error(
                        code="chuc_vu_not_found",
                        message="Chức vụ không tồn tại",
                        reason="NotFound",
                    )
                )

            is_valid, error_msg = validate_loai_compatibility(
                nhan_vien.loai_nhan_vien, chuc_vu.loai
            )
            if not is_valid:
                return Return.err(
                    Error(
                        code="loai_mismatch",
                        message=error_msg,
                        reason="ValidationError",
                    )
                )

            if command.data.get("is_primary"):
                current = await uow.cong_tac_repository.get_current_by_nhan_vien_id(
                    command.nhan_vien_id
                )
                if current:
                    await uow.cong_tac_repository.end_assignment(current)

            ngay_bat_dau = None
            if command.data.get("ngay_bat_dau"):
                ngay_bat_dau = datetime.fromisoformat(command.data["ngay_bat_dau"])

            ct = CongTac(
                nhan_vien_id=command.nhan_vien_id,
                phong_ban_id=command.data["phong_ban_id"],
                chuc_vu_id=command.data["chuc_vu_id"],
                ngay_bat_dau=ngay_bat_dau or get_utc_now(),
                is_primary=command.data.get("is_primary", False),
                he_so_luong=command.data.get("he_so_luong"),
                bac_luong=command.data.get("bac_luong"),
                ghi_chu=command.data.get("ghi_chu"),
            )
            created = await uow.cong_tac_repository.create(ct)

            if created.is_primary:
                nv = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
                if nv:
                    nv.phong_ban_id = created.phong_ban_id
                    nv.chuc_vu_id = created.chuc_vu_id
                    await uow.nhan_vien_repository.update(nv)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="nhan_vien_cong_tac",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi=serialize_model_to_dict(created),
                ghi_chu=f"Phân công công tác cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                CreateCongTacResult(
                    item=CongTacResponse(**serialize_model_to_dict(created))
                )
            )
