from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class LogExportCommand:
    tai_khoan_id: str
    loai_bao_cao: str
    dinh_dang: str


class LogExportBaoCaoUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: LogExportCommand) -> Result[None, Error]:
        async with self.unit_of_work as uow:
            from src.domain.models.audit_log import AuditLog

            audit_log = AuditLog(
                tai_khoan_id=command.tai_khoan_id,
                hanh_dong="EXPORT",
                bang_du_lieu="bao_cao",
                ban_ghi_id=None,
                du_lieu_cu=None,
                du_lieu_moi={
                    "loai": command.loai_bao_cao,
                    "dinh_dang": command.dinh_dang,
                },
                ghi_chu=f"Xuất báo cáo {command.loai_bao_cao} ({command.dinh_dang})",
            )
            await uow.audit_log_repository.create(audit_log)
            return Return.ok(None)
