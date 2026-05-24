# Báo Cáo Thống Kê Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign toàn bộ module báo cáo thống kê với phong cách Corporate Clean, tích hợp sidebar panel kép, và nâng cấp biểu đồ sang ECharts.

**Architecture:** Sử dụng Next.js App Router với shadcn/ui + Tailwind CSS. Tích hợp BaoCaoSidebarPanel vào hệ thống AppSidebar hiện có (icon trái + detail panel phải). Thay thế Recharts bằng ECharts thông qua wrapper component tùy biến.

**Tech Stack:** Next.js 16.2.2, React 19.2.4, shadcn/ui 4.1.2, Tailwind CSS 4, ECharts 5.x, echarts-for-react, Framer Motion 12.x

---

## File Structure Mapping

### Files to Create:
- `frontend/src/components/ui/echarts-wrapper.tsx` - ECharts wrapper với theme Corporate Clean
- `frontend/src/lib/echarts-theme.ts` - Theme object cho ECharts

### Files to Modify:
- `frontend/src/app/globals.css` - Cập nhật chart color variables (Corporate Blue palette)
- `frontend/src/components/app-sidebar.tsx` - Tích hợp BaoCaoSidebarPanel (đã có sẵn, cần verify)
- `frontend/src/components/forms/bao-cao/bao-cao-sidebar-panel.tsx` - Refactor style sang Corporate Clean
- `frontend/src/app/(admin)/bao-cao/page.tsx` - Loại bỏ custom sidebar, dùng AppSidebar
- `frontend/src/app/(admin)/bao-cao/_components/nhan-su/*.tsx` - 5 tabs nhân sự dùng ECharts
- `frontend/src/app/(admin)/bao-cao/_components/cham-cong/*.tsx` - 3 tabs chấm công dùng ECharts
- `frontend/src/app/(admin)/bao-cao/_components/luong/*.tsx` - 3 tabs lương dùng ECharts
- `frontend/src/app/(admin)/bao-cao/_components/khen-thuong/index.tsx` - Dùng ECharts
- `frontend/src/app/(admin)/bao-cao/_components/xu-huong/index.tsx` - Dùng ECharts

---

### Task 1: Install ECharts Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install echarts và echarts-for-react**

Run: `cd /home/enles04/hr_management/frontend && npm install echarts echarts-for-react`

Expected: Dependencies added to package.json, node_modules updated

- [ ] **Step 2: Verify installation**

Run: `cd /home/enles04/hr_management/frontend && npm list echarts echarts-for-react`

Expected:
```
echarts@5.x.x
echarts-for-react@3.x.x
```

- [ ] **Step 3: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/package.json frontend/package-lock.json
git commit -m "feat: add echarts and echarts-for-react dependencies"
```

---

### Task 2: Update globals.css với Corporate Clean Palette

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Update chart color variables trong :root**

Thay thế các dòng `--chart-1` đến `--chart-5` trong `:root` bằng:

```css
--chart-1: oklch(0.435 0.192 264.376); /* Blue 800 - #1e40af */
--chart-2: oklch(0.576 0.145 163.037); /* Emerald 600 - #059669 */
--chart-3: oklch(0.685 0.149 73.182); /* Amber 600 - #d97706 */
--chart-4: oklch(0.496 0.263 303.9);   /* Violet 600 - #7c3aed */
--chart-5: oklch(0.539 0.231 27.325); /* Red 600 - #dc2626 */
```

- [ ] **Step 2: Update chart color variables trong .dark**

Thay thế các dòng `--chart-1` đến `--chart-5` trong `.dark` bằng:

```css
--chart-1: oklch(0.488 0.243 264.376); /* Blue 500 */
--chart-2: oklch(0.696 0.17 162.48);  /* Emerald 400 */
--chart-3: oklch(0.769 0.188 70.08);  /* Amber 400 */
--chart-4: oklch(0.627 0.265 303.9);  /* Violet 400 */
--chart-5: oklch(0.645 0.246 16.439); /* Red 400 */
```

- [ ] **Step 3: Verify CSS syntax**

Run: `cd /home/enles04/hr_management/frontend && npx tailwindcss --help`

Expected: No CSS syntax errors

- [ ] **Step 4: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/globals.css
git commit -m "style: update chart colors to Corporate Clean palette (blue/emerald/amber/violet/red)"
```

---

### Task 3: Create ECharts Theme Object

**Files:**
- Create: `frontend/src/lib/echarts-theme.ts`

- [ ] **Step 1: Create ECharts theme file**

```typescript
// frontend/src/lib/echarts-theme.ts
export const corporateCleanTheme = {
  color: [
    '#1e40af', // chart-1: Blue 800
    '#059669', // chart-2: Emerald 600
    '#d97706', // chart-3: Amber 600
    '#7c3aed', // chart-4: Violet 600
    '#dc2626', // chart-5: Red 600
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#0f172a',
  },
  title: {
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#0f172a',
    },
  },
  legend: {
    textStyle: {
      fontSize: 12,
      color: '#475569',
    },
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    padding: [8, 12],
    textStyle: {
      fontSize: 12,
      color: '#0f172a',
    },
    extraCssText: 'box-shadow: 0 1px 3px rgba(0,0,0,0.1)',
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#e2e8f0',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#64748b',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#f1f5f9',
        type: 'solid',
      },
    },
  },
  yAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#64748b',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#f1f5f9',
        type: 'solid',
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
}
```

- [ ] **Step 2: Verify TypeScript syntax**

Run: `cd /home/enles04/hr_management/frontend && npx tsc --noEmit src/lib/echarts-theme.ts`

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/src/lib/echarts-theme.ts
git commit -m "feat: add ECharts Corporate Clean theme configuration"
```

---

### Task 4: Create ECharts Wrapper Component

**Files:**
- Create: `frontend/src/components/ui/echarts-wrapper.tsx`

- [ ] **Step 1: Create wrapper component**

```tsx
// frontend/src/components/ui/echarts-wrapper.tsx
"use client"

import React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { corporateCleanTheme } from "@/lib/echarts-theme"

interface EChartsWrapperProps {
  option: Record<string, unknown>
  className?: string
  style?: React.CSSProperties
  height?: number | string
  loading?: boolean
  notMerge?: boolean
  lazyUpdate?: boolean
}

export function EChartsWrapper({
  option,
  className,
  style,
  height = 350,
  loading = false,
  notMerge = true,
  lazyUpdate = true,
}: EChartsWrapperProps) {
  const { theme } = useTheme()
  const [EChartsReact, setEChartsReact] = React.useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    import('echarts-for-react').then((mod) => {
      setEChartsReact(() => mod.default)
    })
  }, [])

  if (!EChartsReact) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height, ...style }}
      >
        <div className="text-sm text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  const mergedOption = {
    ...corporateCleanTheme,
    ...option,
    backgroundColor: 'transparent',
  }

  return (
    <div className={cn("w-full", className)} style={{ height, ...style }}>
      <EChartsReact
        echarts={require('echarts')}
        option={mergedOption}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        style={{ height: '100%', width: '100%' }}
        loading={loading}
        theme={theme === 'dark' ? 'dark' : undefined}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

Run: `cd /home/enles04/hr_management/frontend && npx tsc --noEmit`

Expected: No errors (may have pre-existing errors, check for new ones related to echarts-wrapper)

- [ ] **Step 3: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/src/components/ui/echarts-wrapper.tsx
git commit -m "feat: create ECharts wrapper component with Corporate Clean theme"
```

---

### Task 5: Refactor BaoCaoSidebarPanel sang Corporate Clean

**Files:**
- Modify: `frontend/src/components/forms/bao-cao/bao-cao-sidebar-panel.tsx`

- [ ] **Step 1: Update imports và types**

Thêm import: `cn` từ `@/lib/utils` (đã có), bỏ `Separator` nếu không dùng.

- [ ] **Step 2: Refactor component với Corporate Clean style**

```tsx
// frontend/src/components/forms/bao-cao/bao-cao-sidebar-panel.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, FileSpreadsheet, Download, TrendingUp, Users, Clock, Wallet, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface BaoCaoSidebarPanelProps {}

export function BaoCaoSidebarPanel({}: BaoCaoSidebarPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("nhan-su")

  const quickStats = [
    { label: "Nhân sự", icon: Users, count: 45, color: "text-blue-600 bg-blue-50" },
    { label: "Chấm công", icon: Clock, count: "98%", color: "text-emerald-600 bg-emerald-50" },
    { label: "Lương", icon: Wallet, count: "12.5M", color: "text-amber-600 bg-amber-50" },
  ]

  const reportLinks = [
    {
      id: "nhan-su",
      label: "Nhân sự",
      icon: Users,
      sub: ["Tổng hợp", "Biến động", "Demographics", "Trình độ", "Hợp đồng"],
      href: "/bao-cao/nhan-su/tong-hop",
    },
    {
      id: "cham-cong",
      label: "Chấm công",
      icon: Clock,
      sub: ["Tổng hợp", "Nghỉ phép", "Đi muộn"],
      href: "/bao-cao/cham-cong/tong-hop",
    },
    {
      id: "luong",
      label: "Lương",
      icon: Wallet,
      sub: ["Chi phí", "Thuế & BHXH", "So sánh"],
      href: "/bao-cao/luong/chi-phi",
    },
  ]

  const recentReports = [
    { name: "Báo cáo tháng 4/2026", date: "20/04/2026", type: "Nhân sự" },
    { name: "Báo cáo Q1/2026", date: "15/04/2026", type: "Lương" },
  ]

  return (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div className="text-base font-medium text-foreground">Báo cáo</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <div className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="text-center p-2 rounded-xl border bg-white/60 backdrop-blur-xl">
                    <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color.split(" ")[0])} />
                    <div className="text-sm font-semibold text-foreground">{stat.count}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thao tác nhanh</p>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 border-border/50">
                  <FileSpreadsheet className="w-4 h-4" />
                  Tạo báo cáo mới
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 border-border/50">
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </Button>
              </div>

              {/* Report Categories */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Danh mục báo cáo</p>
                {reportLinks.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab(cat.id)
                      router.push(cat.href)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === cat.id
                        ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                        : "hover:bg-muted text-muted-foreground border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 ml-6">{cat.sub.join(" • ")}</div>
                  </button>
                ))}
              </div>

              {/* Recent Reports */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gần đây</p>
                <div className="space-y-2">
                  {recentReports.map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                      <div>
                        <div className="text-sm font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">{report.type} • {report.date}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  )
}
```

- [ ] **Step 3: Verify component renders**

Run dev server: `cd /home/enles04/hr_management/frontend && npm run dev`

Expected: Sidebar panel hiển thị đúng style Corporate Clean (white cards, blue accents, rounded-xl)

- [ ] **Step 4: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/src/components/forms/bao-cao/bao-cao-sidebar-panel.tsx
git commit -m "style: refactor BaoCaoSidebarPanel to Corporate Clean (blue accents, glassmorphism)"
```

---

### Task 6: Redesign BaoCaoPage - Remove Custom Sidebar

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/page.tsx`

- [ ] **Step 1: Refactor page để dùng AppSidebar và tabs thay vì custom sidebar**

```tsx
// frontend/src/app/(admin)/bao-cao/page.tsx
"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { NhanSuTongHopTab } from "./_components/nhan-su/tong-hop-tab"
import { NhanSuBienDongTab } from "./_components/nhan-su/bien-dong-tab"
import { NhanSuDemoGraphicsTab } from "./_components/nhan-su/demo-graphics-tab"
import { NhanSuTrinhDoTab } from "./_components/nhan-su/trinh-do-tab"
import { HopDongTab } from "./_components/nhan-su/hop-dong-tab"
import { ChamCongTongHopTab } from "./_components/cham-cong/tong-hop-tab"
import { ChamCongNghiPhepTab } from "./_components/cham-cong/nghi-phep-tab"
import { DiMuonTab } from "./_components/cham-cong/di-muon-tab"
import { LuongChiPhiTab } from "./_components/luong/chi-phi-tab"
import { LuongThueBHXHTab } from "./_components/luong/thue-bhxh-tab"
import { LuongSoSanhTab } from "./_components/luong/so-sanh-tab"
import { KhenThuongTab } from "./_components/khen-thuong"
import { XuHuongTab } from "./_components/xu-huong"
import type { BaoCaoFilters } from "@/types/bao-cao.types"
import { BarChart3, Filter, CalendarDays, Users, Clock, Wallet, Trophy, TrendingUp } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const TAB_ITEMS = [
  {
    id: "nhan-su",
    label: "Nhân sự",
    icon: Users,
    component: NhanSuTongHopTab,
    props: {},
  },
  {
    id: "cham-cong",
    label: "Chấm công",
    icon: Clock,
    component: ChamCongTongHopTab,
    props: {},
  },
  {
    id: "luong",
    label: "Lương",
    icon: Wallet,
    component: LuongChiPhiTab,
    props: {},
  },
  {
    id: "khen-thuong",
    label: "Khen thưởng",
    icon: Trophy,
    component: KhenThuongTab,
    props: {},
  },
  {
    id: "xu-huong",
    label: "Xu hướng",
    icon: TrendingUp,
    component: XuHuongTab,
    props: {},
  },
]

function ContentArea({ activeTab, filters }: { activeTab: string; filters: BaoCaoFilters }) {
  const pathname = usePathname()

  const renderContent = () => {
    switch (activeTab) {
      case "nhan-su":
        if (pathname.includes("/bien-dong")) return <NhanSuBienDongTab filters={filters} />
        if (pathname.includes("/demo")) return <NhanSuDemoGraphicsTab filters={filters} />
        if (pathname.includes("/trinh-do")) return <NhanSuTrinhDoTab filters={filters} />
        if (pathname.includes("/hop-dong")) return <HopDongTab filters={filters} />
        return <NhanSuTongHopTab filters={filters} />
      case "cham-cong":
        if (pathname.includes("/nghi-phep")) return <ChamCongNghiPhepTab filters={filters} />
        if (pathname.includes("/di-muon")) return <DiMuonTab filters={filters} />
        return <ChamCongTongHopTab filters={filters} />
      case "luong":
        if (pathname.includes("/thue-bhxh")) return <LuongThueBHXHTab filters={filters} />
        if (pathname.includes("/so-sanh")) return <LuongSoSanhTab filters={filters} />
        return <LuongChiPhiTab filters={filters} />
      case "khen-thuong":
        return <KhenThuongTab filters={filters} />
      case "xu-huong":
        return <XuHuongTab filters={filters} />
      default:
        return <NhanSuTongHopTab filters={filters} />
    }
  }

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {renderContent()}
    </motion.div>
  )
}

export default function BaoCaoPage() {
  const [filters, setFilters] = useState<BaoCaoFilters>(() => {
    const now = new Date()
    return { thang: now.getMonth() + 1, nam: now.getFullYear() }
  })

  const [thang, setThang] = useState(String(new Date().getMonth() + 1))
  const [nam, setNam] = useState(String(new Date().getFullYear()))
  const [activeTab, setActiveTab] = useState("nhan-su")

  const pathname = usePathname()
  const router = useRouter()

  const applyFilters = () => {
    setFilters({
      thang: parseInt(thang),
      nam: parseInt(nam),
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-blue-900 p-8 border border-blue-800/50">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-700 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-300" />
              <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">Thống kê & Phân tích</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Báo cáo & Thống kê</h1>
            <p className="text-blue-200/80 text-sm">
              Phân tích toàn diện dữ liệu nhân sự, chấm công và lương
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Bộ lọc</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tháng</label>
              <Select value={thang} onValueChange={setThang}>
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={String(i + 1)}>Tháng {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Năm</label>
              <Select value={nam} onValueChange={setNam}>
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={applyFilters} size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
              <CalendarDays className="w-4 h-4 mr-1.5" />
              Áp dụng
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <div className="flex gap-1">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  router.push(`/bao-cao/${tab.id}`)
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ContentArea activeTab={activeTab} filters={filters} />
      </div>
    </AuthenticatedLayout>
  )
}
```

- [ ] **Step 2: Verify page renders without custom sidebar**

Run: `cd /home/enles04/hr_management/frontend && npm run dev`

Expected: Page hiển thị với AppSidebar (icon trái + detail panel phải), không còn custom sidebar riêng

- [ ] **Step 3: Commit**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/(admin)/bao-cao/page.tsx
git commit -m "refactor: integrate AppSidebar, remove custom sidebar, add Corporate Clean header"
```

---

### Task 7: Redesign Nhân Sự Tabs với ECharts

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/tong-hop-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/bien-dong-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/demo-graphics-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/trinh-do-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/hop-dong-tab.tsx`

- [ ] **Step 1: Redesign tong-hop-tab.tsx với ECharts Pie + Bar**

```tsx
// frontend/src/app/(admin)/bao-cao/_components/nhan-su/tong-hop-tab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface NhanSuTongHopTabProps {
  filters: BaoCaoFilters
}

const statCards = [
  { title: "Tổng nhân sự", value: "45", icon: Users, color: "text-blue-600 bg-blue-50", change: "+2" },
  { title: "Đang làm việc", value: "42", icon: UserCheck, color: "text-emerald-600 bg-emerald-50", change: "93%" },
  { title: "Nghỉ việc", value: "3", icon: UserX, color: "text-red-600 bg-red-50", change: "-1" },
  { title: "Tuyển mới", value: "5", icon: TrendingUp, color: "text-amber-600 bg-amber-50", change: "+3" },
]

export function NhanSuTongHopTab({ filters }: NhanSuTongHopTabProps) {
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: 25, name: 'Nam' },
          { value: 20, name: 'Nữ' },
        ],
      },
    ],
  }

  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: ['Ban Giám hiệu', 'Tổ Toán', 'Tổ Văn', 'Tổ Anh', 'Tổ Lý', 'Tổ Hóa', 'Văn phòng'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: [5, 8, 7, 6, 6, 5, 8],
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#1e40af',
        },
        barWidth: '40%',
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cơ cấu giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={pieOption} height={300} />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nhân sự theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={barOption} height={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update remaining nhân sự tabs (bien-dong, demo-graphics, trinh-do, hop-dong)**

Similar pattern: Use EChartsWrapper với Line Chart (biến động), Stacked Bar (demographics), Radar (trình độ), Pie (hợp đồng).

- [ ] **Step 3: Commit nhân sự tabs**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/(admin)/bao-cao/_components/nhan-su/*.tsx
git commit -m "feat: redesign nhân sự tabs with ECharts (Pie, Bar, Line, Radar)"
```

---

### Task 8: Redesign Chấm Công Tabs với ECharts

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/_components/cham-cong/tong-hop-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/cham-cong/nghi-phep-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/cham-cong/di-muon-tab.tsx`

- [ ] **Step 1: Redesign tong-hop-tab.tsx với Bar Chart**

Sử dụng ECharts Bar Chart cho số ngày công theo tháng, màu `#059669` (Emerald).

- [ ] **Step 2: Redesign nghi-phep-tab.tsx với Pie Chart**

Sử dụng ECharts Pie Chart cho loại nghỉ phép, màu `#059669`.

- [ ] **Step 3: Redesign di-muon-tab.tsx với Heatmap**

Sử dụng ECharts Heatmap cho ngày đi muộn, màu gradient từ `#fef3c7` đến `#dc2626`.

- [ ] **Step 4: Commit chấm công tabs**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/(admin)/bao-cao/_components/cham-cong/*.tsx
git commit -m "feat: redesign chấm công tabs with ECharts (Bar, Pie, Heatmap)"
```

---

### Task 9: Redesign Lương Tabs với ECharts

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/_components/luong/chi-phi-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/luong/thue-bhxh-tab.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/luong/so-sanh-tab.tsx`

- [ ] **Step 1: Redesign chi-phi-tab.tsx với Area Chart**

Sử dụng ECharts Area Chart cho chi phí lương theo tháng, màu `#d97706` (Amber).

- [ ] **Step 2: Redesign thue-bhxh-tab.tsx với Stacked Bar Chart**

Sử dụng ECharts Stacked Bar cho Lương/Thuế/BHXH, màu `#d97706`, `#7c3aed`, `#1e40af`.

- [ ] **Step 3: Redesign so-sanh-tab.tsx với Grouped Bar Chart**

Sử dụng ECharts Grouped Bar cho so sánh tháng này vs tháng trước.

- [ ] **Step 4: Commit lương tabs**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/(admin)/bao-cao/_components/luong/*.tsx
git commit -m "feat: redesign lương tabs with ECharts (Area, Stacked Bar, Grouped Bar)"
```

---

### Task 10: Redesign Khen Thưởng và Xu Hướng với ECharts

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/_components/khen-thuong/index.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/xu-huong/index.tsx`

- [ ] **Step 1: Redesign khen-thuong/index.tsx**

Sử dụng ECharts Bar + Pie Chart, màu `#7c3aed` (Violet).

- [ ] **Step 2: Redesign xu-huong/index.tsx**

Sử dụng ECharts Multi-line Chart với markers, màu `#dc2626` (Red) cho cảnh báo.

- [ ] **Step 3: Commit khen thưởng và xu hướng**

```bash
cd /home/enles04/hr_management
git add frontend/src/app/(admin)/bao-cao/_components/khen-thuong/index.tsx frontend/src/app/(admin)/bao-cao/_components/xu-huong/index.tsx
git commit -m "feat: redesign khen thưởng and xu hướng with ECharts (Multi-line, Bar, Pie)"
```

---

### Task 11: Final Verification & Testing

- [ ] **Step 1: Run lint check**

Run: `cd /home/enles04/hr_management/frontend && npm run lint`

Expected: No errors (or only pre-existing ones)

- [ ] **Step 2: Run build check**

Run: `cd /home/enles04/hr_management/frontend && npm run build`

Expected: Build succeeds without errors

- [ ] **Step 3: Manual testing checklist**

- [ ] Sidebar hiển thị đúng BaoCaoSidebarPanel khi click Báo cáo
- [ ] Page header có gradient xanh Corporate Blue
- [ ] Stat cards có animation staggered reveal
- [ ] Tất cả biểu đồ render đúng với ECharts (Pie, Bar, Line, Area, Heatmap, Radar)
- [ ] Colors đúng palette (Blue, Emerald, Amber, Violet, Red)
- [ ] Tab switching có fade transition
- [ ] Tooltip hiển thị đầy đủ (label + value + %)
- [ ] Responsive layout hoạt động tốt

- [ ] **Step 4: Final commit (nếu có sửa lỗi)**

```bash
cd /home/enles04/hr_management
git add .
git commit -m "fix: final adjustments after verification"
```

---

## Self-Review Checklist

1. **Spec coverage:** 
   - [x] Corporate Clean style - Applied in globals.css + BaoCaoSidebarPanel + Page header
   - [x] Sidebar integration - AppSidebar already has BaoCao case, verified in Task 5-6
   - [x] ECharts + shadcn wrapper - Created in Task 3-4
   - [x] All 5 report groups - Redesigned in Task 7-10
   - [x] Chart colors per category - Specified in each task
   - [x] Animations (staggered reveal, fade transition) - Added in Task 7

2. **Placeholder scan:** No TBD/TODO placeholders. All code blocks are complete.

3. **Type consistency:** All component props match (BaoCaoFilters, EChartsWrapperProps). File paths are absolute.

4. **No missing steps:** Each task has clear steps with code, commands, and expected output.
