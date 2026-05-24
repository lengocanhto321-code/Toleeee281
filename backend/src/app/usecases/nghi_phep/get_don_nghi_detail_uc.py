from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.service.nghi_phep_service import NghiPhepService


@dataclass
class GetDonNghiDetailQuery:
    don_id: str


@dataclass
class GetDonNghiDetailResult:
    don: dict


class GetDonNghiDetailUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = NghiPhepService()

    async def execute(
        self, query: GetDonNghiDetailQuery
    ) -> Result[GetDonNghiDetailResult, Error]:
        async with self.unit_of_work as uow:
            don = await uow.don_xin_nghi_repository.find_by_id(query.don_id)
            if not don:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy đơn nghỉ phép",
                        reason="DonXinNghi not found",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(don.nhan_vien_id)

        return Return.ok(
            GetDonNghiDetailResult(
                don={
                    "id": don.id,
                    "nhan_vien_id": don.nhan_vien_id,
                    "nhan_vien_ho_ten": nhan_vien.ho_ten if nhan_vien else None,
                    "loai_nghi": don.loai_nghi,
                    "ten_loai_nghi": self.service.lay_ten_loai_nghi(don.loai_nghi),
                    "tu_ngay": str(don.tu_ngay),
                    "den_ngay": str(don.den_ngay),
                    "so_ngay": float(don.so_ngay),
                    "ly_do": don.ly_do,
                    "files": don.files or [],
                    "trang_thai": don.trang_thai,
                    "lich_su_duyet": don.lich_su_duyet or [],
                    "ghi_chu_duyet": don.ghi_chu_duyet,
                    "ngay_duyet": str(don.ngay_duyet) if don.ngay_duyet else None,
                    "created_at": str(don.created_at),
                }
            )
        )
