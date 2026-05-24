from dataclasses import dataclass
from datetime import date
from typing import Optional, List, Dict, Any

from libs.result import Result, Error, Return


@dataclass
class GetDanhSachVangMatQuery:
    ngay: date
    phong_ban_id: Optional[str] = None
    loai_vang: Optional[str] = None
    page: int = 1
    page_size: int = 20


@dataclass
class GetDanhSachVangMatResult:
    items: List[Dict[str, Any]]
    total: int
    stats: Dict[str, int]


class GetDanhSachVangMatUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetDanhSachVangMatQuery
    ) -> Result[GetDanhSachVangMatResult, Error]:
        async with self.unit_of_work as uow:
            total, records = await uow.check_in_out_repository.get_vang_mat_by_ngay(
                ngay=query.ngay,
                phong_ban_id=query.phong_ban_id,
                loai_vang=query.loai_vang,
                page=query.page,
                page_size=query.page_size,
            )

            counts = await uow.check_in_out_repository.count_vang_mat_by_ngay(
                query.ngay
            )

            nv_ids = list({r.nhan_vien_id for r in records})
            nv_map: Dict[str, Any] = {}
            if nv_ids:
                nhan_vien_list = await uow.nhan_vien_repository.find_dang_lam(
                    danh_sach_ids=nv_ids
                )
                for nv in nhan_vien_list:
                    nv_map[nv.id] = nv

            items = []
            for r in records:
                nv = nv_map.get(r.nhan_vien_id)
                ho_ten = nv.ho_ten if nv else "N/A"
                phong_ban_ten = nv.phong_ban.ten if nv and nv.phong_ban else ""
                items.append(
                    {
                        "id": r.id,
                        "nhan_vien_id": r.nhan_vien_id,
                        "nhan_vien_ho_ten": ho_ten,
                        "phong_ban": phong_ban_ten,
                        "ngay": r.ngay.isoformat() if r.ngay else None,
                        "trang_thai": r.trang_thai,
                        "ghi_chu_vang": r.ghi_chu_vang,
                        "created_at": r.created_at.isoformat()
                        if r.created_at
                        else None,
                    }
                )

            stats = {
                "tong_vang": sum(counts.values()),
                "tong_co_phep": counts.get("vang_mat_co_phep", 0),
                "tong_khong_phep": counts.get("vang_mat_khong_phep", 0),
            }

            return Return.ok(
                GetDanhSachVangMatResult(
                    items=items,
                    total=total,
                    stats=stats,
                )
            )
