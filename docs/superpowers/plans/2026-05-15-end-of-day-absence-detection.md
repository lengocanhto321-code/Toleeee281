# End-of-Day Absence Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an APScheduler job running at 23:59 on working days that detects absent employees, records them in `CheckInOut` with `vang_mat_co_phep`/`vang_mat_khong_phep` status, and provides an admin API + UI to view the absence list.

**Architecture:** Extend `CheckInOut` model with a `ghi_chu_vang` column and new `trang_thai` values. Add a scheduled job to `SchedulerService` that cross-references active employees with approved leave requests. Provide a paginated API endpoint and a new tab in the admin ChamCong page.

**Tech Stack:** Python/FastAPI, SQLAlchemy async, APScheduler, React/TypeScript, shadcn/ui, @tanstack/react-query

---

### Task 1: Add `ghi_chu_vang` column to CheckInOut model

**Files:**
- Modify: `backend/src/domain/models/check_in_out.py`

- [ ] **Step 1: Add the column to the model**

In `backend/src/domain/models/check_in_out.py`, add a `Text` import and the new column after `trang_thai`:

```python
from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    DateTime,
    Float,
    ForeignKey,
    UniqueConstraint,
)
```

Add after the `trang_thai` column (line 41):

```python
    ghi_chu_vang = Column(Text, nullable=True)
```

Also update the `to_dict` method to include the new field:

```python
    def to_dict(self):
        return {
            "id": self.id,
            "nhan_vien_id": self.nhan_vien_id,
            "ngay": self.ngay.isoformat() if self.ngay else None,
            "check_in_time": serialize_dt(self.check_in_time),
            "check_in_qr_id": self.check_in_qr_id,
            "check_in_lat": self.check_in_lat,
            "check_in_lng": self.check_in_lng,
            "check_in_status": self.check_in_status,
            "check_out_time": serialize_dt(self.check_out_time),
            "check_out_qr_id": self.check_out_qr_id,
            "check_out_lat": self.check_out_lat,
            "check_out_lng": self.check_out_lng,
            "trang_thai": self.trang_thai,
            "ghi_chu_vang": self.ghi_chu_vang,
            "created_at": serialize_dt(self.created_at),
        }
```

- [ ] **Step 2: Create Alembic migration**

Run from `backend/`:
```bash
cd backend && alembic revision --autogenerate -m "add ghi_chu_vang to check_in_out"
```

Then apply:
```bash
cd backend && alembic upgrade head
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/domain/models/check_in_out.py backend/alembic/versions/
git commit -m "feat: add ghi_chu_vang column to CheckInOut model"
```

---

### Task 2: Add absence detection scheduled job

**Files:**
- Modify: `backend/src/service/scheduler_service.py`

- [ ] **Step 1: Add the `_detect_absence_job` function and register it**

In `backend/src/service/scheduler_service.py`, add the job function after `_generate_qr_job` (after line 202). The function needs access to the same `session_factory` and uses UoW pattern.

Add import at top of file (after existing imports):
```python
from src.constants.nghi_phep_constants import LOAI_NGHI
```

Add after `_generate_qr_job` function:

```python
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

            approved_leaves = await ctx.don_xin_nghi_repository.find_all_approved_by_date(today)
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
```

**Important note:** `find_by_date_range` in `DonXinNghiRepository` requires `nhan_vien_id`. We need to add a method that gets all approved leaves for a date. Add a new method to `DonXinNghiRepository` (see Task 3).

- [ ] **Step 2: Register the job in `_register_jobs`**

In `_register_jobs`, after the check-out job (after line 110), add:

```python
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/service/scheduler_service.py
git commit -m "feat: add end-of-day absence detection scheduled job"
```

---

### Task 3: Add `find_all_approved_by_date` to DonXinNghiRepository

**Files:**
- Modify: `backend/src/repository/don_xin_nghi_repository.py`

- [ ] **Step 1: Add the method**

In `backend/src/repository/don_xin_nghi_repository.py`, add after the `find_overlapping` method (after line 137):

```python
    async def find_all_approved_by_date(self, target_date: date) -> List[DonXinNghi]:
        """Find all approved leave requests covering a specific date."""
        result = await self._session.execute(
            select(DonXinNghi).where(
                DonXinNghi.trang_thai == TRANG_THAI_DON_KEYS[1],
                DonXinNghi.tu_ngay <= target_date,
                DonXinNghi.den_ngay >= target_date,
            )
        )
        return list(result.scalars().all())
```

- [ ] **Step 2: Update scheduler job to use this method**

In Task 2's `_detect_absence_job`, replace the `find_by_date_range` call with:

```python
            approved_leaves = await ctx.don_xin_nghi_repository.find_all_approved_by_date(today)
            leave_map: dict[str, str] = {}
            for don in approved_leaves:
                leave_map[don.nhan_vien_id] = don.loai_nghi
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/repository/don_xin_nghi_repository.py backend/src/service/scheduler_service.py
git commit -m "feat: add find_all_approved_by_date to DonXinNghi repo"
```

---

### Task 4: Add `get_vang_mat_by_ngay` to CheckInOutRepository

**Files:**
- Modify: `backend/src/repository/check_in_out_repository.py`

- [ ] **Step 1: Add the method**

In `backend/src/repository/check_in_out_repository.py`, add after the `delete` method (after line 167):

```python
    async def get_vang_mat_by_ngay(
        self,
        ngay: date,
        phong_ban_id: Optional[str] = None,
        loai_vang: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[int, List[CheckInOut]]:
        from src.domain.models.nhan_vien import NhanVien

        statuses = ["vang_mat_co_phep", "vang_mat_khong_phep"]
        if loai_vang == "co_phep":
            statuses = ["vang_mat_co_phep"]
        elif loai_vang == "khong_phep":
            statuses = ["vang_mat_khong_phep"]

        query = (
            select(CheckInOut)
            .where(
                and_(
                    CheckInOut.ngay == ngay,
                    CheckInOut.trang_thai.in_(statuses),
                )
            )
        )
        count_query = select(func.count(CheckInOut.id)).where(
            and_(
                CheckInOut.ngay == ngay,
                CheckInOut.trang_thai.in_(statuses),
            )
        )

        if phong_ban_id:
            query = query.join(
                NhanVien, CheckInOut.nhan_vien_id == NhanVien.id
            ).where(NhanVien.phong_ban_id == phong_ban_id)
            count_query = count_query.join(
                NhanVien, CheckInOut.nhan_vien_id == NhanVien.id
            ).where(NhanVien.phong_ban_id == phong_ban_id)

        total_result = await self._session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(CheckInOut.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self._session.execute(query)
        items = list(result.scalars().all())

        return total, items

    async def count_vang_mat_by_ngay(self, ngay: date) -> dict:
        result = await self._session.execute(
            select(
                CheckInOut.trang_thai,
                func.count(CheckInOut.id),
            )
            .where(
                and_(
                    CheckInOut.ngay == ngay,
                    CheckInOut.trang_thai.in_(["vang_mat_co_phep", "vang_mat_khong_phep"]),
                )
            )
            .group_by(CheckInOut.trang_thai)
        )
        counts = {}
        for row in result:
            counts[row[0]] = row[1]
        return counts
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/repository/check_in_out_repository.py
git commit -m "feat: add vang_mat query methods to CheckInOut repo"
```

---

### Task 5: Create `GetDanhSachVangMat` use case

**Files:**
- Create: `backend/src/app/usecases/cham_cong/get_danh_sach_vang_mat_uc.py`
- Modify: `backend/src/app/usecases/cham_cong/__init__.py`

- [ ] **Step 1: Create the use case**

Create `backend/src/app/usecases/cham_cong/get_danh_sach_vang_mat_uc.py`:

```python
from dataclasses import dataclass
from datetime import date
from typing import Optional, List, Dict, Any

from libs.result import Result, Error, Return


@dataclass
class GetDanhSachVangMatQuery:
    ngay: date
    phong_ban_id: Optional[str] = None
    loai_vang: Optional[str] = None
    page: int = 1
    page_size: int = 20


@dataclass
class VangMatItem:
    record: Dict[str, Any]


@dataclass
class GetDanhSachVangMatResult:
    items: List[Dict[str, Any]]
    total: int
    stats: Dict[str, int]


class GetDanhSachVangMatUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetDanhSachVangMatQuery
    ) -> Result[GetDanhSachVangMatResult, Error]:
        async with self.unit_of_work as uow:
            total, records = await uow.check_in_out_repository.get_vang_mat_by_ngay(
                ngay=query.ngay,
                phong_ban_id=query.phong_ban_id,
                loai_vang=query.loai_vang,
                page=query.page,
                page_size=query.page_size,
            )

            counts = await uow.check_in_out_repository.count_vang_mat_by_ngay(query.ngay)

            nv_ids = list({r.nhan_vien_id for r in records})
            nv_map: Dict[str, Any] = {}
            if nv_ids:
                nhan_vien_list = await uow.nhan_vien_repository.find_dang_lam(
                    danh_sach_ids=nv_ids
                )
                for nv in nhan_vien_list:
                    nv_map[nv.id] = nv

            items = []
            for r in records:
                nv = nv_map.get(r.nhan_vien_id)
                ho_ten = nv.ho_ten if nv else "N/A"
                phong_ban_ten = nv.phong_ban.ten if nv and nv.phong_ban else ""
                items.append({
                    "id": r.id,
                    "nhan_vien_id": r.nhan_vien_id,
                    "nhan_vien_ho_ten": ho_ten,
                    "phong_ban": phong_ban_ten,
                    "ngay": r.ngay.isoformat() if r.ngay else None,
                    "trang_thai": r.trang_thai,
                    "ghi_chu_vang": r.ghi_chu_vang,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                })

            stats = {
                "tong_vang": sum(counts.values()),
                "tong_co_phep": counts.get("vang_mat_co_phep", 0),
                "tong_khong_phep": counts.get("vang_mat_khong_phep", 0),
            }

            return Return.ok(GetDanhSachVangMatResult(
                items=items,
                total=total,
                stats=stats,
            ))
```

- [ ] **Step 2: Export from `__init__.py`**

In `backend/src/app/usecases/cham_cong/__init__.py`, add:

```python
from src.app.usecases.cham_cong.get_danh_sach_vang_mat_uc import (
    GetDanhSachVangMatUseCase,
    GetDanhSachVangMatQuery,
    GetDanhSachVangMatResult,
)
```

And add to `__all__`:
```python
    "GetDanhSachVangMatUseCase",
    "GetDanhSachVangMatQuery",
    "GetDanhSachVangMatResult",
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/app/usecases/cham_cong/
git commit -m "feat: add GetDanhSachVangMat use case"
```

---

### Task 6: Add `GET /vang-mat` API endpoint

**Files:**
- Modify: `backend/src/api/routes/quan_ly/cham_cong.py`

- [ ] **Step 1: Add the endpoint**

In `backend/src/api/routes/quan_ly/cham_cong.py`, update the imports to include the new use case and `APIResponseWithMetadata`:

```python
from src.api.schemas.common import APIResponse, APIResponseWithMetadata
from src.app.usecases.cham_cong import (
    GenerateQRCommand,
    GenerateQRUseCase,
    BulkGenerateQRCommand,
    BulkGenerateQRUseCase,
    AggregateMonthlyCommand,
    AggregateMonthlyUseCase,
    GetQRByDateQuery,
    GetQRByDateUseCase,
    GetQRDetailQuery,
    GetQRDetailUseCase,
    GetDailyReportQuery,
    GetDailyAttendanceReportUseCase,
    GetMonthlySummaryQuery,
    GetMonthlySummaryReportUseCase,
    GetDanhSachVangMatQuery,
    GetDanhSachVangMatUseCase,
)
```

Add after the `/report/monthly-summary` endpoint (after line 268):

```python
@router.get("/vang-mat", response_model=APIResponseWithMetadata[list[dict]])
async def get_danh_sach_vang_mat(
    ngay: date = Query(default_factory=date.today, description="Ngày cần xem"),
    phong_ban_id: Optional[str] = Query(None, description="Lọc theo phòng ban"),
    loai_vang: Optional[str] = Query(None, description="co_phep / khong_phep"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Lấy danh sách nhân viên vắng mặt theo ngày."""
    query = GetDanhSachVangMatQuery(
        ngay=ngay,
        phong_ban_id=phong_ban_id,
        loai_vang=loai_vang,
        page=page,
        page_size=page_size,
    )

    use_case = GetDanhSachVangMatUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    import math
    return APIResponseWithMetadata(
        message="Lấy danh sách vắng mặt thành công",
        data=result.value.items,
        metadata={
            "page": page,
            "per_page": page_size,
            "total": result.value.total,
            "total_pages": math.ceil(result.value.total / page_size) if result.value.total > 0 else 0,
            "thong_ke": result.value.stats,
        },
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/api/routes/quan_ly/cham_cong.py
git commit -m "feat: add GET /vang-mat API endpoint"
```

---

### Task 7: Create frontend hook for vang-mat API

**Files:**
- Create: `frontend/src/hooks/cham-cong/use-danh-sach-vang-mat.ts`

- [ ] **Step 1: Create the hook**

First check the hooks directory:
```bash
ls frontend/src/hooks/
```

Look at an existing hook for the pattern (e.g., `use-bao-cao` or `nghi-phep`). Then create:

`frontend/src/hooks/cham-cong/use-danh-sach-vang-mat.ts`:

```typescript
import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"

interface VangMatParams {
  ngay?: string
  phong_ban_id?: string
  loai_vang?: string
  page?: number
  page_size?: number
}

interface VangMatItem {
  id: string
  nhan_vien_id: string
  nhan_vien_ho_ten: string
  phong_ban: string
  ngay: string
  trang_thai: "vang_mat_co_phep" | "vang_mat_khong_phep"
  ghi_chu_vang: string
  created_at: string
}

interface VangMatStats {
  tong_vang: number
  tong_co_phep: number
  tong_khong_phep: number
}

interface VangMatResponse {
  data: VangMatItem[]
  metadata: {
    page: number
    per_page: number
    total: number
    total_pages: number
    thong_ke: VangMatStats
  }
}

export function useDanhSachVangMat(params: VangMatParams = {}) {
  return useQuery<VangMatResponse>({
    queryKey: ["cham-cong", "vang-mat", params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {}
      if (params.ngay) queryParams.ngay = params.ngay
      if (params.phong_ban_id) queryParams.phong_ban_id = params.phong_ban_id
      if (params.loai_vang) queryParams.loai_vang = params.loai_vang
      if (params.page) queryParams.page = String(params.page)
      if (params.page_size) queryParams.page_size = String(params.page_size)

      const response = await apiGateway.get("/api/v1/quan-ly/cham-cong/vang-mat", {
        params: queryParams,
      })
      return response as VangMatResponse
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/cham-cong/
git commit -m "feat: add useDanhSachVangMat hook"
```

---

### Task 8: Create VangMat tab component

**Files:**
- Create: `frontend/src/app/(admin)/cham-cong/_components/vang-mat-tab.tsx`

- [ ] **Step 1: Create the tab component**

First check existing tab patterns in the codebase for consistency. Then create:

`frontend/src/app/(admin)/cham-cong/_components/vang-mat-tab.tsx`:

```tsx
"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon, Users, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useDanhSachVangMat } from "@/hooks/cham-cong/use-danh-sach-vang-mat"

interface VangMatItem {
  id: string
  nhan_vien_id: string
  nhan_vien_ho_ten: string
  phong_ban: string
  ngay: string
  trang_thai: "vang_mat_co_phep" | "vang_mat_khong_phep"
  ghi_chu_vang: string
  created_at: string
}

const columns: ColumnDef<VangMatItem>[] = [
  {
    accessorKey: "nhan_vien_ho_ten",
    header: "Họ tên",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nhan_vien_ho_ten}</p>
        <p className="text-xs text-muted-foreground">{row.original.nhan_vien_id}</p>
      </div>
    ),
  },
  {
    accessorKey: "phong_ban",
    header: "Phòng ban",
    cell: ({ row }) => <span>{row.original.phong_ban || "—"}</span>,
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isCoPhep = row.original.trang_thai === "vang_mat_co_phep"
      return (
        <Badge
          variant="outline"
          className={cn(
            isCoPhep
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-red-100 text-red-700 border-red-200"
          )}
        >
          {isCoPhep ? "Có phép" : "Không phép"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "ghi_chu_vang",
    header: "Lý do",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.ghi_chu_vang || "—"}
      </span>
    ),
  },
]

export function VangMatTab() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loaiVang, setLoaiVang] = useState<string>("all")
  const [page, setPage] = useState(1)

  const ngayStr = format(selectedDate, "yyyy-MM-dd")

  const { data, isLoading } = useDanhSachVangMat({
    ngay: ngayStr,
    loai_vang: loaiVang === "all" ? undefined : loaiVang,
    page,
    page_size: 20,
  })

  const items = data?.data || []
  const stats = data?.metadata?.thong_ke || { tong_vang: 0, tong_co_phep: 0, tong_khong_phep: 0 }
  const totalPages = data?.metadata?.total_pages || 1

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Tổng vắng mặt"
          value={stats.tong_vang}
          accent="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Có phép"
          value={stats.tong_co_phep}
          accent="success"
        />
        <StatCard
          icon={XCircle}
          label="Không phép"
          value={stats.tong_khong_phep}
          accent="danger"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  setSelectedDate(d)
                  setPage(1)
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Select value={loaiVang} onValueChange={(v) => { setLoaiVang(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="co_phep">Có phép</SelectItem>
            <SelectItem value="khong_phep">Không phép</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        emptyMessage="Không có nhân viên vắng mặt trong ngày này"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/\(admin\)/cham-cong/_components/
git commit -m "feat: add VangMatTab component"
```

---

### Task 9: Integrate VangMatTab into ChamCong page

**Files:**
- Modify: `frontend/src/app/(admin)/cham-cong/page.tsx`

- [ ] **Step 1: Add tabs to the page**

In `frontend/src/app/(admin)/cham-cong/page.tsx`, add imports:

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VangMatTab } from "./_components/vang-mat-tab"
```

Wrap the existing content and the new tab in a `Tabs` component. Replace the return block (starting from `return (`) with:

```tsx
  return (
    <AuthenticatedLayout>
      <Tabs defaultValue="cham-cong" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cham-cong">Chấm công tháng</TabsTrigger>
          <TabsTrigger value="vang-mat">Vắng mặt</TabsTrigger>
        </TabsList>

        <TabsContent value="cham-cong" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard icon={User} label="Tổng NV" value={stats.total} accent="primary" />
            <StatCard icon={CheckCircle2} label="Có mặt" value={stats.coMat} accent="success" />
            <StatCard icon={Clock} label="Vắng CP" value={stats.vangCp} accent="warning" />
            <StatCard icon={XCircle} label="Vắng KP" value={stats.vangKp} accent="danger" />
            <StatCard icon={CalendarDays} label="Lễ Tết" value={stats.leTet} accent="info" />
            <StatCard icon={FileText} label="Công tác" value={stats.congTac} accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <LichChamCongConfig />
          </div>

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={chamCongItems}
              loading={isLoading}
              emptyMessage="Chưa có dữ liệu chấm công"
            />
          </div>

          <ChamCongEditDialog
            chamCong={selectedChamCong}
            open={editOpen}
            onOpenChange={setEditOpen}
            onUpdate={handleUpdate}
            onXacNhan={handleXacNhan}
            onDuyet={handleDuyet}
            onChot={handleChot}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="vang-mat">
          <VangMatTab />
        </TabsContent>
      </Tabs>
    </AuthenticatedLayout>
  )
```

- [ ] **Step 2: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors related to new code.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\(admin\)/cham-cong/
git commit -m "feat: integrate VangMatTab into ChamCong page with tabs"
```

---

### Task 10: Verify and test

- [ ] **Step 1: Run backend type check (if available)**

```bash
cd backend && python -c "from src.service.scheduler_service import scheduler_service; print('OK')"
```

- [ ] **Step 2: Run frontend type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Verify alembic migration applied**

```bash
cd backend && alembic current
```

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A && git commit -m "chore: final cleanup for absence detection feature"
```
