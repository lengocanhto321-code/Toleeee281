from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import (
    UserContext,
    require_permission,
)
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.app.usecases.nghi_phep import (
    NghiPhepUseCase,
    CreateDonNghiUseCase,
    CreateDonNghiCommand,
    GetDonNghiQuery,
    GetDonNghiDetailQuery,
    GetListDonNghiUseCase,
    GetDonNghiDetailUseCase,
    DuyetDonNghiUseCase,
    DuyetDonNghiCommand,
    TuChoiDonNghiUseCase,
    TuChoiDonNghiCommand,
    DeleteDonNghiUseCase,
    DeleteDonNghiCommand,
    GetSoNgayPhepUseCase,
    GetSoNgayPhepQuery,
    InitSoNgayPhepUseCase,
    InitSoNgayPhepCommand,
    ChamCongUseCase,
    GetListChamCongUseCase,
    GetChamCongThangQuery,
    GetChamCongDetailUseCase,
    GetChamCongThangDetailQuery,
    MockGenerateChamCongUseCase,
    MockGenerateChamCongCommand,
    UpdateChamCongThangUseCase,
    UpdateChamCongThangCommand,
    XacNhanChamCongUseCase,
    XacNhanChamCongCommand,
    DuyetChamCongUseCase,
    DuyetChamCongCommand,
    ChotChamCongUseCase,
    ChotChamCongCommand,
)

router = APIRouter()


# ============================================================
# ĐƠN NGHỈ PHÉP
# ============================================================


@router.post("/don", status_code=status.HTTP_201_CREATED)
async def create_don_nghi(
    body: dict,
    user_context: UserContext = Depends(
        require_permission("nghi_phep:create", "nghi_phep:manage")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo đơn xin nghỉ phép mới."""
    command = CreateDonNghiCommand(
        nhan_vien_id=body.get("nhan_vien_id"),
        loai_nghi=body.get("loai_nghi"),
        tu_ngay=body.get("tu_ngay"),
        den_ngay=body.get("den_ngay"),
        ly_do=body.get("ly_do", ""),
        files=body.get("files", []),
        nguoi_tao_id=user_context.user_id,
    )

    use_case = CreateDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in ["invalid_data", "missing_document"]:
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Tạo đơn nghỉ phép thành công", "data": result.value.don}


@router.get("/don")
async def get_list_don_nghi(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nhan_vien_id: Optional[str] = Query(None),
    trang_thai: Optional[str] = Query(None),
    loai_nghi: Optional[str] = Query(None),
    user_context: UserContext = Depends(
        require_permission("nghi_phep:read", "nghi_phep:manage")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách đơn nghỉ phép."""
    query = GetDonNghiQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=nhan_vien_id,
        trang_thai=trang_thai,
        loai_nghi=loai_nghi,
    )

    use_case = GetListDonNghiUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Lấy danh sách thành công",
        "data": result.value.items,
        "metadata": {
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    }


@router.get("/don/{don_id}")
async def get_don_nghi_detail(
    don_id: str = Path(..., description="ID đơn nghỉ phép"),
    user_context: UserContext = Depends(
        require_permission("nghi_phep:read", "nghi_phep:manage", "nghi_phep:view_own")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết đơn nghỉ phép."""
    query = GetDonNghiDetailQuery(don_id=don_id)

    use_case = GetDonNghiDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return {"message": "Lấy chi tiết thành công", "data": result.value.don}


@router.put("/don/{don_id}/duyet")
async def duyet_don_nghi(
    don_id: str = Path(..., description="ID đơn nghỉ phép"),
    user_context: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Duyệt đơn nghỉ phép."""
    command = DuyetDonNghiCommand(
        don_id=don_id,
        nguoi_duyet_id=user_context.user_id,
    )

    use_case = DuyetDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {
        "message": "Duyệt đơn nghỉ phép thành công",
        "data": result.value.don,
    }


@router.put("/don/{don_id}/tu-choi")
async def tu_choi_don_nghi(
    don_id: str = Path(..., description="ID đơn nghỉ phép"),
    body: dict = ...,
    user_context: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Từ chối đơn nghỉ phép."""
    command = TuChoiDonNghiCommand(
        don_id=don_id,
        nguoi_duyet_id=user_context.user_id,
        ly_do_tu_choi=body.get("ly_do", ""),
    )

    use_case = TuChoiDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Từ chối đơn nghỉ phép thành công", "data": result.value.don}


@router.delete("/don/{don_id}")
async def delete_don_nghi(
    don_id: str = Path(..., description="ID đơn nghỉ phép"),
    user_context: UserContext = Depends(
        require_permission("nghi_phep:delete", "nghi_phep:manage")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xóa đơn nghỉ phép (chỉ người tạo hoặc admin)."""
    command = DeleteDonNghiCommand(
        don_id=don_id,
        nguoi_xoa_id=user_context.user_id,
    )

    use_case = DeleteDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Xóa đơn nghỉ phép thành công", "data": result.value}


# ============================================================
# SỐ NGÀY PHÉP
# ============================================================


@router.get("/so-ngay-phep/{nhan_vien_id}")
async def get_so_ngay_phep(
    nhan_vien_id: str = Path(..., description="ID nhân viên"),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy số ngày phép còn lại của nhân viên."""
    query = GetSoNgayPhepQuery(
        nhan_vien_id=nhan_vien_id,
        nam=nam,
    )

    use_case = GetSoNgayPhepUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {"message": "Lấy số ngày phép thành công", "data": result.value}


@router.post("/so-ngay-phep/init")
async def init_so_ngay_phep(
    body: dict,
    user_context: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Khởi tạo số ngày phép năm mới."""
    command = InitSoNgayPhepCommand(
        nhan_vien_id=body.get("nhan_vien_id"),
        nam=body.get("nam"),
        so_ngay_phep=body.get("so_ngay_phep", 12),
    )

    use_case = InitSoNgayPhepUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Khởi tạo số ngày phép thành công",
        "data": result.value.so_ngay_phep,
    }


# ============================================================
# CHẤM CÔNG THÁNG (Mock)
# ============================================================


@router.get("/cham-cong/thang")
async def get_list_cham_cong_thang(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nhan_vien_id: Optional[str] = Query(None),
    thang: Optional[int] = Query(None, ge=1, le=12),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách chấm công tháng."""
    query = GetChamCongThangQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=nhan_vien_id,
        thang=thang,
        nam=nam,
    )

    use_case = GetListChamCongUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Lấy danh sách thành công",
        "data": result.value.items,
        "metadata": {
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    }


@router.get("/cham-cong/thang/{cham_cong_id}")
async def get_cham_cong_thang_detail(
    cham_cong_id: str = Path(..., description="ID chấm công tháng"),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết chấm công tháng."""
    query = GetChamCongThangDetailQuery(cham_cong_id=cham_cong_id)

    use_case = GetChamCongDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return {"message": "Lấy chi tiết thành công", "data": result.value.cham_cong}


@router.post("/cham-cong/mock/generate")
async def mock_generate_cham_cong_thang(
    body: dict,
    user_context: UserContext = Depends(require_permission("nghi_phep:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Mock generate chấm công tháng.

    Chạy để tạo/cập nhật chấm công cho tất cả nhân viên.
    """
    command = MockGenerateChamCongCommand(
        thang=body.get("thang"),
        nam=body.get("nam"),
        nhan_vien_ids=body.get("nhan_vien_ids"),
    )

    use_case = MockGenerateChamCongUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": f"Generate chấm công tháng {command.thang}/{command.nam} thành công",
        "data": result.value,
    }


# ============================================================
# CHẤM CÔNG THÁNG - EDIT + APPROVE
# ============================================================


class UpdateChamCongRequest(BaseModel):
    so_ngay_co_mat: Optional[int] = None
    so_ngay_vang_co_phep: Optional[int] = None
    so_ngay_vang_khong_phep: Optional[int] = None
    so_ngay_nghi_le_tet: Optional[int] = None
    so_ngay_cong_tac: Optional[int] = None
    ghi_chu: Optional[str] = None


@router.put("/cham-cong/thang/{cham_cong_id}")
async def update_cham_cong_thang(
    cham_cong_id: str = Path(..., description="ID chấm công tháng"),
    body: UpdateChamCongRequest = ...,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật chấm công tháng - chỉ khi status = chua_chot."""
    command = UpdateChamCongThangCommand(
        cham_cong_id=cham_cong_id,
        so_ngay_co_mat=body.so_ngay_co_mat,
        so_ngay_vang_co_phep=body.so_ngay_vang_co_phep,
        so_ngay_vang_khong_phep=body.so_ngay_vang_khong_phep,
        so_ngay_nghi_le_tet=body.so_ngay_nghi_le_tet,
        so_ngay_cong_tac=body.so_ngay_cong_tac,
        ghi_chu=body.ghi_chu,
    )

    use_case = UpdateChamCongThangUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Cập nhật chấm công thành công", "data": {"id": result.value.id}}


@router.post("/cham-cong/thang/{cham_cong_id}/xac-nhan")
async def xac_nhan_cham_cong(
    cham_cong_id: str = Path(..., description="ID chấm công tháng"),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xác nhận chấm công - chua_chot -> da_xac_nhan."""
    command = XacNhanChamCongCommand(cham_cong_id=cham_cong_id)

    use_case = XacNhanChamCongUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Xác nhận chấm công thành công", "data": {"id": result.value.id}}


@router.post("/cham-cong/thang/{cham_cong_id}/duyet")
async def duyet_cham_cong(
    cham_cong_id: str = Path(..., description="ID chấm công tháng"),
    current_user: UserContext = Depends(require_permission("cham_cong:approve")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Duyệt chấm công - da_xac_nhan -> da_duyet."""
    command = DuyetChamCongCommand(cham_cong_id=cham_cong_id)

    use_case = DuyetChamCongUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Duyệt chấm công thành công", "data": {"id": result.value.id}}


@router.post("/cham-cong/thang/{cham_cong_id}/chot")
async def chot_cham_cong(
    cham_cong_id: str = Path(..., description="ID chấm công tháng"),
    current_user: UserContext = Depends(require_permission("cham_cong:approve")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Chốt chấm công - da_duyet -> da_chot (lock)."""
    command = ChotChamCongCommand(cham_cong_id=cham_cong_id)

    use_case = ChotChamCongUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Chốt chấm công thành công", "data": {"id": result.value.id}}
