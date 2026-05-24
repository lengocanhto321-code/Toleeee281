from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from src.repository.user_repository import UserRepository
from src.repository.phong_ban_repository import PhongBanRepository
from src.repository.nhan_vien_repository import NhanVienRepository
from src.repository.chuc_vu_repository import ChucVuRepository
from src.repository.audit_log_repository import AuditLogRepository
from src.repository.luong_repository import (
    LuongRepository,
    ChamCongRepository,
    CauHinhLuongRepository,
)
from src.repository.tra_luong_repository import KyLuongRepository, TraLuongRepository
from src.repository.don_xin_nghi_repository import DonXinNghiRepository
from src.repository.so_ngay_phep_repository import SoNgayPhepRepository
from src.repository.cham_cong_thang_repository import ChamCongThangRepository
from src.repository.rbac_repository import RBACRepository
from src.repository.sub_module_repository import (
    NguoiThanRepository,
    BangCapRepository,
    KhenThuongKyLuatRepository,
)
from src.repository.cong_tac_repository import CongTacRepository
from src.repository.lich_su_chuc_vu_repository import LichSuChucVuRepository
from src.repository.hop_dong_repository import HopDongRepository
from src.repository.qr_config_repository import QRConfigRepository
from src.repository.check_in_out_repository import CheckInOutRepository
from src.repository.bao_cao_repository import BaoCaoRepository
from src.repository.cau_hinh_nghi_phep_repository import CauHinhNghiPhepRepository
from src.repository.lich_cham_cong_repository import LichChamCongRepository


class UnitOfWork:
    """
    Unit of Work pattern for managing database transactions and repositories.

    This class ensures that all repository operations are executed within
    a single transaction, providing consistency and atomicity.
    """

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self._session_factory = session_factory
        self._session: AsyncSession | None = None
        self.user_repository: UserRepository
        self.phong_ban_repository: PhongBanRepository
        self.nhan_vien_repository: NhanVienRepository
        self.chuc_vu_repository: ChucVuRepository
        self.audit_log_repository: AuditLogRepository
        self.luong_repository: LuongRepository
        self.cham_cong_repository: ChamCongRepository
        self.cau_hinh_luong_repository: CauHinhLuongRepository
        self.ky_luong_repository: KyLuongRepository
        self.tra_luong_repository: TraLuongRepository
        self.don_xin_nghi_repository: DonXinNghiRepository
        self.so_ngay_phep_repository: SoNgayPhepRepository
        self.cham_cong_thang_repository: ChamCongThangRepository
        self.rbac_repository: RBACRepository
        self.nguoi_than_repository: NguoiThanRepository
        self.bang_cap_repository: BangCapRepository
        self.khen_thuong_ky_luat_repository: KhenThuongKyLuatRepository
        self.cong_tac_repository: CongTacRepository
        self.lich_su_chuc_vu_repository: LichSuChucVuRepository
        self.hop_dong_repository: HopDongRepository
        self.qr_config_repository: QRConfigRepository
        self.check_in_out_repository: CheckInOutRepository
        self.bao_cao_repository: BaoCaoRepository
        self.cau_hinh_nghi_phep_repository: CauHinhNghiPhepRepository
        self.lich_cham_cong_repository: LichChamCongRepository

    async def __aenter__(self):
        self._session = self._session_factory()
        self.user_repository = UserRepository(session=self._session)
        self.phong_ban_repository = PhongBanRepository(session=self._session)
        self.nhan_vien_repository = NhanVienRepository(session=self._session)
        self.chuc_vu_repository = ChucVuRepository(session=self._session)
        self.audit_log_repository = AuditLogRepository(session=self._session)
        self.luong_repository = LuongRepository(session=self._session)
        self.cham_cong_repository = ChamCongRepository(session=self._session)
        self.cau_hinh_luong_repository = CauHinhLuongRepository(session=self._session)
        self.ky_luong_repository = KyLuongRepository(session=self._session)
        self.tra_luong_repository = TraLuongRepository(session=self._session)
        self.don_xin_nghi_repository = DonXinNghiRepository(session=self._session)
        self.so_ngay_phep_repository = SoNgayPhepRepository(session=self._session)
        self.cham_cong_thang_repository = ChamCongThangRepository(session=self._session)
        self.rbac_repository = RBACRepository(session=self._session)
        self.nguoi_than_repository = NguoiThanRepository(session=self._session)
        self.bang_cap_repository = BangCapRepository(session=self._session)
        self.khen_thuong_ky_luat_repository = KhenThuongKyLuatRepository(
            session=self._session
        )
        self.cong_tac_repository = CongTacRepository(session=self._session)
        self.lich_su_chuc_vu_repository = LichSuChucVuRepository(session=self._session)
        self.hop_dong_repository = HopDongRepository(session=self._session)
        self.qr_config_repository = QRConfigRepository(session=self._session)
        self.check_in_out_repository = CheckInOutRepository(session=self._session)
        self.bao_cao_repository = BaoCaoRepository(session=self._session)
        self.cau_hinh_nghi_phep_repository = CauHinhNghiPhepRepository(
            session=self._session
        )
        self.lich_cham_cong_repository = LichChamCongRepository(session=self._session)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if self._session:
                if exc_type:
                    await self.rollback()
                else:
                    await self.commit()
        finally:
            if self._session:
                await self._session.close()
            self._session = None

    async def commit(self):
        """Commit the current transaction."""
        if self._session:
            await self._session.commit()

    async def flush(self):
        """Flush the current session."""
        if self._session:
            await self._session.flush()

    async def rollback(self):
        """Rollback the current transaction."""
        if self._session:
            await self._session.rollback()

    @property
    def session(self) -> AsyncSession:
        """Get the current database session."""
        if self._session is None:
            raise RuntimeError(
                "UnitOfWork is not active. Use 'async with' context manager."
            )
        return self._session
