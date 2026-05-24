# Admin Unified Design: Shared StatCard + Indigo Theme

## Summary

Standardize stat cards and color theme across all admin pages. Create a single reusable `StatCard` component to replace 3 different inline patterns. Migrate dashboard from amber/orange to blue/indigo as primary brand color.

## Scope

- Create shared `StatCard` component
- Replace all inline stat card patterns across 5 pages
- Migrate dashboard hero + primary elements from amber to indigo
- Keep existing toolbar, DataTable, dialog, sidebar panel components unchanged

## Shared StatCard Component

### File
`frontend/src/components/ui/stat-card.tsx`

### Interface

```tsx
interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: string; direction: "up" | "down" | "neutral" }
  accent?: "primary" | "success" | "warning" | "danger" | "info"
  onClick?: () => void
  className?: string
}
```

### Accent Color Mapping

| Accent   | Icon bg         | Border left      | Text color   |
|----------|-----------------|------------------|--------------|
| primary  | indigo-50       | indigo-500       | indigo-600   |
| success  | emerald-50      | emerald-500      | emerald-600  |
| warning  | amber-50        | amber-500        | amber-600    |
| danger   | red-50          | red-500          | red-600      |
| info     | blue-50         | blue-500         | blue-600     |

### Visual Structure

- White card background, rounded-xl, subtle shadow-sm
- Left border accent (4px colored)
- Icon in colored circle (top-left area)
- Label: text-xs text-muted-foreground uppercase tracking-wider
- Value: text-2xl font-bold
- Trend: optional, green arrow up / red arrow down with text
- Hover: if onClick provided, ring-2 ring-{accent}/20 + cursor-pointer + slight lift

## Pages to Modify

### 1. Dashboard (`/dashboard`)
- Hero banner gradient: `from-amber-900 via-amber-800 to-amber-900` -> `from-indigo-900 via-indigo-800 to-indigo-900`
- 4 stat cards: replace inline array+map with shared `StatCard` components
- Keep quick action cards, employee breakdown, activity feed unchanged (only update amber references to indigo where they function as primary brand color)

### 2. Chuc Vu (`/chuc-vu`)
- Remove local `StatCard` inline component (lines defining it within page.tsx)
- Replace 4 stat cards with shared `StatCard` using accent variants
- Keep interactive filter behavior via onClick props

### 3. Cham Cong (`/cham-cong`)
- Replace 6 inline stat divs with shared `StatCard` in a responsive grid
- Mapping: Tong NV=primary, Co mat=success, Vang CP=warning, Vang KP=danger, Le Tet=info, Cong tac=info

### 4. Nghi Phep (`/nghi-phep`)
- Replace 5 inline stat divs with shared `StatCard`
- Mapping: Tong don=primary, Cho cap 1=warning, Cho cap 2=info, Da duyet=success, Tu choi=danger

### 5. Luong (`/luong`)
- Replace 4 inline stat divs with shared `StatCard`
- Mapping: Ky luong=primary, Nhan vien=info, Tong thu nhap=success, Tong thuc nhan=primary

## Color Standardization

### Primary Brand: Indigo

All "primary" UI elements across admin use indigo:
- Primary buttons: `bg-indigo-600 hover:bg-indigo-700`
- Active states: `text-indigo-600`, `bg-indigo-50`
- Hero/dashboard branding: indigo gradient

### Semantic Colors (unchanged)

- Success/positive: emerald-500/600
- Warning/caution: amber-500/600  
- Danger/negative: red-500/600
- Info/neutral: blue-500/600

## What Stays Unchanged

- Toolbar components (all pages)
- DataTable component
- Dialog components (all pages)
- Sidebar panels (NhanVien, Luong, PhongBan, ChucVu, BaoCao)
- AuthenticatedLayout
- AppSidebar navigation
- Route structure
- Data fetching hooks
- Form schemas

## Implementation Order

1. Create `StatCard` component
2. Patch Dashboard (hero + stat cards + amber->indigo references)
3. Patch Chuc Vu (remove local StatCard, use shared)
4. Patch Cham Cong (replace inline stats)
5. Patch Nghi Phep (replace inline stats)
6. Patch Luong (replace inline stats)
7. Verify TypeScript + visual check
