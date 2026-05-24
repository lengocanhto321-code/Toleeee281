from dataclasses import dataclass
from typing import Optional


@dataclass
class GetEmployeeDashboardQuery:
    user_id: str


@dataclass
class GetEmployeeDashboardResult:
    nhan_vien: dict
    nghi_phep: dict
    cham_cong: dict


@dataclass
class GetEmployeeProfileQuery:
    user_id: str


@dataclass
class GetEmployeeProfileResult:
    profile: dict


@dataclass
class UpdateEmployeeProfileCommand:
    user_id: str
    email: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    dia_chi: Optional[str] = None


@dataclass
class UpdateEmployeeProfileResult:
    profile: dict


@dataclass
class GetEmployeePermissionsQuery:
    user_id: str


@dataclass
class GetEmployeePermissionsResult:
    user_id: str
    roles: list[str]
    permissions: list[str]
