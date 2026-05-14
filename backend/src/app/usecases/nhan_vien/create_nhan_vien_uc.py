import logging
from dataclasses import dataclass
from datetime import date, datetime
from libs.datetime import get_utc_now
from sqlalchemy.exc import IntegrityError

from libs.result import Result, Error, Return
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.cong_tac import CongTac
from src.domain.models.hop_dong import HopDong
from src.domain.models.tai_khoan import TaiKhoan
from src.domain.models.audit_log import AuditLog
from src.service.auth_service import AuthService
from src.api.schemas.nhan_vien import NhanVienCreateRequest, NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


LOAI_COMPATIBILITY = {
    "giao_vien": "giao_vien",
    "can_bo": "quan_ly",
    "nhan_vien": "nhan_vien",
}


def validate_loai_compatibility(
    loai_nhan_vien: str, loai_chuc_vu: str
) -> tuple[bool, str]:
    """
    Validate that loai_nhan_vien is compatible with loai_chuc_vu.
    Returns (is_valid, error_message).
    """
    expected_loai = LOAI_COMPATIBILITY.get(loai_nhan_vien)
    if not expected_loai:
        return False, f"Loại nhân viên không hợp lệ: {loai_nhan_vien}"

    if loai_chuc_vu != expected_loai:
        loai_labels = {
            "giao_vien": "Giáo viên",
            "can_bo": "Cán bộ",
            "nhan_vien": "Nhân viên",
        }
        chuc_vu_labels = {
            "quan_ly": "Quản lý",
            "giao_vien": "Giáo viên",
            "nhan_vien": "Nhân viên",
        }
        nv_label = loai_labels.get(loai_nhan_vien, loai_nhan_vien)
        cv_label = chuc_vu_labels.get(loai_chuc_vu, loai_chuc_vu)
        return (
            False,
            f"{nv_label} chỉ được gán chức vụ loại '{chuc_vu_labels.get(expected_loai, expected_loai)}'. Chức vụ đã chọn có loại '{cv_label}'.",
        )

    return True, ""


@dataclass
class CreateNhanVienCommand:
    data: NhanVienCreateRequest
    actor_id: str


@dataclass
class CreateNhanVienResult:
    nhan_vien: NhanVienDataResponse
    tai_khoan: dict | None = None


class CreateNhanVienUseCase:
    """Use case for creating a NhanVien."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateNhanVienCommand
    ) -> Result[CreateNhanVienResult, Error]:
        """Execute create nhan vien use case."""
        logger.info(
            f"User {command.actor_id} is creating NhanVien with loai={command.data.loai_nhan_vien}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            chuc_vu_repo = uow.chuc_vu_repository
            audit_repo = uow.audit_log_repository

            # Validate loai_nhan_vien vs loai_chuc_vu compatibility
            if command.data.chuc_vu_id:
                chuc_vu = await chuc_vu_repo.find_by_id(command.data.chuc_vu_id)
                if not chuc_vu:
                    return Return.err(
                        Error(
                            code="chuc_vu_not_found",
                            message="Chức vụ không tồn tại",
                            reason="NotFound",
                        )
                    )

                is_valid, error_msg = validate_loai_compatibility(
                    command.data.loai_nhan_vien, chuc_vu.loai
                )
                if not is_valid:
                    return Return.err(
                        Error(
                            code="loai_mismatch",
                            message=error_msg,
                            reason="ValidationError",
                        )
                    )

            # Check duplicate email
            if command.data.email:
                existing_by_email = await nhan_vien_repo.find_by_email(
                    command.data.email, include_deleted=True
                )
                if existing_by_email:
                    return Return.err(
                        Error(
                            code="email_exists",
                            message="Email đã tồn tại trong hệ thống",
                            reason="Conflict",
                        )
                    )

            # Check duplicate CCCD
            if command.data.so_cccd:
                existing_by_cccd = await nhan_vien_repo.find_by_cccd(
                    command.data.so_cccd, include_deleted=True
                )
                if existing_by_cccd:
                    return Return.err(
                        Error(
                            code="cccd_exists",
                            message="CCCD đã tồn tại trong hệ thống",
                            reason="Conflict",
                        )
                    )

            ma_nhan_vien = await nhan_vien_repo.generate_ma_nhan_vien(
                command.data.loai_nhan_vien
            )

            new_nv = NhanVien(
                ma_nhan_vien=ma_nhan_vien,
                ho_ten=command.data.ho_ten,
                gioi_tinh=command.data.gioi_tinh,
                ngay_sinh=command.data.ngay_sinh,
                que_quan=command.data.que_quan,
                dia_chi_thuong_tru=command.data.dia_chi_thuong_tru,
                dia_chi_tam_tru=command.data.dia_chi_tam_tru,
                so_dien_thoai=command.data.so_dien_thoai,
                email=command.data.email,
                email_ca_nhan=command.data.email_ca_nhan,
                so_cccd=command.data.so_cccd,
                ngay_cap_cccd=command.data.ngay_cap_cccd,
                noi_cap_cccd=command.data.noi_cap_cccd,
                anh_dai_dien=command.data.anh_dai_dien,
                cccd_front=command.data.cccd_front,
                cccd_back=command.data.cccd_back,
                noi_sinh=command.data.noi_sinh,
                dan_toc=command.data.dan_toc,
                ton_giao=command.data.ton_giao,
                loai_nhan_vien=command.data.loai_nhan_vien,
                cap_hoc=command.data.cap_hoc,
                mon_day=command.data.mon_day,
                hang_chuc_danh=command.data.hang_chuc_danh,
                ngach_luong=command.data.ngach_luong,
                bac_luong=command.data.bac_luong,
                he_so_luong=command.data.he_so_luong,
                so_nam_tham_nien=command.data.so_nam_tham_nien,
                phong_ban_id=command.data.phong_ban_id,
                chuc_vu_id=command.data.chuc_vu_id,
                loai_hop_dong=command.data.loai_hop_dong,
                so_hop_dong=command.data.so_hop_dong,
                ngay_vao_lam=command.data.ngay_vao_lam,
                ngay_het_hop_dong=command.data.ngay_het_hop_dong,
                hinh_thuc_tuyen_dung=command.data.hinh_thuc_tuyen_dung,
                noi_ky_hop_dong=command.data.noi_ky_hop_dong,
                phu_cap_chuc_vu=command.data.phu_cap_chuc_vu,
                ngay_bo_nhiem_chuc_vu=command.data.ngay_bo_nhiem_chuc_vu,
                la_dang_vien=command.data.la_dang_vien,
                la_doan_vien=command.data.la_doan_vien,
                ngay_vao_dang=command.data.ngay_vao_dang,
                ngay_vao_doan=command.data.ngay_vao_doan,
                tinh_trang_hon_nhan=command.data.tinh_trang_hon_nhan,
                ghi_chu=command.data.ghi_chu,
                trang_thai=command.data.trang_thai,
            )

            try:
                created_nv = await nhan_vien_repo.create(new_nv)
            except IntegrityError as e:
                await uow.rollback()
                error_msg = str(e.orig) if hasattr(e, "orig") else str(e)
                logger.error(f"IntegrityError creating NhanVien: {error_msg}")
                return Return.err(
                    Error(
                        code="code_exists",
                        message=f"Lỗi ràng buộc dữ liệu: {error_msg}",
                        reason="Conflict",
                    )
                )

            # Auto-create TaiKhoan
            tai_khoan_info = None
            user_repo = uow.user_repository
            default_password = command.data.so_dien_thoai or "Abc@12345"
            mat_khau_hash = await AuthService.hash_password(default_password)

            tai_khoan = TaiKhoan(
                nhan_vien_id=created_nv.id,
                ten_dang_nhap=created_nv.ma_nhan_vien,
                mat_khau_hash=mat_khau_hash,
                vai_tro="nhan_vien",
                email=command.data.email,
                trang_thai=True,
            )
            created_tk = await user_repo.create(tai_khoan)
            tai_khoan_info = {
                "ten_dang_nhap": created_tk.ten_dang_nhap,
                "mat_khau_goc": default_password,
            }

            audit_tk = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="tai_khoan",
                ban_ghi_id=created_tk.id,
                du_lieu_cu=None,
                du_lieu_moi={
                    "ten_dang_nhap": created_tk.ten_dang_nhap,
                    "nhan_vien_id": str(created_nv.id),
                },
                ghi_chu=f"Tự tạo tài khoản cho nhân viên {created_nv.ma_nhan_vien}",
            )
            await audit_repo.create(audit_tk)

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=created_nv.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu="Tạo mới nhân viên",
            )
            await audit_repo.create(audit_log)

            # Auto-create CongTac record if phong_ban_id and chuc_vu_id are provided
            if command.data.phong_ban_id and command.data.chuc_vu_id:
                cong_tac_repo = uow.cong_tac_repository
                ngay_bat_dau = command.data.ngay_vao_lam or get_utc_now().date()

                cong_tac = CongTac(
                    nhan_vien_id=created_nv.id,
                    phong_ban_id=command.data.phong_ban_id,
                    chuc_vu_id=command.data.chuc_vu_id,
                    ngay_bat_dau=datetime.combine(ngay_bat_dau, datetime.min.time())
                    if ngay_bat_dau
                    else get_utc_now(),
                    is_primary=True,
                    trang_thai="dang_cong_tac",
                    he_so_luong=command.data.he_so_luong,
                    bac_luong=command.data.bac_luong,
                )
                created_ct = await cong_tac_repo.create(cong_tac)

                # Audit log for CongTac creation
                audit_ct = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="nhan_vien_cong_tac",
                    ban_ghi_id=created_ct.id,
                    du_lieu_cu=None,
                    du_lieu_moi=serialize_model_to_dict(created_ct),
                    ghi_chu=f"Tạo phân công công tác khi tạo nhân viên {created_nv.ma_nhan_vien}",
                )
                await audit_repo.create(audit_ct)

            # Auto-create HopDong record if contract info is provided
            if command.data.so_hop_dong and command.data.loai_hop_dong:
                hop_dong_repo = uow.hop_dong_repository

                ngay_ky_hd = command.data.ngay_vao_lam or get_utc_now().date()
                ngay_bat_dau_hd = command.data.ngay_vao_lam or get_utc_now().date()

                hop_dong = HopDong(
                    nhan_vien_id=created_nv.id,
                    so_hop_dong=command.data.so_hop_dong,
                    loai_hop_dong=command.data.loai_hop_dong,
                    ngay_ky=ngay_ky_hd,
                    ngay_bat_dau=ngay_bat_dau_hd,
                    ngay_ket_thuc=command.data.ngay_het_hop_dong,
                    hinh_thuc_tuyen_dung=command.data.hinh_thuc_tuyen_dung,
                    noi_ky_hop_dong=command.data.noi_ky_hop_dong,
                    luong_co_ban=str(command.data.luong_co_ban)
                    if command.data.luong_co_ban
                    else None,
                    trang_thai="dang_hieu_luc",
                )
                created_hd = await hop_dong_repo.create(hop_dong)

                # Audit log for HopDong creation
                audit_hd = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="CREATE",
                    bang_du_lieu="hop_dong",
                    ban_ghi_id=created_hd.id,
                    du_lieu_cu=None,
                    du_lieu_moi=serialize_model_to_dict(created_hd),
                    ghi_chu=f"Tạo hợp đồng khi tạo nhân viên {created_nv.ma_nhan_vien}",
                )
                await audit_repo.create(audit_hd)

            # For response mapping
            resp = serialize_model_to_dict(created_nv)
            response_data = NhanVienDataResponse(**resp)

            logger.info(f"NhanVien {created_nv.ma_nhan_vien} created successfully")
            return Return.ok(
                CreateNhanVienResult(nhan_vien=response_data, tai_khoan=tai_khoan_info)
            )
