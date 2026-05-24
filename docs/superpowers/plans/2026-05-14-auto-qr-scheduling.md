# Auto QR Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically generate QR check-in (7:00 AM) and check-out (5:00 PM) codes on working days (Mon-Sat), skipping Sundays and Vietnamese public holidays.

**Architecture:** APScheduler runs in-process with FastAPI, using PostgreSQL as jobstore. A singleton config table (`lich_cham_cong`) stores schedule settings. On startup, the scheduler reads config and registers cron jobs. Admin can manage config via API, which dynamically updates scheduler jobs.

**Tech Stack:** Python APScheduler 3.10, FastAPI lifespan events, SQLAlchemy async, existing QRAttendanceService

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `backend/src/domain/models/lich_cham_cong.py` | SQLAlchemy model for schedule config |
| Create | `backend/src/repository/lich_cham_cong_repository.py` | Data access for schedule config |
| Create | `backend/src/service/scheduler_service.py` | APScheduler init, job registration, job execution |
| Create | `backend/src/api/routes/quan_ly/lich_cham_cong.py` | Admin API endpoints for schedule config |
| Modify | `backend/src/domain/models/__init__.py` | Export new model |
| Modify | `backend/src/repository/__init__.py` or `backend/src/service/unit_of_work.py` | Add new repository to UoW |
| Modify | `backend/src/api/routes/quan_ly/__init__.py` | Register new router |
| Modify | `backend/src/api/routes/__init__.py` | Include new router in main router |
| Modify | `backend/src/api/app.py` | Add lifespan events for scheduler start/stop |
| Create | Alembic migration | Add `lich_cham_cong` table |
| Create | `frontend/src/types/lich-cham-cong.types.ts` | TypeScript types |
| Modify | `frontend/src/types/api.types.ts` | Add API endpoint constants |
| Create | `frontend/src/hooks/lich-cham-cong/` | TanStack Query hooks |
| Create | `frontend/src/components/forms/lich-cham-cong/` | Schedule config form component |
| Modify | `frontend/src/app/(admin)/cham-cong/page.tsx` | Add schedule config section |

---

### Task 1: Install APScheduler dependency

**Files:**
- Modify: `backend/pyproject.toml`

- [ ] **Step 1: Add apscheduler to dependencies**

Add `apscheduler~=3.10` to the dependencies list in `backend/pyproject.toml`.

- [ ] **Step 2: Install the dependency**

Run: `cd /mnt/newhome/code/hr_management/backend && pip install apscheduler~=3.10`

- [ ] **Step 3: Commit**

```bash
git add backend/pyproject.toml
git commit -m "chore: add apscheduler dependency for auto QR scheduling"
```

---

### Task 2: Create LichChamCong SQLAlchemy model

**Files:**
- Create: `backend/src/domain/models/lich_cham_cong.py`
- Modify: `backend/src/domain/models/__init__.py`

- [ ] **Step 1: Create the model file**

Create `backend/src/domain/models/lich_cham_cong.py`:

```python
from datetime import datetime

from sqlalchemy import Column, String, Time, Float, Integer, Boolean, DateTime, Text

from .base import Base, generate_uuid


class LichChamCong(Base):
    """Cấu hình lịch tự động tạo QR chấm công."""

    __tablename__ = "lich_cham_cong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    gio_check_in = Column(
        Time, nullable=False, default=datetime.strptime("07:00", "%H:%M").time()
    )
    gio_check_out = Column(
        Time, nullable=False, default=datetime.strptime("17:00", "%H:%M").time()
    )
    ngay_lam_viec = Column(
        String(20), nullable=False, default="0,1,2,3,4,5"
    )
    bat_gps = Column(Boolean, nullable=False, default=False)
    kinh_do = Column(Float, nullable=True)
    vi_do = Column(Float, nullable=True)
    ten_vi_tri = Column(String(100), nullable=True)
    ban_kinh_cho_phep = Column(Integer, default=100)
    trang_thai = Column(String(20), nullable=False, default="active")
    created_by = Column(String(32), ForeignKey("tai_khoan.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
```

Wait — need to import ForeignKey:

```python
from sqlalchemy import Column, String, Time, Float, Integer, Boolean, DateTime, Text, ForeignKey
```

- [ ] **Step 2: Register in models `__init__.py`**

Add to `backend/src/domain/models/__init__.py`:

After the line `from .cau_hinh_nghi_phep import CauHinhNghiPhep`, add:
```python
from .lich_cham_cong import LichChamCong
```

Add `"LichChamCong"` to `__all__`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/domain/models/lich_cham_cong.py backend/src/domain/models/__init__.py
git commit -m "feat: add LichChamCong model for auto QR schedule config"
```

---

### Task 3: Create LichChamCong repository

**Files:**
- Create: `backend/src/repository/lich_cham_cong_repository.py`

- [ ] **Step 1: Create the repository**

Create `backend/src/repository/lich_cham_cong_repository.py`:

```python
from typing import Optional
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.lich_cham_cong import LichChamCong


class LichChamCongRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, config: LichChamCong) -> LichChamCong:
        self._session.add(config)
        await self._session.flush()
        await self._session.refresh(config)
        return config

    async def find_by_id(self, id: str) -> Optional[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong).where(LichChamCong.id == id)
        )
        return result.scalar_one_or_none()

    async def find_active(self) -> Optional[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong)
            .where(LichChamCong.trang_thai == "active")
            .order_by(LichChamCong.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def find_all(self) -> list[LichChamCong]:
        result = await self._session.execute(
            select(LichChamCong).order_by(LichChamCong.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, config: LichChamCong) -> LichChamCong:
        await self._session.flush()
        await self._session.refresh(config)
        return config

    async def delete(self, id: str) -> bool:
        config = await self.find_by_id(id)
        if config:
            await self._session.delete(config)
            await self._session.flush()
            return True
        return False
```

- [ ] **Step 2: Register in UnitOfWork**

Modify `backend/src/service/unit_of_work.py`:

Add import at top:
```python
from src.repository.lich_cham_cong_repository import LichChamCongRepository
```

Add type annotation in `__init__`:
```python
self.lich_cham_cong_repository: LichChamCongRepository
```

Add initialization in `__aenter__`:
```python
self.lich_cham_cong_repository = LichChamCongRepository(session=self._session)
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/repository/lich_cham_cong_repository.py backend/src/service/unit_of_work.py
git commit -m "feat: add LichChamCong repository and register in UnitOfWork"
```

---

### Task 4: Create Alembic migration for lich_cham_cong table

**Files:**
- Create: `backend/migration/versions/xxxx_add_lich_cham_cong_table.py`

- [ ] **Step 1: Generate migration**

Run: `cd /mnt/newhome/code/hr_management/backend && alembic revision --autogenerate -m "add_lich_cham_cong_table"`

- [ ] **Step 2: Verify migration file** 

Open the generated migration file and verify it creates the `lich_cham_cong` table with all columns matching the model. Fix if needed.

- [ ] **Step 3: Run migration**

Run: `cd /mnt/newhome/code/hr_management/backend && alembic upgrade head`

- [ ] **Step 4: Commit**

```bash
git add backend/migration/versions/
git commit -m "migration: add lich_cham_cong table"
```

---

### Task 5: Create Scheduler Service

**Files:**
- Create: `backend/src/service/scheduler_service.py`

This is the core service that manages APScheduler lifecycle and job execution.

- [ ] **Step 1: Create the scheduler service**

Create `backend/src/service/scheduler_service.py`:

```python
"""
Scheduler Service - APScheduler integration for auto QR generation.
"""

import logging
from datetime import date, datetime, time

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.cron import CronTrigger

from src.service.qr_attendance_service import QRAttendanceService
from src.service.nghi_phep_service import NghiPhepService
from src.domain.models.qr_config import QRConfig
from src.domain.models.lich_cham_cong import LichChamCong
from src.api.depends import session_factory

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
        """Start the scheduler and register jobs from active config."""
        if self._scheduler and self._scheduler.running:
            return

        jobstores = {
            "default": SQLAlchemyJobStore(
                url=self._get_sync_db_url(),
                tablename="apscheduler_jobs",
            )
        }

        self._scheduler = AsyncIOScheduler(jobstores=jobstores)
        self._scheduler.start()
        logger.info("APScheduler started")

        await self._load_config_and_register_jobs()

    async def stop(self):
        """Stop the scheduler gracefully."""
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("APScheduler stopped")

    def _get_sync_db_url(self) -> str:
        """Convert async DB URI to sync for APScheduler jobstore."""
        from config import config

        return config.DB_URI.replace("postgresql+asyncpg://", "postgresql://")

    async def _load_config_and_register_jobs(self):
        """Load active config from DB and register cron jobs."""
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
        """Register check-in and check-out cron jobs."""
        self._remove_all_jobs()

        working_days = config.ngay_lam_viec

        gio_check_in = config.gio_check_in
        hour_in = gio_check_in.hour
        minute_in = gio_check_in.minute

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

        gio_check_out = config.gio_check_out
        hour_out = gio_check_out.hour
        minute_out = gio_check_out.minute

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

    def _remove_all_jobs(self):
        """Remove all scheduler jobs."""
        if self._scheduler:
            self._scheduler.remove_all_jobs()

    async def reload_config(self):
        """Reload config and re-register jobs (called when config changes)."""
        await self._load_config_and_register_jobs()

    async def deactivate(self):
        """Remove all jobs (when config is deactivated)."""
        self._remove_all_jobs()
        self._config = None
        logger.info("Scheduler jobs removed (deactivated)")


scheduler_service = SchedulerService.get_instance()


async def _generate_qr_job(loai: str, config_id: str):
    """
    Job function executed by APScheduler.
    Generates a QR code for today if it's a working day and QR doesn't exist yet.
    """
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
            holiday_dates = {h for h in holidays}

            if today in holiday_dates:
                logger.info(f"Today {today} is a holiday, skipping")
                return

            existing_qrs = await ctx.qr_config_repository.find_by_ngay(today, loai=loai)
            active_qrs = [q for q in existing_qrs if q.trang_thai == "active"]
            if active_qrs:
                logger.info(f"QR {loai} already exists for {today}, skipping")
                return

            vi_tri = None
            if config.bat_gps and config.kinh_do is not None and config.vi_do is not None:
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
            )

            await ctx.qr_config_repository.create(qr_config)
            logger.info(f"Auto QR {loai} created for {today}")

    except Exception as e:
        logger.error(f"Auto QR job failed: {e}", exc_info=True)
```

Key notes:
- `day_of_week` in APScheduler CronTrigger uses mon=0, tue=1, ..., sun=6 (same as Python's `weekday()`)
- The `_generate_qr_job` function is a standalone async function, not a method — APScheduler needs this
- It checks Vietnamese holidays via `NghiPhepService.get_holidays()`
- It checks for existing QRs to be idempotent
- It uses `session_factory` from `depends.py` to create its own UnitOfWork

- [ ] **Step 2: Commit**

```bash
git add backend/src/service/scheduler_service.py
git commit -m "feat: add SchedulerService with APScheduler integration"
```

---

### Task 6: Add FastAPI lifespan events for scheduler

**Files:**
- Modify: `backend/src/api/app.py`

- [ ] **Step 1: Add lifespan to `create_app`**

Modify `backend/src/api/app.py`. Replace the `create_app` function to add a lifespan context manager:

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    from src.service.scheduler_service import scheduler_service
    await scheduler_service.start()
    logger.info("Application startup complete - Scheduler active")
    yield
    await scheduler_service.stop()
    logger.info("Application shutdown complete - Scheduler stopped")
```

Then pass `lifespan=lifespan` to the `FastAPI(...)` constructor:

```python
app = FastAPI(
    title="HR Management API",
    version="0.1.0",
    description="API for HR management system",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)
```

Note: `lifespan` must be defined before `create_app` and it receives `config` via closure or the app instance. Since we need `config` in the lifespan, we can access it from the app state or just define it inside `create_app`:

```python
def create_app(config_app: ApplicationConfig) -> FastAPI:
    config = config_app

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        from src.service.scheduler_service import scheduler_service
        await scheduler_service.start()
        logger.info("Application startup complete")
        yield
        await scheduler_service.stop()
        logger.info("Application shutdown complete")

    app = FastAPI(
        title="HR Management API",
        version="0.1.0",
        description="API for HR management system",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )
    # ... rest of the function stays the same
```

Add the import at the top: `from contextlib import asynccontextmanager`

- [ ] **Step 2: Commit**

```bash
git add backend/src/api/app.py
git commit -m "feat: add FastAPI lifespan for scheduler startup/shutdown"
```

---

### Task 7: Create Admin API endpoints for schedule config

**Files:**
- Create: `backend/src/api/routes/quan_ly/lich_cham_cong.py`
- Modify: `backend/src/api/routes/quan_ly/__init__.py`
- Modify: `backend/src/api/routes/__init__.py`

- [ ] **Step 1: Create the route file**

Create `backend/src/api/routes/quan_ly/lich_cham_cong.py`:

```python
"""
Admin Schedule Config API - Quản lý cấu hình lịch tự động tạo QR
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.api.schemas.common import APIResponse
from src.domain.models.lich_cham_cong import LichChamCong
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


class ViTriRequest(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None
    radius: int = 100


class CreateLichChamCongRequest(BaseModel):
    gio_check_in: str = "07:00"
    gio_check_out: str = "17:00"
    ngay_lam_viec: str = "0,1,2,3,4,5"
    bat_gps: bool = False
    vi_tri: Optional[ViTriRequest] = None


class UpdateTrangThaiRequest(BaseModel):
    trang_thai: str


@router.get("/lich", response_model=APIResponse[dict])
async def get_lich_cham_cong(
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy cấu hình lịch chấm công hiện tại."""
    async with uow as ctx:
        config = await ctx.lich_cham_cong_repository.find_active()

    if not config:
        return APIResponse(message="Chưa có cấu hình lịch", data=None)

    return APIResponse(
        message="Lấy cấu hình lịch thành công",
        data=_config_to_dict(config),
    )


@router.post("/lich", response_model=APIResponse[dict])
async def create_or_update_lich_cham_cong(
    body: CreateLichChamCongRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Tạo hoặc cập nhật cấu hình lịch chấm công."""
    from src.service.scheduler_service import scheduler_service

    async with uow as ctx:
        existing = await ctx.lich_cham_cong_repository.find_active()
        if existing:
            existing.trang_thai = "inactive"
            await ctx.lich_cham_cong_repository.update(existing)

        gio_check_in = datetime.strptime(body.gio_check_in, "%H:%M").time()
        gio_check_out = datetime.strptime(body.gio_check_out, "%H:%M").time()

        config = LichChamCong(
            gio_check_in=gio_check_in,
            gio_check_out=gio_check_out,
            ngay_lam_viec=body.ngay_lam_viec,
            bat_gps=body.bat_gps,
            kinh_do=body.vi_tri.lat if body.vi_tri else None,
            vi_do=body.vi_tri.lng if body.vi_tri else None,
            ten_vi_tri=body.vi_tri.name if body.vi_tri else None,
            ban_kinh_cho_phep=body.vi_tri.radius if body.vi_tri else 100,
            trang_thai="active",
            created_by=current_user.user_id,
        )

        created = await ctx.lich_cham_cong_repository.create(config)

    await scheduler_service.reload_config()

    return APIResponse(
        message="Cấu hình lịch đã được lưu",
        data=_config_to_dict(created),
    )


@router.patch("/lich/{config_id}/trang-thai", response_model=APIResponse[dict])
async def toggle_lich_cham_cong(
    config_id: str,
    body: UpdateTrangThaiRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Bật/tắt cấu hình lịch."""
    from src.service.scheduler_service import scheduler_service

    async with uow as ctx:
        config = await ctx.lich_cham_cong_repository.find_by_id(config_id)
        if not config:
            raise ClientError(
                base_error=None,
                status_code=404,
                code="not_found",
                message="Không tìm thấy cấu hình lịch",
            )

        config.trang_thai = body.trang_thai
        await ctx.lich_cham_cong_repository.update(config)

    if body.trang_thai == "active":
        await scheduler_service.reload_config()
    else:
        await scheduler_service.deactivate()

    return APIResponse(
        message=f"Đã {'bật' if body.trang_thai == 'active' else 'tắt'} lịch tự động",
        data=_config_to_dict(config),
    )


def _config_to_dict(config: LichChamCong) -> dict:
    return {
        "id": config.id,
        "gio_check_in": config.gio_check_in.strftime("%H:%M") if config.gio_check_in else None,
        "gio_check_out": config.gio_check_out.strftime("%H:%M") if config.gio_check_out else None,
        "ngay_lam_viec": config.ngay_lam_viec,
        "bat_gps": config.bat_gps,
        "kinh_do": config.kinh_do,
        "vi_do": config.vi_do,
        "ten_vi_tri": config.ten_vi_tri,
        "ban_kinh_cho_phep": config.ban_kinh_cho_phep,
        "trang_thai": config.trang_thai,
        "created_by": config.created_by,
        "created_at": config.created_at.isoformat() if config.created_at else None,
        "updated_at": config.updated_at.isoformat() if config.updated_at else None,
    }
```

- [ ] **Step 2: Register in quan_ly `__init__.py`**

Modify `backend/src/api/routes/quan_ly/__init__.py`:

Add import:
```python
from .lich_cham_cong import router as lich_cham_cong_router
```

Add to `__all__`:
```python
"lich_cham_cong_router",
```

- [ ] **Step 3: Register in main routes `__init__.py`**

Modify `backend/src/api/routes/__init__.py`:

Add to the quan_ly imports:
```python
    lich_cham_cong_router,
```

Add router registration after the admin_cham_cong_router line:
```python
router.include_router(
    lich_cham_cong_router, prefix="/admin/cham-cong", tags=["Admin - Lich Cham Cong"]
)
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/api/routes/quan_ly/lich_cham_cong.py backend/src/api/routes/quan_ly/__init__.py backend/src/api/routes/__init__.py
git commit -m "feat: add admin API endpoints for schedule config CRUD"
```

---

### Task 8: Fix ClientError constructor compatibility

**Files:**
- Modify: `backend/src/api/error.py` (if needed)

The `ClientError` in the lich_cham_cong route is called with keyword args that may not match the existing constructor. Check `backend/src/api/error.py` and ensure the `ClientError` constructor accepts `code` and `message` parameters directly, or adjust the route code to match the existing pattern.

Look at how other routes use `ClientError` — they typically pass `base_error=error, status_code=400`. If `base_error` expects an `Error` object with `.code` and `.message`, create one:

```python
from libs.result import Error

error = Error(code="not_found", message="Không tìm thấy cấu hình lịch")
raise ClientError(base_error=error, status_code=404)
```

Adjust the route code accordingly.

- [ ] **Step 1: Read error.py, verify constructor, adjust route if needed**
- [ ] **Step 2: Commit if changes were made**

---

### Task 9: Frontend - TypeScript types and API endpoints

**Files:**
- Create: `frontend/src/types/lich-cham-cong.types.ts`
- Modify: `frontend/src/types/api.types.ts`
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: Create types file**

Create `frontend/src/types/lich-cham-cong.types.ts`:

```typescript
export interface LichChamCong {
  id: string
  gio_check_in: string
  gio_check_out: string
  ngay_lam_viec: string
  bat_gps: boolean
  kinh_do: number | null
  vi_do: number | null
  ten_vi_tri: string | null
  ban_kinh_cho_phep: number
  trang_thai: "active" | "inactive"
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateLichChamCongData {
  gio_check_in: string
  gio_check_out: string
  ngay_lam_viec: string
  bat_gps: boolean
  vi_tri?: {
    lat: number
    lng: number
    name?: string
    radius: number
  }
}

export interface ToggleLichChamCongData {
  trang_thai: "active" | "inactive"
}
```

- [ ] **Step 2: Add API endpoints**

Add to `frontend/src/types/api.types.ts` in the appropriate section:

```typescript
ADMIN_CHAM_CONG_LICH: "/api/v1/admin/cham-cong/lich",
ADMIN_CHAM_CONG_LICH_TOGGLE: (id: string) => `/api/v1/admin/cham-cong/lich/${id}/trang-thai`,
```

- [ ] **Step 3: Export from index**

Add to `frontend/src/types/index.ts`:
```typescript
export * from "./lich-cham-cong.types";
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/lich-cham-cong.types.ts frontend/src/types/api.types.ts frontend/src/types/index.ts
git commit -m "feat: add TypeScript types and API endpoints for schedule config"
```

---

### Task 10: Frontend - TanStack Query hooks

**Files:**
- Create: `frontend/src/hooks/lich-cham-cong/index.ts`
- Create: `frontend/src/hooks/lich-cham-cong/use-lich-cham-cong.ts`
- Modify: `frontend/src/hooks/index.ts`

- [ ] **Step 1: Create hooks**

Create `frontend/src/hooks/lich-cham-cong/use-lich-cham-cong.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastSuccess, toastError } from "@/lib/utils"
import type { LichChamCong, CreateLichChamCongData, ToggleLichChamCongData } from "@/types/lich-cham-cong.types"

export const lichChamCongKeys = {
  all: ["lich-cham-cong"] as const,
  config: () => [...lichChamCongKeys.all, "config"] as const,
}

export function useLichChamCong() {
  return useQuery({
    queryKey: lichChamCongKeys.config(),
    queryFn: () => apiGateway.get<LichChamCong | null>(ApiEndpoints.ADMIN_CHAM_CONG_LICH),
  })
}

export function useCreateLichChamCong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLichChamCongData) =>
      apiGateway.post<LichChamCong>(ApiEndpoints.ADMIN_CHAM_CONG_LICH, data),
    onSuccess: () => {
      toastSuccess("Thành công", "Đã lưu cấu hình lịch chấm công")
      queryClient.invalidateQueries({ queryKey: lichChamCongKeys.all })
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Lưu cấu hình thất bại"
      toastError("Lỗi", message)
    },
  })
}

export function useToggleLichChamCong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleLichChamCongData }) =>
      apiGateway.patch<LichChamCong>(ApiEndpoints.ADMIN_CHAM_CONG_LICH_TOGGLE(id), data),
    onSuccess: (_, variables) => {
      const action = variables.data.trang_thai === "active" ? "bật" : "tắt"
      toastSuccess("Thành công", `Đã ${action} lịch tự động`)
      queryClient.invalidateQueries({ queryKey: lichChamCongKeys.all })
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thao tác thất bại"
      toastError("Lỗi", message)
    },
  })
}
```

- [ ] **Step 2: Create barrel export**

Create `frontend/src/hooks/lich-cham-cong/index.ts`:

```typescript
export * from "./use-lich-cham-cong"
```

- [ ] **Step 3: Export from hooks index**

Add to `frontend/src/hooks/index.ts`:
```typescript
export * from "./lich-cham-cong"
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/lich-cham-cong/ frontend/src/hooks/index.ts
git commit -m "feat: add TanStack Query hooks for schedule config"
```

---

### Task 11: Frontend - Schedule config component

**Files:**
- Create: `frontend/src/components/forms/lich-cham-cong/lich-cham-cong-config.tsx`
- Create: `frontend/src/components/forms/lich-cham-cong/index.ts`

This is a form component for configuring the schedule. It should follow the existing shadcn/ui patterns used in the project.

- [ ] **Step 1: Create the config form component**

Create `frontend/src/components/forms/lich-cham-cong/lich-cham-cong-config.tsx`:

A form component with:
- Two time inputs (gio_check_in, gio_check_out) — use standard `<input type="time">` styled with shadcn
- Checkbox group for working days (T2-T7, default T2-T7 checked, CN disabled/unchecked)
- Switch toggle for GPS + conditional location inputs (lat, lng, name, radius)
- Save button
- A status indicator showing if scheduler is active/inactive
- A toggle switch to enable/disable the scheduler (uses the PATCH toggle endpoint)

The component should use `useLichChamCong()` to load existing config, `useCreateLichChamCong()` to save, and `useToggleLichChamCong()` to toggle.

Map weekday numbers (0=Mon...6=Sun) to Vietnamese labels: T2, T3, T4, T5, T6, T7, CN.

Default values:
- gio_check_in: "07:00"
- gio_check_out: "17:00"
- ngay_lam_viec: "0,1,2,3,4,5" (Mon-Sat)
- bat_gps: false

- [ ] **Step 2: Create barrel export**

Create `frontend/src/components/forms/lich-cham-cong/index.ts`:

```typescript
export * from "./lich-cham-cong-config"
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/forms/lich-cham-cong/
git commit -m "feat: add schedule config form component"
```

---

### Task 12: Frontend - Integrate schedule config into admin cham-cong page

**Files:**
- Modify: `frontend/src/app/(admin)/cham-cong/page.tsx`

- [ ] **Step 1: Add schedule config section to the page**

In the admin cham-cong page, add the `LichChamCongConfig` component. Place it between the stats cards and the data table, or as a collapsible section above the table. Use a Card component to wrap it.

Add a section header: "Lịch tự động tạo QR"

Import:
```typescript
import { LichChamCongConfig } from "@/components/forms/lich-cham-cong"
```

Add the component in the JSX:
```tsx
<div className="mt-6 mb-6">
  <LichChamCongConfig />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/(admin)/cham-cong/page.tsx
git commit -m "feat: integrate schedule config into admin cham-cong page"
```

---

### Task 13: Backend - Add NghiPhepService holiday check to existing bulk QR generation

**Files:**
- Modify: `backend/src/app/usecases/cham_cong/bulk_generate_qr_uc.py`

This is a bonus improvement: the existing bulk QR generation only skips weekends. Enhance it to also skip Vietnamese holidays.

- [ ] **Step 1: Read the existing bulk generate use case**
- [ ] **Step 2: Add holiday check**

In the loop that iterates dates, after the weekend check, add a holiday check:

```python
from src.service.nghi_phep_service import NghiPhepService

holidays_service = NghiPhepService()
holidays = holidays_service.get_holidays(nam)
holiday_dates = set(holidays)

# In the loop:
if current_date in holiday_dates:
    result.skipped += 1
    continue
```

Note: `get_holidays(year)` returns a list of `date` objects. Need to verify the exact return type by reading `nghi_phep_service.py`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/app/usecases/cham_cong/bulk_generate_qr_uc.py
git commit -m "fix: skip Vietnamese holidays in bulk QR generation"
```

---

### Task 14: Verify and test

- [ ] **Step 1: Start the backend server**

Run: `cd /mnt/newhome/code/hr_management/backend && python -m uvicorn main:app --reload`

Check console for "APScheduler started" and "Scheduler jobs registered" messages.

- [ ] **Step 2: Test the API endpoints**

Using curl or the FastAPI docs at `/docs`:
1. `POST /api/v1/admin/cham-cong/lich` — Create schedule config
2. `GET /api/v1/admin/cham-cong/lich` — Get config
3. `PATCH /api/v1/admin/cham-cong/lich/{id}/trang-thai` — Toggle active/inactive

- [ ] **Step 3: Test frontend**

Navigate to admin cham-cong page, verify the schedule config form renders and can save.

- [ ] **Step 4: Final commit if any fixes needed**
