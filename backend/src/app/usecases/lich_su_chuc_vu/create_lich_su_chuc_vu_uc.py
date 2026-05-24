import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.lich_su_chuc_vu import LichSuChucVu
from src.domain.models.audit_log import AuditLog
from src.api.schemas.lich_su_chuc_vu import (
    LichSuChucVuCreateRequest,
    LichSuChucVuResponse,
)

logger = logging.getLogger(__name__)


@dataclass
class CreateLichSuChucVuCommand:
    nhan_vien_id: str
    data: LichSuChucVuCreateRequest
    actor_id: str


@dataclass
class CreateLichSuChucVuResult:
    item: LichSuChucVuResponse


class CreateLichSuChucVuUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateLichSuChucVuCommand
    ) -> Result[CreateLichSuChucVuResult, Error]:
        logger.info(
            f"User {command.actor_id} creating LichSuChucVu for nv={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository
            chuc_vu_repo = uow.chuc_vu_repository
            repo = uow.lich_su_chuc_vu_repository
            audit_repo = uow.audit_log_repository

            nhan_vien = await nhan_vien_repo.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            chuc_vu = await chuc_vu_repo.find_by_id(command.data.chuc_vu_id)
            if not chuc_vu:
                return Return.err(
                    Error(
                        code="chuc_vu_not_found",
                        message="Chức vụ không tồn tại",
                        reason="NotFound",
                    )
                )

            new_item = LichSuChucVu(
                nhan_vien_id=command.nhan_vien_id,
                chuc_vu_id=command.data.chuc_vu_id,
                phong_ban_id=command.data.phong_ban_id,
                tu_ngay=command.data.tu_ngay,
                den_ngay=command.data.den_ngay,
                ly_do=command.data.ly_do,
                so_quyet_dinh=command.data.so_quyet_dinh,
                ghi_chu=command.data.ghi_chu,
            )

            created = await repo.create(new_item)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="lich_su_chuc_vu",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu=f"Tạo lịch sử chức vụ cho nhân viên {nhan_vien.ma_nhan_vien}",
            )
            await audit_repo.create(audit_log)

            from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

            resp = serialize_model_to_dict(created)
            return Return.ok(
                CreateLichSuChucVuResult(item=LichSuChucVuResponse(**resp))
            )
