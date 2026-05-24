from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService


@dataclass
class GetChamCongThangDetailQuery:
    cham_cong_id: str


@dataclass
class GetChamCongThangDetailResult:
    cham_cong: dict


class GetChamCongDetailUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, query: GetChamCongThangDetailQuery
    ) -> Result[GetChamCongThangDetailResult, Error]:
        async with self.unit_of_work as uow:
            cham_cong = await uow.cham_cong_thang_repository.find_by_id(
                query.cham_cong_id
            )
            if not cham_cong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy chấm công tháng",
                        reason="ChamCongThang not found",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(
                cham_cong.nhan_vien_id
            )

        return Return.ok(
            GetChamCongThangDetailResult(
                cham_cong={
                    "id": cham_cong.id,
                    "nhan_vien_id": cham_cong.nhan_vien_id,
                    "nhan_vien_ho_ten": nhan_vien.ho_ten if nhan_vien else None,
                    "thang": cham_cong.thang,
                    "nam": cham_cong.nam,
                    "so_ngay_lam_chuan": float(cham_cong.so_ngay_lam_chuan),
                    "so_ngay_co_mat": float(cham_cong.so_ngay_co_mat),
                    "so_ngay_vang_co_phep": float(cham_cong.so_ngay_vang_co_phep),
                    "so_ngay_vang_khong_phep": float(cham_cong.so_ngay_vang_khong_phep),
                    "so_ngay_nghi_le_tet": float(cham_cong.so_ngay_nghi_le_tet),
                    "so_ngay_cong_tac": float(cham_cong.so_ngay_cong_tac),
                    "he_so_ngay_cong": float(cham_cong.he_so_ngay_cong),
                    "trang_thai": cham_cong.trang_thai,
                    "ghi_chu": cham_cong.ghi_chu,
                    "mau_trang_thai": self.service.lay_mau_trang_thai(
                        cham_cong.trang_thai
                    ),
                }
            )
        )
