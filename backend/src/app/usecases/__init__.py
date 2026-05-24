"""
HR Management System - Use Cases Index

This module exports all use cases for easy importing throughout the application.

Architecture Pattern:
- UseCase → Repository → Entity → Service (Clean Architecture)
- Result Pattern: Return.ok() / Return.err() from libs.result
- Pattern: 1 file = 1 UseCase with execute() method
"""

from .nhan_vien import (
    CreateNhanVienUseCase,
    GetNhanVienUseCase,
    UpdateNhanVienUseCase,
    DeleteNhanVienUseCase,
    RestoreNhanVienUseCase,
    ImportNhanVienUseCase,
)
from .phong_ban import (
    CreatePhongBanUseCase,
    GetPhongBanUseCase,
    UpdatePhongBanUseCase,
    DeletePhongBanUseCase,
)
from .chuc_vu import (
    CreateChucVuUseCase,
    GetChucVuUseCase,
    UpdateChucVuUseCase,
    DeleteChucVuUseCase,
)
from .hop_dong import (
    GetListHopDongUseCase,
    GetHopDongByIdUseCase,
    CreateHopDongUseCase,
    UpdateHopDongUseCase,
    DeleteHopDongUseCase,
)
from .cong_tac import (
    GetListCongTacUseCase,
    GetCurrentCongTacUseCase,
    CreateCongTacUseCase,
    EndCongTacUseCase,
    GetAllCongTacUseCase,
    GetCongTacByIdUseCase,
    UpdateCongTacUseCase,
)
from .lich_su_chuc_vu import (
    GetListLichSuChucVuUseCase,
    GetDetailLichSuChucVuUseCase,
    CreateLichSuChucVuUseCase,
    UpdateLichSuChucVuUseCase,
    DeleteLichSuChucVuUseCase,
)
from .nghi_phep import (
    CreateDonNghiUseCase,
    GetListDonNghiUseCase,
    GetDonNghiDetailUseCase,
    DuyetDonNghiUseCase,
    TuChoiDonNghiUseCase,
    DeleteDonNghiUseCase,
    GetSoNgayPhepUseCase,
    InitSoNgayPhepUseCase,
    GetListChamCongUseCase,
    GetChamCongDetailUseCase,
    MockGenerateChamCongUseCase,
)
from .dieu_chuyen import (
    TransferEmployeeUseCase,
)
from .ho_so import (
    HoSoNhanSuUseCase,
)
from .luong import (
    CreateCauHinhLuongUseCase,
    GetListCauHinhLuongUseCase,
    CreateLuongUseCase,
    GetListLuongUseCase,
    GetLuongHienTaiUseCase,
    GetListKyLuongUseCase,
    DuyetKyLuongUseCase,
    ChotKyLuongUseCase,
    GetTraLuongByKyLuongUseCase,
    GetTraLuongDetailUseCase,
    PreviewLuongUseCase,
    ChayLuongUseCase,
)
from .tai_lieu import (
    UploadTaiLieuUseCase,
    GetTaiLieuListUseCase,
    GetTaiLieuByNhanVienUseCase,
    GetTaiLieuDetailUseCase,
    UpdateTaiLieuUseCase,
    DeleteTaiLieuUseCase,
)
from .sub_module import (
    GetListNguoiThanUseCase,
    CreateNguoiThanUseCase,
    UpdateNguoiThanUseCase,
    DeleteNguoiThanUseCase,
    GetListBangCapUseCase,
    CreateBangCapUseCase,
    UpdateBangCapUseCase,
    DeleteBangCapUseCase,
    GetListKhenThuongKyLuatUseCase,
    CreateKhenThuongKyLuatUseCase,
    UpdateKhenThuongKyLuatUseCase,
    DeleteKhenThuongKyLuatUseCase,
)
from .employee import (
    GetEmployeeDashboardUseCase,
    GetEmployeeProfileUseCase,
    UpdateEmployeeProfileUseCase,
    GetEmployeePermissionsUseCase,
)
from .auth import (
    LoginUseCase,
)
from .dashboard import (
    GetAdminDashboardUseCase,
)
from .cham_cong import (
    GenerateQRUseCase,
    GenerateQRCommand,
    GenerateQRResult,
    BulkGenerateQRUseCase,
    BulkGenerateQRCommand,
    BulkGenerateQRResult,
    CheckInUseCase,
    CheckInCommand,
    CheckInResult,
    CheckOutUseCase,
    CheckOutCommand,
    CheckOutResult,
    GetMyHistoryUseCase,
    GetMyHistoryQuery,
    GetMyHistoryResult,
    GetMyMonthlyUseCase,
    GetMyMonthlyQuery,
    GetMyMonthlyResult,
    AggregateMonthlyUseCase,
    AggregateMonthlyCommand,
    AggregateMonthlyResult,
    GetQRByDateUseCase,
    GetQRByDateQuery,
    GetQRByDateResult,
)


__all__ = [
    # NhanVien
    "CreateNhanVienUseCase",
    "GetNhanVienUseCase",
    "UpdateNhanVienUseCase",
    "DeleteNhanVienUseCase",
    "RestoreNhanVienUseCase",
    "ImportNhanVienUseCase",
    # PhongBan
    "CreatePhongBanUseCase",
    "GetPhongBanUseCase",
    "UpdatePhongBanUseCase",
    "DeletePhongBanUseCase",
    # ChucVu
    "CreateChucVuUseCase",
    "GetChucVuUseCase",
    "UpdateChucVuUseCase",
    "DeleteChucVuUseCase",
    # HopDong
    "GetListHopDongUseCase",
    "GetHopDongByIdUseCase",
    "CreateHopDongUseCase",
    "UpdateHopDongUseCase",
    "DeleteHopDongUseCase",
    # CongTac
    "GetListCongTacUseCase",
    "GetCurrentCongTacUseCase",
    "CreateCongTacUseCase",
    "EndCongTacUseCase",
    "GetAllCongTacUseCase",
    "GetCongTacByIdUseCase",
    "UpdateCongTacUseCase",
    # LichSuChucVu
    "GetListLichSuChucVuUseCase",
    "GetDetailLichSuChucVuUseCase",
    "CreateLichSuChucVuUseCase",
    "UpdateLichSuChucVuUseCase",
    "DeleteLichSuChucVuUseCase",
    # NghiPhep
    "CreateDonNghiUseCase",
    "GetListDonNghiUseCase",
    "GetDonNghiDetailUseCase",
    "DuyetDonNghiUseCase",
    "TuChoiDonNghiUseCase",
    "DeleteDonNghiUseCase",
    "GetSoNgayPhepUseCase",
    "InitSoNgayPhepUseCase",
    # ChamCong
    "GetListChamCongUseCase",
    "GetChamCongDetailUseCase",
    "MockGenerateChamCongUseCase",
    # DieuChuyen
    "TransferEmployeeUseCase",
    # HoSo
    "HoSoNhanSuUseCase",
    # Luong
    "CreateCauHinhLuongUseCase",
    "GetListCauHinhLuongUseCase",
    "CreateLuongUseCase",
    "GetListLuongUseCase",
    "GetLuongHienTaiUseCase",
    "GetListKyLuongUseCase",
    "DuyetKyLuongUseCase",
    "ChotKyLuongUseCase",
    "GetTraLuongByKyLuongUseCase",
    "GetTraLuongDetailUseCase",
    "PreviewLuongUseCase",
    "ChayLuongUseCase",
    # TaiLieu
    "UploadTaiLieuUseCase",
    "GetTaiLieuListUseCase",
    "GetTaiLieuByNhanVienUseCase",
    "GetTaiLieuDetailUseCase",
    "UpdateTaiLieuUseCase",
    "DeleteTaiLieuUseCase",
    # SubModule - NguoiThan
    "GetListNguoiThanUseCase",
    "CreateNguoiThanUseCase",
    "UpdateNguoiThanUseCase",
    "DeleteNguoiThanUseCase",
    # SubModule - BangCap
    "GetListBangCapUseCase",
    "CreateBangCapUseCase",
    "UpdateBangCapUseCase",
    "DeleteBangCapUseCase",
    # SubModule - KhenThuongKyLuat
    "GetListKhenThuongKyLuatUseCase",
    "CreateKhenThuongKyLuatUseCase",
    "UpdateKhenThuongKyLuatUseCase",
    "DeleteKhenThuongKyLuatUseCase",
    # Employee
    "GetEmployeeDashboardUseCase",
    "GetEmployeeProfileUseCase",
    "UpdateEmployeeProfileUseCase",
    "GetEmployeePermissionsUseCase",
    # Auth
    "LoginUseCase",
    # Dashboard
    "GetAdminDashboardUseCase",
    # QR Attendance
    "GenerateQRUseCase",
    "GenerateQRCommand",
    "GenerateQRResult",
    "BulkGenerateQRUseCase",
    "BulkGenerateQRCommand",
    "BulkGenerateQRResult",
    "CheckInUseCase",
    "CheckInCommand",
    "CheckInResult",
    "CheckOutUseCase",
    "CheckOutCommand",
    "CheckOutResult",
    "GetMyHistoryUseCase",
    "GetMyHistoryQuery",
    "GetMyHistoryResult",
    "GetMyMonthlyUseCase",
    "GetMyMonthlyQuery",
    "GetMyMonthlyResult",
    "AggregateMonthlyUseCase",
    "AggregateMonthlyCommand",
    "AggregateMonthlyResult",
    "GetQRByDateUseCase",
    "GetQRByDateQuery",
    "GetQRByDateResult",
]
