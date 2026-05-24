import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.luong import LuongDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


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


class CreateLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateLuongCommand
    ) -> Result[CreateLuongResult, Error]:
        from datetime import date
        from src.domain.models.luong import Luong
        from src.domain.models.base import generate_uuid as generate_id

        logger.info(f"Creating luong for nhan_vien={command.nhan_vien_id}")

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


class GetListLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListLuongQuery
    ) -> Result[GetListLuongResult, Error]:
        from datetime import date

        logger.info(f"Getting luong list: page={query.page}")

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


class GetLuongHienTaiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetLuongHienTaiQuery
    ) -> Result[GetLuongHienTaiResult, Error]:
        from datetime import date

        logger.info(f"Getting luong hien tai for nhan_vien={query.nhan_vien_id}")

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


@dataclass
class UpdateLuongCommand:
    luong_id: str
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
    ghi_chu: Optional[str] = None


class UpdateLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateLuongCommand
    ) -> Result[LuongDataResponse, Error]:
        logger.info(f"Updating luong id={command.luong_id}")

        async with self.unit_of_work as uow:
            luong = await uow.luong_repository.find_by_id(command.luong_id)
            if not luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy bảng lương",
                        reason="Luong not found",
                    )
                )

            luong.ma_ngach = command.ma_ngach
            luong.bac = command.bac
            luong.he_so_luong = command.he_so_luong
            luong.so_nam_tham_nien = command.so_nam_tham_nien
            luong.ty_le_pc_uu_dai = command.ty_le_pc_uu_dai
            luong.he_so_khu_vuc = command.he_so_khu_vuc
            luong.phu_cap_chuc_vu = command.phu_cap_chuc_vu
            luong.phu_cap_tham_nien_vuot_khung = command.phu_cap_tham_nien_vuot_khung
            luong.phu_cap_khac = command.phu_cap_khac
            luong.khau_tru_khac = command.khau_tru_khac
            luong.ghi_chu = command.ghi_chu
            await uow.flush()

        resp = serialize_model_to_dict(luong)
        return Return.ok(LuongDataResponse(**resp))
