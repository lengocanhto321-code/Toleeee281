from typing import Optional

from fastapi import APIRouter, Depends, Path, status

from libs.result import is_err
from libs.result import Error
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.sub_modules import (
    NguoiThanCreateRequest,
    NguoiThanUpdateRequest,
    NguoiThanResponse,
    BangCapCreateRequest,
    BangCapUpdateRequest,
    BangCapResponse,
    KhenThuongKyLuatCreateRequest,
    KhenThuongKyLuatUpdateRequest,
    KhenThuongKyLuatResponse,
)
from src.api.schemas.common import APIResponse
from src.api.error import ClientError, ServerError
from src.app.usecases.sub_module import (
    NguoiThanUseCase,
    GetListNguoiThanQuery,
    CreateNguoiThanCommand,
    UpdateNguoiThanCommand,
    DeleteNguoiThanCommand,
    BangCapUseCase,
    GetListBangCapQuery,
    CreateBangCapCommand,
    UpdateBangCapCommand,
    DeleteBangCapCommand,
    KhenThuongKyLuatUseCase,
    GetListKhenThuongKyLuatQuery,
    CreateKhenThuongKyLuatCommand,
    UpdateKhenThuongKyLuatCommand,
    DeleteKhenThuongKyLuatCommand,
)

router = APIRouter()


# ============ NGUOI THAN (Family) ============


@router.get(
    "/{nhan_vien_id}/nguoi-than",
    response_model=APIResponse[list[NguoiThanResponse]],
)
async def get_nguoi_than_list(
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetListNguoiThanQuery(nhan_vien_id=nhan_vien_id)
    use_case = NguoiThanUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy danh sách người thân thành công",
        data=result.value.items,
    )


@router.post(
    "/{nhan_vien_id}/nguoi-than",
    response_model=APIResponse[NguoiThanResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_nguoi_than(
    body: NguoiThanCreateRequest,
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = CreateNguoiThanCommand(
        nhan_vien_id=nhan_vien_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = NguoiThanUseCase(uow)
    result = await use_case.create(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Thêm người thân thành công",
        data=result.value.item,
    )


@router.put(
    "/{nhan_vien_id}/nguoi-than/{item_id}",
    response_model=APIResponse[NguoiThanResponse],
)
async def update_nguoi_than(
    body: NguoiThanUpdateRequest,
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = UpdateNguoiThanCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = NguoiThanUseCase(uow)
    result = await use_case.update(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật người thân thành công",
        data=result.value.item,
    )


@router.delete(
    "/{nhan_vien_id}/nguoi-than/{item_id}",
    response_model=APIResponse[dict],
)
async def delete_nguoi_than(
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = DeleteNguoiThanCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        actor_id=user_context.user_id,
    )
    use_case = NguoiThanUseCase(uow)
    result = await use_case.delete(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Xóa người thân thành công", data={"id": item_id})


# ============ BANG CAP (Degrees) ============


@router.get(
    "/{nhan_vien_id}/bang-cap",
    response_model=APIResponse[list[BangCapResponse]],
)
async def get_bang_cap_list(
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetListBangCapQuery(nhan_vien_id=nhan_vien_id)
    use_case = BangCapUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy danh sách bằng cấp thành công",
        data=result.value.items,
    )


@router.post(
    "/{nhan_vien_id}/bang-cap",
    response_model=APIResponse[BangCapResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_bang_cap(
    body: BangCapCreateRequest,
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = CreateBangCapCommand(
        nhan_vien_id=nhan_vien_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = BangCapUseCase(uow)
    result = await use_case.create(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Thêm bằng cấp thành công",
        data=result.value.item,
    )


@router.put(
    "/{nhan_vien_id}/bang-cap/{item_id}",
    response_model=APIResponse[BangCapResponse],
)
async def update_bang_cap(
    body: BangCapUpdateRequest,
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = UpdateBangCapCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = BangCapUseCase(uow)
    result = await use_case.update(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật bằng cấp thành công",
        data=result.value.item,
    )


@router.delete(
    "/{nhan_vien_id}/bang-cap/{item_id}",
    response_model=APIResponse[dict],
)
async def delete_bang_cap(
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = DeleteBangCapCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        actor_id=user_context.user_id,
    )
    use_case = BangCapUseCase(uow)
    result = await use_case.delete(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(message="Xóa bằng cấp thành công", data={"id": item_id})


# ============ KHEN THUONG / KY LUAT ============


@router.get(
    "/{nhan_vien_id}/khen-thuong-ky-luat",
    response_model=APIResponse[list[KhenThuongKyLuatResponse]],
)
async def get_khen_thuong_ky_luat_list(
    nhan_vien_id: str = Path(...),
    loai: Optional[str] = None,
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetListKhenThuongKyLuatQuery(nhan_vien_id=nhan_vien_id, loai=loai)
    use_case = KhenThuongKyLuatUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy danh sách khen thưởng/kỷ luật thành công",
        data=result.value.items,
    )


@router.post(
    "/{nhan_vien_id}/khen-thuong-ky-luat",
    response_model=APIResponse[KhenThuongKyLuatResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_khen_thuong_ky_luat(
    body: KhenThuongKyLuatCreateRequest,
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = CreateKhenThuongKyLuatCommand(
        nhan_vien_id=nhan_vien_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = KhenThuongKyLuatUseCase(uow)
    result = await use_case.create(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Thêm khen thưởng/kỷ luật thành công",
        data=result.value.item,
    )


@router.put(
    "/{nhan_vien_id}/khen-thuong-ky-luat/{item_id}",
    response_model=APIResponse[KhenThuongKyLuatResponse],
)
async def update_khen_thuong_ky_luat(
    body: KhenThuongKyLuatUpdateRequest,
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = UpdateKhenThuongKyLuatCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        data=body,
        actor_id=user_context.user_id,
    )
    use_case = KhenThuongKyLuatUseCase(uow)
    result = await use_case.update(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật khen thưởng/kỷ luật thành công",
        data=result.value.item,
    )


@router.delete(
    "/{nhan_vien_id}/khen-thuong-ky-luat/{item_id}",
    response_model=APIResponse[dict],
)
async def delete_khen_thuong_ky_luat(
    nhan_vien_id: str = Path(...),
    item_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = DeleteKhenThuongKyLuatCommand(
        nhan_vien_id=nhan_vien_id,
        item_id=item_id,
        actor_id=user_context.user_id,
    )
    use_case = KhenThuongKyLuatUseCase(uow)
    result = await use_case.delete(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Xóa khen thưởng/kỷ luật thành công", data={"id": item_id}
    )
