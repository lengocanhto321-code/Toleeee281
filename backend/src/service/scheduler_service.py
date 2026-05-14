"""
Scheduler Service - APScheduler integration for auto QR generation.
"""

import logging
from datetime import date, datetime, time

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.cron import CronTrigger

from src.service.qr_attendance_service import QRAttendanceService, generate_pin
from src.service.nghi_phep_service import NghiPhepService
from src.domain.models.qr_config import QRConfig
from src.domain.models.lich_cham_cong import LichChamCong
from src.domain.models.check_in_out import CheckInOut
from src.api.depends import session_factory
from src.constants.nghi_phep_constants import LOAI_NGHI

logger = logging.getLogger(__name__)


class SchedulerService:
    _instance = None

    def __init__(self):
        self._scheduler: AsyncIOScheduler | None = None
        self._config: LichChamCong | None = None

    @classmethod
    def get_instance(cls) -> "SchedulerService":
        if cls._instance is None:
            cls._instance = SchedulerService()
        return cls._instance

    async def start(self):
        if self._scheduler and self._scheduler.running:
            return

        from config import config

        jobstores = {
            "default": SQLAlchemyJobStore(
                url=config.DB_URI.replace("postgresql+asyncpg://", "postgresql://"),
                tablename="apscheduler_jobs",
            )
        }

        self._scheduler = AsyncIOScheduler(jobstores=jobstores)
        self._scheduler.start()
        logger.info("APScheduler started")

        await self._load_config_and_register_jobs()

    async def stop(self):
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("APScheduler stopped")

    async def _load_config_and_register_jobs(self):
        from src.service.unit_of_work import UnitOfWork

        uow = UnitOfWork(session_factory)
        async with uow as ctx:
            config = await ctx.lich_cham_cong_repository.find_active()

        if config and config.trang_thai == "active":
            self._config = config
            self._register_jobs(config)
            logger.info(
                f"Scheduler jobs registered: check-in at {config.gio_check_in}, "
                f"check-out at {config.gio_check_out}"
            )
        else:
            logger.info("No active schedule config found. Scheduler idle.")

    def _register_jobs(self, config: LichChamCong):
        self._remove_all_jobs()

        working_days = config.ngay_lam_viec

        hour_in = config.gio_check_in.hour
        minute_in = config.gio_check_in.minute

        self._scheduler.add_job(
            _generate_qr_job,
            CronTrigger(
                day_of_week=working_days,
                hour=hour_in,
                minute=minute_in,
            ),
            id="auto_qr_check_in",
            name="Auto QR Check-In",
            replace_existing=True,
            kwargs={"loai": "check_in", "config_id": config.id},
        )

        hour_out = config.gio_check_out.hour
        minute_out = config.gio_check_out.minute

        self._scheduler.add_job(
            _generate_qr_job,
            CronTrigger(
                day_of_week=working_days,
                hour=hour_out,
                minute=minute_out,
            ),
            id="auto_qr_check_out",
            name="Auto QR Check-Out",
            replace_existing=True,
            kwargs={"loai": "check_out", "config_id": config.id},
        )

        self._scheduler.add_job(
            _detect_absence_job,
            CronTrigger(
                day_of_week=working_days,
                hour=23,
                minute=59,
            ),
            id="auto_detect_absence",
            name="Auto Detect Absence",
            replace_existing=True,
        )

    def _remove_all_jobs(self):
        if self._scheduler:
            self._scheduler.remove_all_jobs()

    async def reload_config(self):
        await self._load_config_and_register_jobs()

    async def deactivate(self):
        self._remove_all_jobs()
        self._config = None
        logger.info("Scheduler jobs removed (deactivated)")


scheduler_service = SchedulerService.get_instance()


async def _generate_qr_job(loai: str, config_id: str):
    from src.service.unit_of_work import UnitOfWork

    today = date.today()
    logger.info(f"Auto QR job running: {loai} for {today}")

    try:
        uow = UnitOfWork(session_factory)
        async with uow as ctx:
            config = await ctx.lich_cham_cong_repository.find_by_id(config_id)
            if not config or config.trang_thai != "active":
                logger.info("Config not active, skipping")
                return

            holidays_service = NghiPhepService()
            holidays = holidays_service.get_holidays(today.year)
            holiday_dates = set(holidays)

            if today in holiday_dates:
                logger.info(f"Today {today} is a holiday, skipping")
                return

            existing_qrs = await ctx.qr_config_repository.find_by_ngay(today, loai=loai)
            active_qrs = [q for q in existing_qrs if q.trang_thai == "active"]
            if active_qrs:
                logger.info(f"QR {loai} already exists for {today}, skipping")
                return

            vi_tri = None
            if (
                config.bat_gps
                and config.kinh_do is not None
                and config.vi_do is not None
            ):
                vi_tri = {
                    "lat": config.kinh_do,
                    "lng": config.vi_do,
                    "name": config.ten_vi_tri,
                    "radius": config.ban_kinh_cho_phep,
                }

            gio_bat_dau = config.gio_check_in
            gio_ket_thuc = config.gio_check_out

            qr_payload = QRAttendanceService.generate_qr_payload(
                ngay=today,
                phong_ban_id=None,
                vi_tri=vi_tri,
                loai=loai,
            )

            thoi_gian_hieu_luc = datetime.combine(today, gio_ket_thuc)

            qr_config = QRConfig(
                ngay=today,
                loai=loai,
                qr_data=qr_payload,
                thoi_gian_hieu_luc=thoi_gian_hieu_luc,
                mac=qr_payload[:64] if len(qr_payload) >= 64 else qr_payload,
                gio_bat_dau=gio_bat_dau,
                gio_ket_thuc=gio_ket_thuc,
                vi_tri=config.ten_vi_tri,
                kinh_do=config.kinh_do,
                vi_do=config.vi_do,
                ban_kinh_cho_phep=config.ban_kinh_cho_phep,
                trang_thai="active",
                created_by=None,
                ma_nhap=generate_pin(),
            )

            await ctx.qr_config_repository.create(qr_config)
            logger.info(f"Auto QR {loai} created for {today}")

    except Exception as e:
        logger.error(f"Auto QR job failed: {e}", exc_info=True)


async def _detect_absence_job():
    from src.service.unit_of_work import UnitOfWork

    today = date.today()
    logger.info(f"Absence detection job running for {today}")

    try:
        uow = UnitOfWork(session_factory)
        async with uow as ctx:
            config = await ctx.lich_cham_cong_repository.find_active()
            if not config or config.trang_thai != "active":
                logger.info("No active schedule config, skipping absence detection")
                return

            holidays_service = NghiPhepService()
            holidays = holidays_service.get_holidays(today.year)
            if today in set(holidays):
                logger.info(f"Today {today} is a holiday, skipping")
                return

            nhan_vien_list = await ctx.nhan_vien_repository.find_dang_lam()

            records = await ctx.check_in_out_repository.get_by_date(today)
            present_ids = {r.nhan_vien_id for r in records}

            approved_leaves = (
                await ctx.don_xin_nghi_repository.find_all_approved_by_date(today)
            )
            leave_map: dict[str, str] = {}
            for don in approved_leaves:
                leave_map[don.nhan_vien_id] = don.loai_nghi

            co_phep_count = 0
            khong_phep_count = 0

            for nv in nhan_vien_list:
                nv_id = nv.id
                if nv_id in present_ids:
                    continue

                existing = await ctx.check_in_out_repository.find_today(nv_id, today)
                if existing and existing.trang_thai.startswith("vang_mat"):
                    continue

                if nv_id in leave_map:
                    loai = leave_map[nv_id]
                    ten_loai = LOAI_NGHI.get(loai, {}).get("ten", loai)
                    record = CheckInOut(
                        nhan_vien_id=nv_id,
                        ngay=today,
                        trang_thai="vang_mat_co_phep",
                        ghi_chu_vang=f"{ten_loai} (có phép)",
                    )
                    co_phep_count += 1
                else:
                    record = CheckInOut(
                        nhan_vien_id=nv_id,
                        ngay=today,
                        trang_thai="vang_mat_khong_phep",
                        ghi_chu_vang="Nghỉ không phép",
                    )
                    khong_phep_count += 1

                await ctx.check_in_out_repository.create(record)

        logger.info(
            f"Absence detection complete: {co_phep_count} co phep, "
            f"{khong_phep_count} khong phep, "
            f"total {co_phep_count + khong_phep_count}"
        )

    except Exception as e:
        logger.error(f"Absence detection job failed: {e}", exc_info=True)
