import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteHopDongCommand:
    id: str
    actor_id: str


@dataclass
class DeleteHopDongResult:
    pass


class DeleteHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteHopDongCommand
    ) -> Result[DeleteHopDongResult, Error]:
        logger.info(f"User {command.actor_id} cancelling HopDong {command.id}")

        async with self.unit_of_work as uow:
            hd = await uow.hop_dong_repository.find_by_id(command.id)
            if not hd:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Hợp đồng không tồn tại",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(hd)
            old_trang_thai = hd.trang_thai

            hd.trang_thai = "bi_huy"
            await uow.hop_dong_repository.update(hd)

            if old_trang_thai == "dang_hieu_luc":
                nhan_vien = await uow.nhan_vien_repository.find_by_id(hd.nhan_vien_id)
                if nhan_vien and nhan_vien.so_hop_dong == hd.so_hop_dong:
                    nhan_vien.loai_hop_dong = "vien_chuc"
                    nhan_vien.so_hop_dong = None
                    nhan_vien.ngay_het_hop_dong = None
                    await uow.nhan_vien_repository.update(nhan_vien)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=command.id,
                du_lieu_cu=old_data,
                du_lieu_moi={"trang_thai": "bi_huy"},
                ghi_chu=f"Hủy hợp đồng {old_data.get('so_hop_dong')}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(DeleteHopDongResult())
