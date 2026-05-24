import logging
from dataclasses import dataclass
from datetime import date as date_type

from libs.result import Result, Error, Return
from src.domain.models.hop_dong import HopDong
from src.domain.models.audit_log import AuditLog
from src.api.schemas.hop_dong import (
    HopDongCreateRequest,
    HopDongResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateHopDongCommand:
    nhan_vien_id: str
    data: HopDongCreateRequest
    actor_id: str


@dataclass
class CreateHopDongResult:
    item: HopDongResponse


class CreateHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateHopDongCommand
    ) -> Result[CreateHopDongResult, Error]:
        logger.info(
            f"User {command.actor_id} creating HopDong for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            if command.data.ngay_ket_thuc and command.data.ngay_bat_dau:
                if command.data.ngay_ket_thuc < command.data.ngay_bat_dau:
                    return Return.err(
                        Error(
                            code="invalid_dates",
                            message="Ngày kết thúc phải sau ngày bắt đầu",
                            reason="ValidationError",
                        )
                    )

            active_contracts = (
                await uow.hop_dong_repository.get_dang_hieu_luc_by_nhan_vien(
                    command.nhan_vien_id
                )
            )
            for old_hd in active_contracts:
                if command.data.ngay_bat_dau and old_hd.ngay_bat_dau:
                    if command.data.ngay_bat_dau < old_hd.ngay_bat_dau:
                        return Return.err(
                            Error(
                                code="overlap_error",
                                message="Ngày bắt đầu hợp đồng mới phải sau ngày bắt đầu hợp đồng đang hiệu lực",
                                reason="ValidationError",
                            )
                        )

            for old_hd in active_contracts:
                old_hd.trang_thai = "da_het_han"
                if (
                    not old_hd.ngay_ket_thuc
                    or old_hd.ngay_ket_thuc > command.data.ngay_bat_dau
                ):
                    old_hd.ngay_ket_thuc = command.data.ngay_bat_dau
                await uow.hop_dong_repository.update(old_hd)

                audit_close = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="UPDATE",
                    bang_du_lieu="hop_dong",
                    ban_ghi_id=old_hd.id,
                    du_lieu_cu={"trang_thai": "dang_hieu_luc"},
                    du_lieu_moi={
                        "trang_thai": "da_het_han",
                        "ngay_ket_thuc": str(old_hd.ngay_ket_thuc),
                    },
                    ghi_chu=f"Tự động đóng hợp đồng {old_hd.so_hop_dong} do ký hợp đồng mới",
                )
                await uow.audit_log_repository.create(audit_close)

            hd = HopDong(
                nhan_vien_id=command.nhan_vien_id,
                so_hop_dong=command.data.so_hop_dong
                or await uow.hop_dong_repository.generate_so_hop_dong(),
                loai_hop_dong=command.data.loai_hop_dong,
                ngay_ky=command.data.ngay_ky,
                ngay_bat_dau=command.data.ngay_bat_dau,
                ngay_ket_thuc=command.data.ngay_ket_thuc,
                hinh_thuc_tuyen_dung=command.data.hinh_thuc_tuyen_dung,
                noi_ky_hop_dong=command.data.noi_ky_hop_dong,
                luong_co_ban=command.data.luong_co_ban,
                ghi_chu=command.data.ghi_chu,
                trang_thai="dang_hieu_luc",
            )
            created = await uow.hop_dong_repository.create(hd)

            nhan_vien.loai_hop_dong = created.loai_hop_dong
            nhan_vien.so_hop_dong = created.so_hop_dong
            nhan_vien.ngay_het_hop_dong = created.ngay_ket_thuc
            nhan_vien.hinh_thuc_tuyen_dung = created.hinh_thuc_tuyen_dung
            nhan_vien.noi_ky_hop_dong = created.noi_ky_hop_dong
            await uow.nhan_vien_repository.update(nhan_vien)

            if command.data.luong_co_ban:
                luong = await uow.luong_repository.find_hien_tai(
                    command.nhan_vien_id, date_type.today()
                )
                if luong:
                    try:
                        luong.luong_co_ban = int(command.data.luong_co_ban)
                    except (ValueError, TypeError):
                        pass

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi={
                    "so_hop_dong": created.so_hop_dong,
                    "loai_hop_dong": created.loai_hop_dong,
                },
                ghi_chu=f"Tạo hợp đồng {created.so_hop_dong} cho nhân viên",
            )
            await uow.audit_log_repository.create(audit_log)

            resp = serialize_model_to_dict(created)
            return Return.ok(CreateHopDongResult(item=HopDongResponse(**resp)))
