from dataclasses import dataclass
from datetime import date
from libs.datetime import get_utc_now
from typing import Optional, List, Dict, Any

from libs.result import Result, Error, Return
from src.service.tinh_luong_service import TinhLuongService
from src.domain.models.base import generate_uuid as generate_id
from src.domain.models.cau_hinh_luong import KyLuong
from src.domain.models.tra_luong import TraLuong


@dataclass
class PreviewLuongCommand:
    nhan_vien_id: str
    thang: int
    nam: int


@dataclass
class PreviewLuongResult:
    data: Dict[str, Any]


class PreviewLuongUseCase:
    """Use case for previewing salary calculation."""

    def __init__(self, unit_of_work, tinh_luong_service: TinhLuongService):
        self.unit_of_work = unit_of_work
        self.tinh_luong_service = tinh_luong_service

    async def execute(
        self, command: PreviewLuongCommand
    ) -> Result[PreviewLuongResult, Error]:
        """Execute preview salary calculation."""
        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            luong_repo = uow.luong_repository
            cau_hinh_repo = uow.cau_hinh_luong_repository

            nhan_vien = await nhan_vien_repo.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVien not found",
                    )
                )

            ngay_tinh = date(command.nam, command.thang, 1)

            cau_hinh = await cau_hinh_repo.find_cau_hinh_hien_tai(ngay_tinh)
            if not cau_hinh:
                return Return.err(
                    Error(
                        code="cau_hinh_not_found",
                        message="Chưa có cấu hình lương cho ngày này",
                        reason="CauHinhHeThongLuong not found",
                    )
                )

            luong = await luong_repo.find_hien_tai(command.nhan_vien_id, ngay_tinh)
            if not luong:
                return Return.err(
                    Error(
                        code="luong_not_found",
                        message="Nhân viên chưa có cấu hình lương",
                        reason="Luong not found",
                    )
                )

            cham_cong_thang = (
                await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                    command.nhan_vien_id, command.thang, command.nam
                )
            )

            tam_dinh_chi = await cau_hinh_repo.find_tam_dinh_chi(
                command.nhan_vien_id, command.thang, command.nam
            )
            ky_luat = await cau_hinh_repo.find_ky_luat_hieu_luc(
                command.nhan_vien_id, command.thang, command.nam
            )

            thong_tin_nhan_vien = {
                "id": nhan_vien.id,
                "thang": command.thang,
                "nam": command.nam,
                "ngay_vao": nhan_vien.ngay_vao_lam,
                "ngay_nghi": None,
                "so_nguoi_phu_thuoc": 0,
            }

            thong_tin_luong = {
                "he_so_luong": float(luong.he_so_luong),
                "phu_cap_chuc_vu": int(luong.phu_cap_chuc_vu or 0),
                "phu_cap_tham_nien_vuot_khung": int(
                    luong.phu_cap_tham_nien_vuot_khung or 0
                ),
                "so_nam_tham_nien": int(luong.so_nam_tham_nien or 0),
                "ty_le_pc_uu_dai": float(luong.ty_le_pc_uu_dai) if luong.ty_le_pc_uu_dai is not None else 30.0,
                "he_so_khu_vuc": float(luong.he_so_khu_vuc or 0),
                "phu_cap_khac": int(luong.phu_cap_khac or 0),
                "khau_tru_khac": int(luong.khau_tru_khac or 0),
            }

            thong_tin_cham_cong = None
            if cham_cong_thang:
                thong_tin_cham_cong = {
                    "so_ngay_lam_chuan": cham_cong_thang.so_ngay_lam_chuan,
                    "so_ngay_lam_thuc_te": cham_cong_thang.so_ngay_co_mat,
                    "so_ngay_nghi_phep": cham_cong_thang.so_ngay_vang_co_phep,
                    "so_ngay_nghi_om": 0,
                    "so_ngay_cong_tac": cham_cong_thang.so_ngay_cong_tac,
                    "so_ngay_le_tet": cham_cong_thang.so_ngay_nghi_le_tet,
                    "so_ngay_nghi_khong_phep": cham_cong_thang.so_ngay_vang_khong_phep,
                }

            thong_tin_cau_hinh = {
                "ngay_tinh": ngay_tinh,
                "luong_co_so": int(cau_hinh.luong_co_so),
                "he_so_dac_thu": float(cau_hinh.he_so_dac_thu),
                "ty_le_bhxh": float(cau_hinh.ty_le_bhxh),
                "ty_le_bhyt": float(cau_hinh.ty_le_bhyt),
                "ty_le_bhtn": float(cau_hinh.ty_le_bhtn),
                "muc_giam_tru_ban_than": int(cau_hinh.muc_giam_tru_ban_than),
                "muc_giam_tru_nguoi_phu_thuoc": int(
                    cau_hinh.muc_giam_tru_nguoi_phu_thuoc
                ),
            }

            thong_tin_tam_dinh_chi = None
            if tam_dinh_chi:
                so_ngay_tdc = (
                    (tam_dinh_chi.ngay_ket_thuc - tam_dinh_chi.ngay_bat_dau).days + 1
                    if tam_dinh_chi.ngay_ket_thuc
                    else 0
                )
                thong_tin_tam_dinh_chi = {
                    "co_tam_dinh_chi": True,
                    "id": tam_dinh_chi.id,
                    "so_ngay_tam_dinh_chi": so_ngay_tdc,
                    "ty_le_huong_luong": float(tam_dinh_chi.ty_le_huong_luong),
                }

            thong_tin_ky_luat = None
            if ky_luat:
                thong_tin_ky_luat = {
                    "id": ky_luat.id,
                    "hinh_thuc": ky_luat.hinh_thuc,
                }

            ket_qua = self.tinh_luong_service.tinh_luong_nhan_vien(
                thong_tin_nhan_vien=thong_tin_nhan_vien,
                thong_tin_luong=thong_tin_luong,
                thong_tin_cham_cong=thong_tin_cham_cong,
                thong_tin_cau_hinh=thong_tin_cau_hinh,
                thong_tin_tam_dinh_chi=thong_tin_tam_dinh_chi,
                thong_tin_ky_luat=thong_tin_ky_luat,
            )

            return Return.ok(PreviewLuongResult(data=ket_qua))


@dataclass
class ChayLuongCommand:
    thang: int
    nam: int
    danh_sach_nhan_vien_ids: Optional[List[str]] = None


@dataclass
class ChayLuongResult:
    ky_luong_id: str
    thang: int
    nam: int
    tong_nhan_vien: int
    tong_thu_nhap: int
    tong_thuc_nhan: int
    danh_sach: List[Dict[str, Any]]


class ChayLuongUseCase:
    """Use case for batch salary calculation."""

    def __init__(self, unit_of_work, tinh_luong_service: TinhLuongService):
        self.unit_of_work = unit_of_work
        self.tinh_luong_service = tinh_luong_service

    async def execute(
        self, command: ChayLuongCommand
    ) -> Result[ChayLuongResult, Error]:
        """Execute batch salary calculation."""
        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            luong_repo = uow.luong_repository
            cau_hinh_repo = uow.cau_hinh_luong_repository
            ky_luong_repo = uow.ky_luong_repository
            tra_luong_repo = uow.tra_luong_repository

            ngay_tinh = date(command.nam, command.thang, 1)

            cau_hinh = await cau_hinh_repo.find_cau_hinh_hien_tai(ngay_tinh)
            if not cau_hinh:
                return Return.err(
                    Error(
                        code="cau_hinh_not_found",
                        message="Chưa có cấu hình lương cho ngày này",
                        reason="CauHinhHeThongLuong not found",
                    )
                )

            ky_luong_hien_tai = await ky_luong_repo.find_by_thang_nam(
                command.thang, command.nam
            )
            if ky_luong_hien_tai:
                if ky_luong_hien_tai.trang_thai == "da_chot":
                    return Return.err(
                        Error(
                            code="ky_luong_da_chot",
                            message=f"Kỳ lương tháng {command.thang}/{command.nam} đã chốt, không thể tính lại",
                            reason="KyLuong is already finalized",
                        )
                    )
                await tra_luong_repo.delete_by_ky_luong_id(ky_luong_hien_tai.id)
                ky_luong = ky_luong_hien_tai
                ky_luong.ngay_chay = get_utc_now()
            else:
                ngay_bat_dau = date(command.nam, command.thang, 1)
                ngay_ket_thuc = (
                    date(command.nam, command.thang + 1, 1)
                    if command.thang < 12
                    else date(command.nam + 1, 1, 1)
                )

                ky_luong = KyLuong(
                    id=generate_id(),
                    thang=command.thang,
                    nam=command.nam,
                    ngay_bat_dau=ngay_bat_dau,
                    ngay_ket_thuc=ngay_ket_thuc,
                    trang_thai="chua_duyet",
                )
                await ky_luong_repo.create(ky_luong)

            nhan_viens = await nhan_vien_repo.find_dang_lam(
                command.danh_sach_nhan_vien_ids
            )

            thong_tin_cau_hinh = {
                "ngay_tinh": ngay_tinh,
                "luong_co_so": int(cau_hinh.luong_co_so),
                "he_so_dac_thu": float(cau_hinh.he_so_dac_thu),
                "ty_le_bhxh": float(cau_hinh.ty_le_bhxh),
                "ty_le_bhyt": float(cau_hinh.ty_le_bhyt),
                "ty_le_bhtn": float(cau_hinh.ty_le_bhtn),
                "muc_giam_tru_ban_than": int(cau_hinh.muc_giam_tru_ban_than),
                "muc_giam_tru_nguoi_phu_thuoc": int(
                    cau_hinh.muc_giam_tru_nguoi_phu_thuoc
                ),
            }

            tra_luongs = []
            ket_qua = []
            tong_thu_nhap = 0
            tong_thuc_nhan = 0

            for nv in nhan_viens:
                luong = await luong_repo.find_hien_tai(nv.id, ngay_tinh)
                if not luong:
                    continue

                cham_cong_thang = (
                    await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                        nv.id, command.thang, command.nam
                    )
                )
                tam_dinh_chi = await cau_hinh_repo.find_tam_dinh_chi(
                    nv.id, command.thang, command.nam
                )
                ky_luat = await cau_hinh_repo.find_ky_luat_hieu_luc(
                    nv.id, command.thang, command.nam
                )

                thong_tin_nhan_vien = {
                    "id": nv.id,
                    "thang": command.thang,
                    "nam": command.nam,
                    "ngay_vao": nv.ngay_vao_lam,
                    "ngay_nghi": None,
                    "so_nguoi_phu_thuoc": 0,
                }

                thong_tin_luong = {
                    "he_so_luong": float(luong.he_so_luong),
                    "phu_cap_chuc_vu": int(luong.phu_cap_chuc_vu or 0),
                    "phu_cap_tham_nien_vuot_khung": int(
                        luong.phu_cap_tham_nien_vuot_khung or 0
                    ),
                    "so_nam_tham_nien": int(luong.so_nam_tham_nien or 0),
                    "ty_le_pc_uu_dai": float(luong.ty_le_pc_uu_dai) if luong.ty_le_pc_uu_dai is not None else 30.0,
                    "he_so_khu_vuc": float(luong.he_so_khu_vuc or 0),
                    "phu_cap_khac": int(luong.phu_cap_khac or 0),
                    "khau_tru_khac": int(luong.khau_tru_khac or 0),
                }

                thong_tin_cham_cong = None
                if cham_cong_thang:
                    thong_tin_cham_cong = {
                        "so_ngay_lam_chuan": cham_cong_thang.so_ngay_lam_chuan,
                        "so_ngay_lam_thuc_te": cham_cong_thang.so_ngay_co_mat,
                        "so_ngay_nghi_phep": cham_cong_thang.so_ngay_vang_co_phep,
                        "so_ngay_nghi_om": 0,
                        "so_ngay_cong_tac": cham_cong_thang.so_ngay_cong_tac,
                        "so_ngay_le_tet": cham_cong_thang.so_ngay_nghi_le_tet,
                        "so_ngay_nghi_khong_phep": cham_cong_thang.so_ngay_vang_khong_phep,
                    }

                thong_tin_tam_dinh_chi = None
                if tam_dinh_chi:
                    so_ngay_tdc = (
                        (tam_dinh_chi.ngay_ket_thuc - tam_dinh_chi.ngay_bat_dau).days
                        + 1
                        if tam_dinh_chi.ngay_ket_thuc
                        else 0
                    )
                    thong_tin_tam_dinh_chi = {
                        "co_tam_dinh_chi": True,
                        "id": tam_dinh_chi.id,
                        "so_ngay_tam_dinh_chi": so_ngay_tdc,
                        "ty_le_huong_luong": float(tam_dinh_chi.ty_le_huong_luong),
                    }

                thong_tin_ky_luat = None
                if ky_luat:
                    thong_tin_ky_luat = {
                        "id": ky_luat.id,
                        "hinh_thuc": ky_luat.hinh_thuc,
                    }

                ket_qua_nv = self.tinh_luong_service.tinh_luong_nhan_vien(
                    thong_tin_nhan_vien=thong_tin_nhan_vien,
                    thong_tin_luong=thong_tin_luong,
                    thong_tin_cham_cong=thong_tin_cham_cong,
                    thong_tin_cau_hinh=thong_tin_cau_hinh,
                    thong_tin_tam_dinh_chi=thong_tin_tam_dinh_chi,
                    thong_tin_ky_luat=thong_tin_ky_luat,
                )

                tra_luong = TraLuong(
                    id=generate_id(),
                    nhan_vien_id=nv.id,
                    luong_id=luong.id,
                    cham_cong_id=None,
                    ky_luong_id=ky_luong.id,
                    thang=command.thang,
                    nam=command.nam,
                    ngay_vao=ket_qua_nv.get("ngay_vao"),
                    ngay_nghi=ket_qua_nv.get("ngay_nghi"),
                    so_ngay_cong_chuan=ket_qua_nv.get("so_ngay_cong_chuan"),
                    so_ngay_cong_thuc_te=ket_qua_nv.get("so_ngay_cong_thuc_te"),
                    luong_co_ban=ket_qua_nv["luong_co_ban"],
                    he_so_dac_thu_ap_dung=ket_qua_nv["he_so_dac_thu_ap_dung"],
                    loai_cong_thuc=ket_qua_nv["loai_cong_thuc"],
                    phu_cap_chuc_vu=ket_qua_nv["phu_cap_chuc_vu"],
                    phu_cap_tham_nien=ket_qua_nv["phu_cap_tham_nien"],
                    phu_cap_uu_dai=ket_qua_nv["phu_cap_uu_dai"],
                    phu_cap_khu_vuc=ket_qua_nv["phu_cap_khu_vuc"],
                    phu_cap_tham_nien_vuot_khung=ket_qua_nv[
                        "phu_cap_tham_nien_vuot_khung"
                    ],
                    phu_cap_khac=ket_qua_nv["phu_cap_khac"],
                    tong_phu_cap=ket_qua_nv["tong_phu_cap"],
                    thu_nhap_tang_them=0,
                    thuong=0,
                    bhxh=ket_qua_nv["bhxh"],
                    bhyt=ket_qua_nv["bhyt"],
                    bhtn=ket_qua_nv["bhtn"],
                    thue_tncn=ket_qua_nv["thue_tncn"],
                    khau_tru_khac=ket_qua_nv["khau_tru_khac"],
                    tong_khau_tru=ket_qua_nv["tong_khau_tru"],
                    tong_thu_nhap=ket_qua_nv["tong_thu_nhap"],
                    luong_thuc_nhan=ket_qua_nv["luong_thuc_nhan"],
                    co_tam_dinh_chi=ket_qua_nv["co_tam_dinh_chi"],
                    tam_dinh_chi_id=ket_qua_nv.get("tam_dinh_chi_id"),
                    co_ky_luat=ket_qua_nv["co_ky_luat"],
                    ky_luat_id=ket_qua_nv.get("ky_luat_id"),
                    ngay_chay=get_utc_now(),
                    trang_thai="chua_tra",
                )
                tra_luongs.append(tra_luong)

                ket_qua.append(
                    {
                        "nhan_vien_id": nv.id,
                        "ho_ten": nv.ho_ten,
                        "luong_thuc_nhan": ket_qua_nv["luong_thuc_nhan"],
                    }
                )

                tong_thu_nhap += ket_qua_nv["tong_thu_nhap"]
                tong_thuc_nhan += ket_qua_nv["luong_thuc_nhan"]

            if tra_luongs:
                await tra_luong_repo.create_many(tra_luongs)

            ky_luong.tong_nhan_vien = len(tra_luongs)
            ky_luong.tong_thu_nhap = tong_thu_nhap
            ky_luong.tong_thuc_nhan = tong_thuc_nhan

            return Return.ok(
                ChayLuongResult(
                    ky_luong_id=ky_luong.id,
                    thang=command.thang,
                    nam=command.nam,
                    tong_nhan_vien=len(tra_luongs),
                    tong_thu_nhap=tong_thu_nhap,
                    tong_thuc_nhan=tong_thuc_nhan,
                    danh_sach=ket_qua,
                )
            )
