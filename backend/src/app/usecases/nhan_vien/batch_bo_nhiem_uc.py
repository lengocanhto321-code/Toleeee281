import logging
from dataclasses import dataclass
from datetime import date
from typing import List, Optional

from libs.result import Result, Error, Return
from src.domain.models.lich_su_chuc_vu import LichSuChucVu
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class BatchBoNhiemCommand:
    nhan_vien_ids: List[str]
    chuc_vu_id: str
    ngay_bo_nhiem: date
    so_quyet_dinh: Optional[str] = None
    actor_id: str = ""


@dataclass
class BatchBoNhiemResult:
    success_count: int
    failed_ids: List[str]


class BatchBoNhiemUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: BatchBoNhiemCommand
    ) -> Result[BatchBoNhiemResult, Error]:
        logger.info(
            f"User {command.actor_id} batch appointing {len(command.nhan_vien_ids)} "
            f"employees to chuc_vu {command.chuc_vu_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            lich_su_repo = uow.lich_su_chuc_vu_repository
            audit_repo = uow.audit_log_repository

            success_count = 0
            failed_ids: List[str] = []

            for nv_id in command.nhan_vien_ids:
                existing_nv = await nhan_vien_repo.find_by_id(nv_id)
                if not existing_nv:
                    failed_ids.append(nv_id)
                    continue

                old_data = serialize_model_to_dict(existing_nv)
                old_chuc_vu_id = existing_nv.chuc_vu_id

                lich_su = LichSuChucVu(
                    nhan_vien_id=nv_id,
                    chuc_vu_id=command.chuc_vu_id,
                    phong_ban_id=existing_nv.phong_ban_id,
                    tu_ngay=command.ngay_bo_nhiem,
                    so_quyet_dinh=command.so_quyet_dinh,
                    ly_do="Bổ nhiệm hàng loạt",
                )
                await lich_su_repo.create(lich_su)

                existing_nv.chuc_vu_id = command.chuc_vu_id
                existing_nv.ngay_bo_nhiem_chuc_vu = command.ngay_bo_nhiem
                await nhan_vien_repo.update(existing_nv)

                audit_log = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="lich_su_chuc_vu",
                    ban_ghi_id=lich_su.id,
                    du_lieu_cu=None,
                    du_lieu_moi=serialize_model_to_dict(lich_su),
                    ghi_chu=f"Bổ nhiệm hàng loạt: {old_chuc_vu_id or 'N/A'} → {command.chuc_vu_id}",
                )
                await audit_repo.create(audit_log)

                nv_audit = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="UPDATE",
                    bang_du_lieu="nhan_vien",
                    ban_ghi_id=existing_nv.id,
                    du_lieu_cu=old_data,
                    du_lieu_moi=serialize_model_to_dict(existing_nv),
                    ghi_chu="Bổ nhiệm chức vụ hàng loạt",
                )
                await audit_repo.create(nv_audit)

                success_count += 1

            return Return.ok(
                BatchBoNhiemResult(success_count=success_count, failed_ids=failed_ids)
            )
