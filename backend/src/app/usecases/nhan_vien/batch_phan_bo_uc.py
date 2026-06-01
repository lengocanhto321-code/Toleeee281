import logging
from dataclasses import dataclass
from typing import List

from libs.datetime import get_utc_now, serialize_dt

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.cong_tac import CongTac
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class BatchPhanBoCommand:
    nhan_vien_ids: List[str]
    phong_ban_id: str
    actor_id: str


@dataclass
class BatchPhanBoResult:
    success_count: int
    failed_ids: List[str]


class BatchPhanBoUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: BatchPhanBoCommand
    ) -> Result[BatchPhanBoResult, Error]:
        logger.info(
            f"User {command.actor_id} batch allocating {len(command.nhan_vien_ids)} "
            f"employees to phong_ban {command.phong_ban_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            audit_repo = uow.audit_log_repository
            cong_tac_repo = uow.cong_tac_repository

            success_count = 0
            failed_ids: List[str] = []

            for nv_id in command.nhan_vien_ids:
                existing_nv = await nhan_vien_repo.find_by_id(nv_id)
                if not existing_nv:
                    failed_ids.append(nv_id)
                    continue

                if existing_nv.phong_ban_id == command.phong_ban_id:
                    continue

                old_data = serialize_model_to_dict(existing_nv)
                old_phong_ban_id = existing_nv.phong_ban_id

                existing_nv.phong_ban_id = command.phong_ban_id

                new_chuc_vu_id = existing_nv.chuc_vu_id

                if command.phong_ban_id and new_chuc_vu_id:
                    current_cong_tac = await cong_tac_repo.get_current_by_nhan_vien_id(
                        nv_id
                    )
                    if current_cong_tac:
                        await cong_tac_repo.end_assignment(current_cong_tac)
                        old_ct_data = serialize_model_to_dict(current_cong_tac)
                        old_ct_data["ngay_ket_thuc"] = serialize_dt(get_utc_now())
                        old_ct_data["trang_thai"] = "da_chuyen"

                        audit_log_end = AuditLog(
                            tai_khoan_id=command.actor_id,
                            hanh_dong="UPDATE",
                            bang_du_lieu="nhan_vien_cong_tac",
                            ban_ghi_id=current_cong_tac.id,
                            du_lieu_cu=old_ct_data,
                            du_lieu_moi=serialize_model_to_dict(current_cong_tac),
                            ghi_chu="Kết thúc phân công do phân bổ hàng loạt",
                        )
                        await audit_repo.create(audit_log_end)

                    new_cong_tac = CongTac(
                        nhan_vien_id=nv_id,
                        phong_ban_id=command.phong_ban_id,
                        chuc_vu_id=new_chuc_vu_id,
                        ngay_bat_dau=get_utc_now(),
                        is_primary=True,
                        he_so_luong=existing_nv.he_so_luong,
                        bac_luong=str(existing_nv.bac_luong)
                        if existing_nv.bac_luong is not None
                        else None,
                        trang_thai="dang_cong_tac",
                    )
                    created_ct = await cong_tac_repo.create(new_cong_tac)

                    audit_log_new = AuditLog(
                        tai_khoan_id=command.actor_id,
                        hanh_dong="CREATE",
                        bang_du_lieu="nhan_vien_cong_tac",
                        ban_ghi_id=created_ct.id,
                        du_lieu_cu=None,
                        du_lieu_moi=serialize_model_to_dict(created_ct),
                        ghi_chu=f"Phân công mới do phân bổ hàng loạt: "
                        f"{old_phong_ban_id or 'N/A'} → {command.phong_ban_id}",
                    )
                    await audit_repo.create(audit_log_new)

                await nhan_vien_repo.update(existing_nv)

                audit_log = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="UPDATE",
                    bang_du_lieu="nhan_vien",
                    ban_ghi_id=existing_nv.id,
                    du_lieu_cu=old_data,
                    du_lieu_moi=serialize_model_to_dict(existing_nv),
                    ghi_chu="Phân bổ phòng ban hàng loạt",
                )
                await audit_repo.create(audit_log)

                success_count += 1

            return Return.ok(
                BatchPhanBoResult(success_count=success_count, failed_ids=failed_ids)
            )
