import logging
from dataclasses import dataclass
from typing import List

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class BatchPhanBoChucVuCommand:
    nhan_vien_ids: List[str]
    chuc_vu_id: str
    actor_id: str


@dataclass
class BatchPhanBoChucVuResult:
    success_count: int
    failed_ids: List[str]


class BatchPhanBoChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: BatchPhanBoChucVuCommand
    ) -> Result[BatchPhanBoChucVuResult, Error]:
        logger.info(
            f"User {command.actor_id} batch allocating {len(command.nhan_vien_ids)} "
            f"employees to chuc_vu {command.chuc_vu_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            audit_repo = uow.audit_log_repository

            success_count = 0
            failed_ids: List[str] = []

            for nv_id in command.nhan_vien_ids:
                existing_nv = await nhan_vien_repo.find_by_id(nv_id)
                if not existing_nv:
                    failed_ids.append(nv_id)
                    continue

                if existing_nv.chuc_vu_id == command.chuc_vu_id:
                    continue

                old_data = serialize_model_to_dict(existing_nv)

                existing_nv.chuc_vu_id = command.chuc_vu_id
                await nhan_vien_repo.update(existing_nv)

                audit_log = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="UPDATE",
                    bang_du_lieu="nhan_vien",
                    ban_ghi_id=existing_nv.id,
                    du_lieu_cu=old_data,
                    du_lieu_moi=serialize_model_to_dict(existing_nv),
                    ghi_chu="Phân bổ chức vụ hàng loạt",
                )
                await audit_repo.create(audit_log)

                success_count += 1

            return Return.ok(
                BatchPhanBoChucVuResult(
                    success_count=success_count, failed_ids=failed_ids
                )
            )
