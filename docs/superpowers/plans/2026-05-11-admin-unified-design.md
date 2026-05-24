# Admin Unified Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared `StatCard` component and unify the admin color theme to indigo across all admin pages.

**Architecture:** Create a single reusable `StatCard` in `components/ui/`, then replace inline stat patterns in 5 admin pages (dashboard, chuc-vu, cham-cong, nghi-phep, luong). Dashboard hero banner migrates from amber to indigo.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide icons, Next.js App Router

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `frontend/src/components/ui/stat-card.tsx` | Shared stat card with accent variants |
| Modify | `frontend/src/app/(admin)/dashboard/page.tsx` | Indigo hero + shared StatCard |
| Modify | `frontend/src/app/(admin)/chuc-vu/page.tsx` | Remove local StatCard, use shared |
| Modify | `frontend/src/app/(admin)/cham-cong/page.tsx` | Replace 6 inline stat divs |
| Modify | `frontend/src/app/(admin)/nghi-phep/page.tsx` | Replace 5 inline stat divs |
| Modify | `frontend/src/app/(admin)/luong/page.tsx` | Replace 4 inline stat divs |

---

### Task 1: Create Shared StatCard Component

**Files:**
- Create: `frontend/src/components/ui/stat-card.tsx`

- [ ] **Step 1: Create the StatCard component**

```tsx
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type AccentVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral"

const ACCENT_MAP: Record<AccentVariant, { iconBg: string; iconText: string; border: string; label: string }> = {
  primary: { iconBg: "bg-indigo-50", iconText: "text-indigo-600", border: "border-l-indigo-500", label: "text-indigo-600" },
  success: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", border: "border-l-emerald-500", label: "text-emerald-600" },
  warning: { iconBg: "bg-amber-50", iconText: "text-amber-600", border: "border-l-amber-500", label: "text-amber-600" },
  danger:  { iconBg: "bg-red-50", iconText: "text-red-600", border: "border-l-red-500", label: "text-red-600" },
  info:    { iconBg: "bg-blue-50", iconText: "text-blue-600", border: "border-l-blue-500", label: "text-blue-600" },
  neutral: { iconBg: "bg-slate-50", iconText: "text-slate-600", border: "border-l-slate-300", label: "text-slate-600" },
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: AccentVariant
  trend?: { value: string; direction: "up" | "down" | "neutral" }
  onClick?: () => void
  active?: boolean
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "neutral",
  trend,
  onClick,
  active,
  className,
}: StatCardProps) {
  const a = ACCENT_MAP[accent]
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all duration-200",
        a.border,
        isClickable && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        active && "ring-2 ring-indigo-500/20 border-l-indigo-500",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", a.iconBg)}>
          <Icon className={cn("h-5 w-5", a.iconText)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {trend && trend.direction !== "neutral" && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-600",
              )}>
                {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors related to stat-card.tsx

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/stat-card.tsx
git commit -m "feat: add shared StatCard component with accent variants"
```

---

### Task 2: Patch Dashboard - Hero Banner Amber to Indigo + Shared StatCard

**Files:**
- Modify: `frontend/src/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Add StatCard import**

At the top of the file, add to the imports section (after line 9 `import { Card } from "@/components/ui/card";`):

```tsx
import { StatCard } from "@/components/ui/stat-card"
```

- [ ] **Step 2: Replace hero banner gradient from amber to indigo**

Find the hero banner `<div>` at line 141 and change:
- `from-amber-900 via-amber-800 to-amber-900` -> `from-indigo-900 via-indigo-800 to-indigo-900`
- `border-amber-700/50` -> `border-indigo-700/50`

In the hero content (lines 149-167), change:
- `text-amber-400` -> `text-indigo-400` (GraduationCap icon)
- `from-amber-500 to-orange-600` -> `from-indigo-500 to-indigo-600` (Button gradient)
- `hover:from-amber-600 hover:to-orange-700` -> `hover:from-indigo-600 hover:from-indigo-700`
- `shadow-amber-500/20` -> `shadow-indigo-500/20`

- [ ] **Step 3: Replace stats array and stat card rendering with shared StatCard**

Replace the entire `stats` array definition (lines 83-124) and the stat card rendering grid (lines 171-201).

Remove the `stats` const array and replace the grid block with:

```tsx
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Nhân viên"
            value={dashboard?.tong_nhan_vien ?? "—"}
            accent="primary"
            trend={dashboard?.nhan_vien_moi_thang_nay ? { value: `+${dashboard.nhan_vien_moi_thang_nay} tháng này`, direction: "up" } : undefined}
            onClick={() => router.push("/nhan-vien")}
          />
          <StatCard
            icon={Building2}
            label="Phòng ban"
            value={dashboard?.so_phong_ban ?? "—"}
            accent="info"
            onClick={() => router.push("/phong-ban")}
          />
          <StatCard
            icon={Award}
            label="Chức vụ"
            value={dashboard?.so_chuc_vu ?? "—"}
            accent="info"
            onClick={() => router.push("/chuc-vu")}
          />
          <StatCard
            icon={FileText}
            label="Đơn nghỉ chờ duyệt"
            value={dashboard?.don_nghi_phep_cho_duyet ?? "—"}
            accent={dashboard?.don_nghi_phep_cho_duyet ? "warning" : "neutral"}
            onClick={() => router.push("/nghi-phep")}
          />
        </div>
```

- [ ] **Step 4: Update quick action colors**

In the `quickActions` array (lines 126-130), change the first item's color from amber to indigo:
- `"bg-gradient-to-br from-amber-500 to-orange-600"` -> `"bg-gradient-to-br from-indigo-500 to-indigo-600"`

- [ ] **Step 5: Update employee breakdown colors**

In the `empBreakdown` array (lines 132-136), change the first item's color from amber to indigo:
- `color: "bg-amber-500"` -> `color: "bg-indigo-500"`

- [ ] **Step 6: Update Sparkles icon color**

At line 208, change `text-amber-500` to `text-indigo-500`:
- `<Sparkles className="w-5 h-5 text-amber-500" />` -> `<Sparkles className="w-5 h-5 text-indigo-500" />`

- [ ] **Step 7: Remove unused imports**

Remove `ArrowUp`, `ArrowDown` from the lucide-react import since StatCard handles them internally. Also remove `cn` import if it is no longer used elsewhere in the file (check first - it IS still used at line 10 for `cn` calls in the activity feed section, so keep it).

- [ ] **Step 8: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/\(admin\)/dashboard/page.tsx
git commit -m "feat: dashboard uses shared StatCard and indigo theme"
```

---

### Task 3: Patch Chuc Vu - Replace Local StatCard with Shared

**Files:**
- Modify: `frontend/src/app/(admin)/chuc-vu/page.tsx`

- [ ] **Step 1: Add StatCard import, remove local StatCard definition**

Add after line 7 (`import { DataTable } from "@/components/ui/data-table";`):

```tsx
import { StatCard } from "@/components/ui/stat-card"
```

Then delete the entire local `StatCard` function component (lines 19-48).

- [ ] **Step 2: Replace the 4 StatCard usages**

Replace the stats row (the `<div className="grid grid-cols-4 gap-4 mb-6">` block, lines 170-201 after deletion) with:

```tsx
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Award}
          label="Tổng số"
          value={totalCount}
          accent="primary"
        />
        <StatCard
          icon={Crown}
          label="Quản lý"
          value={quanLyCount}
          accent="primary"
          active={loaiFilter === "quan_ly"}
          onClick={() => setLoaiFilter(loaiFilter === "quan_ly" ? "all" : "quan_ly")}
        />
        <StatCard
          icon={BookOpen}
          label="Giáo viên"
          value={giaoVienCount}
          accent="info"
          active={loaiFilter === "giao_vien"}
          onClick={() => setLoaiFilter(loaiFilter === "giao_vien" ? "all" : "giao_vien")}
        />
        <StatCard
          icon={UserCog}
          label="Nhân viên"
          value={nhanVienCount}
          accent="success"
          active={loaiFilter === "nhan_vien"}
          onClick={() => setLoaiFilter(loaiFilter === "nhan_vien" ? "all" : "nhan_vien")}
        />
      </div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(admin\)/chuc-vu/page.tsx
git commit -m "feat: chuc-vu uses shared StatCard"
```

---

### Task 4: Patch Cham Cong - Replace 6 Inline Stat Divs

**Files:**
- Modify: `frontend/src/app/(admin)/cham-cong/page.tsx`

- [ ] **Step 1: Add StatCard import**

Add after line 6 (`import { DataTable } from "@/components/ui/data-table";`):

```tsx
import { StatCard } from "@/components/ui/stat-card"
```

- [ ] **Step 2: Replace the 6 inline stat divs**

Replace the entire `<div className="grid grid-cols-6 gap-4 mb-6">` block (lines 224-279) with:

```tsx
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={User} label="Tổng NV" value={stats.total} accent="primary" />
        <StatCard icon={CheckCircle2} label="Có mặt" value={stats.coMat} accent="success" />
        <StatCard icon={Clock} label="Vắng CP" value={stats.vangCp} accent="warning" />
        <StatCard icon={XCircle} label="Vắng KP" value={stats.vangKp} accent="danger" />
        <StatCard icon={CalendarDays} label="Lễ Tết" value={stats.leTet} accent="info" />
        <StatCard icon={FileText} label="Công tác" value={stats.congTac} accent="info" />
      </div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(admin\)/cham-cong/page.tsx
git commit -m "feat: cham-cong uses shared StatCard"
```

---

### Task 5: Patch Nghi Phep - Replace 5 Inline Stat Divs

**Files:**
- Modify: `frontend/src/app/(admin)/nghi-phep/page.tsx`

- [ ] **Step 1: Add StatCard import**

Add after line 6 (`import { DataTable } from "@/components/ui/data-table";`):

```tsx
import { StatCard } from "@/components/ui/stat-card"
```

- [ ] **Step 2: Replace the 5 inline stat divs**

Replace the entire `<div className="grid grid-cols-5 gap-4 mb-6">` block (lines 231-277) with:

```tsx
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={FileText} label="Tổng đơn" value={stats.total} accent="neutral" />
        <StatCard icon={Clock} label="Chờ cấp 1" value={stats.choCap1} accent="warning" />
        <StatCard icon={Users} label="Chờ cấp 2" value={stats.choCap2} accent="info" />
        <StatCard icon={CheckCircle2} label="Đã duyệt" value={stats.daDuyet} accent="success" />
        <StatCard icon={XCircle} label="Từ chối" value={stats.tuChoi} accent="danger" />
      </div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(admin\)/nghi-phep/page.tsx
git commit -m "feat: nghi-phep uses shared StatCard"
```

---

### Task 6: Patch Luong - Replace 4 Inline Stat Divs

**Files:**
- Modify: `frontend/src/app/(admin)/luong/page.tsx`

- [ ] **Step 1: Add StatCard import**

Add after line 6 (`import { DataTable } from "@/components/ui/data-table";`):

```tsx
import { StatCard } from "@/components/ui/stat-card"
```

- [ ] **Step 2: Add Wallet icon import**

Add `Wallet` to a new lucide-react import. Since the file doesn't have a lucide import, add:

```tsx
import { Wallet } from "lucide-react"
```

- [ ] **Step 3: Replace the 4 inline stat divs**

Replace the entire `<div className="grid grid-cols-4 gap-4 mb-6">` block (lines 183-220) with:

```tsx
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Kỳ lương" value={kyLuongs.length} accent="primary" />
        <StatCard icon={Wallet} label="Nhân viên" value={tongNhanVien} accent="info" />
        <StatCard icon={Wallet} label="Tổng thu nhập" value={formatCurrency(tongThuNhap)} accent="success" />
        <StatCard icon={Wallet} label="Tổng thực nhận" value={formatCurrency(tongThucNhan)} accent="primary" />
      </div>
```

Note: The `Wallet` icon is used as a placeholder since the original used the same structure without icons. If a more fitting icon is available (e.g. `Receipt`, `Coins`, `Banknote`), substitute accordingly. Check what lucide icons are already used in the codebase.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit 2>&1 | head -5`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/\(admin\)/luong/page.tsx
git commit -m "feat: luong uses shared StatCard"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Visual spot-check**

Run: `cd /mnt/newhome/code/hr_management/frontend && npm run dev`
Open browser and verify:
- Dashboard: indigo hero banner, 4 stat cards with left border accent
- Chuc vu: 4 interactive stat cards, click to filter
- Cham cong: 6 stat cards in responsive grid
- Nghi phep: 5 stat cards in responsive grid
- Luong: 4 stat cards with currency values
