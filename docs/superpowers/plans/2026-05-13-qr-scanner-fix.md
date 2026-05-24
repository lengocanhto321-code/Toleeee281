# QR Attendance Fix + Employee Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 backend bugs in QR attendance routes + replace meaningless "My QR" page with functional QR scanner for check-in/check-out.

**Architecture:** Fix backend route-to-usecase field mapping, then replace frontend my-qr page with html5-qrcode scanner calling existing check-in/check-out APIs.

**Tech Stack:** Python/FastAPI (backend), Next.js 16 + html5-qrcode (frontend)

---

### Task 1: Fix check-in route field mismatch

**Files:**
- Modify: `backend/src/api/routes/nhan_vien/cham_cong.py`

- [ ] **Step 1: Fix the check-in route to map fields correctly**

Replace lines 51-56 of `nhan_vien/cham_cong.py`:

```python
    command = CheckInCommand(
        user_id=current_user.user_id,
        qr_data=body.qr_data,
        latitude=body.latitude,
        longitude=body.longitude,
    )
```

With:

```python
    command = CheckInCommand(
        nhan_vien_id=current_user.user_id,
        qr_data=body.qr_data,
        thoi_gian=datetime.now().isoformat(),
        vi_tri={"lat": body.latitude, "lng": body.longitude}
        if body.latitude and body.longitude
        else None,
    )
```

- [ ] **Step 2: Verify Python import**

Run: `cd /mnt/newhome/code/hr_management/backend && .venv/bin/python -c "from src.api.routes.nhan_vien.cham_cong import router; print('OK')"`

- [ ] **Step 3: Commit**

```bash
git add src/api/routes/nhan_vien/cham_cong.py
git commit -m "fix(backend): map check-in route fields to CheckInCommand correctly"
```

---

### Task 2: Fix check-out route + duplicate trang_thai

**Files:**
- Modify: `backend/src/api/routes/nhan_vien/cham_cong.py`
- Modify: `backend/src/app/usecases/cham_cong/check_out_uc.py`

- [ ] **Step 1: Fix the check-out route**

Replace lines 82-86 of `nhan_vien/cham_cong.py`:

```python
    command = CheckOutCommand(
        user_id=current_user.user_id,
        latitude=body.latitude,
        longitude=body.longitude,
    )
```

With:

```python
    command = CheckOutCommand(
        nhan_vien_id=current_user.user_id,
        thoi_gian=datetime.now().isoformat(),
    )
```

- [ ] **Step 2: Fix duplicate trang_thai in check_out_uc.py**

Replace line 69-70 of `check_out_uc.py`:

```python
            check_in.trang_thai = "valid"
            check_in.trang_thai = "checked_out"
```

With:

```python
            check_in.trang_thai = "checked_out"
```

- [ ] **Step 3: Verify**

Run: `cd /mnt/newhome/code/hr_management/backend && .venv/bin/python -c "from src.api.routes.nhan_vien.cham_cong import router; from src.app.usecases.cham_cong.check_out_uc import CheckOutUseCase; print('OK')"`

- [ ] **Step 4: Commit**

```bash
git add src/api/routes/nhan_vien/cham_cong.py src/app/usecases/cham_cong/check_out_uc.py
git commit -m "fix(backend): map check-out route fields + remove duplicate trang_thai"
```

---

### Task 3: Fix bulk generate QR field mismatch

**Files:**
- Modify: `backend/src/app/usecases/cham_cong/bulk_generate_qr_uc.py`

- [ ] **Step 1: Fix field names in bulk_generate_qr_uc.py**

Replace lines 69-73 of `bulk_generate_qr_uc.py`:

```python
                qr_config = QRConfig(
                    ngay=current,
                    qr_payload=qr_payload,
                    secret_key=qr_payload[:64],
```

With:

```python
                qr_config = QRConfig(
                    ngay=current,
                    qr_data=qr_payload,
                    mac=qr_payload[:64] if len(qr_payload) >= 64 else qr_payload,
```

- [ ] **Step 2: Verify**

Run: `cd /mnt/newhome/code/hr_management/backend && .venv/bin/python -c "from src.app.usecases.cham_cong.bulk_generate_qr_uc import BulkGenerateQRUseCase; print('OK')"`

- [ ] **Step 3: Commit**

```bash
git add src/app/usecases/cham_cong/bulk_generate_qr_uc.py
git commit -m "fix(backend): use correct QRConfig field names in bulk generate"
```

---

### Task 4: Add employee API endpoints to frontend types

**Files:**
- Modify: `frontend/src/types/api.types.ts`

- [ ] **Step 1: Add employee check-in/check-out/history endpoints**

Add these lines to the `ApiEndpoints` object in `api.types.ts`, after the existing employee endpoints (after line that has EMPLOYEE_PROFILE or similar):

```typescript
  // Employee QR Attendance
  EMPLOYEE_CHECK_IN: "/api/v1/nhan-vien/cham-cong/check-in",
  EMPLOYEE_CHECK_OUT: "/api/v1/nhan-vien/cham-cong/check-out",
  EMPLOYEE_ATTENDANCE_HISTORY: "/api/v1/nhan-vien/cham-cong/history",
```

- [ ] **Step 2: Commit**

```bash
git add src/types/api.types.ts
git commit -m "feat(frontend): add employee check-in/check-out API endpoints"
```

---

### Task 5: Create employee check-in/check-out hooks

**Files:**
- Create: `frontend/src/hooks/employee/use-employee-check-in-out.ts`
- Modify: `frontend/src/hooks/employee/index.ts`

- [ ] **Step 1: Create check-in/check-out hooks**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastError, toastSuccess } from "@/lib/utils"

export const employeeAttendanceKeys = {
  all: ["employee-attendance"] as const,
  today: () => [...employeeAttendanceKeys.all, "today"] as const,
}

interface CheckInResponse {
  id: string
  thoi_gian: string
  trang_thai: string
  is_late: boolean
  message: string
}

interface CheckOutResponse {
  id: string
  thoi_gian: string
  trang_thai: string
  message: string
}

interface TodayRecord {
  id: string
  check_in_time: string | null
  check_out_time: string | null
  trang_thai: string
  check_in_status: string | null
}

interface HistoryResponse {
  data: TodayRecord[]
  total: number
}

export function useEmployeeTodayAttendance() {
  return useQuery({
    queryKey: employeeAttendanceKeys.today(),
    queryFn: async () => {
      const res = await apiGateway.get<HistoryResponse>(
        ApiEndpoints.EMPLOYEE_ATTENDANCE_HISTORY,
        { params: { page: 1, page_size: 1 } }
      )
      const today = new Date().toISOString().slice(0, 10)
      const record = res.data?.[0]
      if (record && record.check_in_time?.startsWith(today)) {
        return record
      }
      return null
    },
    refetchOnWindowFocus: true,
  })
}

export function useEmployeeCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { qr_data: string; latitude?: number; longitude?: number }) => {
      return apiGateway.post<CheckInResponse>(ApiEndpoints.EMPLOYEE_CHECK_IN, data)
    },
    onSuccess: (res) => {
      toastSuccess("Check-in", res.message || "Check-in thành công")
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.today() })
    },
    onError: (err: any) => {
      toastError("Check-in thất bại", err?.response?.data?.detail?.message || "Lỗi không xác định")
    },
  })
}

export function useEmployeeCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data?: { latitude?: number; longitude?: number }) => {
      return apiGateway.post<CheckOutResponse>(ApiEndpoints.EMPLOYEE_CHECK_OUT, data || {})
    },
    onSuccess: (res) => {
      toastSuccess("Check-out", res.message || "Check-out thành công")
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.today() })
    },
    onError: (err: any) => {
      toastError("Check-out thất bại", err?.response?.data?.detail?.message || "Lỗi không xác định")
    },
  })
}
```

- [ ] **Step 2: Export from index.ts**

Add to `frontend/src/hooks/employee/index.ts`:

```typescript
export * from "./use-employee-check-in-out"
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/employee/use-employee-check-in-out.ts src/hooks/employee/index.ts
git commit -m "feat(frontend): add employee check-in/check-out mutation hooks"
```

---

### Task 6: Install html5-qrcode

- [ ] **Step 1: Install library**

Run: `cd /mnt/newhome/code/hr_management/frontend && npm install html5-qrcode`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add html5-qrcode dependency"
```

---

### Task 7: Replace my-qr page with QR scanner page

**Files:**
- Modify: `frontend/src/app/(employee)/employee/my-qr/page.tsx`

- [ ] **Step 1: Replace entire my-qr page with QR scanner**

```tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { BentoCard } from "@/components/employee/bento-card"
import {
  useEmployeeTodayAttendance,
  useEmployeeCheckIn,
  useEmployeeCheckOut,
} from "@/hooks/employee"
import { LogIn, LogOut, Clock, CheckCircle2, AlertTriangle } from "lucide-react"

export default function QRScannerPage() {
  const [scanning, setScanning] = useState<"check_in" | "check_out" | null>(null)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const { data: todayRecord, isLoading: loadingToday } = useEmployeeTodayAttendance()
  const checkInMutation = useEmployeeCheckIn()
  const checkOutMutation = useEmployeeCheckOut()

  const isCheckedIn = !!todayRecord?.check_in_time
  const isCheckedOut = !!todayRecord?.check_out_time

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScan = async (mode: "check_in" | "check_out") => {
    setResult(null)
    setScanning(mode)

    try {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop()
          scannerRef.current = null
          setScanning(null)

          if (mode === "check_in") {
            checkInMutation.mutate(
              { qr_data: decodedText },
              {
                onSuccess: (res) => {
                  setResult({
                    type: "success",
                    message: res.is_late
                      ? `Check-in lúc ${res.thoi_gian?.slice(11, 16)} (đi muộn!)`
                      : `Check-in lúc ${res.thoi_gian?.slice(11, 16)}`,
                  })
                },
              }
            )
          } else {
            checkOutMutation.mutate(undefined, {
              onSuccess: (res) => {
                setResult({
                  type: "success",
                  message: res.message || "Check-out thành công",
                })
              },
            })
          }
        },
        () => {}
      )
    } catch {
      setResult({ type: "error", message: "Không thể mở camera. Vui lòng cấp quyền." })
      setScanning(null)
    }
  }

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setScanning(null)
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return "—"
    return iso.slice(11, 16)
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Hôm nay</h2>
        {loadingToday ? (
          <div className="text-sm text-slate-400 py-4 text-center">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase">Check-in</span>
              </div>
              {isCheckedIn ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900">
                    {formatTime(todayRecord?.check_in_time)}
                  </span>
                  {todayRecord?.check_in_status === "late" && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
              ) : (
                <span className="text-sm text-slate-300">Chưa check-in</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase">Check-out</span>
              </div>
              {isCheckedOut ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900">
                    {formatTime(todayRecord?.check_out_time)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-300">Chưa check-out</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        id="qr-reader"
        className={`rounded-2xl overflow-hidden ${scanning ? "block" : "hidden"}`}
      />

      {scanning && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Đang quét QR... Hướng camera vào mã QR tại cổng trường
          </p>
          <button
            onClick={stopScan}
            className="text-sm text-red-500 font-medium hover:text-red-600"
          >
            Hủy quét
          </button>
        </div>
      )}

      {result && (
        <div
          className={`rounded-2xl p-4 ${
            result.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.type === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {result.message}
          </p>
        </div>
      )}

      {!scanning && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => startScan("check_in")}
            disabled={isCheckedIn || checkInMutation.isPending}
            className={`rounded-2xl p-4 text-center transition-colors ${
              isCheckedIn
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            <LogIn className="w-6 h-6 mx-auto mb-1.5" />
            <div className="text-xs font-semibold">
              {isCheckedIn ? "Đã check-in" : "Check-in"}
            </div>
          </button>
          <button
            onClick={() => startScan("check_out")}
            disabled={!isCheckedIn || isCheckedOut || checkOutMutation.isPending}
            className={`rounded-2xl p-4 text-center transition-colors ${
              !isCheckedIn || isCheckedOut
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-900 text-white hover:bg-blue-950 active:bg-blue-950"
            }`}
          >
            <LogOut className="w-6 h-6 mx-auto mb-1.5" />
            <div className="text-xs font-semibold">
              {isCheckedOut ? "Đã check-out" : "Check-out"}
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add "src/app/(employee)/employee/my-qr/page.tsx"
git commit -m "feat(employee): replace my-qr with QR scanner check-in/check-out page"
```

---

### Task 8: Update sidebar + tab bar labels

**Files:**
- Modify: `frontend/src/components/forms/employee/employee-sidebar.tsx`
- Modify: `frontend/src/components/employee/bottom-tab-bar.tsx`

- [ ] **Step 1: Update sidebar label**

In `employee-sidebar.tsx`, change the nav item:
```typescript
  { href: "/employee/my-qr", icon: QrCode, label: "QR Cá nhân" },
```
To:
```typescript
  { href: "/employee/my-qr", icon: QrCode, label: "Quét QR" },
```

- [ ] **Step 2: Update bottom tab bar - swap Hồ sơ for Quét QR**

In `bottom-tab-bar.tsx`, replace the entire tabs array:

```typescript
const tabs = [
  { href: "/employee", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/my-qr", icon: QrCode, label: "Quét QR" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]
```

Also add the QrCode import at the top (add to existing lucide imports):
```typescript
import { LayoutDashboard, Calendar, Clock, Wallet, User, QrCode } from "lucide-react"
```

Remove the Wallet import since Lương is no longer in the bottom tabs.

- [ ] **Step 3: Verify TypeScript**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/components/forms/employee/employee-sidebar.tsx src/components/employee/bottom-tab-bar.tsx
git commit -m "refactor(employee): update QR labels, swap tab for scanner"
```

---

### Task 9: Final verification

- [ ] **Step 1: Backend Python check**

Run: `cd /mnt/newhome/code/hr_management/backend && .venv/bin/python -c "from src.api.routes.nhan_vien.cham_cong import router; print('OK')"`

- [ ] **Step 2: Frontend TypeScript check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Verify all commits**

Run: `git log --oneline -8`
