from typing import Optional, List

from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork

from src.api.schemas.phong_ban import (
    PhongBanCreateRequest,
    PhongBanUpdateRequest,
    PhongBanDataResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.phong_ban.create_phong_ban_uc import (
    CreatePhongBanCommand,
    CreatePhongBanUseCase,
)
from src.app.usecases.phong_ban.update_phong_ban_uc import (
    UpdatePhongBanCommand,
    UpdatePhongBanUseCase,
)
from src.app.usecases.phong_ban.delete_phong_ban_uc import (
    DeletePhongBanCommand,
    DeletePhongBanUseCase,
)
from src.app.usecases.phong_ban.get_phong_ban_uc import (
    GetListPhongBanQuery,
    GetDetailPhongBanQuery,
    GetPhongBanUseCase,
)

from src.api.error import ClientError, ServerError

router = APIRouter(tags=["Phong Ban"])


@router.post(
    "",
    response_model=APIResponse[PhongBanDataResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_phong_ban(
    body: PhongBanCreateRequest,
    user_context: UserContext = Depends(require_permission("phong_ban:create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo mới phòng ban."""
    command = CreatePhongBanCommand(data=body, actor_id=str(user_context.user_id))
    use_case = CreatePhongBanUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "code_already_exists":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(message="Tạo phòng ban thành công", data=result.value.phong_ban)


@router.get("", response_model=APIResponseWithMetadata[List[PhongBanDataResponse]])
async def get_phong_ban_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    loai: Optional[str] = Query(None),
    trang_thai: Optional[bool] = Query(None),
    sort_by: str = Query("created_at"),
    sort_desc: bool = Query(True),
    user_context: UserContext = Depends(require_permission("phong_ban:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách phòng ban có phân trang."""
    query = GetListPhongBanQuery(
        page=page,
        page_size=page_size,
        search=search,
        loai=loai,
        trang_thai=trang_thai,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )
    use_case = GetPhongBanUseCase(uow)
    result = await use_case.get_list(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    res_value = result.value
    return APIResponseWithMetadata(
        message="Lấy danh sách phòng ban thành công",
        data=res_value.items,
        metadata=res_value.metadata,
    )


@router.get("/{id}", response_model=APIResponse[PhongBanDataResponse])
async def get_phong_ban_detail(
    id: str = Path(...),
    user_context: UserContext = Depends(require_permission("phong_ban:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết phòng ban."""
    query = GetDetailPhongBanQuery(id=id)
    use_case = GetPhongBanUseCase(uow)
    result = await use_case.get_detail(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy thông tin phòng ban thành công", data=result.value.phong_ban
    )


@router.put("/{id}", response_model=APIResponse[PhongBanDataResponse])
async def update_phong_ban(
    body: PhongBanUpdateRequest,
    id: str = Path(...),
    user_context: UserContext = Depends(require_permission("phong_ban:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật phòng ban."""
    command = UpdatePhongBanCommand(
        id=id, data=body, actor_id=str(user_context.user_id)
    )
    use_case = UpdatePhongBanUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        elif error.code == "active_employees_exist":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật phòng ban thành công", data=result.value.phong_ban
    )


@router.delete("/{id}", response_model=APIResponse[None])
async def delete_phong_ban(
    id: str = Path(...),
    user_context: UserContext = Depends(require_permission("phong_ban:delete")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Xoá phòng ban."""
    command = DeletePhongBanCommand(id=id, actor_id=str(user_context.user_id))
    use_case = DeletePhongBanUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        elif error.code == "employees_exist":
            raise ClientError(base_error=error, status_code=status.HTTP_409_CONFLICT)
        raise ServerError(base_error=error)

    return APIResponse(message="Xoá phòng ban thành công", data=None)
