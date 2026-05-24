# Employee Portal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 6 employee-facing pages from admin-style to friendly, education-oriented mobile-first portal using Ocean Calm palette and Bento Grid layout.

**Architecture:** Mobile-first responsive with bottom tab bar (<1024px) and sidebar (>=1024px). All pages share reusable components (PageHeader, BentoCard). Existing hooks/types/schemas unchanged - only UI layer modified.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, framer-motion, lucide-react

---

## File Structure

### New files to create:
| File | Responsibility |
|------|---------------|
| `src/components/employee/page-header.tsx` | Reusable gradient header with title + optional actions |
| `src/components/employee/bento-card.tsx` | Reusable stat card with icon/label/value/subtitle + color tints |
| `src/components/employee/bottom-tab-bar.tsx` | Fixed bottom navigation for mobile (5 tabs) |

### Files to modify:
| File | What changes |
|------|-------------|
| `src/components/forms/employee/employee-sidebar.tsx` | Restyle Ocean Calm colors, replace emerald with blue |
| `src/app/(employee)/layout.tsx` | Add responsive: bottom tab (mobile) vs sidebar (desktop) |
| `src/app/(employee)/employee/page.tsx` | Bento Generous dashboard redesign |
| `src/app/(employee)/employee/cham-cong/page.tsx` | Calendar-centric redesign |
| `src/app/(employee)/employee/nghi-phep/page.tsx` | Header + stats + list redesign |
| `src/app/(employee)/employee/luong/page.tsx` | Header + payslip card redesign |
| `src/app/(employee)/employee/profile/page.tsx` | Centered header + info cards redesign |
| `src/app/(employee)/employee/my-qr/page.tsx` | Centered card restyle |

### Files NOT changed:
- All hooks (`src/hooks/employee/*`, `src/hooks/nghi-phep/*`, `src/hooks/upload/*`)
- All types (`src/types/employee.types.ts`, `src/types/nghi-phep.types.ts`)
- All schemas (`src/schemas/employee.schema.ts`)
- Admin-side anything
- Backend API
- `src/components/ui/*` (reuse existing shadcn components as-is)

---

### Task 1: Create BentoCard Component

**Files:**
- Create: `src/components/employee/bento-card.tsx`

- [ ] **Step 1: Create the BentoCard component**

```tsx
"use client"

import { cn } from "@/lib/utils"

type BentoVariant = "blue" | "darkBlue" | "amber" | "green" | "red" | "slate" | "outline"

const VARIANT_STYLES: Record<BentoVariant, { bg: string; text: string; sub: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", sub: "text-blue-500" },
  darkBlue: { bg: "bg-blue-600", text: "text-white", sub: "text-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", sub: "text-amber-500" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", sub: "text-emerald-500" },
  red: { bg: "bg-red-50", text: "text-red-700", sub: "text-red-500" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", sub: "text-slate-400" },
  outline: { bg: "bg-white", text: "text-blue-600", sub: "text-slate-400" },
}

interface BentoCardProps {
  label: string
  value: string | number
  subtitle?: string
  variant?: BentoVariant
  className?: string
  onClick?: () => void
}

export function BentoCard({
  label,
  value,
  subtitle,
  variant = "blue",
  className,
  onClick,
}: BentoCardProps) {
  const v = VARIANT_STYLES[variant]
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        v.bg,
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <div className={cn("text-xs font-medium", v.sub)}>{label}</div>
      <div className={cn("text-2xl font-extrabold mt-1", v.text)}>{value}</div>
      {subtitle && <div className={cn("text-xs mt-1", v.sub)}>{subtitle}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit --pretty src/components/employee/bento-card.tsx 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/employee/bento-card.tsx
git commit -m "feat(employee): add BentoCard component"
```

---

### Task 2: Create PageHeader Component

**Files:**
- Create: `src/components/employee/page-header.tsx`

- [ ] **Step 1: Create the PageHeader component**

```tsx
"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 rounded-2xl p-5 text-white",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/employee/page-header.tsx
git commit -m "feat(employee): add PageHeader component"
```

---

### Task 3: Create EmployeeBottomTabBar Component

**Files:**
- Create: `src/components/employee/bottom-tab-bar.tsx`

- [ ] **Step 1: Create the bottom tab bar component**

This component reads the current pathname and renders 5 fixed tabs at the bottom. It uses `Link` from Next.js for navigation and highlights the active tab.

```tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Clock, Wallet, User } from "lucide-react"

const tabs = [
  { href: "/employee", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/luong", icon: Wallet, label: "Lương" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]

function isTabActive(pathname: string, href: string) {
  if (href === "/employee") return pathname === "/employee"
  return pathname.startsWith(href)
}

export function EmployeeBottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors",
                active ? "text-blue-600" : "text-slate-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                  active ? "bg-blue-600 text-white" : ""
                )}
              >
                <tab.icon className="w-[18px] h-[18px]" />
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/employee/bottom-tab-bar.tsx
git commit -m "feat(employee): add EmployeeBottomTabBar component"
```

---

### Task 4: Restyle EmployeeSidebar (Ocean Calm)

**Files:**
- Modify: `src/components/forms/employee/employee-sidebar.tsx`

- [ ] **Step 1: Replace entire sidebar file with Ocean Calm styling**

Change emerald → blue color scheme, keep all navigation items the same. Add `hidden lg:flex` to only show on desktop (complements bottom tab bar on mobile).

```tsx
"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Wallet,
  User,
  LogOut,
  GraduationCap,
  QrCode,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthActions } from "@/stores/auth.store"

const navItems = [
  { href: "/employee", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/my-qr", icon: QrCode, label: "QR Cá nhân" },
  { href: "/employee/luong", icon: Wallet, label: "Lương" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]

export function EmployeeSidebar() {
  const pathname = usePathname()
  const { logout } = useAuthActions()

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-60 bg-white border-r border-blue-100 flex-col hidden lg:flex">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-blue-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <GraduationCap className="size-4" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-semibold text-slate-900">THPT Thăng Long</span>
          <span className="block text-[11px] text-slate-500">Cổng nhân viên</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/employee"
              ? pathname === "/employee"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-blue-100">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/employee/employee-sidebar.tsx
git commit -m "refactor(employee): restyle sidebar to Ocean Calm blue palette"
```

---

### Task 5: Redesign Employee Layout (Responsive)

**Files:**
- Modify: `src/app/(employee)/layout.tsx`

- [ ] **Step 1: Replace entire layout with responsive bottom-tab / sidebar switch**

Key changes:
- Add `EmployeeBottomTabBar` for mobile
- Desktop: sidebar (w-60) + content area (pl-60)
- Mobile: no sidebar, no header, bottom tab bar, content with pb-20 for tab bar clearance
- Change emerald loading screen to blue

```tsx
"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { EmployeeSidebar } from "@/components/forms/employee/employee-sidebar"
import { EmployeeBottomTabBar } from "@/components/employee/bottom-tab-bar"
import { useAuthStore } from "@/stores/auth.store"
import type { UserRole } from "@/types/auth.types"

const EMPLOYEE_ROLES: UserRole[] = ["GIAO_VIEN", "NHAN_VIEN"]
const ADMIN_ROLES: UserRole[] = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && ADMIN_ROLES.includes(user.role) && !EMPLOYEE_ROLES.includes(user.role)) {
      router.push("/dashboard")
    }
  }, [mounted, isAuthenticated, user, router])

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-blue-50/30">
        <div className="text-sm text-slate-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeSidebar />
      <div className="lg:pl-60">
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
      <EmployeeBottomTabBar />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx next build 2>&1 | tail -20` (or just tsc check)

- [ ] **Step 3: Commit**

```bash
git add src/app/\(employee\)/layout.tsx
git commit -m "refactor(employee): responsive layout with bottom tab bar + sidebar"
```

---

### Task 6: Redesign Dashboard Page (Bento Generous)

**Files:**
- Modify: `src/app/(employee)/employee/page.tsx`

- [ ] **Step 1: Replace entire dashboard page with Bento Generous layout**

Layout: Hero banner → bento stat grid (2 cols uneven) → activity feed → quick actions. Uses existing hooks unchanged.

```tsx
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  ArrowUpRight,
  GraduationCap,
  QrCode,
  Wallet,
} from "lucide-react"
import {
  LOAI_NGHI_LABELS,
  TRANG_THAI_DON_LABELS,
  TRANG_THAI_DON_COLORS,
} from "@/types/employee.types"

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

  const initials = nv?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-blue-200" />
              <span className="text-xs text-blue-200">THPT Thăng Long</span>
            </div>
            <h1 className="text-xl font-bold">Xin chào, {nv?.ho_ten || "Nhân viên"} 👋</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {nv?.chuc_vu?.ten_chuc_vu || "Nhân viên"}
              {nv?.phong_ban?.ten_phong_ban ? ` · ${nv.phong_ban.ten_phong_ban}` : ""}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold shrink-0">
            {initials}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BentoCard
          label="🏖️ Phép còn lại"
          value={np ? `${np.so_ngay_phep_con_lai}` : "—"}
          subtitle={np ? `/ ${np.tong_ngay_phep_nam} ngày` : undefined}
          variant="blue"
          onClick={() => router.push("/employee/nghi-phep")}
        />
        <BentoCard
          label="📋 Công tháng này"
          value={cc?.so_ngay_cong ?? "—"}
          subtitle="ngày làm việc"
          variant="green"
          onClick={() => router.push("/employee/cham-cong")}
        />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3">
          <BentoCard
            label="⏳ Đơn chờ duyệt"
            value={np?.don_cho_duyet ?? 0}
            subtitle="đơn nghỉ phép"
            variant={np?.don_cho_duyet ? "amber" : "slate"}
            onClick={() => router.push("/employee/nghi-phep")}
          />
        </div>
        <div className="col-span-2">
          <BentoCard
            label="Hệ số CC"
            value={cc?.he_so ?? "—"}
            variant="outline"
            onClick={() => router.push("/employee/cham-cong")}
          />
        </div>
      </div>

      {np?.don_gan_nhat && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Hoạt động gần đây</h2>
            <button
              onClick={() => router.push("/employee/nghi-phep")}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-sm">📅</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {LOAI_NGHI_LABELS[np.don_gan_nhat.loai_nghi] || np.don_gan_nhat.loai_nghi}
              </p>
              <p className="text-xs text-slate-500">
                {np.don_gan_nhat.tu_ngay} → {np.don_gan_nhat.den_ngay}
              </p>
            </div>
            <Badge
              variant="outline"
              className={TRANG_THAI_DON_COLORS[np.don_gan_nhat.trang_thai] || ""}
            >
              {TRANG_THAI_DON_LABELS[np.don_gan_nhat.trang_thai] || np.don_gan_nhat.trang_thai}
            </Badge>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/employee/nghi-phep")}
          className="bg-blue-600 rounded-2xl p-3 text-center hover:bg-blue-700 transition-colors"
        >
          <div className="text-lg mb-0.5">✏️</div>
          <div className="text-[11px] text-white font-semibold">Xin nghỉ</div>
        </button>
        <button
          onClick={() => router.push("/employee/my-qr")}
          className="bg-blue-900 rounded-2xl p-3 text-center hover:bg-blue-950 transition-colors"
        >
          <div className="text-lg mb-0.5">📷</div>
          <div className="text-[11px] text-white font-semibold">QR của tôi</div>
        </button>
        <button
          onClick={() => router.push("/employee/luong")}
          className="bg-white border-2 border-blue-600 rounded-2xl p-3 text-center hover:bg-blue-50 transition-colors"
        >
          <div className="text-lg mb-0.5">💰</div>
          <div className="text-[11px] text-blue-600 font-semibold">Xem lương</div>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/page.tsx
git commit -m "feat(employee): bento generous dashboard redesign"
```

---

### Task 7: Redesign Cham Cong Page (Calendar-Centric)

**Files:**
- Modify: `src/app/(employee)/employee/cham-cong/page.tsx`

- [ ] **Step 1: Replace entire cham-cong page with calendar-centric layout**

Layout: PageHeader with month selector → stat row (3 cols) → calendar month grid → legend.

```tsx
"use client"

import { useState } from "react"
import { BentoCard } from "@/components/employee/bento-card"
import { PageHeader } from "@/components/employee/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeeChamCongThang } from "@/hooks/employee/use-employee-cham-cong"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

function getDaysInMonth(thang: number, nam: number) {
  return new Date(nam, thang, 0).getDate()
}

function getFirstDayOffset(thang: number, nam: number) {
  const day = new Date(nam, thang - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function EmployeeChamCongPage() {
  const [thang, setThang] = useState(new Date().getMonth() + 1)
  const [nam, setNam] = useState(new Date().getFullYear())

  const { data: chamCong, isLoading } = useEmployeeChamCongThang(thang, nam)

  const daysInMonth = getDaysInMonth(thang, nam)
  const firstDayOffset = getFirstDayOffset(thang, nam)
  const nc = chamCong?.ngay_cong

  const chiTietMap = new Map<number, string>()
  if (chamCong?.chi_tiet) {
    chamCong.chi_tiet.forEach((d) => chiTietMap.set(d.ngay, d.trang_thai))
  }

  const today = new Date()
  const isCurrentMonth = thang === today.getMonth() + 1 && nam === today.getFullYear()

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Chấm công"
        subtitle="Theo dõi ngày công của bạn"
        actions={
          <div className="flex gap-2">
            <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
              <SelectTrigger className="w-[100px] h-8 bg-white/15 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
              <SelectTrigger className="w-[90px] h-8 bg-white/15 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <BentoCard label="Có mặt" value={nc?.co_mat ?? "—"} variant="blue" />
        <BentoCard label="Vắng CP" value={nc?.vang_co_phep ?? "—"} variant="amber" />
        <BentoCard label="Vắng KP" value={nc?.vang_khong_phep ?? "—"} variant="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }, (_, i) => (
                <div key={`e-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const status = chiTietMap.get(day)
                const dayOfWeek = new Date(nam, thang - 1, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const isToday = isCurrentMonth && day === today.getDate()

                let cellClass = "bg-slate-50 text-slate-300"
                if (status === "co_mat") cellClass = "bg-blue-500 text-white"
                else if (status === "vang") cellClass = "bg-amber-400 text-white"
                else if (status === "nghi_le") cellClass = "bg-purple-100 text-purple-700"
                else if (!status && !isWeekend) cellClass = "bg-white border border-slate-200 text-slate-900"
                else if (isWeekend) cellClass = "bg-slate-50 text-slate-300"

                if (isToday && !status) {
                  cellClass = "border-2 border-blue-500 text-blue-700 bg-blue-50 font-bold"
                }

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${cellClass}`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-[10px] text-slate-500">Có mặt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-[10px] text-slate-500">Nghỉ phép</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-[10px] text-slate-500">Nghỉ KK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-200" />
                <span className="text-[10px] text-slate-500">Nghỉ lễ</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/cham-cong/page.tsx
git commit -m "feat(employee): calendar-centric cham cong redesign"
```

---

### Task 8: Redesign Nghi Phep Page

**Files:**
- Modify: `src/app/(employee)/employee/nghi-phep/page.tsx`

- [ ] **Step 1: Replace entire nghi-phep page**

Layout: PageHeader with "Xin nghỉ" button → 3 stat cards → leave request list → dialog (unchanged logic, keep existing `CreateEmployeeDonNghiDialog`).

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Hourglass, FileText } from "lucide-react"
import { PageHeader } from "@/components/employee/page-header"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  useEmployeeNghiPhepList,
  useCreateEmployeeDonNghi,
  useHuyDonNghi,
} from "@/hooks/employee/use-employee-nghi-phep"
import { CreateEmployeeDonNghiDialog } from "./_components/create-don-nghi-dialog"
import { format } from "date-fns"
import type { LoaiNghi } from "@/types/nghi-phep.types"
import {
  LOAI_NGHI_LABELS,
  TRANG_THAI_DON_LABELS,
  TRANG_THAI_DON_COLORS,
} from "@/types/employee.types"

const TRANG_THAI_2LEVEL_LABELS: Record<string, string> = {
  cho_duyet_cap_1: "Chờ duyệt",
  cho_duyet_cap_2: "Chờ duyệt cấp 2",
  da_duyet_cap_2: "Đã duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
  huy: "Đã hủy",
}

const TRANG_THAI_2LEVEL_COLORS: Record<string, string> = {
  cho_duyet_cap_1: "bg-amber-100 text-amber-700 border-amber-200",
  cho_duyet_cap_2: "bg-blue-100 text-blue-700 border-blue-200",
  da_duyet_cap_2: "bg-emerald-100 text-emerald-700 border-emerald-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-red-100 text-red-700 border-red-200",
  huy: "bg-slate-100 text-slate-500 border-slate-200",
}

const DON_ICONS: Record<string, string> = {
  phep_nam: "🏖️",
  nghi_om: "🤒",
  viec_rieng: "🏠",
  cong_tac: "✈️",
  ket_hon: "💍",
  mai_tang: "🕊️",
  thai_san: "👶",
}

export default function EmployeeNghiPhepPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: dashboard } = useEmployeeDashboard()
  const { data: nghiPhepList, isLoading } = useEmployeeNghiPhepList()
  const createMutation = useCreateEmployeeDonNghi()
  const huyMutation = useHuyDonNghi()

  const nghiPhep = dashboard?.nghi_phep
  const donList = nghiPhepList?.items ?? []
  const nhanVienId = dashboard?.nhan_vien?.id ?? ""
  const hoTen = dashboard?.nhan_vien?.ho_ten ?? ""

  const handleCreate = (data: {
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
    files?: string[]
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false)
      },
    })
  }

  const handleHuy = (donId: string) => {
    huyMutation.mutate(donId)
  }

  const getStatusLabel = (status: string) =>
    TRANG_THAI_2LEVEL_LABELS[status] || TRANG_THAI_DON_LABELS[status] || status

  const getStatusColor = (status: string) =>
    TRANG_THAI_2LEVEL_COLORS[status] || TRANG_THAI_DON_COLORS[status] || ""

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Nghỉ phép"
        subtitle="Quản lý đơn nghỉ phép"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-white/15 hover:bg-white/25 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Xin nghỉ
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <BentoCard
          label="🏖️ Còn lại"
          value={nghiPhep?.so_ngay_phep_con_lai ?? "—"}
          subtitle="ngày phép"
          variant="green"
        />
        <BentoCard
          label="⏳ Chờ duyệt"
          value={nghiPhep?.don_cho_duyet ?? 0}
          subtitle="đơn"
          variant="amber"
        />
        <BentoCard
          label="✅ Đã duyệt"
          value={nghiPhep?.da_duyet_thang_nay ?? 0}
          subtitle="tháng này"
          variant="blue"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Đơn nghỉ phép</h2>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-slate-400">Đang tải...</div>
        ) : donList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có đơn nghỉ phép nào</div>
        ) : (
          <div className="space-y-2">
            {donList.map((don) => (
              <div
                key={don.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0">
                  {DON_ICONS[don.loai_nghi] || "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {LOAI_NGHI_LABELS[don.loai_nghi] || don.ten_loai_nghi}
                    </p>
                    {don.files && don.files.length > 0 && (
                      <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {format(new Date(don.tu_ngay), "dd/MM")} — {format(new Date(don.den_ngay), "dd/MM")} · {don.so_ngay} ngày
                  </p>
                  {don.ghi_chu_duyet && don.trang_thai === "tu_choi" && (
                    <p className="text-[10px] text-red-500 mt-0.5">Lý do: {don.ghi_chu_duyet}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className={`text-[10px] px-2 ${getStatusColor(don.trang_thai)}`}>
                    {getStatusLabel(don.trang_thai)}
                  </Badge>
                  {(don.trang_thai === "cho_duyet_cap_1" || don.trang_thai === "cho_duyet_cap_2") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs px-2"
                      onClick={() => handleHuy(don.id)}
                      disabled={huyMutation.isPending}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateEmployeeDonNghiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        nhanVienId={nhanVienId}
        hoTen={hoTen}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/nghi-phep/page.tsx
git commit -m "feat(employee): nghi phep page redesign with bento stats"
```

---

### Task 9: Redesign Luong Page

**Files:**
- Modify: `src/app/(employee)/employee/luong/page.tsx`

- [ ] **Step 1: Replace entire luong page**

Layout: PageHeader with year selector → 2 stat cards → latest payslip detail card → history list.

```tsx
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/employee/page-header"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeLuong } from "@/hooks/employee/use-employee-luong"
import { Banknote } from "lucide-react"

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
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Lương"
        subtitle="Tra cứu thông tin lương"
        actions={
          <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
            <SelectTrigger className="w-[90px] h-8 bg-white/15 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
      ) : latestPhieu ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <BentoCard
              label="💰 Thực nhận"
              value={formatCurrency(latestPhieu.luong_thuc_nhan)}
              subtitle={`Tháng ${latestPhieu.thang}/${latestPhieu.nam}`}
              variant="blue"
            />
            <BentoCard
              label="Khấu trừ"
              value={formatCurrency(latestPhieu.tong_khau_tru)}
              variant="red"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Phiếu lương tháng {latestPhieu.thang}/{latestPhieu.nam}
              </h2>
              {latestPhieu.ngay_thanh_toan && (
                <Badge variant="outline" className="text-[10px]">
                  Thanh toán: {latestPhieu.ngay_thanh_toan}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lương cơ bản</p>
                <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(ct?.luong_co_ban || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Phụ cấp</p>
                <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(ct?.phu_cap || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Thưởng</p>
                <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(ct?.thuong || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Bảo hiểm</p>
                <p className="text-base font-bold text-red-600 mt-1">-{formatCurrency(ct?.bao_hiem || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Thuế</p>
                <p className="text-base font-bold text-red-600 mt-1">-{formatCurrency(ct?.thue || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Khác</p>
                <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(ct?.khac || 0)}</p>
              </div>
            </div>
          </div>

          {phieuLuongs.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Lịch sử lương</h2>
              <div className="space-y-2">
                {phieuLuongs.slice(1).map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">Tháng {pl.thang}/{pl.nam}</p>
                      <p className="text-xs text-slate-500">
                        CB: {formatCurrency(pl.chi_tiet?.luong_co_ban || 0)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(pl.luong_thuc_nhan)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Banknote className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-500">Chưa có dữ liệu lương</h3>
          <p className="text-xs text-slate-400 mt-1">Dữ liệu sẽ hiển thị khi có phiếu lương</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/luong/page.tsx
git commit -m "feat(employee): luong page redesign with bento cards"
```

---

### Task 10: Redesign Profile Page

**Files:**
- Modify: `src/app/(employee)/employee/profile/page.tsx`

- [ ] **Step 1: Replace entire profile page**

Layout: Centered profile header (avatar + name + badges) → info cards.

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
  GraduationCap,
} from "lucide-react"

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
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
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
      <div className="flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {isEditing ? (
          <Input
            value={editData[field] ?? value ?? ""}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="h-7 text-sm"
          />
        ) : (
          <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
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
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
          {initials}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{profile?.ho_ten}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">{loaiLabel(profile?.loai_nhan_vien || "")}</Badge>
          <Badge variant="outline" className="text-xs">{trangThaiLabel(profile?.trang_thai || "")}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {profile?.ma_nhan_vien} · {profile?.phong_ban?.ten_phong_ban || "—"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={User} label="Giới tính" value={profile?.gioi_tinh} />
          <InfoRow icon={Calendar} label="Ngày sinh" value={profile?.ngay_sinh} />
          <InfoRow icon={CreditCard} label="Số CCCD" value={profile?.so_cccd} />
          <InfoRow icon={MapPin} label="Quê quán" value={profile?.que_quan} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Liên hệ</h3>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={startEdit} className="text-blue-600 h-7 text-xs">
              <Pencil className="w-3 h-3 mr-1" />
              Sửa
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 text-xs">
                <X className="w-3 h-3 mr-1" />Hủy
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                <Check className="w-3 h-3 mr-1" />
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={Mail} label="Email công việc" value={profile?.email} />
          <EditableRow icon={Phone} label="Số điện thoại" value={profile?.so_dien_thoai} field="so_dien_thoai" editData={editData} setEditData={setEditData} isEditing={isEditing} />
          <EditableRow icon={Mail} label="Email cá nhân" value={profile?.email_ca_nhan} field="email_ca_nhan" editData={editData} setEditData={setEditData} isEditing={isEditing} />
          <EditableRow icon={MapPin} label="Địa chỉ" value={profile?.dia_chi} field="dia_chi" editData={editData} setEditData={setEditData} isEditing={isEditing} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Thông tin công tác</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={Building2} label="Phòng ban" value={profile?.phong_ban?.ten_phong_ban} />
          <InfoRow icon={Award} label="Chức vụ" value={profile?.chuc_vu?.ten_chuc_vu} />
          <InfoRow icon={Calendar} label="Ngày vào làm" value={profile?.ngay_vao_lam} />
          <InfoRow icon={Briefcase} label="Loại nhân viên" value={loaiLabel(profile?.loai_nhan_vien || "")} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/profile/page.tsx
git commit -m "feat(employee): profile page redesign with centered header"
```

---

### Task 11: Redesign My QR Page

**Files:**
- Modify: `src/app/(employee)/employee/my-qr/page.tsx`

- [ ] **Step 1: Replace entire my-qr page with Ocean Calm styling**

```tsx
"use client"

import { useEmployeeProfile } from "@/hooks/employee"
import { useGetMyQR } from "@/hooks/nghi-phep"
import { QrCode, RefreshCw } from "lucide-react"

export default function MyQRPage() {
  const { data: profile } = useEmployeeProfile()
  const { data: qrData, isLoading, refetch } = useGetMyQR()

  const initials = profile?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="max-w-sm mx-auto space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">{profile?.ho_ten || "Nhân viên"}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{profile?.ma_nhan_vien}</p>
        </div>

        <div className="flex justify-center mb-5">
          {isLoading ? (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : qrData?.qr_data ? (
            <div className="p-3 bg-white rounded-xl border-2 border-blue-100">
              <img src={qrData.qr_data} alt="QR Code" className="w-44 h-44" />
            </div>
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl">
              <QrCode className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới QR
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            QR thay đổi mỗi ngày. Quét trong giờ làm việc.
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(employee\)/employee/my-qr/page.tsx
git commit -m "feat(employee): my-qr page Ocean Calm restyle"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run TypeScript check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -30`

Expected: No errors (or only pre-existing errors unrelated to employee pages)

- [ ] **Step 2: Run dev server and smoke test**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx next dev --port 3001`

Verify manually:
- `/employee` shows Bento Generous dashboard with blue palette
- `/employee/cham-cong` shows calendar-centric view
- `/employee/nghi-phep` shows stats + list
- `/employee/luong` shows payslip details
- `/employee/profile` shows centered profile
- `/employee/my-qr` shows QR card
- On mobile viewport (<1024px): bottom tab bar visible, sidebar hidden
- On desktop (>=1024px): sidebar visible, bottom tab bar hidden

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(employee): final adjustments after verification"
```
