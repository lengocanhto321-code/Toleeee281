from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import get_current_admin, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.service.tinh_luong_service import TinhLuongService

from src.api.schemas.luong import (
    LuongCreateRequest,
    LuongDataResponse,
    PreviewLuongRequest,
    PreviewLuongResponse,
    ChayLuongRequest,
    ChayLuongResponse,
    KyLuongResponse,
    TraLuongResponse,
    CauHinhLuongResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.api.error import ClientError, ServerError
from src.app.usecases.luong import (
    LuongUseCase,
    PreviewLuongUseCase,
    PreviewLuongCommand,
    ChayLuongUseCase,
    ChayLuongCommand,
    CreateCauHinhLuongCommand,
    GetListCauHinhLuongQuery,
    CreateLuongCommand,
    GetListLuongQuery,
    GetLuongHienTaiQuery,
    GetListKyLuongQuery,
    DuyetKyLuongCommand,
    ChotKyLuongCommand,
    GetTraLuongByKyLuongQuery,
    GetTraLuongDetailQuery,
)

router = APIRouter(tags=["Luong"])


@router.post(
    "/cau-hinh",
    response_model=APIResponse[CauHinhLuongResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_cau_hinh_luong(
    body: dict,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo cấu hình hệ thống lương mới."""
    command = CreateCauHinhLuongCommand(
        ten_cau_hinh=body.get("ten_cau_hinh"),
        ngay_ap_dung=body.get("ngay_ap_dung"),
        luong_co_so=body.get("luong_co_so", 1800000),
        he_so_dac_thu=body.get("he_so_dac_thu", 1.0),
        ty_le_bhxh=body.get("ty_le_bhxh", 8.0),
        ty_le_bhyt=body.get("ty_le_bhyt", 1.5),
        ty_le_bhtn=body.get("ty_le_bhtn", 1.0),
        muc_giam_tru_ban_than=body.get("muc_giam_tru_ban_than", 11000000),
        muc_giam_tru_nguoi_phu_thuoc=body.get("muc_giam_tru_nguoi_phu_thuoc", 4400000),
    )

    use_case = LuongUseCase(uow)
    result = await use_case.create_cau_hinh(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Tạo cấu hình lương thành công", data=result.value.cau_hinh
    )


@router.get(
    "/cau-hinh", response_model=APIResponseWithMetadata[list[CauHinhLuongResponse]]
)
async def get_list_cau_hinh_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    ngay_ap_dung: Optional[str] = Query(None),
    trang_thai: Optional[str] = Query(None),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách cấu hình lương."""
    query = GetListCauHinhLuongQuery(
        page=page,
        page_size=page_size,
        ngay_ap_dung=ngay_ap_dung,
        trang_thai=trang_thai,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.get_list_cau_hinh(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách cấu hình lương thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.post(
    "",
    response_model=APIResponse[LuongDataResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_luong(
    body: LuongCreateRequest,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo mới bảng lương cho nhân viên."""
    command = CreateLuongCommand(
        nhan_vien_id=body.nhan_vien_id,
        ma_ngach=body.ma_ngach,
        bac=body.bac,
        he_so_luong=body.he_so_luong,
        so_nam_tham_nien=body.so_nam_tham_nien,
        ty_le_pc_uu_dai=body.ty_le_pc_uu_dai,
        he_so_khu_vuc=body.he_so_khu_vuc,
        phu_cap_chuc_vu=body.phu_cap_chuc_vu,
        phu_cap_tham_nien_vuot_khung=body.phu_cap_tham_nien_vuot_khung,
        phu_cap_khac=body.phu_cap_khac,
        khau_tru_khac=body.khau_tru_khac,
        hieu_luc_tu=str(body.hieu_luc_tu),
        hieu_luc_den=str(body.hieu_luc_den) if body.hieu_luc_den else None,
        ghi_chu=body.ghi_chu,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.create_luong(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Tạo bảng lương thành công", data=result.value.luong)


@router.get("", response_model=APIResponseWithMetadata[list[LuongDataResponse]])
async def get_list_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    nhan_vien_id: Optional[str] = Query(None),
    hieu_luc: Optional[str] = Query(None),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách bảng lương."""
    query = GetListLuongQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=nhan_vien_id,
        hieu_luc=hieu_luc,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.get_list_luong(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách lương thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/{nhan_vien_id}/hien-tai", response_model=APIResponse[LuongDataResponse])
async def get_luong_hien_tai(
    nhan_vien_id: str = Path(..., description="ID nhân viên"),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy bảng lương hiện tại của nhân viên."""
    query = GetLuongHienTaiQuery(nhan_vien_id=nhan_vien_id)

    use_case = LuongUseCase(uow)
    result = await use_case.get_luong_hien_tai(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Lấy bảng lương thành công", data=result.value.luong)


@router.post("/preview", response_model=APIResponse[PreviewLuongResponse])
async def preview_luong(
    body: PreviewLuongRequest,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Preview tính lương cho nhân viên (không lưu vào DB)."""
    tinh_luong_service = TinhLuongService()
    use_case = PreviewLuongUseCase(uow, tinh_luong_service)

    command = PreviewLuongCommand(
        nhan_vien_id=body.nhan_vien_id,
        thang=body.thang,
        nam=body.nam,
    )

    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in ["cau_hinh_not_found", "luong_not_found"]:
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(message="Preview lương thành công", data=result.value.data)


@router.post(
    "/chay-luong",
    response_model=APIResponse[ChayLuongResponse],
    status_code=status.HTTP_201_CREATED,
)
async def chay_luong(
    body: ChayLuongRequest,
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Chạy lương hàng loạt cho một tháng."""
    tinh_luong_service = TinhLuongService()
    use_case = ChayLuongUseCase(uow, tinh_luong_service)

    command = ChayLuongCommand(
        thang=body.thang,
        nam=body.nam,
        danh_sach_nhan_vien_ids=body.danh_sach_nhan_vien_ids,
    )

    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "da_co_ky_luong":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        if error.code == "cau_hinh_not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(
        message=f"Đã chạy lương tháng {body.thang}/{body.nam} thành công",
        data=result.value,
    )


@router.get("/ky-luong", response_model=APIResponseWithMetadata[list[KyLuongResponse]])
async def get_list_ky_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    thang: Optional[int] = Query(None, ge=1, le=12),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    trang_thai: Optional[str] = Query(None),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách kỳ lương."""
    query = GetListKyLuongQuery(
        page=page,
        page_size=page_size,
        thang=thang,
        nam=nam,
        trang_thai=trang_thai,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.get_list_ky_luong(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách kỳ lương thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get(
    "/ky-luong/{ky_luong_id}/tra-luong",
    response_model=APIResponseWithMetadata[list[TraLuongResponse]],
)
async def get_tra_luong_by_ky_luong(
    ky_luong_id: str = Path(..., description="ID kỳ lương"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách phiếu trả lương theo kỳ lương."""
    query = GetTraLuongByKyLuongQuery(
        ky_luong_id=ky_luong_id,
        page=page,
        page_size=page_size,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.get_tra_luong_by_ky_luong(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách phiếu trả lương thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/tra-luong/{tra_luong_id}", response_model=APIResponse[TraLuongResponse])
async def get_tra_luong_detail(
    tra_luong_id: str = Path(..., description="ID phiếu trả lương"),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết phiếu trả lương."""
    query = GetTraLuongDetailQuery(tra_luong_id=tra_luong_id)

    use_case = LuongUseCase(uow)
    result = await use_case.get_tra_luong_detail(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết phiếu trả lương thành công", data=result.value.tra_luong
    )


@router.put(
    "/ky-luong/{ky_luong_id}/duyet", response_model=APIResponse[KyLuongResponse]
)
async def duyet_ky_luong(
    ky_luong_id: str = Path(..., description="ID kỳ lương"),
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Duyệt kỳ lương."""
    command = DuyetKyLuongCommand(
        ky_luong_id=ky_luong_id,
        actor_id=user_context.user_id,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.duyet_ky_luong(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(message="Duyệt kỳ lương thành công", data=result.value.ky_luong)


@router.put("/ky-luong/{ky_luong_id}/chot", response_model=APIResponse[KyLuongResponse])
async def chot_ky_luong(
    ky_luong_id: str = Path(..., description="ID kỳ lương"),
    user_context: UserContext = Depends(get_current_admin),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Chốt kỳ lương."""
    command = ChotKyLuongCommand(
        ky_luong_id=ky_luong_id,
        actor_id=user_context.user_id,
    )

    use_case = LuongUseCase(uow)
    result = await use_case.chot_ky_luong(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(message="Chốt kỳ lương thành công", data=result.value.ky_luong)
