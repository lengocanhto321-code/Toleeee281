# Hợp Đồng - Sửa Logic Nghiệp Vụ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa logic nghiệp vụ hợp đồng: chỉ 1 HĐ hiệu lực tại 1 thời điểm, tự động đóng HĐ cũ khi ký mới, cấm xóa HĐ, sync sang NhanVien.

**Architecture:** Backend thêm validation trong use case + repository query mới. Frontend đổi nút "Xóa" thành "Hủy hợp đồng" + hiển thị cảnh báo khi có HĐ hiệu lực đang tồn tại.

**Tech Stack:** Python/FastAPI/SQLAlchemy backend, Next.js/React/TypeScript frontend.

---

## Quy tắc nghiệp vụ

1. **Chỉ 1 HĐ đang hiệu lực** — Khi tạo HĐ mới, tất cả HĐ `dang_hieu_luc` khác của nhân viên đó tự chuyển sang `da_het_han`
2. **Không cho thời gian chồng chéo** — `ngay_bat_dau` HĐ mới phải >= `ngay_ket_thuc` HĐ cũ (hoặc sau ngày hiện tại nếu HĐ cũ không có hạn)
3. **Cấm xóa HĐ** — Chỉ cho chuyển trạng thái (`bi_huy`, `da_het_han`), giữ lịch sử
4. **Auto-sync NhanVien** — Khi tạo/cập nhật HĐ `dang_hieu_luc`, tự động cập nhật `loai_hop_dong`, `so_hop_dong`, `ngay_het_hop_dong` trên bảng `nhan_vien`

---

## Files will be modified

| File | Change |
|------|--------|
| `backend/src/repository/hop_dong_repository.py` | Thêm method `get_dang_hieu_luc_by_nhan_vien()` |
| `backend/src/app/usecases/hop_dong/create_hop_dong_uc.py` | Thêm logic auto-close HĐ cũ + sync NhanVien |
| `backend/src/app/usecases/hop_dong/update_hop_dong_uc.py` | Thêm logic sync NhanVien khi HĐ đang hiệu lực |
| `backend/src/app/usecases/hop_dong/delete_hop_dong_uc.py` | Đổi từ xóa cứng → chuyển trạng thái `bi_huy` |
| `backend/src/api/routes/quan_ly/hop_dong.py` | Cập nhật error handling cho validation mới |
| `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx` | Đổi nút Xóa → Hủy, thêm cảnh báo |
| `frontend/src/components/forms/nhan-vien/hop-dong-form-dialog.tsx` | Thêm cảnh báo khi đã có HĐ hiệu lực |

---

### Task 1: Thêm repository method lấy HĐ đang hiệu lực

**Files:**
- Modify: `backend/src/repository/hop_dong_repository.py:30` (thêm sau method `get_by_nhan_vien_id`)

- [ ] **Step 1: Thêm method `get_dang_hieu_luc_by_nhan_vien` vào repository**

Thêm method mới vào `HopDongRepository` class, sau method `get_by_nhan_vien_id` (dòng 30):

```python
    async def get_dang_hieu_luc_by_nhan_vien(self, nhan_vien_id: str) -> List[HopDong]:
        result = await self._session.execute(
            select(HopDong)
            .where(
                HopDong.nhan_vien_id == nhan_vien_id,
                HopDong.trang_thai == "dang_hieu_luc",
            )
            .order_by(HopDong.ngay_bat_dau.desc())
        )
        return list(result.scalars().all())
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/repository/hop_dong_repository.py
git commit -m "feat(hop-dong): add get_dang_hieu_luc_by_nhan_vien repository method"
```

---

### Task 2: Sửa Create Hop Dong UC — auto-close HĐ cũ + sync NhanVien

**Files:**
- Modify: `backend/src/app/usecases/hop_dong/create_hop_dong_uc.py`

- [ ] **Step 1: Cập nhật `CreateHopDongUseCase.execute()`**

Thay toàn bộ nội dung file `backend/src/app/usecases/hop_dong/create_hop_dong_uc.py`:

```python
import logging
from dataclasses import dataclass
from datetime import date as date_type

from libs.result import Result, Error, Return
from src.domain.models.hop_dong import HopDong
from src.domain.models.audit_log import AuditLog
from src.api.schemas.hop_dong import (
    HopDongCreateRequest,
    HopDongResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateHopDongCommand:
    nhan_vien_id: str
    data: HopDongCreateRequest
    actor_id: str


@dataclass
class CreateHopDongResult:
    item: HopDongResponse


class CreateHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateHopDongCommand
    ) -> Result[CreateHopDongResult, Error]:
        logger.info(
            f"User {command.actor_id} creating HopDong for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            if command.data.ngay_ket_thuc and command.data.ngay_bat_dau:
                if command.data.ngay_ket_thuc < command.data.ngay_bat_dau:
                    return Return.err(
                        Error(
                            code="invalid_dates",
                            message="Ngày kết thúc phải sau ngày bắt đầu",
                            reason="ValidationError",
                        )
                    )

            active_contracts = await uow.hop_dong_repository.get_dang_hieu_luc_by_nhan_vien(
                command.nhan_vien_id
            )
            for old_hd in active_contracts:
                if command.data.ngay_bat_dau and old_hd.ngay_bat_dau:
                    if command.data.ngay_bat_dau < old_hd.ngay_bat_dau:
                        return Return.err(
                            Error(
                                code="overlap_error",
                                message="Ngày bắt đầu hợp đồng mới phải sau ngày bắt đầu hợp đồng đang hiệu lực",
                                reason="ValidationError",
                            )
                        )

            for old_hd in active_contracts:
                old_hd.trang_thai = "da_het_han"
                if not old_hd.ngay_ket_thuc or old_hd.ngay_ket_thuc > command.data.ngay_bat_dau:
                    old_hd.ngay_ket_thuc = command.data.ngay_bat_dau
                await uow.hop_dong_repository.update(old_hd)

                audit_close = AuditLog(
                    tai_khoan_id=command.actor_id,
                    hanh_dong="UPDATE",
                    bang_du_lieu="hop_dong",
                    ban_ghi_id=old_hd.id,
                    du_lieu_cu={"trang_thai": "dang_hieu_luc"},
                    du_lieu_moi={"trang_thai": "da_het_han", "ngay_ket_thuc": str(old_hd.ngay_ket_thuc)},
                    ghi_chu=f"Tự động đóng hợp đồng {old_hd.so_hop_dong} do ký hợp đồng mới",
                )
                await uow.audit_log_repository.create(audit_close)

            hd = HopDong(
                nhan_vien_id=command.nhan_vien_id,
                so_hop_dong=command.data.so_hop_dong
                or await uow.hop_dong_repository.generate_so_hop_dong(),
                loai_hop_dong=command.data.loai_hop_dong,
                ngay_ky=command.data.ngay_ky,
                ngay_bat_dau=command.data.ngay_bat_dau,
                ngay_ket_thuc=command.data.ngay_ket_thuc,
                hinh_thuc_tuyen_dung=command.data.hinh_thuc_tuyen_dung,
                noi_ky_hop_dong=command.data.noi_ky_hop_dong,
                luong_co_ban=command.data.luong_co_ban,
                ghi_chu=command.data.ghi_chu,
                trang_thai="dang_hieu_luc",
            )
            created = await uow.hop_dong_repository.create(hd)

            nhan_vien.loai_hop_dong = created.loai_hop_dong
            nhan_vien.so_hop_dong = created.so_hop_dong
            nhan_vien.ngay_het_hop_dong = created.ngay_ket_thuc
            nhan_vien.hinh_thuc_tuyen_dung = created.hinh_thuc_tuyen_dung
            nhan_vien.noi_ky_hop_dong = created.noi_ky_hop_dong
            await uow.nhan_vien_repository.update(nhan_vien)

            if command.data.luong_co_ban:
                luong = await uow.luong_repository.find_hien_tai(
                    command.nhan_vien_id, date_type.today()
                )
                if luong:
                    try:
                        luong.luong_co_ban = int(command.data.luong_co_ban)
                    except (ValueError, TypeError):
                        pass

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi={
                    "so_hop_dong": created.so_hop_dong,
                    "loai_hop_dong": created.loai_hop_dong,
                },
                ghi_chu=f"Tạo hợp đồng {created.so_hop_dong} cho nhân viên",
            )
            await uow.audit_log_repository.create(audit_log)

            resp = serialize_model_to_dict(created)
            return Return.ok(CreateHopDongResult(item=HopDongResponse(**resp)))
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/hop_dong/create_hop_dong_uc.py
git commit -m "feat(hop-dong): auto-close old contracts + sync NhanVien on create"
```

---

### Task 3: Sửa Update Hop Dong UC — sync NhanVien khi HĐ hiệu lực

**Files:**
- Modify: `backend/src/app/usecases/hop_dong/update_hop_dong_uc.py`

- [ ] **Step 1: Cập nhật `UpdateHopDongUseCase.execute()`**

Thay toàn bộ nội dung file `backend/src/app/usecases/hop_dong/update_hop_dong_uc.py`:

```python
import logging
from dataclasses import dataclass
from datetime import date as date_type

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.hop_dong import (
    HopDongUpdateRequest,
    HopDongResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class UpdateHopDongCommand:
    id: str
    data: HopDongUpdateRequest
    actor_id: str


@dataclass
class UpdateHopDongResult:
    item: HopDongResponse


class UpdateHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateHopDongCommand
    ) -> Result[UpdateHopDongResult, Error]:
        logger.info(f"User {command.actor_id} updating HopDong {command.id}")

        async with self.unit_of_work as uow:
            hd = await uow.hop_dong_repository.find_by_id(command.id)
            if not hd:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Hợp đồng không tồn tại",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(hd)

            if command.data.trang_thai == "dang_hieu_luc" and hd.trang_thai != "dang_hieu_luc":
                active_contracts = await uow.hop_dong_repository.get_dang_hieu_luc_by_nhan_vien(
                    hd.nhan_vien_id
                )
                active_contracts = [c for c in active_contracts if c.id != hd.id]
                for old_hd in active_contracts:
                    old_hd.trang_thai = "da_het_han"
                    await uow.hop_dong_repository.update(old_hd)

            update_data = command.data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(hd, field, value)

            updated = await uow.hop_dong_repository.update(hd)

            if updated.trang_thai == "dang_hieu_luc":
                nhan_vien = await uow.nhan_vien_repository.find_by_id(updated.nhan_vien_id)
                if nhan_vien:
                    if updated.loai_hop_dong:
                        nhan_vien.loai_hop_dong = updated.loai_hop_dong
                    if updated.so_hop_dong:
                        nhan_vien.so_hop_dong = updated.so_hop_dong
                    nhan_vien.ngay_het_hop_dong = updated.ngay_ket_thuc
                    if updated.hinh_thuc_tuyen_dung:
                        nhan_vien.hinh_thuc_tuyen_dung = updated.hinh_thuc_tuyen_dung
                    if updated.noi_ky_hop_dong:
                        nhan_vien.noi_ky_hop_dong = updated.noi_ky_hop_dong
                    await uow.nhan_vien_repository.update(nhan_vien)

            if command.data.luong_co_ban:
                luong = await uow.luong_repository.find_hien_tai(
                    updated.nhan_vien_id, date_type.today()
                )
                if luong:
                    try:
                        luong.luong_co_ban = int(command.data.luong_co_ban)
                    except (ValueError, TypeError):
                        pass

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu=f"Cập nhật hợp đồng {updated.so_hop_dong}",
            )
            await uow.audit_log_repository.create(audit_log)

            resp = serialize_model_to_dict(updated)
            return Return.ok(UpdateHopDongResult(item=HopDongResponse(**resp)))
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/hop_dong/update_hop_dong_uc.py
git commit -m "feat(hop-dong): sync NhanVien fields when updating active contract"
```

---

### Task 4: Đổi Delete UC → chuyển trạng thái "bị hủy" thay vì xóa cứng

**Files:**
- Modify: `backend/src/app/usecases/hop_dong/delete_hop_dong_uc.py`

- [ ] **Step 1: Đổi logic delete sang cancel**

Thay toàn bộ nội dung file `backend/src/app/usecases/hop_dong/delete_hop_dong_uc.py`:

```python
import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class DeleteHopDongCommand:
    id: str
    actor_id: str


@dataclass
class DeleteHopDongResult:
    pass


class DeleteHopDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteHopDongCommand
    ) -> Result[DeleteHopDongResult, Error]:
        logger.info(f"User {command.actor_id} cancelling HopDong {command.id}")

        async with self.unit_of_work as uow:
            hd = await uow.hop_dong_repository.find_by_id(command.id)
            if not hd:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Hợp đồng không tồn tại",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(hd)
            old_trang_thai = hd.trang_thai

            hd.trang_thai = "bi_huy"
            await uow.hop_dong_repository.update(hd)

            if old_trang_thai == "dang_hieu_luc":
                nhan_vien = await uow.nhan_vien_repository.find_by_id(hd.nhan_vien_id)
                if nhan_vien and nhan_vien.so_hop_dong == hd.so_hop_dong:
                    nhan_vien.loai_hop_dong = "vien_chuc"
                    nhan_vien.so_hop_dong = None
                    nhan_vien.ngay_het_hop_dong = None
                    await uow.nhan_vien_repository.update(nhan_vien)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="hop_dong",
                ban_ghi_id=command.id,
                du_lieu_cu=old_data,
                du_lieu_moi={"trang_thai": "bi_huy"},
                ghi_chu=f"Hủy hợp đồng {old_data.get('so_hop_dong')}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(DeleteHopDongResult())
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/hop_dong/delete_hop_dong_uc.py
git commit -m "feat(hop-dong): change delete to cancel (soft state change)"
```

---

### Task 5: Cập nhật API route error handling

**Files:**
- Modify: `backend/src/api/routes/quan_ly/hop_dong.py`

- [ ] **Step 1: Thêm error code `overlap_error` vào handler create và update**

Trong file `backend/src/api/routes/quan_ly/hop_dong.py`, cập nhật hàm `create_hop_dong` (dòng 114-118). Thay:

```python
    if error.code in ("not_found", "nhan_vien_not_found"):
        raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
    raise ServerError(base_error=error)
```

Thành:

```python
    if error.code in ("not_found", "nhan_vien_not_found"):
        raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
    if error.code in ("invalid_dates", "overlap_error"):
        raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
    raise ServerError(base_error=error)
```

- [ ] **Step 2: Cập nhật message cho delete route**

Trong hàm `delete_hop_dong` (dòng 183-185), thay:

```python
    return APIResponse(
        message="Xóa hợp đồng thành công",
        data={"success": True},
    )
```

Thành:

```python
    return APIResponse(
        message="Hủy hợp đồng thành công",
        data={"success": True},
    )
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/api/routes/quan_ly/hop_dong.py
git commit -m "feat(hop-dong): add overlap error handling + update delete message"
```

---

### Task 6: Cập nhật Frontend — đổi nút Xóa thành Hủy, thêm cảnh báo

**Files:**
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx`

- [ ] **Step 1: Cập nhật UI tab hợp đồng**

Thay toàn bộ nội dung file `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock, Plus, Pencil, Ban, AlertTriangle } from "lucide-react"
import type { HopDong, HopDongFormData, LoaiHopDong, TrangThaiHopDong } from "@/types/hop-dong.types"
import { LOAI_HOP_DONG_LABELS, TRANG_THAI_HOP_DONG_LABELS } from "@/types/hop-dong.types"
import { HopDongFormDialog } from "./hop-dong-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCreateHopDong, useUpdateHopDong, useDeleteHopDong } from "@/hooks/hop-dong/use-hop-dong-query"
import { toastSuccess, toastError } from "@/lib/utils"
import { formatDateVN } from "@/lib/date-utils"

interface NhanVienHopDongTabProps {
  nhanVienId: string
  hopDongs: HopDong[]
}

function getTrangThaiColor(trangThai: TrangThaiHopDong) {
  switch (trangThai) {
    case "dang_hieu_luc":
      return "bg-emerald-100 text-emerald-700 border-0"
    case "da_het_han":
      return "bg-slate-100 text-slate-600 border-0"
    case "bi_huy":
      return "bg-red-100 text-red-700 border-0"
    default:
      return "bg-slate-100 text-slate-600 border-0"
  }
}

export function NhanVienHopDongTab({ nhanVienId, hopDongs }: NhanVienHopDongTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingHopDong, setEditingHopDong] = useState<HopDong | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const createMutation = useCreateHopDong(nhanVienId)
  const updateMutation = useUpdateHopDong(nhanVienId, editingHopDong?.id || "")
  const cancelMutation = useDeleteHopDong(nhanVienId)

  const activeCount = hopDongs?.filter(hd => hd.trang_thai === "dang_hieu_luc").length || 0

  const handleAdd = () => {
    setEditingHopDong(null)
    setFormOpen(true)
  }

  const handleEdit = (hopDong: HopDong) => {
    setEditingHopDong(hopDong)
    setFormOpen(true)
  }

  const handleSubmit = (data: HopDongFormData, editId?: string) => {
    if (editId) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          toastSuccess("Thành công", "Cập nhật hợp đồng thành công")
          setFormOpen(false)
        },
        onError: () => {
          toastError("Lỗi", "Cập nhật hợp đồng thất bại")
        },
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toastSuccess("Thành công", "Thêm hợp đồng mới thành công")
          setFormOpen(false)
        },
        onError: () => {
          toastError("Lỗi", "Thêm hợp đồng thất bại")
        },
      })
    }
  }

  const handleCancel = () => {
    if (cancelId) {
      cancelMutation.mutate(cancelId, {
        onSuccess: () => {
          toastSuccess("Thành công", "Hủy hợp đồng thành công")
          setCancelId(null)
        },
        onError: () => {
          toastError("Lỗi", "Hủy hợp đồng thất bại")
        },
      })
    }
  }

  const cancelTarget = hopDongs?.find(hd => hd.id === cancelId)

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Lịch sử hợp đồng lao động
          </h3>
          <Button size="sm" onClick={handleAdd} className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            Ký hợp đồng mới
          </Button>
        </div>

        {activeCount > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Đang có <strong>{activeCount}</strong> hợp đồng hiệu lực. Ký hợp đồng mới sẽ tự động đóng hợp đồng hiện tại.
            </span>
          </div>
        )}
        
        {!hopDongs || hopDongs.length === 0 ? (
          <p className="text-slate-500 text-sm">Chưa có hợp đồng nào</p>
        ) : (
          <div className="space-y-4">
            {hopDongs.map((hd) => (
              <div
                key={hd.id}
                className={`relative border rounded-lg p-4 ${
                  hd.trang_thai === "dang_hieu_luc"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : hd.trang_thai === "bi_huy"
                    ? "border-red-100 bg-red-50/20 opacity-70"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {hd.so_hop_dong}
                    </p>
                    <p className="text-sm text-slate-500">
                      {LOAI_HOP_DONG_LABELS[hd.loai_hop_dong as LoaiHopDong] || hd.loai_hop_dong}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ký: {formatDateVN(hd.ngay_ky)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateVN(hd.ngay_bat_dau)} - {formatDateVN(hd.ngay_ket_thuc) || "Không thời hạn"}
                      </span>
                    </div>
                    {hd.luong_co_ban && (
                      <p className="text-sm text-slate-500">
                        Lương cơ bản: {Number(hd.luong_co_ban).toLocaleString("vi-VN")} đ
                      </p>
                    )}
                    {hd.hinh_thuc_tuyen_dung && (
                      <p className="text-sm text-slate-500">
                        Hình thức tuyển dụng: {hd.hinh_thuc_tuyen_dung}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTrangThaiColor(hd.trang_thai as TrangThaiHopDong)}>
                      {TRANG_THAI_HOP_DONG_LABELS[hd.trang_thai as TrangThaiHopDong] || hd.trang_thai}
                    </Badge>
                    {hd.trang_thai !== "bi_huy" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(hd)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setCancelId(hd.id)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {hd.ghi_chu && (
                  <p className="mt-2 text-sm text-slate-500 italic">{hd.ghi_chu}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <HopDongFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingHopDong={editingHopDong}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.trang_thai === "dang_hieu_luc" ? (
                <span className="text-amber-600 font-medium">
                  Hợp đồng "{cancelTarget.so_hop_dong}" đang hiệu lực. Hủy sẽ làm thay đổi thông tin hợp đồng hiện tại của nhân viên.
                </span>
              ) : (
                <>Bạn có chắc chắn muốn hủy hợp đồng "{cancelTarget?.so_hop_dong}"?</>
              )}
              {" "}Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Hủy hợp đồng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx
git commit -m "feat(hop-dong): change delete to cancel, add active contract warning"
```

---

### Task 7: Cập nhật form dialog — thêm cảnh báo HĐ hiệu lực

**Files:**
- Modify: `frontend/src/components/forms/nhan-vien/hop-dong-form-dialog.tsx`

- [ ] **Step 1: Thêm cảnh báo khi đã có HĐ hiệu lực**

Trong file `frontend/src/components/forms/nhan-vien/hop-dong-form-dialog.tsx`:

**1a.** Cập nhật interface props (dòng 53-58), thêm `hasActiveContract`:

```typescript
interface HopDongFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingHopDong: HopDong | null
  isPending: boolean
  onSubmit: (data: HopDongFormData, editId?: string) => void
  hasActiveContract?: boolean
}
```

**1b.** Cập nhật destructured props (dòng 61-67):

```typescript
export function HopDongFormDialog({
  open,
  onOpenChange,
  editingHopDong,
  isPending,
  onSubmit,
  hasActiveContract = false,
}: HopDongFormDialogProps) {
```

**1c.** Thêm import `AlertTriangle` vào dòng 7:

```typescript
import { FileText, Calendar, Clock, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
```

Thay bằng — không cần, file này không dùng icons từ lucide-react. Skip.

**1d.** Thêm cảnh báo trong DialogDescription (sau dòng 165). Thay:

```tsx
          <DialogDescription>
            {editingHopDong
              ? "Cập nhật thông tin hợp đồng"
              : "Nhập thông tin để thêm hợp đồng mới"}
          </DialogDescription>
```

Thành:

```tsx
          <DialogDescription>
            {editingHopDong
              ? "Cập nhật thông tin hợp đồng"
              : hasActiveContract
              ? "Hợp đồng mới sẽ thay thế hợp đồng đang hiệu lực. Hợp đồng cũ sẽ tự động chuyển sang trạng thái \"Đã hết hạn\"."
              : "Nhập thông tin để thêm hợp đồng mới"}
          </DialogDescription>
```

- [ ] **Step 2: Cập nhật nơi gọi HopDongFormDialog trong tab**

Trong file `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx`, cập nhật component `<HopDongFormDialog>`:

```tsx
      <HopDongFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingHopDong={editingHopDong}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        hasActiveContract={activeCount > 0}
      />
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/forms/nhan-vien/hop-dong-form-dialog.tsx frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx
git commit -m "feat(hop-dong): add active contract warning in form dialog"
```

---

### Task 8: Verify — chạy lint và typecheck

- [ ] **Step 1: Chạy backend lint**

```bash
cd backend && python -m py_compile src/repository/hop_dong_repository.py && python -m py_compile src/app/usecases/hop_dong/create_hop_dong_uc.py && python -m py_compile src/app/usecases/hop_dong/update_hop_dong_uc.py && python -m py_compile src/app/usecases/hop_dong/delete_hop_dong_uc.py && python -m py_compile src/api/routes/quan_ly/hop_dong.py
```

Expected: No errors

- [ ] **Step 2: Chạy frontend typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Chạy frontend lint**

```bash
cd frontend && npx next lint
```

Expected: No errors
