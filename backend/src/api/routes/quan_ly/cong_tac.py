from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.cong_tac import (
    CongTacUpdateRequest,
    CongTacResponse,
)
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.api.error import ClientError, ServerError
from src.app.usecases.cong_tac import (
    GetAllCongTacUseCase,
    GetAllCongTacQuery,
    GetCongTacByIdUseCase,
    GetCongTacByIdQuery,
    UpdateCongTacUseCase,
    UpdateCongTacCommand,
    CreateCongTacUseCase,
    CreateCongTacCommand,
)

router = APIRouter(tags=["CongTac"])


@router.get(
    "",
    response_model=APIResponseWithMetadata[list[CongTacResponse]],
)
async def get_all_cong_tac(
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(10, ge=1, le=100, description="Số item trên mỗi trang"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách tất cả phân công công tác (phân trang)."""
    query = GetAllCongTacQuery(page=page, page_size=page_size)
    use_case = GetAllCongTacUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponseWithMetadata(
        message="Lấy danh sách phân công công tác thành công",
        data=result.value.items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )


@router.get("/{id}", response_model=APIResponse[CongTacResponse])
async def get_cong_tac_by_id(
    id: str = Path(..., description="ID phân công công tác"),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy chi tiết phân công công tác."""
    query = GetCongTacByIdQuery(id=id)
    use_case = GetCongTacByIdUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy chi tiết phân công công tác thành công",
        data=result.value.item,
    )


@router.put("/{id}", response_model=APIResponse[CongTacResponse])
async def update_cong_tac(
    id: str = Path(..., description="ID phân công công tác"),
    body: CongTacUpdateRequest = ...,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật phân công công tác."""
    command = UpdateCongTacCommand(
        id=id,
        data=body.model_dump(exclude_unset=True),
        actor_id=user_context.user_id,
    )
    use_case = UpdateCongTacUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật phân công công tác thành công",
        data=result.value.item,
    )
