from src.app.usecases.nghi_phep.create_don_nghi_uc import (
    CreateDonNghiUseCase,
    CreateDonNghiCommand,
    CreateDonNghiResult,
)
from src.app.usecases.nghi_phep.get_list_don_nghi_uc import (
    GetListDonNghiUseCase,
    GetDonNghiQuery,
    GetDonNghiResult,
)
from src.app.usecases.nghi_phep.get_don_nghi_detail_uc import (
    GetDonNghiDetailUseCase,
    GetDonNghiDetailQuery,
    GetDonNghiDetailResult,
)
from src.app.usecases.nghi_phep.duyet_don_nghi_uc import (
    DuyetDonNghiUseCase,
    DuyetDonNghiCommand,
    DuyetDonNghiResult,
)
from src.app.usecases.nghi_phep.tu_choi_don_nghi_uc import (
    TuChoiDonNghiUseCase,
    TuChoiDonNghiCommand,
    TuChoiDonNghiResult,
)
from src.app.usecases.nghi_phep.delete_don_nghi_uc import (
    DeleteDonNghiUseCase,
    DeleteDonNghiCommand,
    DeleteDonNghiResult,
)
from src.app.usecases.nghi_phep.get_so_ngay_phep_uc import (
    GetSoNgayPhepUseCase,
    GetSoNgayPhepQuery,
    GetSoNgayPhepResult,
)
from src.app.usecases.nghi_phep.init_so_ngay_phep_uc import (
    InitSoNgayPhepUseCase,
    InitSoNgayPhepCommand,
    InitSoNgayPhepResult,
)
from src.app.usecases.nghi_phep.get_list_cham_cong_uc import (
    GetListChamCongUseCase,
    GetChamCongThangQuery,
    GetChamCongThangResult,
)
from src.app.usecases.nghi_phep.get_cham_cong_detail_uc import (
    GetChamCongDetailUseCase,
    GetChamCongThangDetailQuery,
    GetChamCongThangDetailResult,
)
from src.app.usecases.nghi_phep.mock_generate_cham_cong_uc import (
    MockGenerateChamCongUseCase,
    MockGenerateChamCongCommand,
    MockGenerateChamCongResult,
)
from src.app.usecases.nghi_phep.update_cham_cong_uc import (
    UpdateChamCongThangUseCase,
    UpdateChamCongThangCommand,
    UpdateChamCongThangResult,
)
from src.app.usecases.nghi_phep.xac_nhan_cham_cong_uc import (
    XacNhanChamCongUseCase,
    XacNhanChamCongCommand,
    XacNhanChamCongResult,
)
from src.app.usecases.nghi_phep.duyet_cham_cong_uc import (
    DuyetChamCongUseCase,
    DuyetChamCongCommand,
    DuyetChamCongResult,
)
from src.app.usecases.nghi_phep.chot_cham_cong_uc import (
    ChotChamCongUseCase,
    ChotChamCongCommand,
    ChotChamCongResult,
)

NghiPhepUseCase = GetListDonNghiUseCase
ChamCongUseCase = GetListChamCongUseCase

__all__ = [
    "CreateDonNghiUseCase",
    "CreateDonNghiCommand",
    "CreateDonNghiResult",
    "GetListDonNghiUseCase",
    "GetDonNghiQuery",
    "GetDonNghiResult",
    "GetDonNghiDetailUseCase",
    "GetDonNghiDetailQuery",
    "GetDonNghiDetailResult",
    "DuyetDonNghiUseCase",
    "DuyetDonNghiCommand",
    "DuyetDonNghiResult",
    "TuChoiDonNghiUseCase",
    "TuChoiDonNghiCommand",
    "TuChoiDonNghiResult",
    "DeleteDonNghiUseCase",
    "DeleteDonNghiCommand",
    "DeleteDonNghiResult",
    "GetSoNgayPhepUseCase",
    "GetSoNgayPhepQuery",
    "GetSoNgayPhepResult",
    "InitSoNgayPhepUseCase",
    "InitSoNgayPhepCommand",
    "InitSoNgayPhepResult",
    "GetListChamCongUseCase",
    "GetChamCongThangQuery",
    "GetChamCongThangResult",
    "GetChamCongDetailUseCase",
    "GetChamCongThangDetailQuery",
    "GetChamCongThangDetailResult",
    "MockGenerateChamCongUseCase",
    "MockGenerateChamCongCommand",
    "MockGenerateChamCongResult",
    "UpdateChamCongThangUseCase",
    "UpdateChamCongThangCommand",
    "UpdateChamCongThangResult",
    "XacNhanChamCongUseCase",
    "XacNhanChamCongCommand",
    "XacNhanChamCongResult",
    "DuyetChamCongUseCase",
    "DuyetChamCongCommand",
    "DuyetChamCongResult",
    "ChotChamCongUseCase",
    "ChotChamCongCommand",
    "ChotChamCongResult",
    "NghiPhepUseCase",
    "ChamCongUseCase",
]
