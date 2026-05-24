# HR Reporting System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive HR reporting system with 6 new report types, PDF/Excel export, and enhanced dashboard for Trường THPT.

**Architecture:** 
- Backend: FastAPI with new endpoints for each report type under `/api/v1/thong-ke/bao-cao/`
- Frontend: Next.js with TanStack Query, Recharts for charts, jsPDF/xlsx for export
- UI: Bento Grid layout with glassmorphism cards, sidebar navigation

**Tech Stack:** 
- Backend: FastAPI, SQLAlchemy, Pydantic
- Frontend: Next.js 15, React, TanStack Query, Recharts, jsPDF, xlsx
- Styling: Tailwind CSS, shadcn/ui

---

## Phase 1: Backend APIs (Reports Data)

### Task 1: Create BaoCaoService for Thống kê

**Files:**
- Create: `backend/src/service/bao_cao_service.py`

- [ ] **Step 1: Create BaoCaoService with tong_quan method**

```python
from typing import Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

class BaoCaoService:
    """Service for HR reports"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_tong_quan(self, thang: int, nam: int) -> dict:
        """Get executive dashboard KPIs"""
        # Query: tong_nhan_vien, dang_lam, nghi_viec, nghi_huu
        # Query: tong_giao_vien, tong_can_bo
        # Query: ty_le_co_mat (from cham_cong_thang)
        # Query: tong_chi_phi_luong (from luong)
        # Query: don_cho_duyet (from don_xin_nghi)
        pass
```

- [ ] **Step 2: Add get_hop_dong_sap_het_han method**

```python
    async def get_hop_dong_sap_het_han(self, ngay_chieu: date, phong_ban_id: Optional[str] = None) -> dict:
        """Get contracts expiring within 30 days"""
        # Query hop_dong where ngay_ket_thuc within 30 days
        # Group by phong_ban, loai_hop_dong
        pass
```

- [ ] **Step 3: Add get_di_muon method**

```python
    async def get_di_muon(self, thang: int, nam: int) -> dict:
        """Get late attendance statistics"""
        # Query check_in_out where check_in_status = 'late' or 'very_late'
        # Group by nhan_vien, ngay, phong_ban
        pass
```

- [ ] **Step 4: Add get_luong_so_sanh method**

```python
    async def get_luong_so_sanh(self, thang: int, nam: int) -> dict:
        """Get salary comparison data"""
        # Query luong records with nhan_vien join
        # Calculate: luong_tb, luong_cao_nhat, luong_thap_nhat
        # Group by phong_ban
        pass
```

- [ ] **Step 5: Add get_khen_thuong method**

```python
    async def get_khen_thuong(self, thang: int, nam: int) -> dict:
        """Get rewards and disciplines statistics"""
        # Query khen_thuong_ky_luat
        # Group by loai (khen_thuong vs ky_luat), thang
        pass
```

- [ ] **Step 6: Add get_xu_huong method**

```python
    async def get_xu_huong(self, so_thang: int = 12) -> dict:
        """Get trend data for last N months"""
        # Query data from multiple tables for trend analysis
        pass
```

### Task 2: Create BaoCao API Routes

**Files:**
- Create: `backend/src/api/routes/thong_ke/bao_cao.py`

- [ ] **Step 1: Create route file with endpoints**

```python
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/bao-cao", tags=["Báo Cáo"])

class BaoCaoResponse(BaseModel):
    message: str
    data: dict

@router.get("/tong-quan")
async def get_tong_quan(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    # ... dependencies
):
    """Get executive dashboard data"""
    pass

@router.get("/hop-dong/sap-het-han")
async def get_hop_dong_sap_het_han(
    ngay_chieu: date = Query(default=None),
    phong_ban_id: Optional[str] = None,
    # ... dependencies
):
    """Get contracts expiring soon"""
    pass

@router.get("/cham-cong/di-muon")
async def get_di_muon(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    # ... dependencies
):
    """Get late attendance report"""
    pass

@router.get("/luong/so-sanh")
async def get_luong_so_sanh(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    # ... dependencies
):
    """Get salary comparison report"""
    pass

@router.get("/khen-thuong")
async def get_khen_thuong(
    thang: int = Query(default=None),
    nam: int = Query(default=None),
    # ... dependencies
):
    """Get rewards/disciplines report"""
    pass

@router.get("/xu-huong")
async def get_xu_huong(
    so_thang: int = Query(default=12),
    # ... dependencies
):
    """Get trend analysis"""
    pass
```

- [ ] **Step 2: Register router in main routes**

```python
# backend/src/api/routes/__init__.py
from .thong_ke.bao_cao import router as bao_cao_router

router.include_router(bao_hao_router, prefix="/thong-ke", tags=["Thống Kê"])
```

---

## Phase 2: Frontend Hooks

### Task 3: Create BaoCao API Hooks

**Files:**
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-tong-quan.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-hop-dong.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-di-muon.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-luong.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-khen-thuong.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-xu-huong.ts`

- [ ] **Step 1: Create useBaoCaoTongQuan hook**

```typescript
import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"

export function useBaoCaoTongQuan(filters: { thang?: number; nam?: number }) {
  return useQuery({
    queryKey: ["bao-cao", "tong-quan", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.thang) params.append("thang", String(filters.thang))
      if (filters.nam) params.append("nam", String(filters.nam))
      const res = await apiGateway.get(`/api/v1/thong-ke/bao-cao/tong-quan?${params}`)
      return res.data.data
    },
  })
}
```

- [ ] **Step 2: Create other hooks (similar pattern)**

---

## Phase 3: Report Components

### Task 4: Update Sidebar Navigation

**Files:**
- Modify: `frontend/src/components/layouts/sidebar.tsx`

- [ ] **Step 1: Add new menu items to sidebar**

```typescript
const REPORT_MENU = [
  {
    title: "Tổng Quan",
    href: "/bao-cao/tong-quan",
    icon: BarChart3,
  },
  {
    title: "Nhân Sự",
    icon: Users,
    children: [
      { title: "Tổng hợp", href: "/bao-cao/nhan-su/tong-hop" },
      { title: "Hợp đồng lao động", href: "/bao-cao/nhan-su/hop-dong" },
      // ...
    ],
  },
  // ... other sections
]
```

### Task 5: Create HopDong Report Tab

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/_components/nhan-su/hop-dong-tab.tsx`

- [ ] **Step 1: Create HopDongTab component**

```typescript
"use client"

import { useBaoCaoHopDong } from "@/hooks/bao-cao"
import { DataTable } from "@/components/ui/data-table"
import { KPICard } from "./_components/shared/kpi-card"
import { Badge } from "@/components/ui/badge"

export function HopDongTab({ filters }) {
  const { data, isLoading } = useBaoCaoHopDong(filters)

  const columns = [
    {
      accessorKey: "nhan_vien",
      header: "Nhân viên",
    },
    {
      accessorKey: "loai_hop_dong",
      header: "Loại HĐ",
    },
    {
      accessorKey: "ngay_het_han",
      header: "Ngày hết hạn",
      cell: ({ row }) => {
        const ngay = new Date(row.original.ngay_het_han)
        const now = new Date()
        const daysLeft = Math.ceil((ngay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysLeft <= 30) {
          return <Badge variant="destructive">{daysLeft} ngày</Badge>
        }
        return ngay.toLocaleDateString("vi-VN")
      },
    },
    // ...
  ]

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Tổng HĐ" value={data?.tong} />
        <KPICard title="Sắp hết hạn" value={data?.sap_het_han} accent="amber" />
        <KPICard title="Đã hết hạn" value={data?.da_het_han} accent="red" />
        <KPICard title="Cần gia hạn" value={data?.can_gia_han} accent="blue" />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={data?.items || []} loading={isLoading} />
    </div>
  )
}
```

### Task 6: Create DiMuon Report Tab

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/_components/cham-cong/di-muon-tab.tsx`

- [ ] **Step 1: Create DiMuonTab with charts**

```typescript
"use client"

import { useBaoCaoDiMuon } from "@/hooks/bao-cao"
import { BarChart, LineChart } from "recharts"
import { KPICard } from "./_components/shared/kpi-card"

export function DiMuonTab({ filters }) {
  const { data } = useBaoCaoDiMuon(filters)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Tổng muộn" value={data?.tong_muon} accent="amber" />
        <KPICard title="Tổng về sớm" value={data?.tong_ve_som} accent="orange" />
        <KPICard title="Đúng giờ" value={data?.dung_gio} accent="green" />
        <KPICard title="Vi phạm >3 lần" value={data?.vi_pham} accent="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <BarChart data={data?.theo_ngay} />
        <LineChart data={data?.xu_huong} />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={data?.chi_tiet} />
    </div>
  )
}
```

### Task 7: Create LuongSoSanh Tab

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/_components/luong/so-sanh-tab.tsx`

- [ ] **Step 1: Create salary comparison component**

```typescript
"use client"

import { useBaoCaoLuongSoSanh } from "@/hooks/bao-cao"
import { BarChart } from "recharts"

export function LuongSoSanhTab({ filters }) {
  const { data } = useBaoCaoLuongSoSanh(filters)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Lương TB" value={formatCurrency(data?.luong_tb)} />
        <KPICard title="Cao nhất" value={formatCurrency(data?.luong_cao_nhat)} />
        <KPICard title="Thấp nhất" value={formatCurrency(data?.luong_thap_nhat)} />
        <KPICard title="Chênh lệch" value={formatCurrency(data?.chenh_lech)} />
      </div>

      <BarChart data={data?.theo_phong_ban} />

      <DataTable columns={columns} data={data?.top_luong} />
    </div>
  )
}
```

### Task 8: Create KhenThuong Tab

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/_components/khen-thuong/index.tsx`

- [ ] **Step 1: Create rewards/disciplines component**

```typescript
"use client"

import { useBaoCaoKhenThuong } from "@/hooks/bao-cao"
import { PieChart, BarChart } from "recharts"

export function KhenThuongTab({ filters }) {
  const { data } = useBaoCaoKhenThuong(filters)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Khen thưởng" value={data?.tong_khen} accent="green" />
        <KPICard title="Kỷ luật" value={data?.tong_ky} accent="red" />
        <KPICard title="Tỷ lệ Khen/Kỷ" value={data?.ty_le} />
        <KPICard title="Tổng tiền thưởng" value={formatCurrency(data?.tong_tien)} accent="amber" />
      </div>

      <PieChart data={data?.ty_le_chart} />
      <BarChart data={data?.theo_thang} />
    </div>
  )
}
```

### Task 9: Create XuHuong Tab

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/_components/xu-huong/index.tsx`

- [ ] **Step 1: Create trend analysis component**

```typescript
"use client"

import { useBaoCaoXuHuong } from "@/hooks/bao-cao"
import { AreaChart, LineChart } from "recharts"

export function XuHuongTab({ filters }) {
  const { data } = useBaoCaoXuHuong({ so_thang: 12 })

  return (
    <div className="space-y-4">
      {/* Comparison KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard 
          title="So với tháng trước" 
          value={data?.change_thang_truoc?.percent}
          trend={data?.change_thang_truoc?.direction}
        />
        <KPICard 
          title="So với cùng kỳ năm trước" 
          value={data?.change_nam_truoc?.percent}
          trend={data?.change_nam_truoc?.direction}
        />
      </div>

      <AreaChart data={data?.xu_huong} />
      <ComparisonChart data={data?.so_sanh} />
    </div>
  )
}
```

---

## Phase 4: Export Functionality

### Task 10: Create Export Utilities

**Files:**
- Create: `frontend/src/lib/export.ts`

- [ ] **Step 1: Create PDF export function**

```typescript
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportPDFOptions {
  title: string
  filters?: Record<string, string>
  data: any[]
  columns: { header: string; key: string }[]
  schoolName?: string
}

export function exportToPDF({ title, filters, data, columns, schoolName = "Trường THPT" }: ExportOptions) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text(schoolName, 14, 20)
  doc.setFontSize(14)
  doc.text(title, 14, 30)
  
  // Date
  doc.setFontSize(10)
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 38)
  
  // Filters
  if (filters) {
    let y = 44
    Object.entries(filters).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, y)
      y += 6
    })
  }
  
  // Table
  autoTable(doc, {
    startY: y + 4,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(c => row[c.key])),
  })
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`)
}
```

- [ ] **Step 2: Create Excel export function**

```typescript
import * as XLSX from "xlsx"

export function exportToExcel(data: any[], sheets: { name: string; data: any[] }[], filename: string) {
  const workbook = XLSX.utils.book_new()
  
  sheets.forEach(sheet => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })
  
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
```

### Task 11: Add Export Buttons to Reports

**Files:**
- Modify: Each report tab component

- [ ] **Step 1: Create ExportButtons component**

```typescript
// frontend/src/components/bao-cao/export-buttons.tsx
"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet, Printer } from "lucide-react"
import { exportToPDF, exportToExcel } from "@/lib/export"

export function ExportButtons({ 
  onExportPDF, 
  onExportExcel,
  onPrint 
}: { 
  onExportPDF: () => void
  onExportExcel: () => void
  onPrint: () => void
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onExportPDF}>
        <FileDown className="w-4 h-4 mr-1" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={onExportExcel}>
        <FileSpreadsheet className="w-4 h-4 mr-1" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer className="w-4 h-4 mr-1" />
        In
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Integrate into HopDongTab**

```typescript
// Add to hop-dong-tab.tsx
import { ExportButtons } from "@/components/bao-cao/export-buttons"

export function HopDongTab({ filters }) {
  const handleExportPDF = () => {
    exportToPDF({
      title: "Báo cáo hợp đồng lao động",
      filters: { "Tháng": filters.thang, "Năm": filters.nam },
      data: data?.items || [],
      columns: [
        { header: "Nhân viên", key: "nhan_vien" },
        { header: "Loại HĐ", key: "loai_hop_dong" },
        { header: "Ngày hết hạn", key: "ngay_het_han" },
      ],
    })
  }

  return (
    <div className="space-y-4">
      <ExportButtons 
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onPrint={() => window.print()}
      />
      {/* ... rest of component */}
    </div>
  )
}
```

---

## Phase 5: Integration & Polish

### Task 12: Create Main BaoCao Layout with Sidebar

**Files:**
- Modify: `frontend/src/app/(admin)/bao-cao/page.tsx`

- [ ] **Step 1: Update main page with sidebar navigation**

```typescript
// Convert from tabs to sidebar layout
export default function BaoCaoPage() {
  const [activeSection, setActiveSection] = useState("tong-quan")

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <ReportContent section={activeSection} filters={filters} />
      </main>
    </div>
  )
}
```

### Task 13: Add Loading States & Error Handling

**Files:**
- Modify: All report components

- [ ] **Step 1: Add skeleton loaders**

```typescript
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg" />
    </div>
  )
}
```

### Task 14: Final Integration & Testing

**Files:**
- Test: All reports

- [ ] **Step 1: Run full build**

```bash
cd frontend && npm run build
```

- [ ] **Step 2: Test each report**

- Verify KPIs display correctly
- Verify charts render
- Verify export functions work
- Verify responsive design

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-2 | Backend APIs |
| 2 | 3 | Frontend hooks |
| 3 | 4-9 | Report components |
| 4 | 10-11 | Export functionality |
| 5 | 12-14 | Integration & polish |

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-bao-cao-hr-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
