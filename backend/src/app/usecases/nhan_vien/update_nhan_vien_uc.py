import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from libs.datetime import get_utc_now

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.cong_tac import CongTac
from src.domain.models.audit_log import AuditLog
from src.api.schemas.nhan_vien import NhanVienUpdateRequest, NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.app.usecases.nhan_vien.create_nhan_vien_uc import validate_loai_compatibility

logger = logging.getLogger(__name__)


@dataclass
class UpdateNhanVienCommand:
    id: str
    data: NhanVienUpdateRequest
    actor_id: str


@dataclass
class UpdateNhanVienResult:
    nhan_vien: NhanVienDataResponse


class UpdateNhanVienUseCase:
    """Use case for updating a NhanVien."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateNhanVienCommand
    ) -> Result[UpdateNhanVienResult, Error]:
        """Execute update nhan vien use case."""
        logger.info(f"User {command.actor_id} is updating NhanVien {command.id}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            chuc_vu_repo = uow.chuc_vu_repository
            audit_repo = uow.audit_log_repository

            # Find existing NhanVien (try ma_nhan_vien first, then id)
            existing_nv = await nhan_vien_repo.find_by_ma(command.id)
            if not existing_nv:
                existing_nv = await nhan_vien_repo.find_by_id(command.id)
            if not existing_nv:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            # Store old data for audit log
            old_data = serialize_model_to_dict(existing_nv)

            # Check duplicate email if changing
            if command.data.email and command.data.email != existing_nv.email:
                existing_by_email = await nhan_vien_repo.find_by_email(
                    command.data.email, include_deleted=True
                )
                if existing_by_email and existing_by_email.id != command.id:
                    return Return.err(
                        Error(
                            code="email_exists",
                            message="Email đã tồn tại trong hệ thống",
                            reason="Conflict",
                        )
                    )

            # Check duplicate CCCD if changing
            if command.data.so_cccd and command.data.so_cccd != existing_nv.so_cccd:
                existing_by_cccd = await nhan_vien_repo.find_by_cccd(
                    command.data.so_cccd, include_deleted=True
                )
                if existing_by_cccd and existing_by_cccd.id != command.id:
                    return Return.err(
                        Error(
                            code="cccd_exists",
                            message="CCCD đã tồn tại trong hệ thống",
                            reason="Conflict",
                        )
                    )

            # Validate loai_nhan_vien vs loai_chuc_vu compatibility
            new_loai_nv = command.data.loai_nhan_vien or existing_nv.loai_nhan_vien
            new_chuc_vu_id = (
                command.data.chuc_vu_id
                if "chuc_vu_id" in command.data.model_dump(exclude_unset=True)
                else None
            )

            if new_chuc_vu_id or command.data.loai_nhan_vien:
                chuc_vu_id_to_check = new_chuc_vu_id or existing_nv.chuc_vu_id
                if chuc_vu_id_to_check:
                    chuc_vu = await chuc_vu_repo.find_by_id(chuc_vu_id_to_check)
                    if not chuc_vu:
                        return Return.err(
                            Error(
                                code="chuc_vu_not_found",
                                message="Chức vụ không tồn tại",
                                reason="NotFound",
                            )
                        )

                    is_valid, error_msg = validate_loai_compatibility(
                        new_loai_nv, chuc_vu.loai
                    )
                    if not is_valid:
                        return Return.err(
                            Error(
                                code="loai_mismatch",
                                message=error_msg,
                                reason="ValidationError",
                            )
                        )

            # Update fields from request
            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing_nv, field, value)

            # Check if phong_ban_id or chuc_vu_id changed - trigger CongTac workflow
            new_phong_ban_id = (
                update_data.get("phong_ban_id") or existing_nv.phong_ban_id
            )
            new_chuc_vu_id = update_data.get("chuc_vu_id") or existing_nv.chuc_vu_id
            old_phong_ban_id = old_data.get("phong_ban_id")
            old_chuc_vu_id = old_data.get("chuc_vu_id")

            cong_tac_changed = (
                (
                    new_phong_ban_id != old_phong_ban_id
                    or new_chuc_vu_id != old_chuc_vu_id
                )
                and new_phong_ban_id
                and new_chuc_vu_id
            )

            if cong_tac_changed:
                logger.info(
                    f"Detected assignment change for NhanVien {command.id}: "
                    f"PB {old_phong_ban_id}->{new_phong_ban_id}, "
                    f"CV {old_chuc_vu_id}->{new_chuc_vu_id}"
                )

                # End current primary CongTac record
                current_cong_tac = (
                    await uow.cong_tac_repository.get_current_by_nhan_vien_id(
                        command.id
                    )
                )
                if current_cong_tac:
                    await uow.cong_tac_repository.end_assignment(current_cong_tac)
                    old_ct_data = serialize_model_to_dict(current_cong_tac)
                    old_ct_data["ngay_ket_thuc"] = get_utc_now()
                    old_ct_data["trang_thai"] = "da_chuyen"

                    # Audit log for ending old assignment
                    audit_log_end = AuditLog(
                        tai_khoan_id=command.actor_id,
                        hanh_dong="UPDATE",
                        bang_du_lieu="nhan_vien_cong_tac",
                        ban_ghi_id=current_cong_tac.id,
                        du_lieu_cu=old_ct_data,
                        du_lieu_moi=serialize_model_to_dict(current_cong_tac),
                        ghi_chu=f"Kết thúc phân công do điều chuyển công tác",
                    )
                    await audit_repo.create(audit_log_end)

                # Create new CongTac record
                new_cong_tac = CongTac(
                    nhan_vien_id=command.id,
                    phong_ban_id=new_phong_ban_id,
                    chuc_vu_id=new_chuc_vu_id,
                    ngay_bat_dau=get_utc_now(),
                    is_primary=True,
                    he_so_luong=existing_nv.he_so_luong,
                    bac_luong=existing_nv.bac_luong,
                    trang_thai="dang_cong_tac",
                )
                created_ct = await uow.cong_tac_repository.create(new_cong_tac)

                # Audit log for new assignment
                audit_log_new = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="nhan_vien_cong_tac",
                    ban_ghi_id=created_ct.id,
                    du_lieu_cu=None,
                    du_lieu_moi=serialize_model_to_dict(created_ct),
                    ghi_chu=f"Phân công công tác mới do điều chuyển: "
                    f"{existing_nv.phong_ban.ten_phong_ban if existing_nv.phong_ban else 'N/A'} "
                    f"→ {new_phong_ban_id}",
                )
                await audit_repo.create(audit_log_new)

            try:
                updated_nv = await nhan_vien_repo.update(existing_nv)
            except IntegrityError as e:
                await uow.rollback()
                logger.error(f"IntegrityError updating NhanVien: {str(e)}")
                return Return.err(
                    Error(
                        code="integrity_error",
                        message="Lỗi toàn vẹn dữ liệu",
                        reason="IntegrityError",
                    )
                )

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=updated_nv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated_nv),
                ghi_chu="Cập nhật nhân viên"
                + (" + điều chuyển công tác" if cong_tac_changed else ""),
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(updated_nv)
            response_data = NhanVienDataResponse(**resp)

            logger.info(f"NhanVien {updated_nv.ma_nhan_vien} updated successfully")
            return Return.ok(UpdateNhanVienResult(nhan_vien=response_data))
