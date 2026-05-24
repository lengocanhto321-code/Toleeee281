"""
Employee API Routes - Dành cho nhân viên/giáo viên truy cập dữ liệu cá nhân
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.error import ClientError, ServerError
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponse
from src.app.usecases.employee import (
    GetEmployeeDashboardQuery,
    GetEmployeeDashboardUseCase,
    GetEmployeeProfileQuery,
    GetEmployeeProfileUseCase,
    UpdateEmployeeProfileCommand,
    UpdateEmployeeProfileUseCase,
    GetEmployeePermissionsQuery,
    GetEmployeePermissionsUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class UpdateProfileRequest(BaseModel):
    email: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    dia_chi: Optional[str] = None


@router.get("/dashboard", response_model=APIResponse[dict])
async def get_employee_dashboard(
    current_user: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy dashboard data cho nhân viên."""
    query = GetEmployeeDashboardQuery(user_id=current_user.user_id)
    use_case = GetEmployeeDashboardUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    result_value = result.value
    return APIResponse(
        message="Lấy dashboard thành công",
        data={
            "nhan_vien": result_value.nhan_vien,
            "nghi_phep": result_value.nghi_phep,
            "cham_cong": result_value.cham_cong,
        },
    )


@router.get("/profile", response_model=APIResponse[dict])
async def get_employee_profile(
    current_user: UserContext = Depends(require_permission("profile:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy thông tin hồ sơ cá nhân của nhân viên."""
    query = GetEmployeeProfileQuery(user_id=current_user.user_id)
    use_case = GetEmployeeProfileUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Lấy profile thành công",
        data=result.value.profile,
    )


@router.put("/profile", response_model=APIResponse[dict])
async def update_employee_profile(
    body: UpdateProfileRequest,
    current_user: UserContext = Depends(require_permission("profile:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Cập nhật thông tin hồ sơ cá nhân của nhân viên."""
    command = UpdateEmployeeProfileCommand(
        user_id=current_user.user_id,
        email=body.email,
        so_dien_thoai=body.so_dien_thoai,
        dia_chi=body.dia_chi,
    )
    use_case = UpdateEmployeeProfileUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=404)
        raise ServerError(base_error=error)

    return APIResponse(
        message="Cập nhật profile thành công",
        data=result.value.profile,
    )


@router.get("/permissions", response_model=APIResponse[dict])
async def get_user_permissions(
    current_user: UserContext = Depends(require_permission("profile:read")),
):
    """Lấy danh sách permissions của user hiện tại (từ JWT token)."""
    query = GetEmployeePermissionsQuery(user_id=current_user.user_id)
    use_case = GetEmployeePermissionsUseCase()
    result = use_case.execute(
        query=query,
        roles=current_user.roles,
        permissions=current_user.permissions,
    )

    if is_err(result):
        raise ServerError(base_error=result.value)

    return APIResponse(
        message="Lấy permissions thành công",
        data={
            "user_id": result.value.user_id,
            "roles": result.value.roles,
            "permissions": result.value.permissions,
        },
    )
