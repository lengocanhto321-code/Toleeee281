import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.luong import CauHinhLuongResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateCauHinhLuongCommand:
    ngay_ap_dung: str
    luong_co_so: int = 1800000
    he_so_dac_thu: float = 1.0
    ty_le_bhxh: float = 8.0
    ty_le_bhyt: float = 1.5
    ty_le_bhtn: float = 1.0
    muc_giam_tru_ban_than: int = 11000000
    muc_giam_tru_nguoi_phu_thuoc: int = 4400000
    ghi_chu: Optional[str] = None


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


class CreateCauHinhLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateCauHinhLuongCommand
    ) -> Result[CreateCauHinhLuongResult, Error]:
        from datetime import date
        from sqlalchemy import update
        from src.domain.models.cau_hinh_luong import CauHinhHeThongLuong
        from src.domain.models.base import generate_uuid as generate_id

        logger.info(f"Creating salary config: ngay_ap_dung={command.ngay_ap_dung}")

        async with self.unit_of_work as uow:
            ngay_ap_dung = date.fromisoformat(command.ngay_ap_dung)

            existing_configs = await uow.cau_hinh_luong_repository.get_paginated(
                page=1, page_size=100, trang_thai="dang_ap_dung"
            )
            for old_cfg in existing_configs[1]:
                if old_cfg.ngay_ap_dung < ngay_ap_dung:
                    old_cfg.trang_thai = "het_hieu_luc"
                elif old_cfg.ngay_ap_dung > ngay_ap_dung:
                    old_cfg.trang_thai = "sap_hieu_luc"

            if ngay_ap_dung <= date.today():
                trang_thai = "dang_ap_dung"
            else:
                trang_thai = "sap_hieu_luc"

            cau_hinh = CauHinhHeThongLuong(
                id=generate_id(),
                ngay_ap_dung=ngay_ap_dung,
                luong_co_so=command.luong_co_so,
                he_so_dac_thu=command.he_so_dac_thu,
                ty_le_bhxh=command.ty_le_bhxh,
                ty_le_bhyt=command.ty_le_bhyt,
                ty_le_bhtn=command.ty_le_bhtn,
                muc_giam_tru_ban_than=command.muc_giam_tru_ban_than,
                muc_giam_tru_nguoi_phu_thuoc=command.muc_giam_tru_nguoi_phu_thuoc,
                trang_thai=trang_thai,
                ghi_chu=command.ghi_chu,
            )

            await uow.cau_hinh_luong_repository.create_cau_hinh(cau_hinh)

        resp = serialize_model_to_dict(cau_hinh)
        return Return.ok(
            CreateCauHinhLuongResult(cau_hinh=CauHinhLuongResponse(**resp))
        )


class GetListCauHinhLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListCauHinhLuongQuery
    ) -> Result[GetListCauHinhLuongResult, Error]:
        from datetime import date

        logger.info(f"Getting cau hinh luong list: page={query.page}")

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


class ActivateCauHinhLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, cau_hinh_id: str):
        from src.domain.models.cau_hinh_luong import CauHinhHeThongLuong

        async with self.unit_of_work as uow:
            repo = uow.cau_hinh_luong_repository

            target = await repo.find_by_id(cau_hinh_id)
            if not target:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy cấu hình lương",
                        reason="CauHinhHeThongLuong not found",
                    )
                )

            existing_configs = await repo.get_paginated(
                page=1, page_size=100, trang_thai="dang_ap_dung"
            )
            for old_cfg in existing_configs[1]:
                if old_cfg.id != cau_hinh_id:
                    old_cfg.trang_thai = "het_hieu_luc"

            target.trang_thai = "dang_ap_dung"
            await uow.flush()

            return Return.ok(target)
