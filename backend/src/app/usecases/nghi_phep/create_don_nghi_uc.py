from dataclasses import dataclass, field
from typing import List
from datetime import date
from libs.datetime import get_utc_now

from libs.result import Result, Error, Return
from src.domain.models.don_xin_nghi import DonXinNghi
from src.domain.models.base import generate_uuid as generate_id
from src.service.nghi_phep_service import NghiPhepService
from src.constants import LOAI_NGHI_KEYS, TRANG_THAI_DON_KEYS


@dataclass
class CreateDonNghiCommand:
    nhan_vien_id: str
    loai_nghi: str
    tu_ngay: str
    den_ngay: str
    ly_do: str = ""
    files: List[str] = field(default_factory=list)
    nguoi_tao_id: str = ""
    skip_document_check: bool = False
    auto_approve: bool = False


@dataclass
class CreateDonNghiResult:
    don: dict


class CreateDonNghiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = NghiPhepService()

    async def execute(
        self, command: CreateDonNghiCommand
    ) -> Result[CreateDonNghiResult, Error]:
        tu_ngay = date.fromisoformat(command.tu_ngay)
        den_ngay = date.fromisoformat(command.den_ngay)
        today = date.today()

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

            if tu_ngay < today:
                return Return.err(
                    Error(
                        code="invalid_data",
                        message="Ngày bắt đầu nghỉ phải từ hôm nay trở đi",
                        reason="Invalid start date",
                    )
                )

            if den_ngay < tu_ngay:
                return Return.err(
                    Error(
                        code="invalid_data",
                        message="Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
                        reason="Invalid date range",
                    )
                )

            existing_dons = await uow.don_xin_nghi_repository.find_overlapping(
                command.nhan_vien_id, tu_ngay, den_ngay
            )
            if existing_dons:
                return Return.err(
                    Error(
                        code="overlapping_request",
                        message="Đã có đơn nghỉ trong khoảng thời gian này",
                        reason="Overlapping leave request",
                    )
                )

            so_ngay = self.service.tinh_so_ngay_nghi(tu_ngay, den_ngay)
            if so_ngay <= 0:
                return Return.err(
                    Error(
                        code="invalid_data",
                        message="Số ngày nghỉ phải lớn hơn 0 và không trùng ngày lễ",
                        reason="Invalid days",
                    )
                )

            if not command.skip_document_check:
                ho_so = self.service.kiem_tra_ho_so(command.loai_nghi, command.files)
                if not ho_so["valid"]:
                    return Return.err(
                        Error(
                            code="missing_document",
                            message=ho_so["thieu"],
                            reason="Missing required document",
                        )
                    )

            canh_bao = None
            phep_con_lai = None

            if command.auto_approve:
                trang_thai = TRANG_THAI_DON_KEYS[1]
                ngay_duyet = get_utc_now()
                nguoi_duyet_id = command.nguoi_tao_id
            else:
                trang_thai = TRANG_THAI_DON_KEYS[0]
                ngay_duyet = None
                nguoi_duyet_id = None

            if command.loai_nghi == LOAI_NGHI_KEYS[0]:
                so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                    command.nhan_vien_id, tu_ngay.year
                )
                phep_con_lai = float(so_ngay_phep.phep_nam_con_lai or 0)
                kiem_tra = self.service.kiem_tra_phep_con_lai(phep_con_lai, so_ngay)
                if kiem_tra["canh_bao"]:
                    canh_bao = kiem_tra["canh_bao"]

                if command.auto_approve:
                    phep_nam_da_su_dung = (
                        float(so_ngay_phep.phep_nam_da_su_dung or 0) + so_ngay
                    )
                    phep_con_lai = max(
                        0, float(so_ngay_phep.phep_nam_duoc_phep) - phep_nam_da_su_dung
                    )
                    await uow.so_ngay_phep_repository.update_con_lai(
                        so_ngay_phep.id,
                        phep_nam_da_su_dung=phep_nam_da_su_dung,
                        phep_nam_con_lai=phep_con_lai,
                    )

            don = DonXinNghi(
                id=generate_id(),
                nhan_vien_id=command.nhan_vien_id,
                loai_nghi=command.loai_nghi,
                tu_ngay=tu_ngay,
                den_ngay=den_ngay,
                so_ngay=so_ngay,
                ly_do=command.ly_do,
                files=command.files,
                trang_thai=trang_thai,
                nguoi_tao_id=command.nguoi_tao_id or command.nhan_vien_id,
                nguoi_duyet_id=nguoi_duyet_id,
                ngay_duyet=ngay_duyet,
            )

            await uow.don_xin_nghi_repository.create(don)

        response_data = {
            "id": don.id,
            "nhan_vien_id": don.nhan_vien_id,
            "loai_nghi": don.loai_nghi,
            "ten_loai_nghi": self.service.lay_ten_loai_nghi(don.loai_nghi),
            "tu_ngay": str(don.tu_ngay),
            "den_ngay": str(don.den_ngay),
            "so_ngay": float(don.so_ngay),
            "ly_do": don.ly_do,
            "trang_thai": don.trang_thai,
            "canh_bao": canh_bao,
            "created_at": str(don.created_at),
        }

        return Return.ok(CreateDonNghiResult(don=response_data))
