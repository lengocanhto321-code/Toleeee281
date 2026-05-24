import logging
from typing import Optional

from libs.result import Result, Error, Return, is_err
from libs.datetime import serialize_dt
from src.domain.models.nhan_vien import TaiLieuNhanVien, LOAI_TAI_LIEU_LABELS
from src.service.upload_service import UploadService
from src.app.usecases.tai_lieu.commands import (
    UploadTaiLieuCommand,
    UploadTaiLieuResult,
    GetTaiLieuListQuery,
    GetTaiLieuListResult,
    GetTaiLieuByNhanVienQuery,
    GetTaiLieuByNhanVienResult,
    GetTaiLieuDetailQuery,
    GetTaiLieuDetailResult,
    UpdateTaiLieuCommand,
    UpdateTaiLieuResult,
    DeleteTaiLieuCommand,
    DeleteTaiLieuResult,
)

logger = logging.getLogger(__name__)

UPLOAD_DIR = "/home/enles04/hr_management/backend/uploads"


def serialize_tai_lieu(tl: TaiLieuNhanVien) -> dict:
    return {
        "id": tl.id,
        "nhan_vien_id": tl.nhan_vien_id,
        "loai_tai_lieu": tl.loai_tai_lieu,
        "loai_tai_lieu_label": LOAI_TAI_LIEU_LABELS.get(
            tl.loai_tai_lieu, tl.loai_tai_lieu
        ),
        "ten_tai_lieu": tl.ten_tai_lieu,
        "duong_dan": tl.duong_dan,
        "ten_file_goc": tl.ten_file_goc,
        "kich_thuoc": tl.kich_thuoc,
        "dinh_dang": tl.dinh_dang,
        "mo_ta": tl.mo_ta,
        "ngay_het_han": tl.ngay_het_han.isoformat() if tl.ngay_het_han else None,
        "la_ban_chinh": tl.la_ban_chinh,
        "trang_thai": tl.trang_thai,
        "created_at": serialize_dt(tl.created_at),
    }


class UploadTaiLieuUseCase:
    def __init__(self, unit_of_work, upload_service: UploadService):
        self.unit_of_work = unit_of_work
        self.upload_service = upload_service

    async def execute(
        self, command: UploadTaiLieuCommand
    ) -> Result[UploadTaiLieuResult, Error]:
        logger.info(f"Uploading document for nhan_vien={command.nhan_vien_id}")

        validate_result = self.upload_service.validate_file(
            filename=command.original_filename,
            content_type="application/octet-stream",
            file_size=len(command.file_content),
        )

        if is_err(validate_result):
            return Return.err(validate_result.value)

        save_result = await self.upload_service.save_file(
            file_content=command.file_content,
            ho_ten=command.ho_ten,
            nhan_vien_id=command.nhan_vien_id,
            loai_tai_lieu=command.loai_tai_lieu,
            original_filename=command.original_filename,
        )

        if is_err(save_result):
            return Return.err(save_result.value)

        relative_path, saved_filename, saved_size = save_result.value

        async with self.unit_of_work as uow:
            tai_lieu = TaiLieuNhanVien(
                nhan_vien_id=command.nhan_vien_id,
                loai_tai_lieu=command.loai_tai_lieu,
                ten_tai_lieu=command.ten_tai_lieu,
                duong_dan=relative_path,
                ten_file_goc=command.original_filename,
                kich_thuoc=saved_size,
                dinh_dang="application/octet-stream",
                mo_ta=command.mo_ta,
                ngay_het_han=command.ngay_het_han,
                la_ban_chinh=command.la_ban_chinh,
            )
            uow.session.add(tai_lieu)
            await uow.session.flush()
            await uow.session.refresh(tai_lieu)

        return Return.ok(
            UploadTaiLieuResult(
                id=tai_lieu.id,
                url=self.upload_service.get_file_url(
                    relative_path, "http://localhost:8000"
                ),
                file_name=saved_filename,
                file_size=saved_size,
                content_type="application/octet-stream",
                path=relative_path,
            )
        )


class GetTaiLieuListUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetTaiLieuListQuery
    ) -> Result[GetTaiLieuListResult, Error]:
        logger.info(f"Getting tai lieu list: page={query.page}")

        async with self.unit_of_work as uow:
            from src.repository.tai_lieu_repository import TaiLieuRepository

            repo = TaiLieuRepository(session=uow.session)
            total, tai_lieus = await repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                nhan_vien_id=query.nhan_vien_id,
                loai_tai_lieu=query.loai_tai_lieu,
                trang_thai=query.trang_thai,
                search=query.search,
            )

            items = [serialize_tai_lieu(tl) for tl in tai_lieus]
            return Return.ok(GetTaiLieuListResult(total=total, items=items))


class GetTaiLieuByNhanVienUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetTaiLieuByNhanVienQuery
    ) -> Result[GetTaiLieuByNhanVienResult, Error]:
        logger.info(f"Getting tai lieu for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            from src.repository.tai_lieu_repository import TaiLieuRepository

            repo = TaiLieuRepository(session=uow.session)
            tai_lieus = await repo.find_by_nhan_vien(
                nhan_vien_id=query.nhan_vien_id,
                loai_tai_lieu=query.loai_tai_lieu,
                trang_thai=query.trang_thai,
            )

            items = [serialize_tai_lieu(tl) for tl in tai_lieus]
            return Return.ok(GetTaiLieuByNhanVienResult(items=items))


class GetTaiLieuDetailUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetTaiLieuDetailQuery
    ) -> Result[GetTaiLieuDetailResult, Error]:
        logger.info(f"Getting tai lieu detail: id={query.id}")

        async with self.unit_of_work as uow:
            from src.repository.tai_lieu_repository import TaiLieuRepository

            repo = TaiLieuRepository(session=uow.session)
            tai_lieu = await repo.find_by_id(query.id)

            if not tai_lieu:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Tài liệu không tồn tại",
                        reason="TaiLieuNotFound",
                    )
                )

            return Return.ok(
                GetTaiLieuDetailResult(tai_lieu=serialize_tai_lieu(tai_lieu))
            )


class UpdateTaiLieuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateTaiLieuCommand
    ) -> Result[UpdateTaiLieuResult, Error]:
        logger.info(f"Updating tai lieu: id={command.id}")

        async with self.unit_of_work as uow:
            from src.repository.tai_lieu_repository import TaiLieuRepository

            repo = TaiLieuRepository(session=uow.session)
            tai_lieu = await repo.find_by_id(command.id)

            if not tai_lieu:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Tài liệu không tồn tại",
                        reason="TaiLieuNotFound",
                    )
                )

            if command.ten_tai_lieu is not None:
                tai_lieu.ten_tai_lieu = command.ten_tai_lieu
            if command.mo_ta is not None:
                tai_lieu.mo_ta = command.mo_ta
            if command.ngay_het_han is not None:
                tai_lieu.ngay_het_han = command.ngay_het_han
            if command.la_ban_chinh is not None:
                tai_lieu.la_ban_chinh = command.la_ban_chinh
            if command.trang_thai is not None:
                tai_lieu.trang_thai = command.trang_thai

            await repo.update(tai_lieu)
            return Return.ok(UpdateTaiLieuResult(tai_lieu=serialize_tai_lieu(tai_lieu)))


class DeleteTaiLieuUseCase:
    def __init__(self, unit_of_work, upload_service: UploadService):
        self.unit_of_work = unit_of_work
        self.upload_service = upload_service

    async def execute(
        self, command: DeleteTaiLieuCommand
    ) -> Result[DeleteTaiLieuResult, Error]:
        logger.info(f"Deleting tai lieu: id={command.id}")

        async with self.unit_of_work as uow:
            from src.repository.tai_lieu_repository import TaiLieuRepository

            repo = TaiLieuRepository(session=uow.session)
            tai_lieu = await repo.find_by_id(command.id)

            if not tai_lieu:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Tài liệu không tồn tại",
                        reason="TaiLieuNotFound",
                    )
                )

            await self.upload_service.delete_file(tai_lieu.duong_dan)
            await repo.delete(tai_lieu)
            return Return.ok(DeleteTaiLieuResult(id=command.id))
