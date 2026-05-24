import logging
from dataclasses import dataclass
from datetime import datetime

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateCongTacCommand:
    id: str
    data: dict
    actor_id: str


@dataclass
class UpdateCongTacResult:
    item: CongTacResponse


class UpdateCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateCongTacCommand
    ) -> Result[UpdateCongTacResult, Error]:
        logger.info(f"User {command.actor_id} updating CongTac {command.id}")

        async with self.unit_of_work as uow:
            ct = await uow.cong_tac_repository.find_by_id(command.id)
            if not ct:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phân công công tác",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(ct)

            if "phong_ban_id" in command.data:
                ct.phong_ban_id = command.data["phong_ban_id"]
            if "chuc_vu_id" in command.data:
                ct.chuc_vu_id = command.data["chuc_vu_id"]
            if "ngay_bat_dau" in command.data:
                if command.data["ngay_bat_dau"]:
                    ct.ngay_bat_dau = datetime.fromisoformat(
                        command.data["ngay_bat_dau"]
                    )
            if "he_so_luong" in command.data:
                ct.he_so_luong = command.data["he_so_luong"]
            if "bac_luong" in command.data:
                ct.bac_luong = command.data["bac_luong"]
            if "ghi_chu" in command.data:
                ct.ghi_chu = command.data["ghi_chu"]

            updated = await uow.cong_tac_repository.update(ct)

            if updated.is_primary:
                nhan_vien = await uow.nhan_vien_repository.find_by_id(
                    updated.nhan_vien_id
                )
                if nhan_vien:
                    nhan_vien.phong_ban_id = updated.phong_ban_id
                    nhan_vien.chuc_vu_id = updated.chuc_vu_id
                    await uow.nhan_vien_repository.update(nhan_vien)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nhan_vien_cong_tac",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu="Cập nhật phân công công tác",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                UpdateCongTacResult(
                    item=CongTacResponse(**serialize_model_to_dict(updated))
                )
            )
