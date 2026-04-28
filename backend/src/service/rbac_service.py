from typing import Optional
from src.domain.models.rbac import Role, Permission
from src.repository.rbac_repository import RBACRepository
from src.service.unit_of_work import UnitOfWork


class RBACService:
    """Service for RBAC operations."""

    def __init__(self, uow: UnitOfWork):
        self._uow = uow

    async def get_user_permissions(self, user_id: str) -> list[str]:
        """Get list of permission codes for a user."""
        permissions = await self._uow.rbac_repository.get_user_permissions(user_id)
        return [p.code for p in permissions]

    async def has_permission(self, user_id: str, permission_code: str) -> bool:
        """Check if user has a specific permission."""
        return await self._uow.rbac_repository.user_has_permission(
            user_id, permission_code
        )

    async def has_any_permission(
        self, user_id: str, permission_codes: list[str]
    ) -> bool:
        """Check if user has any of the specified permissions."""
        user_permissions = await self.get_user_permissions(user_id)
        return any(code in user_permissions for code in permission_codes)

    async def has_all_permissions(
        self, user_id: str, permission_codes: list[str]
    ) -> bool:
        """Check if user has all of the specified permissions."""
        user_permissions = await self.get_user_permissions(user_id)
        return all(code in user_permissions for code in permission_codes)

    async def get_user_roles(self, user_id: str) -> list[Role]:
        """Get all roles for a user."""
        return await self._uow.rbac_repository.get_user_roles(user_id)

    async def is_admin(self, user_id: str) -> bool:
        """Check if user has admin role."""
        roles = await self.get_user_roles(user_id)
        admin_roles = ["ADMIN", "HIEU_TRUONG"]
        return any(r.name in admin_roles for r in roles)

    async def is_manager(self, user_id: str) -> bool:
        """Check if user has manager role."""
        roles = await self.get_user_roles(user_id)
        manager_roles = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]
        return any(r.name in manager_roles for r in roles)

    async def is_employee(self, user_id: str) -> bool:
        """Check if user has employee role."""
        roles = await self.get_user_roles(user_id)
        employee_roles = ["GIAO_VIEN", "NHAN_VIEN"]
        return any(r.name in employee_roles for r in roles)


PERMISSION_CODES = {
    # Nhân viên
    "nhan_vien:read": "Xem danh sách nhân viên",
    "nhan_vien:create": "Tạo nhân viên mới",
    "nhan_vien:update": "Cập nhật thông tin nhân viên",
    "nhan_vien:delete": "Xóa nhân viên",
    # Phòng ban
    "phong_ban:read": "Xem phòng ban",
    "phong_ban:create": "Tạo phòng ban",
    "phong_ban:update": "Cập nhật phòng ban",
    "phong_ban:delete": "Xóa phòng ban",
    # Chức vụ
    "chuc_vu:read": "Xem chức vụ",
    "chuc_vu:create": "Tạo chức vụ",
    "chuc_vu:update": "Cập nhật chức vụ",
    "chuc_vu:delete": "Xóa chức vụ",
    # Lương - Quản lý
    "luong:read": "Xem bảng lương",
    "luong:manage": "Quản lý lương",
    "luong:export": "Xuất bảng lương",
    # Lương - Nhân viên
    "luong:view_own": "Xem lương cá nhân",
    # Chấm công - Quản lý
    "cham_cong:read": "Xem chấm công",
    "cham_cong:manage": "Quản lý chấm công",
    "cham_cong:export": "Xuất bảng chấm công",
    # Chấm công - Nhân viên
    "cham_cong:view_own": "Xem chấm công cá nhân",
    "cham_cong:check_in": "Check-in/Check-out bằng QR",
    # Nghỉ phép - Quản lý
    "nghi_phep:read": "Xem đơn nghỉ phép",
    "nghi_phep:approve": "Duyệt đơn nghỉ phép",
    "nghi_phep:manage": "Quản lý nghỉ phép",
    # Nghỉ phép - Nhân viên
    "nghi_phep:create": "Tạo đơn nghỉ phép",
    "nghi_phep:view_own": "Xem đơn nghỉ phép cá nhân",
    # Dashboard
    "dashboard:view_admin": "Xem dashboard quản trị",
    "dashboard:view_employee": "Xem dashboard nhân viên",
    # Báo cáo
    "bao_cao:read": "Xem báo cáo thống kê",
    "bao_cao:export": "Xuất báo cáo",
    # Thống kê
    "thong_ke:read": "Xem thống kê",
    # Hồ sơ
    "profile:read": "Xem hồ sơ",
    "profile:update": "Cập nhật hồ sơ",
    # Tài liệu
    "tai_lieu:read": "Xem tài liệu",
    "tai_lieu:create": "Tạo tài liệu",
    "tai_lieu:update": "Cập nhật tài liệu",
    "tai_lieu:delete": "Xóa tài liệu",
}


ROLE_PERMISSIONS = {
    "ADMIN": [
        "nhan_vien:read",
        "nhan_vien:create",
        "nhan_vien:update",
        "nhan_vien:delete",
        "phong_ban:read",
        "phong_ban:create",
        "phong_ban:update",
        "phong_ban:delete",
        "chuc_vu:read",
        "chuc_vu:create",
        "chuc_vu:update",
        "chuc_vu:delete",
        "luong:read",
        "luong:manage",
        "luong:export",
        "cham_cong:read",
        "cham_cong:manage",
        "cham_cong:export",
        "nghi_phep:read",
        "nghi_phep:approve",
        "nghi_phep:manage",
        "dashboard:view_admin",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
        "tai_lieu:read",
        "tai_lieu:create",
        "tai_lieu:update",
        "tai_lieu:delete",
        "bao_cao:read",
        "bao_cao:export",
        "thong_ke:read",
    ],
    "HIEU_TRUONG": [
        "nhan_vien:read",
        "nhan_vien:create",
        "nhan_vien:update",
        "phong_ban:read",
        "luong:read",
        "luong:export",
        "cham_cong:read",
        "cham_cong:manage",
        "cham_cong:export",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
        "bao_cao:read",
        "bao_cao:export",
        "thong_ke:read",
    ],
    "HIEU_PHO": [
        "nhan_vien:read",
        "phong_ban:read",
        "luong:read",
        "cham_cong:read",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
        "bao_cao:read",
        "thong_ke:read",
    ],
    "TO_TRUONG": [
        "nhan_vien:read",
        "phong_ban:read",
        "cham_cong:read",
        "cham_cong:manage",
        "nghi_phep:read",
        "nghi_phep:approve",
        "dashboard:view_admin",
        "profile:read",
        "profile:update",
        "bao_cao:read",
        "thong_ke:read",
    ],
    "GIAO_VIEN": [
        "luong:view_own",
        "cham_cong:view_own",
        "cham_cong:check_in",
        "nghi_phep:create",
        "nghi_phep:view_own",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
    ],
    "NHAN_VIEN": [
        "luong:view_own",
        "cham_cong:view_own",
        "cham_cong:check_in",
        "nghi_phep:create",
        "nghi_phep:view_own",
        "dashboard:view_employee",
        "profile:read",
        "profile:update",
    ],
}


ROLES = [
    {
        "name": "ADMIN",
        "description": "Quản trị hệ thống",
        "priority": 100,
        "is_system": True,
    },
    {
        "name": "HIEU_TRUONG",
        "description": "Hiệu trưởng",
        "priority": 90,
        "is_system": True,
    },
    {"name": "HIEU_PHO", "description": "Hiệu phó", "priority": 80, "is_system": True},
    {
        "name": "TO_TRUONG",
        "description": "Tổ trưởng",
        "priority": 70,
        "is_system": True,
    },
    {
        "name": "GIAO_VIEN",
        "description": "Giáo viên",
        "priority": 50,
        "is_system": True,
    },
    {
        "name": "NHAN_VIEN",
        "description": "Nhân viên",
        "priority": 40,
        "is_system": True,
    },
]
