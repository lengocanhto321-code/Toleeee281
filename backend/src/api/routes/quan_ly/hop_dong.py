import logging
from fastapi import APIRouter, Depends, Query
from libs.result import is_err
from src.api.auth import UserContext, require_permission
from src.api.error import ClientError, ServerError
from src.app.usecases.hop_dong import (
    HopDongUseCase,
    GetListHopDongUseCase,
    GetListHopDongQuery,
    GetHopDongByIdUseCase,
    GetHopDongByIdQuery,
    CreateHopDongUseCase,
    CreateHopDongCommand,
    UpdateHopDongUseCase,
    UpdateHopDongCommand,
    DeleteHopDongUseCase,
    DeleteHopDongCommand,
)
from src.api.schemas.hop_dong import (
    HopDongCreateRequest,
    HopDongUpdateRequest,
    HopDongResponse,
)
from src.api.schemas.common import APIResponse
from src.api.depends import get_unit_of_work
from fastapi import status

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/hop-dong/generate-so", response_model=APIResponse[dict])
async def generate_so_hop_dong(
    uow=Depends(get_unit_of_work),
):
    """Generate số hợp đồng tiếp theo."""
    async with uow:
        so_hd = await uow.hop_dong_repository.generate_so_hop_dong()
    return APIResponse(message="OK", data={"so_hop_dong": so_hd})


@router.get(
    "/{nhan_vien_id}/hop-dong", response_model=APIResponse[list[HopDongResponse]]
)
async def get_hop_dong_list(
    nhan_vien_id: str,
    current_user: UserContext = Depends(require_permission("nhan_vien:read")),
    uow=Depends(get_unit_of_work),
):
    """Lấy danh sách hợp đồng của nhân viên."""
    uc = GetListHopDongUseCase(uow)
    result = await uc.execute(GetListHopDongQuery(nhan_vien_id=nhan_vien_id))

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy danh sách hợp đồng thành công",
        data=result.value.items,
    )


@router.get(
    "/{nhan_vien_id}/hop-dong/{hop_dong_id}",
    response_model=APIResponse[HopDongResponse],
)
async def get_hop_dong_by_id(
    nhan_vien_id: str,
    hop_dong_id: str,
    current_user: UserContext = Depends(require_permission("nhan_vien:read")),
    uow=Depends(get_unit_of_work),
):
    """Lấy chi tiết một hợp đồng."""
    uc = GetHopDongByIdUseCase(uow)
    result = await uc.execute(GetHopDongByIdQuery(id=hop_dong_id))

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết hợp đồng thành công",
        data=result.value.item,
    )


@router.post(
    "/{nhan_vien_id}/hop-dong",
    response_model=APIResponse[HopDongResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_hop_dong(
    nhan_vien_id: str,
    data: HopDongCreateRequest,
    current_user: UserContext = Depends(require_permission("nhan_vien:update")),
    uow=Depends(get_unit_of_work),
):
    """Tạo hợp đồng mới cho nhân viên."""
    uc = CreateHopDongUseCase(uow)
    result = await uc.execute(
        CreateHopDongCommand(
            nhan_vien_id=nhan_vien_id,
            data=data,
            actor_id=current_user.user_id,
        )
    )

    if is_err(result):
        error = result.value
        if error.code in ("not_found", "nhan_vien_not_found"):
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in ("invalid_dates", "overlap_error"):
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Tạo hợp đồng thành công",
        data=result.value.item,
    )


@router.put(
    "/{nhan_vien_id}/hop-dong/{hop_dong_id}",
    response_model=APIResponse[HopDongResponse],
)
async def update_hop_dong(
    nhan_vien_id: str,
    hop_dong_id: str,
    data: HopDongUpdateRequest,
    current_user: UserContext = Depends(require_permission("nhan_vien:update")),
    uow=Depends(get_unit_of_work),
):
    """Cập nhật hợp đồng."""
    uc = UpdateHopDongUseCase(uow)
    result = await uc.execute(
        UpdateHopDongCommand(
            id=hop_dong_id,
            data=data,
            actor_id=current_user.user_id,
        )
    )

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật hợp đồng thành công",
        data=result.value.item,
    )


@router.delete(
    "/{nhan_vien_id}/hop-dong/{hop_dong_id}", response_model=APIResponse[dict]
)
async def delete_hop_dong(
    nhan_vien_id: str,
    hop_dong_id: str,
    current_user: UserContext = Depends(require_permission("nhan_vien:delete")),
    uow=Depends(get_unit_of_work),
):
    """Xóa hợp đồng."""
    uc = DeleteHopDongUseCase(uow)
    result = await uc.execute(
        DeleteHopDongCommand(
            id=hop_dong_id,
            actor_id=current_user.user_id,
        )
    )

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Hủy hợp đồng thành công",
        data={"success": True},
    )
