# Employee Portal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full redesign of employee portal with dashboard-modern aesthetic, wire real API data to 4 static pages, fix layout to use dual-panel sidebar.

**Architecture:** Replace inline sidebar layout with `SidebarProvider` + `EmployeeSidebar` matching admin's `AuthenticatedLayout` pattern. Rewrite Dashboard, Cham Cong, Luong, Profile pages to use existing hooks. Fix My QR layout. Keep Nghi Phep untouched.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, TanStack Query, Next.js App Router

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `components/forms/employee/employee-sidebar.tsx` | Fix routes, add QR nav item |
| Modify | `app/(employee)/layout.tsx` | Replace with SidebarProvider + EmployeeSidebar |
| Rewrite | `app/(employee)/employee/page.tsx` | Dashboard with real data |
| Rewrite | `app/(employee)/employee/cham-cong/page.tsx` | Calendar with real data |
| Rewrite | `app/(employee)/employee/luong/page.tsx` | Salary with real data |
| Rewrite | `app/(employee)/employee/profile/page.tsx` | Profile with real data + edit |
| Modify | `app/(employee)/employee/my-qr/page.tsx` | Remove AuthenticatedLayout wrapper |

---

### Task 1: Fix EmployeeSidebar Routes + Add QR Item

**Files:**
- Modify: `frontend/src/components/forms/employee/employee-sidebar.tsx`

- [ ] **Step 1: Update navItems routes and add QR item**

Replace the `navItems` array (lines 29-55) with:

```ts
import { QrCode } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    url: "/employee",
    icon: LayoutDashboard,
  },
  {
    title: "Nghỉ phép",
    url: "/employee/nghi-phep",
    icon: Calendar,
  },
  {
    title: "Chấm công",
    url: "/employee/cham-cong",
    icon: Clock,
  },
  {
    title: "QR Cá nhân",
    url: "/employee/my-qr",
    icon: QrCode,
  },
  {
    title: "Lương",
    url: "/employee/luong",
    icon: Wallet,
  },
  {
    title: "Hồ sơ",
    url: "/employee/profile",
    icon: User,
  },
]
```

- [ ] **Step 2: Fix logo link**

Change line 115 `href="/dashboard"` to `href="/employee"`.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors related to employee-sidebar.tsx

---

### Task 2: Replace Employee Layout

**Files:**
- Rewrite: `frontend/src/app/(employee)/layout.tsx`

- [ ] **Step 1: Replace layout with SidebarProvider pattern**

Replace the entire file content with:

```tsx
"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { EmployeeSidebar } from "@/components/forms/employee/employee-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const ROUTE_LABELS: Record<string, string> = {
    employee: "Cổng nhân viên",
    "nghi-phep": "Nghỉ phép",
    "cham-cong": "Chấm công",
    luong: "Lương",
    profile: "Hồ sơ",
    "my-qr": "QR Cá nhân",
  }

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbItems = segments.map((seg, i) => {
    const isLast = i === segments.length - 1
    const label = ROUTE_LABELS[seg] || seg
    return {
      label,
      href: "/" + segments.slice(0, i + 1).join("/"),
      isLast,
    }
  })

  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = useCallback((d: Date) => {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    const day = days[d.getDay()]
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    const ss = String(d.getSeconds()).padStart(2, "0")
    return `${day}, ${dd}/${mm}/${yyyy} — ${hh}:${min}:${ss}`
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "280px",
        } as React.CSSProperties
      }
    >
      <EmployeeSidebar />
      <SidebarInset className="flex flex-col min-h-0">
        <header className="sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b bg-white p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, i) => (
                <span key={item.href} className="hidden md:contents">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {now && (
            <span className="ml-auto font-mono text-xs text-slate-400">
              {formatTime(now)}
            </span>
          )}
        </header>
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{
            backgroundImage: "linear-gradient(oklch(0.75 0 0 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0 0 / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundAttachment: "fixed",
            scrollbarGutter: "stable both-edges",
          }}
        >
          <div className="p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 3: Redesign Employee Dashboard with Real Data

**Files:**
- Rewrite: `frontend/src/app/(employee)/employee/page.tsx`

**Data source:** `useEmployeeDashboard()` returns:
```ts
{
  nhan_vien: { id, ma_nhan_vien, ho_ten, email, so_dien_thoai, dia_chi, phong_ban?, chuc_vu? }
  nghi_phep: { so_ngay_phep_con_lai, tong_ngay_phep_nam, don_cho_duyet, da_duyet_thang_nay, don_gan_nhat? }
  cham_cong: { thang_hien_tai: { thang, nam, so_ngay_cong, he_so } }
}
```

- [ ] **Step 1: Rewrite dashboard page**

Replace entire file with:

```tsx
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react"
import { LOAI_NGHI_LABELS, TRANG_THAI_DON_LABELS, TRANG_THAI_DON_COLORS } from "@/types/employee.types"

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const { data: dashboard, isLoading } = useEmployeeDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    )
  }

  const nv = dashboard?.nhan_vien
  const np = dashboard?.nghi_phep
  const cc = dashboard?.cham_cong?.thang_hien_tai

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 p-8 border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">THPT Thăng Long</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Xin chào, {nv?.ho_ten || "Nhân viên"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {nv?.chuc_vu?.ten_chuc_vu || "Nhân viên"} • {nv?.phong_ban?.ten_phong_ban || ""}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm bg-indigo-500/20 text-indigo-200 border-indigo-500/30">
            {nv?.ma_nhan_vien || ""}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Phép còn lại"
          value={np ? `${np.so_ngay_phep_con_lai}/${np.tong_ngay_phep_nam}` : "—"}
          accent="warning"
          onClick={() => router.push("/employee/nghi-phep")}
        />
        <StatCard
          icon={Clock}
          label="Công tháng này"
          value={cc?.so_ngay_cong ?? "—"}
          accent="success"
          onClick={() => router.push("/employee/cham-cong")}
        />
        <StatCard
          icon={FileText}
          label="Đơn chờ duyệt"
          value={np?.don_cho_duyet ?? 0}
          accent={np?.don_cho_duyet ? "danger" : "neutral"}
          onClick={() => router.push("/employee/nghi-phep")}
        />
        <StatCard
          icon={TrendingUp}
          label="Hệ số công"
          value={cc?.he_so ?? "—"}
          accent="info"
          onClick={() => router.push("/employee/cham-cong")}
        />
      </div>

      <Card className="border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => router.push("/employee/nghi-phep")}>
            <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
            <div className="text-left">
              <p className="font-medium">Xin nghỉ phép</p>
              <p className="text-xs text-slate-500">Gửi đơn nghỉ phép mới</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => router.push("/employee/cham-cong")}>
            <Clock className="w-5 h-5 mr-3 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium">Xem chấm công</p>
              <p className="text-xs text-slate-500">Theo dõi ngày công</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" onClick={() => router.push("/employee/profile")}>
            <FileText className="w-5 h-5 mr-3 text-amber-600" />
            <div className="text-left">
              <p className="font-medium">Hồ sơ cá nhân</p>
              <p className="text-xs text-slate-500">Cập nhật thông tin</p>
            </div>
          </Button>
        </div>
      </Card>

      {np?.don_gan_nhat && (
        <Card className="border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Đơn nghỉ phép gần nhất</h2>
            <Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => router.push("/employee/nghi-phep")}>
              Xem tất cả <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100">
            <div>
              <p className="font-medium text-slate-900">{LOAI_NGHI_LABELS[np.don_gan_nhat.loai_nghi] || np.don_gan_nhat.loai_nghi}</p>
              <p className="text-sm text-slate-500">{np.don_gan_nhat.tu_ngay} → {np.don_gan_nhat.den_ngay}</p>
            </div>
            <Badge variant="outline" className={TRANG_THAI_DON_COLORS[np.don_gan_nhat.trang_thai] || ""}>
              {TRANG_THAI_DON_LABELS[np.don_gan_nhat.trang_thai] || np.don_gan_nhat.trang_thai}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 4: Redesign Cham Cong with Real Data

**Files:**
- Rewrite: `frontend/src/app/(employee)/employee/cham-cong/page.tsx`

**Data source:** `useEmployeeChamCongThang(thang, nam)` returns:
```ts
{
  thang, nam, tong_ngay_lam,
  ngay_cong: { co_mat, vang_co_phep, vang_khong_phep, nghi_le },
  chi_tiet: [{ ngay: number, trang_thai: "co_mat"|"vang"|"nghi_le"|"cuoi_tuan" }]
}
```

- [ ] **Step 1: Rewrite cham cong page**

Replace entire file with:

```tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeeChamCongThang } from "@/hooks/employee/use-employee-cham-cong"
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

function getDaysInMonth(thang: number, nam: number) {
  return new Date(nam, thang, 0).getDate()
}

function getFirstDayOfMonth(thang: number, nam: number) {
  return new Date(nam, thang - 1, 1).getDay()
}

const STATUS_STYLE: Record<string, string> = {
  co_mat: "bg-emerald-100 text-emerald-700",
  vang: "bg-amber-100 text-amber-700",
  nghi_le: "bg-purple-100 text-purple-700",
  cuoi_tuan: "bg-slate-50 text-slate-400",
}

export default function EmployeeChamCongPage() {
  const [thang, setThang] = useState(new Date().getMonth() + 1)
  const [nam, setNam] = useState(new Date().getFullYear())

  const { data: chamCong, isLoading } = useEmployeeChamCongThang(thang, nam)

  const daysInMonth = getDaysInMonth(thang, nam)
  const firstDay = getFirstDayOfMonth(thang, nam)
  const nc = chamCong?.ngay_cong

  const chiTietMap = new Map<number, string>()
  if (chamCong?.chi_tiet) {
    chamCong.chi_tiet.forEach((d) => chiTietMap.set(d.ngay, d.trang_thai))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chấm công</h1>
        <p className="text-slate-500 mt-1">Theo dõi ngày công của bạn</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Có mặt" value={nc?.co_mat ?? "—"} accent="success" />
        <StatCard icon={AlertTriangle} label="Vắng CP" value={nc?.vang_co_phep ?? "—"} accent="warning" />
        <StatCard icon={XCircle} label="Vắng KP" value={nc?.vang_khong_phep ?? "—"} accent="danger" />
        <StatCard icon={Clock} label="Tổng ngày công" value={chamCong?.tong_ngay_lam ?? "—"} accent="primary" />
      </div>

      <Card className="border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Đi làm</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">Vắng CP</Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">Nghỉ lễ</Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-400">Cuối tuần</Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {DAY_LABELS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const status = chiTietMap.get(day) || "cuoi_tuan"
              const dayOfWeek = new Date(nam, thang - 1, day).getDay()
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
              const style = chiTietMap.has(day)
                ? STATUS_STYLE[status] || "bg-slate-50 text-slate-400"
                : isWeekend
                ? "bg-slate-50 text-slate-300"
                : "bg-white border border-slate-200 text-slate-900"
              return (
                <div
                  key={day}
                  className={`h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium ${style}`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 5: Redesign Luong with Real Data

**Files:**
- Rewrite: `frontend/src/app/(employee)/employee/luong/page.tsx`

**Data source:** `useEmployeeLuong()` returns `{ items: PhieuLuongEmployee[], total }` where:
```ts
PhieuLuongEmployee = {
  id, thang, nam, tong_thu_nhap, tong_khau_tru, luong_thuc_nhan, ngay_thanh_toan?,
  chi_tiet: { luong_co_ban, phu_cap, thuong, bao_hiem, thue, khac }
}
```

- [ ] **Step 1: Rewrite luong page**

Replace entire file with:

```tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeeLuong } from "@/hooks/employee/use-employee-luong"
import { Wallet, ArrowDownUp, ArrowDownRight, Banknote } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)

export default function EmployeeLuongPage() {
  const [nam, setNam] = useState(CURRENT_YEAR)
  const { data: luongData, isLoading } = useEmployeeLuong({ nam })

  const phieuLuongs = luongData?.items || []
  const latestPhieu = phieuLuongs.length > 0 ? phieuLuongs[0] : null
  const ct = latestPhieu?.chi_tiet

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lương</h1>
          <p className="text-slate-500 mt-1">Tra cứu thông tin lương của bạn</p>
        </div>
        <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
      ) : latestPhieu ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label="Tổng thu nhập" value={formatCurrency(latestPhieu.tong_thu_nhap)} accent="success" />
            <StatCard icon={ArrowDownRight} label="Khấu trừ" value={formatCurrency(latestPhieu.tong_khau_tru)} accent="danger" />
            <StatCard icon={Banknote} label="Thực nhận" value={formatCurrency(latestPhieu.luong_thuc_nhan)} accent="primary" />
            <StatCard icon={ArrowDownUp} label="Tháng" value={`T${latestPhieu.thang}/${latestPhieu.nam}`} accent="info" />
          </div>

          <Card className="border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Phiếu lương tháng {latestPhieu.thang}/{latestPhieu.nam}
              </h2>
              {latestPhieu.ngay_thanh_toan && (
                <Badge variant="outline">Thanh toán: {latestPhieu.ngay_thanh_toan}</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Lương cơ bản</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(ct?.luong_co_ban || 0)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Phụ cấp</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(ct?.phu_cap || 0)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Thưởng</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(ct?.thuong || 0)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Bảo hiểm</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(ct?.bao_hiem || 0)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Thuế</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(ct?.thue || 0)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Khác</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(ct?.khac || 0)}</p>
              </div>
            </div>
          </Card>

          {phieuLuongs.length > 1 && (
            <Card className="border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Lịch sử lương</h2>
              <div className="space-y-2">
                {phieuLuongs.slice(1).map((pl) => (
                  <div key={pl.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">Tháng {pl.thang}/{pl.nam}</p>
                      <p className="text-sm text-slate-500">
                        CB: {formatCurrency(pl.chi_tiet?.luong_co_ban || 0)} • Thuế: {formatCurrency(pl.chi_tiet?.thue || 0)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(pl.luong_thuc_nhan)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="border border-slate-200 shadow-sm p-12 text-center">
          <Banknote className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-600">Chưa có dữ liệu lương</h3>
          <p className="text-sm text-slate-500 mt-1">Dữ liệu lương sẽ hiển thị khi có phiếu lương</p>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 6: Redesign Profile with Real Data + Edit

**Files:**
- Rewrite: `frontend/src/app/(employee)/employee/profile/page.tsx`

**Data source:** `useEmployeeProfile()` returns `EmployeeProfile`, `useUpdateEmployeeProfile()` mutation accepts `{ email, so_dien_thoai, dia_chi }`

- [ ] **Step 1: Rewrite profile page**

Replace entire file with:

```tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useEmployeeProfile, useUpdateEmployeeProfile } from "@/hooks/employee/use-employee-profile"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
  Building2,
  Award,
  Pencil,
  Check,
  X,
} from "lucide-react"

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-slate-400 shrink-0" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value || "—"}</p>
      </div>
    </div>
  )
}

function EditableRow({
  icon: Icon,
  label,
  value,
  field,
  editData,
  setEditData,
  isEditing,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  field: string
  editData: Record<string, string>
  setEditData: (d: Record<string, string>) => void
  isEditing: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-slate-400 shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        {isEditing ? (
          <Input
            value={editData[field] ?? value ?? ""}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="h-8 text-sm"
          />
        ) : (
          <p className="font-medium text-slate-900">{value || "—"}</p>
        )}
      </div>
    </div>
  )
}

export default function EmployeeProfilePage() {
  const { data: profile, isLoading } = useEmployeeProfile()
  const updateMutation = useUpdateEmployeeProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, string>>({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    )
  }

  const startEdit = () => {
    setEditData({
      email_ca_nhan: profile?.email_ca_nhan || "",
      so_dien_thoai: profile?.so_dien_thoai || "",
      dia_chi: profile?.dia_chi || "",
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const saveEdit = () => {
    updateMutation.mutate(
      {
        email: editData.email_ca_nhan || undefined,
        so_dien_thoai: editData.so_dien_thoai || undefined,
        dia_chi: editData.dia_chi || undefined,
      },
      { onSuccess: () => { setIsEditing(false); setEditData({}) } }
    )
  }

  const loaiLabel = (loai: string) => {
    const map: Record<string, string> = {
      giao_vien: "Giáo viên",
      nhan_vien: "Nhân viên",
      can_bo: "Cán bộ",
    }
    return map[loai] || loai
  }

  const trangThaiLabel = (tt: string) => {
    const map: Record<string, string> = {
      dang_lam: "Đang làm việc",
      nghi_viec: "Nghỉ việc",
      nghi_huu: "Nghỉ hưu",
    }
    return map[tt] || tt
  }

  const initials = profile?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Thông tin cá nhân của bạn</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={startEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>
              <Check className="w-4 h-4 mr-1" />
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        )}
      </div>

      <Card className="border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">{profile?.ho_ten}</h2>
              <Badge variant="secondary">{loaiLabel(profile?.loai_nhan_vien || "")}</Badge>
              <Badge variant="outline">{trangThaiLabel(profile?.trang_thai || "")}</Badge>
            </div>
            <p className="text-slate-500">{profile?.ma_nhan_vien} • {profile?.phong_ban?.ten_phong_ban || "—"}</p>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow icon={User} label="Giới tính" value={profile?.gioi_tinh} />
          <InfoRow icon={Calendar} label="Ngày sinh" value={profile?.ngay_sinh} />
          <InfoRow icon={CreditCard} label="Số CCCD" value={profile?.so_cccd} />
          <InfoRow icon={MapPin} label="Quê quán" value={profile?.que_quan} />
        </div>
      </Card>

      <Card className="border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow icon={Mail} label="Email công việc" value={profile?.email} />
          <EditableRow
            icon={Phone}
            label="Số điện thoại"
            value={profile?.so_dien_thoai}
            field="so_dien_thoai"
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
          />
          <EditableRow
            icon={Mail}
            label="Email cá nhân"
            value={profile?.email_ca_nhan}
            field="email_ca_nhan"
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
          />
          <EditableRow
            icon={MapPin}
            label="Địa chỉ"
            value={profile?.dia_chi}
            field="dia_chi"
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
          />
        </div>
      </Card>

      <Card className="border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin công tác</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow icon={Building2} label="Phòng ban" value={profile?.phong_ban?.ten_phong_ban} />
          <InfoRow icon={Award} label="Chức vụ" value={profile?.chuc_vu?.ten_chuc_vu} />
          <InfoRow icon={Calendar} label="Ngày vào làm" value={profile?.ngay_vao_lam} />
          <InfoRow icon={Briefcase} label="Loại nhân viên" value={loaiLabel(profile?.loai_nhan_vien || "")} />
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 7: Fix My QR Layout

**Files:**
- Modify: `frontend/src/app/(employee)/employee/my-qr/page.tsx`

- [ ] **Step 1: Remove AuthenticatedLayout wrapper**

Replace entire file with:

```tsx
"use client"

import { useEmployeeProfile } from "@/hooks/employee"
import { useGetMyQR } from "@/hooks/nghi-phep"
import { QrCode, RefreshCw } from "lucide-react"

export default function MyQRPage() {
  const { data: profile } = useEmployeeProfile()
  const { data: qrData, isLoading, refetch } = useGetMyQR()

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">QR Chấm công</h1>
        <p className="text-slate-500 mt-1">Quét QR để chấm công hàng ngày</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-indigo-600">
              {profile?.ho_ten?.charAt(0) || "?"}
            </span>
          </div>
          <h2 className="text-lg font-semibold">{profile?.ho_ten || "Nhân viên"}</h2>
          <p className="text-sm text-slate-500">{profile?.ma_nhan_vien}</p>
        </div>

        <div className="flex justify-center mb-6">
          {isLoading ? (
            <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : qrData?.qr_data ? (
            <div className="p-4 bg-white rounded-lg border-2 border-slate-100">
              <img
                src={qrData.qr_data}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg">
              <QrCode className="h-12 w-12 text-slate-300" />
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => refetch()}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới QR
          </button>
          <p className="text-xs text-slate-400 mt-3">
            QR sẽ thay đổi mỗi ngày. Vui lòng quét trong giờ làm việc.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -10`
Expected: No errors

---

### Task 8: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Visual spot-check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npm run dev`
Open browser and verify:
- `/employee` - Dashboard with indigo hero, 4 stat cards, data from API
- `/employee/cham-cong` - Calendar grid with colored days, month/year picker
- `/employee/luong` - Salary breakdown, history list
- `/employee/profile` - Profile info, edit mode for contact fields
- `/employee/my-qr` - QR code without admin sidebar
- `/employee/nghi-phep` - Unchanged, still works
