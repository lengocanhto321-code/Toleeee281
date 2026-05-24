import logging
from dataclasses import dataclass
from datetime import date as date_type

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.hop_dong import (
    HopDongUpdateRequest,
    HopDongResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateHopDongCommand:
    id: str
    data: HopDongUpdateRequest
    actor_id: str


@dataclass
class UpdateHopDongResult:
    item: HopDongResponse


class UpdateHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateHopDongCommand
    ) -> Result[UpdateHopDongResult, Error]:
        logger.info(f"User {command.actor_id} updating HopDong {command.id}")

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

            if (
                command.data.trang_thai == "dang_hieu_luc"
                and hd.trang_thai != "dang_hieu_luc"
            ):
                active_contracts = (
                    await uow.hop_dong_repository.get_dang_hieu_luc_by_nhan_vien(
                        hd.nhan_vien_id
                    )
                )
                active_contracts = [c for c in active_contracts if c.id != hd.id]
                for old_hd in active_contracts:
                    old_hd.trang_thai = "da_het_han"
                    await uow.hop_dong_repository.update(old_hd)

            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(hd, field, value)

            updated = await uow.hop_dong_repository.update(hd)

            if updated.trang_thai == "dang_hieu_luc":
                nhan_vien = await uow.nhan_vien_repository.find_by_id(
                    updated.nhan_vien_id
                )
                if nhan_vien:
                    if updated.loai_hop_dong:
                        nhan_vien.loai_hop_dong = updated.loai_hop_dong
                    if updated.so_hop_dong:
                        nhan_vien.so_hop_dong = updated.so_hop_dong
                    nhan_vien.ngay_het_hop_dong = updated.ngay_ket_thuc
                    if updated.hinh_thuc_tuyen_dung:
                        nhan_vien.hinh_thuc_tuyen_dung = updated.hinh_thuc_tuyen_dung
                    if updated.noi_ky_hop_dong:
                        nhan_vien.noi_ky_hop_dong = updated.noi_ky_hop_dong
                    await uow.nhan_vien_repository.update(nhan_vien)

            if command.data.luong_co_ban:
                luong = await uow.luong_repository.find_hien_tai(
                    updated.nhan_vien_id, date_type.today()
                )
                if luong:
                    try:
                        luong.luong_co_ban = int(command.data.luong_co_ban)
                    except (ValueError, TypeError):
                        pass

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu=f"Cập nhật hợp đồng {updated.so_hop_dong}",
            )
            await uow.audit_log_repository.create(audit_log)

            resp = serialize_model_to_dict(updated)
            return Return.ok(UpdateHopDongResult(item=HopDongResponse(**resp)))
