from datetime import date
from typing import List

from src.service.cham_cong_service import ChamCongService


async def sync_cham_cong_thang_for_nhan_vien(
    uow, nhan_vien_id: str, thang: int, nam: int
):
    service = ChamCongService()

    tu_ngay = date(nam, thang, 1)
    if thang == 12:
        den_ngay = date(nam + 1, 1, 1)
    else:
        den_ngay = date(nam, thang + 1, 1)

    don_nghi_list = await uow.don_xin_nghi_repository.find_by_date_range(
        nhan_vien_id, tu_ngay, den_ngay - date.resolution
    )

    danh_sach_nghi: List[dict] = []
    for don in don_nghi_list:
        danh_sach_nghi.append(
            {
                "loai_nghi": don.loai_nghi,
                "so_ngay": float(don.so_ngay),
            }
        )

    so_ngay_lam_viec = service.tinh_so_ngay_lam_viec_thang(thang, nam)

    so_ngay_nghi_le_tet = _tinh_ngay_le_tet_thang(thang, nam)

    ket_qua = service.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=so_ngay_lam_viec,
        danh_sach_nghi=danh_sach_nghi,
        so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
    )

    await uow.cham_cong_thang_repository.upsert(
        nhan_vien_id=nhan_vien_id,
        thang=thang,
        nam=nam,
        so_ngay_co_mat=ket_qua["so_ngay_co_mat"],
        so_ngay_vang_co_phep=ket_qua["so_ngay_vang_co_phep"],
        so_ngay_vang_khong_phep=ket_qua["so_ngay_vang_khong_phep"],
        so_ngay_nghi_le_tet=ket_qua["so_ngay_nghi_le_tet"],
        so_ngay_cong_tac=ket_qua["so_ngay_cong_tac"],
        he_so_ngay_cong=ket_qua["he_so_ngay_cong"],
    )


def _tinh_ngay_le_tet_thang(thang: int, nam: int) -> float:
    from src.service.nghi_phep_service import NghiPhepService

    nghi_phep_service = NghiPhepService()
    holidays = nghi_phep_service.get_holidays(nam)
    tu_ngay = date(nam, thang, 1)
    if thang == 12:
        den_ngay = date(nam + 1, 1, 1) - date.resolution
    else:
        den_ngay = date(nam, thang + 1, 1) - date.resolution
    count = sum(1 for h in holidays if tu_ngay <= h <= den_ngay and h.weekday() < 5)
    return float(count)
