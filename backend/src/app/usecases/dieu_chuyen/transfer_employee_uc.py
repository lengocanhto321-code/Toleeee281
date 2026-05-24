import logging
from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional, List

from libs.result import Result, Error, Return
from src.domain.models.cong_tac import CongTac
from src.domain.models.lich_su_chuc_vu import LichSuChucVu
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.app.usecases.nhan_vien.create_nhan_vien_uc import validate_loai_compatibility

logger = logging.getLogger(__name__)


@dataclass
class TransferEmployeeCommand:
    nhan_vien_id: str
    phong_ban_id_moi: str
    chuc_vu_id_moi: str
    ngay_dieu_chuyen: str
    ly_do: Optional[str] = None
    so_quyet_dinh: Optional[str] = None
    ghi_chu: Optional[str] = None
    actor_id: str = ""


@dataclass
class TransferEmployeeResult:
    nhan_vien_id: str
    phong_ban_cu: Optional[dict]
    phong_ban_moi: dict
    chuc_vu_cu: Optional[dict]
    chuc_vu_moi: dict
    ngay_dieu_chuyen: str
    cong_tac_moi_id: str
    lich_su_chuc_vu_id: Optional[str]


@dataclass
class GetEmployeeTransferHistoryQuery:
    nhan_vien_id: str


@dataclass
class GetEmployeeTransferHistoryResult:
    items: List[dict]


@dataclass
class GetTransferOptionsQuery:
    nhan_vien_id: str


@dataclass
class GetTransferOptionsResult:
    phong_ban_hien_tai: Optional[dict]
    chuc_vu_hien_tai: Optional[dict]
    phong_ban_kha_dung: List[dict]
    chuc_vu_kha_dung: List[dict]
    loai_nhan_vien: str


class TransferEmployeeUseCase:
    """
    Use case for employee transfer operations.

    Business Logic:
    1. Validate employee exists and is active
    2. Validate new department and position exist
    3. Validate loai compatibility (giao_vien → giao_vu, can_bo → quan_ly, etc.)
    4. End current CongTac (set ngay_ket_thuc, is_primary=false, trang_thai=da_chuyen)
    5. Create new CongTac (is_primary=true)
    6. Create LichSuChucVu record
    7. Update NhanVien FK (phong_ban_id, chuc_vu_id)
    8. Create audit logs for all changes
    """

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: TransferEmployeeCommand
    ) -> Result[TransferEmployeeResult, Error]:
        """
        Execute employee transfer workflow.

        This method:
        1. Validates all business rules
        2. Ends current CongTac assignment
        3. Creates new CongTac assignment
        4. Creates LichSuChucVu record
        5. Updates NhanVien FK fields
        6. Creates audit logs
        """
        logger.info(
            f"User {command.actor_id} transferring nhan_vien={command.nhan_vien_id} "
            f"to phong_ban={command.phong_ban_id_moi}, chuc_vu={command.chuc_vu_id_moi}"
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

            if nhan_vien.trang_thai != "dang_lam":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Nhân viên không ở trạng thái đang làm, không thể điều chuyển",
                        reason="InvalidEmployeeStatus",
                    )
                )

            phong_ban_moi = await uow.phong_ban_repository.find_by_id(
                command.phong_ban_id_moi
            )
            if not phong_ban_moi:
                return Return.err(
                    Error(
                        code="phong_ban_not_found",
                        message="Phòng ban mới không tồn tại",
                        reason="NotFound",
                    )
                )

            if not phong_ban_moi.trang_thai:
                return Return.err(
                    Error(
                        code="phong_ban_inactive",
                        message="Phòng ban mới đã bị vô hiệu hóa",
                        reason="InvalidDepartment",
                    )
                )

            chuc_vu_moi = await uow.chuc_vu_repository.find_by_id(
                command.chuc_vu_id_moi
            )
            if not chuc_vu_moi:
                return Return.err(
                    Error(
                        code="chuc_vu_not_found",
                        message="Chức vụ mới không tồn tại",
                        reason="NotFound",
                    )
                )

            if not chuc_vu_moi.trang_thai:
                return Return.err(
                    Error(
                        code="chuc_vu_inactive",
                        message="Chức vụ mới đã bị vô hiệu hóa",
                        reason="InvalidPosition",
                    )
                )

            is_valid, error_msg = validate_loai_compatibility(
                nhan_vien.loai_nhan_vien, chuc_vu_moi.loai
            )
            if not is_valid:
                return Return.err(
                    Error(
                        code="loai_mismatch",
                        message=error_msg,
                        reason="ValidationError",
                    )
                )

            ngay_dieu_chuyen = date.fromisoformat(command.ngay_dieu_chuyen)

            phong_ban_cu_data = None
            chuc_vu_cu_data = None
            if nhan_vien.phong_ban_id:
                pb_cu = await uow.phong_ban_repository.find_by_id(
                    nhan_vien.phong_ban_id
                )
                if pb_cu:
                    phong_ban_cu_data = {
                        "id": pb_cu.id,
                        "ten_phong_ban": pb_cu.ten_phong_ban,
                    }

            if nhan_vien.chuc_vu_id:
                cv_cu = await uow.chuc_vu_repository.find_by_id(nhan_vien.chuc_vu_id)
                if cv_cu:
                    chuc_vu_cu_data = {
                        "id": cv_cu.id,
                        "ten_chuc_vu": cv_cu.ten_chuc_vu,
                    }

            current_cong_tac = (
                await uow.cong_tac_repository.get_current_by_nhan_vien_id(
                    command.nhan_vien_id
                )
            )

            old_cong_tac_data = None
            if current_cong_tac:
                old_cong_tac_data = serialize_model_to_dict(current_cong_tac)
                await uow.cong_tac_repository.end_assignment(current_cong_tac)

            new_cong_tac = CongTac(
                nhan_vien_id=command.nhan_vien_id,
                phong_ban_id=command.phong_ban_id_moi,
                chuc_vu_id=command.chuc_vu_id_moi,
                ngay_bat_dau=datetime.combine(ngay_dieu_chuyen, datetime.min.time()),
                is_primary=True,
                trang_thai="dang_cong_tac",
                ghi_chu=command.ghi_chu,
            )
            created_cong_tac = await uow.cong_tac_repository.create(new_cong_tac)

            audit_log_cong_tac = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="nhan_vien_cong_tac",
                ban_ghi_id=created_cong_tac.id,
                du_lieu_cu=old_cong_tac_data,
                du_lieu_moi=serialize_model_to_dict(created_cong_tac),
                ghi_chu=f"Điều chuyển nhân viên từ phòng ban "
                f"{phong_ban_cu_data['ten_phong_ban'] if phong_ban_cu_data else 'N/A'} "
                f"sang phòng ban {phong_ban_moi.ten_phong_ban}",
            )
            await uow.audit_log_repository.create(audit_log_cong_tac)

            lich_su_chuc_vu_id = None
            if chuc_vu_cu_data:
                lich_su = LichSuChucVu(
                    nhan_vien_id=command.nhan_vien_id,
                    chuc_vu_id=nhan_vien.chuc_vu_id,
                    phong_ban_id=nhan_vien.phong_ban_id,
                    tu_ngay=current_cong_tac.ngay_bat_dau.date()
                    if current_cong_tac
                    else nhan_vien.ngay_vao_lam,
                    den_ngay=ngay_dieu_chuyen,
                    ly_do=command.ly_do or "Điều chuyển",
                    so_quyet_dinh=command.so_quyet_dinh,
                    ghi_chu=command.ghi_chu,
                )
                created_lich_su = await uow.lich_su_chuc_vu_repository.create(lich_su)
                lich_su_chuc_vu_id = created_lich_su.id

                audit_log_lich_su = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="lich_su_chuc_vu",
                    ban_ghi_id=created_lich_su.id,
                    du_lieu_cu=None,
                    du_lieu_moi=serialize_model_to_dict(created_lich_su),
                    ghi_chu=f"Thêm lịch sử chức vụ khi điều chuyển nhân viên",
                )
                await uow.audit_log_repository.create(audit_log_lich_su)

            old_nhan_vien_data = serialize_model_to_dict(nhan_vien)

            nhan_vien.phong_ban_id = command.phong_ban_id_moi
            nhan_vien.chuc_vu_id = command.chuc_vu_id_moi
            await uow.nhan_vien_repository.update(nhan_vien)

            audit_log_nhan_vien = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=nhan_vien.id,
                du_lieu_cu=old_nhan_vien_data,
                du_lieu_moi=serialize_model_to_dict(nhan_vien),
                ghi_chu=f"Điều chuyển nhân viên: "
                f"{phong_ban_cu_data['ten_phong_ban'] if phong_ban_cu_data else 'N/A'} "
                f"→ {phong_ban_moi.ten_phong_ban}, "
                f"{chuc_vu_cu_data['ten_chuc_vu'] if chuc_vu_cu_data else 'N/A'} "
                f"→ {chuc_vu_moi.ten_chuc_vu}",
            )
            await uow.audit_log_repository.create(audit_log_nhan_vien)

        return Return.ok(
            TransferEmployeeResult(
                nhan_vien_id=command.nhan_vien_id,
                phong_ban_cu=phong_ban_cu_data,
                phong_ban_moi={
                    "id": phong_ban_moi.id,
                    "ten_phong_ban": phong_ban_moi.ten_phong_ban,
                },
                chuc_vu_cu=chuc_vu_cu_data,
                chuc_vu_moi={
                    "id": chuc_vu_moi.id,
                    "ten_chuc_vu": chuc_vu_moi.ten_chuc_vu,
                },
                ngay_dieu_chuyen=command.ngay_dieu_chuyen,
                cong_tac_moi_id=created_cong_tac.id,
                lich_su_chuc_vu_id=lich_su_chuc_vu_id,
            )
        )

    async def get_history(
        self, query: GetEmployeeTransferHistoryQuery
    ) -> Result[GetEmployeeTransferHistoryResult, Error]:
        """Get transfer history for an employee."""
        logger.info(f"Getting transfer history for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            cong_tacs = await uow.cong_tac_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )

            items = []
            for ct in cong_tacs:
                item = serialize_model_to_dict(ct)

                phong_ban = await uow.phong_ban_repository.find_by_id(ct.phong_ban_id)
                if phong_ban:
                    item["phong_ban"] = {
                        "id": phong_ban.id,
                        "ten_phong_ban": phong_ban.ten_phong_ban,
                    }

                chuc_vu = await uow.chuc_vu_repository.find_by_id(ct.chuc_vu_id)
                if chuc_vu:
                    item["chuc_vu"] = {
                        "id": chuc_vu.id,
                        "ten_chuc_vu": chuc_vu.ten_chuc_vu,
                    }

                items.append(item)

            return Return.ok(GetEmployeeTransferHistoryResult(items=items))

    async def get_options(
        self, query: GetTransferOptionsQuery
    ) -> Result[GetTransferOptionsResult, Error]:
        """Get available options for employee transfer."""
        logger.info(f"Getting transfer options for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            phong_ban_hien_tai = None
            if nhan_vien.phong_ban_id:
                pb = await uow.phong_ban_repository.find_by_id(nhan_vien.phong_ban_id)
                if pb:
                    phong_ban_hien_tai = {
                        "id": pb.id,
                        "ten_phong_ban": pb.ten_phong_ban,
                    }

            chuc_vu_hien_tai = None
            if nhan_vien.chuc_vu_id:
                cv = await uow.chuc_vu_repository.find_by_id(nhan_vien.chuc_vu_id)
                if cv:
                    chuc_vu_hien_tai = {
                        "id": cv.id,
                        "ten_chuc_vu": cv.ten_chuc_vu,
                    }

            loai_mapping = {
                "giao_vien": "giao_vien",
                "can_bo": "quan_ly",
                "nhan_vien": "nhan_vien",
            }
            chuc_vu_loai = loai_mapping.get(nhan_vien.loai_nhan_vien, "nhan_vien")

            _, all_phong_bans = await uow.phong_ban_repository.get_paginated(
                page=1, page_size=100, trang_thai=True
            )
            phong_ban_kha_dung = [
                {
                    "id": pb.id,
                    "ten_phong_ban": pb.ten_phong_ban,
                }
                for pb in all_phong_bans
                if pb.id != nhan_vien.phong_ban_id
            ]

            _, all_chuc_vus = await uow.chuc_vu_repository.get_paginated(
                page=1, page_size=100, trang_thai=True
            )
            chuc_vu_kha_dung = [
                {
                    "id": cv.id,
                    "ten_chuc_vu": cv.ten_chuc_vu,
                    "loai": cv.loai,
                }
                for cv in all_chuc_vus
                if cv.loai == chuc_vu_loai and cv.id != nhan_vien.chuc_vu_id
            ]

            return Return.ok(
                GetTransferOptionsResult(
                    phong_ban_hien_tai=phong_ban_hien_tai,
                    chuc_vu_hien_tai=chuc_vu_hien_tai,
                    phong_ban_kha_dung=phong_ban_kha_dung,
                    chuc_vu_kha_dung=chuc_vu_kha_dung,
                    loai_nhan_vien=nhan_vien.loai_nhan_vien,
                )
            )
