# SPEC: Hệ Thống Báo Cáo Toàn Diện - HR Management

**Date:** 2026-04-21  
**Author:** Development Team  
**Status:** Draft  

---

## 1. Overview

Nâng cấp hệ thống báo cáo HR Management cho Trường THPT với:
- Dashboard tổng quan Bento Grid
- Báo cáo đa dạng (Nhân sự, Chấm công, Lương, Khen thưởng, Xu hướng)
- Export PDF/Excel chuyên nghiệp
- Phục vụ Hiệu trưởng + Quản lý

---

## 2. Cấu Trúc Sidebar

```
📊 Báo Cáo
├── 📈 Tổng Quan (Executive Dashboard)
├── 👥 Nhân Sự
│   ├── Tổng hợp
│   ├── Biến động nhân sự
│   ├── Demographics
│   ├── Trình độ
│   └── Hợp đồng lao động
├── ⏰ Chấm Công
│   ├── Tổng hợp
│   ├── Nghỉ phép
│   ├── Đi muộn/Về sớm
│   └── Theo dõi hàng ngày
├── 💰 Lương
│   ├── Chi phí nhân sự
│   ├── Thuế & BHXH
│   └── So sánh lương
├── 🏆 Khen Thưởng/Kỷ Luật
├── 📋 Xu Hướng (Trend Analysis)
└── ⚙️ Cấu Hình Báo Cáo
```

---

## 3. UI/UX Design

### 3.1 Layout: Bento Grid

- Mỗi tab có 4-6 KPI cards ở trên
- Main chart chiếm 60% width
- Secondary charts: 2-3 small charts
- Data table ở dưới có drill-down
- Quick actions: Export PDF/Excel

### 3.2 Color Palette

```
Primary: #f59e0b (Amber - school theme)
Secondary: #6366f1 (Indigo)
Background: #fafafa (Light gray)
Cards: White with subtle shadows
Charts: Consistent color scheme per category
```

### 3.3 Components

| Component | Mô tả |
|-----------|-------|
| KPICard | Glassmorphism card với icon, số lớn, trend indicator |
| GlassCard | Container cho charts với blur effect |
| BentoGrid | CSS Grid layout 12 columns |
| ChartContainer | Recharts wrapper với tooltips |
| DataTable | TanStack Table với sorting, filtering |
| ExportButtons | PDF, Excel, Print buttons |

---

## 4. Reports Chi Tiết

### 4.1 Tổng Quan (Executive Dashboard)

**KPIs:**
- Tổng số nhân viên
- Tổng số giáo viên
- Tổng số cán bộ
- Tỷ lệ có mặt trung bình
- Tổng chi phí lương tháng
- Số đơn nghỉ phép chờ duyệt

**Charts:**
- Line chart: Xu hướng nhân sự 12 tháng
- Bar chart: Nhân viên theo phòng ban
- Pie chart: Phân bổ loại nhân viên
- Area chart: Chi phí lương theo tháng

### 4.2 Nhân Sự - Hợp Đồng Lao Động (NEW)

**KPIs:**
- Tổng hợp đồng đang hiệu lực
- Sắp hết hạn (30 ngày)
- Đã hết hạn
- Cần gia hạn

**Features:**
- Table liệt kê all HĐ với ngày hết hạn
- Filter theo loại HĐ, phòng ban
- Reminder highlight cho HĐ sắp hết
- Export danh sách

### 4.3 Chấm Công - Đi Muộn/Về Sớm (NEW)

**KPIs:**
- Tổng số lần đi muộn
- Tổng số lần về sớm
- Tỷ lệ đúng giờ
- Số người vi phạm > 3 lần

**Charts:**
- Bar chart: Đi muộn theo ngày trong tuần
- Line chart: Xu hướng đi muộn 12 tháng
- Table: Chi tiết từng nhân viên

### 4.4 Lương - So Sánh Lương (NEW)

**KPIs:**
- Lương trung bình
- Lương cao nhất
- Lương thấp nhất
- Chênh lệch lương

**Charts:**
- Bar chart: So sánh lương theo phòng ban
- Box plot: Phân bố lương
- Table: Top 10 lương cao nhất

### 4.5 Khen Thưởng/Kỷ Luật (NEW)

**KPIs:**
- Tổng số khen thưởng
- Tổng số kỷ luật
- Tỷ lệ khen/kỷ
- Tổng tiền thưởng

**Charts:**
- Bar chart: Khen thưởng theo tháng
- Pie chart: Tỷ lệ khen/kỷ
- Table: Chi tiết theo nhân viên

### 4.6 Xu Hướng (Trend Analysis) (NEW)

**KPIs:**
- So sánh với tháng trước (% change)
- So sánh với cùng kỳ năm trước
- Year-over-year growth

**Charts:**
- Multi-line: So sánh nhiều metrics
- Stacked area: Cấu trúc thay đổi
- Comparison bars: Side-by-side

---

## 5. Export Features

### 5.1 PDF Export

- Header với logo trường + tên báo cáo
- Thời gian generate
- Filters đang áp dụng
- Charts được embed vào PDF
- Tables với pagination
- Footer với page numbers

### 5.2 Excel Export

- Raw data không format
- Multiple sheets cho multiple tables
- Filters info trong separate sheet
- Auto-filter enabled

---

## 6. Technical Implementation

### 6.1 Frontend Structure

```
frontend/src/app/(admin)/bao-cao/
├── page.tsx                      # Main layout + tabs
├── layout.tsx                    # Sidebar navigation
├── _components/
│   ├── tong-quan/               # Executive dashboard
│   │   ├── kpi-cards.tsx
│   │   ├── trend-chart.tsx
│   │   └── stats-grid.tsx
│   ├── nhan-su/
│   │   ├── hop-dong-tab.tsx     # NEW
│   │   └── ...
│   ├── cham-cong/
│   │   ├── di-muon-tab.tsx      # NEW
│   │   └── ...
│   ├── luong/
│   │   └── so-sanh-tab.tsx      # NEW
│   ├── khen-thuong/             # NEW
│   │   └── index.tsx
│   └── xu-huong/                # NEW
│       └── index.tsx
├── _hooks/
│   └── use-bao-cao-*.ts         # API hooks
└── _types/
    └── bao-cao.types.ts
```

### 6.2 Backend APIs Required

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/thong-ke/bao-cao/tong-quan` | GET | Dashboard KPIs |
| `/api/v1/thong-ke/bao-cao/hop-dong` | GET | HĐ sắp hết hạn |
| `/api/v1/thong-ke/bao-cao/di-muon` | GET | Thống kê đi muộn |
| `/api/v1/thong-ke/bao-cao/luong/so-sanh` | GET | So sánh lương |
| `/api/v1/thong-ke/bao-cao/khen-thuong` | GET | Khen/kỷ luật |
| `/api/v1/thong-ke/bao-cao/xu-huong` | GET | Trend data |

### 6.3 Export Libraries

- **PDF**: `jspdf` + `jspdf-autotable` hoặc `react-pdf`
- **Excel**: `xlsx` (SheetJS)
- **Print**: CSS `@media print`

---

## 7. Acceptance Criteria

- [ ] Sidebar navigation hoạt động với all menu items
- [ ] Tổng Quan hiển thị 6 KPIs + 4 charts
- [ ] Hợp đồng lao động: table + filter + export
- [ ] Đi muộn/Về sớm: stats + charts + table
- [ ] So sánh lương: bar chart + table
- [ ] Khen thưởng/Kỷ luật: stats + charts
- [ ] Xu hướng: multi-line chart + comparison
- [ ] Export PDF: có header, charts, tables
- [ ] Export Excel: raw data, multiple sheets
- [ ] Responsive: hoạt động trên desktop/tablet
- [ ] Loading states: skeleton loaders
- [ ] Error handling: error boundaries

---

## 8. Priority Order

1. **Tổng Quan** - Core dashboard
2. **Export PDF/Excel** - Yêu cầu từ lãnh đạo
3. **Hợp đồng** - HR cần quản lý
4. **Đi muộn** - Attendance monitoring
5. **So sánh lương** - Compensation analysis
6. **Khen thưởng/Kỷ luật** - Rewards tracking
7. **Xu hướng** - Trend analysis

---

*End of Spec*
