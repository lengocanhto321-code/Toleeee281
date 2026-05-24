# Employee Portal Redesign

## Summary

Full redesign of the employee-facing portal with dashboard-modern aesthetic. Replace static mockups with real API data, unify layout using existing `EmployeeSidebar` component, fix routing inconsistencies. Indigo theme consistent with admin side.

## Scope

- Replace employee layout with dual-panel sidebar (`EmployeeSidebar` with fixed routes)
- Redesign 4 pages: Dashboard, Cham cong, Luong, Profile (wire to existing hooks)
- Fix My QR page layout inconsistency
- Keep Nghi Phep page as-is (already production-ready)
- Unify visual style: shared `StatCard`, indigo accents, clean data-focused design

## Design Direction: Dashboard Modern

- **Tone:** Clean, professional, data-focused. Minimal decoration, maximum information density.
- **Color:** Indigo primary (consistent with admin), white/light gray backgrounds, semantic status colors (emerald=success, amber=warning, red=danger, blue=info)
- **Typography:** Be Vietnam Pro (existing), clear hierarchy with font sizes
- **Spacing:** Generous card padding, consistent gaps, no clutter
- **Motion:** Subtle transitions on hover, no heavy animations

## Architecture Changes

### Layout: `EmployeeSidebar` (fix + activate)

**File:** `frontend/src/components/forms/employee/employee-sidebar.tsx`

Fix navigation URLs from admin paths to employee paths:
- `/dashboard` → `/employee`
- `/nghi-phep` → `/employee/nghi-phep`
- `/cham-cong` → `/employee/cham-cong`
- `/luong` → `/employee/luong`
- `/profile` → `/employee/profile`

Add QR code nav item:
- `/employee/my-qr` with `QrCode` icon

**File:** `frontend/src/app/(employee)/layout.tsx`

Replace the entire inline sidebar layout with `SidebarProvider` + `EmployeeSidebar` + `SidebarInset` pattern, matching admin's `AuthenticatedLayout` structure (header with breadcrumbs + clock, main content area).

### My QR Fix

**File:** `frontend/src/app/(employee)/employee/my-qr/page.tsx`

Remove `<AuthenticatedLayout>` wrapper. The page should use the employee layout from parent route group.

## Page Designs

### 1. Dashboard (`/employee`)

**Data:** `useEmployeeDashboard()` hook (already exists)

**Layout:**
- Welcome banner: gradient indigo card with user name, role badge, school name
- 4 `StatCard` components: Phep con lai (warning), Ngay cong thang (success), Don cho duyet (primary), Luong thuc nhan (info)
- Quick actions row: Xin nghi phep, Xem cham cong, Ho so ca nhan
- Recent leave requests: last 5 items from dashboard data

### 2. Nghi Phep (`/employee/nghi-phep`)

**Status:** KEEP AS-IS. Already production-ready with full API integration. Only inherits new layout from parent.

### 3. Cham Cong (`/employee/cham-cong`)

**Data:** `useEmployeeChamCongThang(thang, nam)` hook (exists, unused)

**Layout:**
- Month/Year picker row
- 4 stat cards: Ngay lam chuan, Co mat, Vang CP, He so ngay cong
- Calendar grid: 7-column month view, each day colored by status (co_mat=emerald, vang=amber, nghi_le=purple, cuoi_tuen=gray, chua_co_du_lieu=white)
- Legend bar below calendar

### 4. Luong (`/employee/luong`)

**Data:** `useEmployeeLuong()` hook (exists, unused)

**Layout:**
- Month/Year picker
- Current payslip card: breakdown table (luong co so, phu cap, khoan giam tru, thuc nhan)
- Salary history: list of previous months with net pay
- Empty state when no data

### 5. Profile (`/employee/profile`)

**Data:** `useEmployeeProfile()` + `useUpdateEmployeeProfile()` hooks (exist, unused)

**Layout:**
- Profile header: avatar (initials), name, role badge, employee code, department
- Personal info section (readonly): gioi_tinh, ngay_sinh, so_cccd, que_quan
- Editable section: email_ca_nhan, so_dien_thoai, dia_chi_tam_tru
- Work info section (readonly): phong_ban, chuc_vu, ngay_vao_lam, loai_hop_dong
- Edit button toggles inline editing for editable fields

### 6. My QR (`/employee/my-qr`)

**Data:** `useEmployeeProfile()` + `useGetMyQR()` (already wired)

**Changes:** Remove `AuthenticatedLayout` wrapper, add to employee nav.

## Files to Modify

| File | Action |
|------|--------|
| `components/forms/employee/employee-sidebar.tsx` | Fix routes, add QR nav item |
| `app/(employee)/layout.tsx` | Replace with SidebarProvider + EmployeeSidebar |
| `app/(employee)/employee/page.tsx` | Full rewrite, wire useEmployeeDashboard |
| `app/(employee)/employee/cham-cong/page.tsx` | Full rewrite, wire useEmployeeChamCongThang |
| `app/(employee)/employee/luong/page.tsx` | Full rewrite, wire useEmployeeLuong |
| `app/(employee)/employee/profile/page.tsx` | Full rewrite, wire useEmployeeProfile |
| `app/(employee)/employee/my-qr/page.tsx` | Remove AuthenticatedLayout wrapper |

## Implementation Order

1. Fix EmployeeSidebar routes + add QR item
2. Replace employee layout
3. Redesign Dashboard + wire data
4. Redesign Cham Cong + wire data
5. Redesign Luong + wire data
6. Redesign Profile + wire data
7. Fix My QR layout
8. Verify TypeScript + visual check
