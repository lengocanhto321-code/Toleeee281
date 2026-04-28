# Báo Cáo Thống Kê - Redesign Design

**Date**: 2026-04-28
**Status**: Approved
**Scope**: Full redesign of Reports & Statistics module

## 1. Overview

Redesign toàn bộ giao diện báo cáo thống kê để đồng bộ với hệ thống hiện tại (shadcn/ui + Tailwind CSS), tích hợp panel kép sidebar, và nâng cấp hệ thống biểu đồ sang ECharts với phong cách Corporate Clean.

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tone/Style | Corporate Clean | Chuyên nghiệp, tối giản, phù hợp HR doanh nghiệp |
| Sidebar | Tích hợp vào AppSidebar chính | Đồng bộ với các module khác (Nhân viên, Lương...) |
| Chart Library | ECharts + shadcn/ui wrapper | Mạnh mẽ, tùy biến cao, hỗ trợ đa dạng loại biểu đồ |
| Scope | Toàn bộ 5 nhóm báo cáo | Nhân sự, Chấm công, Lương, Khen thưởng, Xu hướng |

## 3. Architecture & Layout

```
AppSidebar (panel kép)
├── Icon Sidebar (trái) - 48px
│   └── Báo cáo (icon) → Khi click: hiển thị BaoCaoSidebarPanel bên phải
│
└── Detail Panel (phải) - flex-1
    └── BaoCaoSidebarPanel (nếu đang ở trang báo cáo)
        ├── Quick Stats (3 stat cards nhỏ)
        ├── Report Categories (accordion)
        └── Recent Reports

Main Content Area (bên phải sidebar)
├── Page Header (gradient corporate blue)
│   ├── Icon + Tiêu đề "Báo cáo thống kê"
│   └── Description
├── Global Filters (nếu cần)
├── Tabs (nhan-su | cham-cong | luong | khen-thuong | xu-huong)
└── Tab Content
    ├── Stat Cards (2 cards lớn)
    ├── Charts Grid (70/30 split)
    └── Data Table (bên dưới)
```

## 4. Color System (Corporate Clean)

### Base Colors
- **Primary**: `#1e40af` (Blue 800) / `#3b82f6` (Blue 500)
- **Background**: `#f8fafc` (Slate 50)
- **Cards**: White (`#ffffff`) với border `#e2e8f0`, shadow `shadow-sm`
- **Text**: `#0f172a` (Slate 900) / `#475569` (Slate 600)

### Chart Palette (5 màu phân biệt)
```css
--chart-1: #1e40af; /* Blue - Nhân sự */
--chart-2: #059669; /* Emerald - Chấm công */
--chart-3: #d97706; /* Amber - Lương */
--chart-4: #7c3aed; /* Violet - Khen thưởng */
--chart-5: #dc2626; /* Red - Xu hướng cảnh báo */
```

Áp dụng vào CSS variables trong `globals.css` với OKLCH format.

## 5. Sidebar Integration

### Cập nhật AppSidebar (`components/app-sidebar.tsx`)
- Thêm case xử lý cho `bao-cao` trong detail panel
- Import và render `BaoCaoSidebarPanel` khi active nav item là báo cáo

### Refactor BaoCaoSidebarPanel (`components/forms/bao-cao/bao-cao-sidebar-panel.tsx`)
- Style đồng bộ: `bg-white/60 backdrop-blur-xl border-border/50 rounded-xl`
- Quick Stats: 3 cards nhỏ với icon + value + label
- Report Categories: Accordion với 3 nhóm chính (Nhân sự, Chấm công, Lương)
- Recent Reports: List với tên báo cáo + thời gian

## 6. Chart System (ECharts + shadcn/ui)

### Tạo ECharts Wrapper (`components/ui/echarts-wrapper.tsx`)
```typescript
interface EChartsWrapperProps {
  option: EChartsOption;
  className?: string;
  height?: number;
  loading?: boolean;
}
```

- Sử dụng `echarts-for-react` hoặc trực tiếp `echarts`
- Theme đồng bộ qua CSS variables (merge với `echarts-theme`)
- Custom tooltip style: white card, shadow, border corporate blue
- Legend rõ ràng: icon (20x20) + label + value + percentage
- Responsive container với `ChartContainer` pattern

### Chart Types per Report Group

**Nhân sự (4 tabs)**
- Tổng hợp: Pie Chart (giới tính, độ tuổi) + Bar Chart (theo phòng ban)
- Biến động: Line Chart (số lượng theo tháng)
- Demographics: Stacked Bar Chart (trình độ theo độ tuổi)
- Trình độ: Radar Chart (các loại trình độ)
- Hợp đồng: Pie Chart (loại hợp đồng)

**Chấm công (3 tabs)**
- Tổng hợp: Bar Chart (số ngày công theo tháng)
- Nghỉ phép: Pie Chart (loại nghỉ phép)
- Đi muộn: Heatmap (ngày/tháng)

**Lương (3 tabs)**
- Chi phí: Area Chart (tổng lương theo tháng)
- Thuế BHXH: Stacked Bar Chart (lương, thuế, BHXH)
- So sánh: Grouped Bar Chart (tháng này vs tháng trước)

**Khen thưởng (1 tab)**
- Tổng hợp: Bar Chart (số lượng theo loại) + Pie Chart (theo phòng ban)

**Xu hướng (1 tab)**
- Xu hướng: Multi-line Chart (nhân sự, lương, chấm công theo thời gian)

## 7. Interactions & Animations

- **Page load**: Staggered reveal cho stat cards (delay 100ms giữa các card)
- **Tab switch**: Fade transition 200ms (dùng Framer Motion)
- **Chart hover**: Tooltip hiển thị đầy đủ (label + value + %), highlight series với opacity 0.8
- **Card hover**: Scale nhẹ (1.02) + shadow tăng nhẹ

## 8. Technical Implementation Notes

### Dependencies to Add
```
npm install echarts echarts-for-react
```

### Files to Modify
1. `frontend/src/components/app-sidebar.tsx` - Thêm BaoCao case
2. `frontend/src/components/forms/bao-cao/bao-cao-sidebar-panel.tsx` - Refactor style
3. `frontend/src/app/(admin)/bao-cao/page.tsx` - Redesign layout
4. `frontend/src/app/(admin)/bao-cao/_components/**/*` - Redesign tất cả tab components
5. `frontend/src/components/ui/echarts-wrapper.tsx` - Tạo mới
6. `frontend/src/app/globals.css` - Cập nhật chart color variables

### Pattern to Follow
- Sử dụng `Card` từ shadcn/ui cho stat cards và chart containers
- Tuân thủ pattern `bg-white/60 backdrop-blur-xl border-border/50 rounded-xl` cho glassmorphism effects
- Sử dụng `cn()` từ `clsx` + `tailwind-merge` cho class merging
- TypeScript strict mode cho tất cả components mới
