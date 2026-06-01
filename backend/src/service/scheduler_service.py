"""
Scheduler Service - APScheduler integration for auto OTP generation.
"""

import logging
from datetime import date, datetime, time

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.cron import CronTrigger

from src.service.qr_attendance_service import generate_pin
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

        from sqlalchemy import pool as sa_pool

        sync_uri = config.DB_URI.replace("postgresql+asyncpg://", "postgresql://")
        jobstores = {
            "default": SQLAlchemyJobStore(
                url=sync_uri,
                tablename="apscheduler_jobs",
                engine_options={
                    "pool_size": 3,
                    "max_overflow": 2,
                    "pool_pre_ping": True,
                    "pool_recycle": 1800,
                },
            )
        }

        self._scheduler = AsyncIOScheduler(jobstores=jobstores)
        self._scheduler.start()
        logger.info("APScheduler started")

        await self._load_config_and_register_jobs()

    async def stop(self):
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=True)
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
            name="Auto OTP Check-In",
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
            name="Auto OTP Check-Out",
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
    logger.info(f"Auto OTP job running: {loai} for {today}")

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
                logger.info(f"OTP {loai} already exists for {today}, skipping")
                return

            gio_bat_dau = config.gio_check_in
            gio_ket_thuc = config.gio_check_out

            thoi_gian_hieu_luc = datetime.combine(today, gio_ket_thuc)

            qr_config = QRConfig(
                ngay=today,
                loai=loai,
                qr_data="",
                thoi_gian_hieu_luc=thoi_gian_hieu_luc,
                mac="",
                gio_bat_dau=gio_bat_dau,
                gio_ket_thuc=gio_ket_thuc,
                trang_thai="active",
                created_by=None,
                ma_nhap=generate_pin(),
                bat_gps=False,
            )

            await ctx.qr_config_repository.create(qr_config)
            logger.info(f"Auto OTP {loai} created for {today}")

    except Exception as e:
        logger.error(f"Auto OTP job failed: {e}", exc_info=True)


async def _detect_absence_job():
    from src.service.unit_of_work import UnitOfWork

    today = date.today()
    logger.info(f"Absence detection job running for {today}")

    try:
        nhan_vien_list: list = []
        present_ids: set[str] = set()
        leave_map: dict[str, str] = {}

        uow_read = UnitOfWork(session_factory)
        async with uow_read as ctx:
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
            for don in approved_leaves:
                leave_map[don.nhan_vien_id] = don.loai_nghi

        records_to_create: list[CheckInOut] = []
        co_phep_count = 0
        khong_phep_count = 0

        for nv in nhan_vien_list:
            nv_id = nv.id
            if nv_id in present_ids:
                continue

            if nv_id in leave_map:
                loai = leave_map[nv_id]
                ten_loai = LOAI_NGHI.get(loai, {}).get("ten", loai)
                records_to_create.append(
                    CheckInOut(
                        nhan_vien_id=nv_id,
                        ngay=today,
                        trang_thai="vang_mat_co_phep",
                        ghi_chu_vang=f"{ten_loai} (có phép)",
                    )
                )
                co_phep_count += 1
            else:
                records_to_create.append(
                    CheckInOut(
                        nhan_vien_id=nv_id,
                        ngay=today,
                        trang_thai="vang_mat_khong_phep",
                        ghi_chu_vang="Nghỉ không phép",
                    )
                )
                khong_phep_count += 1

        if records_to_create:
            uow_write = UnitOfWork(session_factory)
            async with uow_write as ctx:
                for record in records_to_create:
                    existing = await ctx.check_in_out_repository.find_today(
                        record.nhan_vien_id, today
                    )
                    if existing and existing.trang_thai.startswith("vang_mat"):
                        continue
                    await ctx.check_in_out_repository.create(record)

        logger.info(
            f"Absence detection complete: {co_phep_count} co phep, "
            f"{khong_phep_count} khong phep, "
            f"total {co_phep_count + khong_phep_count}"
        )

    except Exception as e:
        logger.error(f"Absence detection job failed: {e}", exc_info=True)
