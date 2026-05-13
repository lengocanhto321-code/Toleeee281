from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return
from src.api.schemas.luong import (
    LuongDataResponse,
    KyLuongResponse,
    TraLuongResponse,
    CauHinhLuongResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict


@dataclass
class CreateCauHinhLuongCommand:
    ten_cau_hinh: str
    ngay_ap_dung: str
    luong_co_so: int = 1800000
    he_so_dac_thu: float = 1.0
    ty_le_bhxh: float = 8.0
    ty_le_bhyt: float = 1.5
    ty_le_bhtn: float = 1.0
    muc_giam_tru_ban_than: int = 11000000
    muc_giam_tru_nguoi_phu_thuoc: int = 4400000


@dataclass
class CreateCauHinhLuongResult:
    cau_hinh: CauHinhLuongResponse


@dataclass
class GetListCauHinhLuongQuery:
    page: int = 1
    page_size: int = 10
    ngay_ap_dung: Optional[str] = None
    trang_thai: Optional[str] = None


@dataclass
class GetListCauHinhLuongResult:
    total: int
    items: list[CauHinhLuongResponse]


@dataclass
class CreateLuongCommand:
    nhan_vien_id: str
    ma_ngach: Optional[str] = None
    bac: Optional[int] = None
    he_so_luong: float = 1.0
    so_nam_tham_nien: int = 0
    ty_le_pc_uu_dai: float = 30.0
    he_so_khu_vuc: float = 0.0
    phu_cap_chuc_vu: int = 0
    phu_cap_tham_nien_vuot_khung: int = 0
    phu_cap_khac: int = 0
    khau_tru_khac: int = 0
    hieu_luc_tu: str = ""
    hieu_luc_den: Optional[str] = None
    ghi_chu: Optional[str] = None


@dataclass
class CreateLuongResult:
    luong: LuongDataResponse


@dataclass
class GetListLuongQuery:
    page: int = 1
    page_size: int = 10
    nhan_vien_id: Optional[str] = None
    hieu_luc: Optional[str] = None


@dataclass
class GetListLuongResult:
    total: int
    items: list[LuongDataResponse]


@dataclass
class GetLuongHienTaiQuery:
    nhan_vien_id: str


@dataclass
class GetLuongHienTaiResult:
    luong: LuongDataResponse


@dataclass
class GetListKyLuongQuery:
    page: int = 1
    page_size: int = 10
    thang: Optional[int] = None
    nam: Optional[int] = None
    trang_thai: Optional[str] = None


@dataclass
class GetListKyLuongResult:
    total: int
    items: list[KyLuongResponse]


@dataclass
class DuyetKyLuongCommand:
    ky_luong_id: str
    actor_id: str


@dataclass
class DuyetKyLuongResult:
    ky_luong: KyLuongResponse


@dataclass
class ChotKyLuongCommand:
    ky_luong_id: str
    actor_id: str


@dataclass
class ChotKyLuongResult:
    ky_luong: KyLuongResponse


@dataclass
class GetTraLuongByKyLuongQuery:
    ky_luong_id: str
    page: int = 1
    page_size: int = 10


@dataclass
class GetTraLuongByKyLuongResult:
    total: int
    items: list[TraLuongResponse]


@dataclass
class GetTraLuongDetailQuery:
    tra_luong_id: str


@dataclass
class GetTraLuongDetailResult:
    tra_luong: TraLuongResponse


class LuongUseCase:
    """Use case for salary configuration operations."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def create_cau_hinh(
        self, command: CreateCauHinhLuongCommand
    ) -> Result[CreateCauHinhLuongResult, Error]:
        """Create a new salary configuration."""
        from datetime import date
        from src.domain.models.cau_hinh_luong import CauHinhHeThongLuong
        from src.domain.models.base import generate_uuid as generate_id

        async with self.unit_of_work as uow:
            cau_hinh = CauHinhHeThongLuong(
                id=generate_id(),
                ten_cau_hinh=command.ten_cau_hinh,
                ngay_ap_dung=date.fromisoformat(command.ngay_ap_dung),
                luong_co_so=command.luong_co_so,
                he_so_dac_thu=command.he_so_dac_thu,
                ty_le_bhxh=command.ty_le_bhxh,
                ty_le_bhyt=command.ty_le_bhyt,
                ty_le_bhtn=command.ty_le_bhtn,
                muc_giam_tru_ban_than=command.muc_giam_tru_ban_than,
                muc_giam_tru_nguoi_phu_thuoc=command.muc_giam_tru_nguoi_phu_thuoc,
                trang_thai="dang_ap_dung",
            )

            await uow.cau_hinh_luong_repository.create_cau_hinh(cau_hinh)

        resp = serialize_model_to_dict(cau_hinh)
        return Return.ok(
            CreateCauHinhLuongResult(cau_hinh=CauHinhLuongResponse(**resp))
        )

    async def get_list_cau_hinh(
        self, query: GetListCauHinhLuongQuery
    ) -> Result[GetListCauHinhLuongResult, Error]:
        """Get paginated list of salary configurations."""
        from datetime import date

        ngay_ap_dung = None
        if query.ngay_ap_dung:
            ngay_ap_dung = date.fromisoformat(query.ngay_ap_dung)

        async with self.unit_of_work as uow:
            total, items = await uow.cau_hinh_luong_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                ngay_ap_dung=ngay_ap_dung,
                trang_thai=query.trang_thai,
            )

        response_items = [
            CauHinhLuongResponse(**serialize_model_to_dict(item)) for item in items
        ]
        return Return.ok(GetListCauHinhLuongResult(total=total, items=response_items))

    async def create_luong(
        self, command: CreateLuongCommand
    ) -> Result[CreateLuongResult, Error]:
        """Create a new salary record."""
        from datetime import date
        from src.domain.models.luong import Luong
        from src.domain.models.base import generate_uuid as generate_id

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVien not found",
                    )
                )

            hieu_luc_tu = date.fromisoformat(command.hieu_luc_tu)
            existing = await uow.luong_repository.find_hien_tai(
                command.nhan_vien_id, hieu_luc_tu
            )
            if existing:
                await uow.luong_repository.update_hieu_luc_den(existing.id, hieu_luc_tu)

            luong = Luong(
                id=generate_id(),
                nhan_vien_id=command.nhan_vien_id,
                ma_ngach=command.ma_ngach,
                bac=command.bac,
                he_so_luong=command.he_so_luong,
                so_nam_tham_nien=command.so_nam_tham_nien,
                ty_le_pc_uu_dai=command.ty_le_pc_uu_dai,
                he_so_khu_vuc=command.he_so_khu_vuc,
                phu_cap_chuc_vu=command.phu_cap_chuc_vu,
                phu_cap_tham_nien_vuot_khung=command.phu_cap_tham_nien_vuot_khung,
                phu_cap_khac=command.phu_cap_khac,
                khau_tru_khac=command.khau_tru_khac,
                hieu_luc_tu=hieu_luc_tu,
                hieu_luc_den=date.fromisoformat(command.hieu_luc_den)
                if command.hieu_luc_den
                else None,
                ghi_chu=command.ghi_chu,
            )

            await uow.luong_repository.create(luong)

        resp = serialize_model_to_dict(luong)
        return Return.ok(CreateLuongResult(luong=LuongDataResponse(**resp)))

    async def get_list_luong(
        self, query: GetListLuongQuery
    ) -> Result[GetListLuongResult, Error]:
        """Get paginated list of salary records."""
        from datetime import date

        hieu_luc = None
        if query.hieu_luc:
            hieu_luc = date.fromisoformat(query.hieu_luc)

        async with self.unit_of_work as uow:
            total, items = await uow.luong_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                nhan_vien_id=query.nhan_vien_id,
                hieu_luc=hieu_luc,
            )

        response_items = [
            LuongDataResponse(**serialize_model_to_dict(item)) for item in items
        ]
        return Return.ok(GetListLuongResult(total=total, items=response_items))

    async def get_luong_hien_tai(
        self, query: GetLuongHienTaiQuery
    ) -> Result[GetLuongHienTaiResult, Error]:
        """Get current salary for a nhan_vien."""
        from datetime import date

        async with self.unit_of_work as uow:
            luong = await uow.luong_repository.find_hien_tai(
                query.nhan_vien_id, date.today()
            )

            if not luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy bảng lương",
                        reason="Luong not found",
                    )
                )

        resp = serialize_model_to_dict(luong)
        return Return.ok(GetLuongHienTaiResult(luong=LuongDataResponse(**resp)))

    async def get_list_ky_luong(
        self, query: GetListKyLuongQuery
    ) -> Result[GetListKyLuongResult, Error]:
        """Get paginated list of salary periods."""
        async with self.unit_of_work as uow:
            total, items = await uow.ky_luong_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                thang=query.thang,
                nam=query.nam,
                trang_thai=query.trang_thai,
            )

        response_items = [
            KyLuongResponse(**serialize_model_to_dict(item)) for item in items
        ]
        return Return.ok(GetListKyLuongResult(total=total, items=response_items))

    async def duyet_ky_luong(
        self, command: DuyetKyLuongCommand
    ) -> Result[DuyetKyLuongResult, Error]:
        """Approve a salary period."""
        from datetime import datetime

        async with self.unit_of_work as uow:
            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

            if not ky_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy kỳ lương",
                        reason="KyLuong not found",
                    )
                )

            if ky_luong.trang_thai != "chua_duyet":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Kỳ lương đã được duyệt hoặc đã chốt",
                        reason="Invalid status",
                    )
                )

            await uow.ky_luong_repository.update_trang_thai(
                command.ky_luong_id,
                trang_thai="da_duyet",
                ngay_duyet=datetime.utcnow(),
                nguoi_duyet_id=command.actor_id,
            )

            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

        resp = serialize_model_to_dict(ky_luong)
        return Return.ok(DuyetKyLuongResult(ky_luong=KyLuongResponse(**resp)))

    async def chot_ky_luong(
        self, command: ChotKyLuongCommand
    ) -> Result[ChotKyLuongResult, Error]:
        """Lock a salary period."""
        from datetime import datetime

        async with self.unit_of_work as uow:
            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

            if not ky_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy kỳ lương",
                        reason="KyLuong not found",
                    )
                )

            if ky_luong.trang_thai not in ["da_duyet"]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Kỳ lương chưa được duyệt",
                        reason="Invalid status",
                    )
                )

            await uow.ky_luong_repository.update_trang_thai(
                command.ky_luong_id,
                trang_thai="da_chot",
                ngay_chot=datetime.utcnow(),
            )
            await uow.tra_luong_repository.update_trang_thai_by_ky_luong(
                command.ky_luong_id, "da_chot"
            )

            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

        resp = serialize_model_to_dict(ky_luong)
        return Return.ok(ChotKyLuongResult(ky_luong=KyLuongResponse(**resp)))

    async def get_tra_luong_by_ky_luong(
        self, query: GetTraLuongByKyLuongQuery
    ) -> Result[GetTraLuongByKyLuongResult, Error]:
        """Get paginated list of salary slips by ky_luong."""
        async with self.unit_of_work as uow:
            total, items = await uow.tra_luong_repository.get_paginated_by_ky_luong(
                ky_luong_id=query.ky_luong_id,
                page=query.page,
                page_size=query.page_size,
            )

            for item in items:
                nhan_vien = await uow.nhan_vien_repository.find_by_id(item.nhan_vien_id)
                if nhan_vien:
                    item.nhan_vien_ho_ten = nhan_vien.ho_ten

        response_items = [
            TraLuongResponse(**serialize_model_to_dict(item)) for item in items
        ]
        return Return.ok(GetTraLuongByKyLuongResult(total=total, items=response_items))

    async def get_tra_luong_detail(
        self, query: GetTraLuongDetailQuery
    ) -> Result[GetTraLuongDetailResult, Error]:
        """Get detail of a salary slip."""
        async with self.unit_of_work as uow:
            tra_luong = await uow.tra_luong_repository.find_by_id(query.tra_luong_id)

            if not tra_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phiếu trả lương",
                        reason="TraLuong not found",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(
                tra_luong.nhan_vien_id
            )
            if nhan_vien:
                tra_luong.nhan_vien_ho_ten = nhan_vien.ho_ten

        resp = serialize_model_to_dict(tra_luong)
        return Return.ok(GetTraLuongDetailResult(tra_luong=TraLuongResponse(**resp)))
