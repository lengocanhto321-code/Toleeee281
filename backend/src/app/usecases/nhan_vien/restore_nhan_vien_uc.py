import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.nhan_vien import NhanVienDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class RestoreNhanVienCommand:
    id: str
    actor_id: str


@dataclass
class RestoreNhanVienResult:
    nhan_vien: NhanVienDataResponse


class RestoreNhanVienUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: RestoreNhanVienCommand
    ) -> Result[RestoreNhanVienResult, Error]:
        logger.info(f"User {command.actor_id} restoring NhanVien {command.id}")

        async with self.unit_of_work as uow:
            nv = await uow.nhan_vien_repository.find_by_id(
                command.id, include_deleted=True
            )
            if not nv:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NotFound",
                    )
                )

            if nv.deleted_at is None:
                return Return.err(
                    Error(
                        code="not_deleted",
                        message="Nhân viên chưa bị xóa",
                        reason="BadRequest",
                    )
                )

            old_data = serialize_model_to_dict(nv)

            nv.deleted_at = None
            nv.trang_thai = "dang_lam"
            await uow.nhan_vien_repository.update(nv)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="RESTORE",
                bang_du_lieu="nhan_vien",
                ban_ghi_id=nv.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(nv),
                ghi_chu="Khôi phục nhân viên đã xóa",
            )
            await uow.audit_log_repository.create(audit_log)

            resp = serialize_model_to_dict(nv)
            return Return.ok(
                RestoreNhanVienResult(nhan_vien=NhanVienDataResponse(**resp))
            )
