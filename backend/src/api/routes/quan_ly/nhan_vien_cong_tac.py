from fastapi import APIRouter, Depends, Path, status

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.cong_tac import (
    CongTacCreateRequest,
    CongTacResponse,
)
from src.api.schemas.common import APIResponse
from src.api.error import ClientError, ServerError
from src.app.usecases.cong_tac import (
    CongTacUseCase,
    GetListCongTacQuery,
    GetCurrentCongTacQuery,
    CreateCongTacCommand,
    EndCongTacCommand,
)

router = APIRouter()


@router.get(
    "/{nhan_vien_id}/cong-tac",
    response_model=APIResponse[list[CongTacResponse]],
)
async def get_cong_tac_list(
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetListCongTacQuery(nhan_vien_id=nhan_vien_id)
    use_case = CongTacUseCase(uow)
    result = await use_case.get_all(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy lịch sử công tác thành công",
        data=result.value.items,
    )


@router.get(
    "/{nhan_vien_id}/cong-tac/hien-tai",
    response_model=APIResponse[CongTacResponse],
)
async def get_current_cong_tac(
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetCurrentCongTacQuery(nhan_vien_id=nhan_vien_id)
    use_case = CongTacUseCase(uow)
    result = await use_case.get_current(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy phân công hiện tại thành công",
        data=result.value.item,
    )


@router.post(
    "/{nhan_vien_id}/cong-tac",
    response_model=APIResponse[CongTacResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_cong_tac(
    body: CongTacCreateRequest,
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = CreateCongTacCommand(
        nhan_vien_id=nhan_vien_id,
        data=body.model_dump(),
        actor_id=user_context.user_id,
    )
    use_case = CongTacUseCase(uow)
    result = await use_case.create(command)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Tạo phân công công tác thành công",
        data=result.value.item,
    )


@router.post(
    "/{nhan_vien_id}/cong-tac/{cong_tac_id}/ket-thuc",
    response_model=APIResponse[CongTacResponse],
)
async def end_cong_tac(
    nhan_vien_id: str = Path(...),
    cong_tac_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = EndCongTacCommand(
        cong_tac_id=cong_tac_id,
        nhan_vien_id=nhan_vien_id,
        actor_id=user_context.user_id,
    )
    use_case = CongTacUseCase(uow)
    result = await use_case.end(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Kết thúc phân công công tác thành công",
        data=result.value.item,
    )
