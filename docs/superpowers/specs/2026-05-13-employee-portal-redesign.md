# Employee Portal Redesign Spec

## Context

THPT Thang Long HR Management system has an employee-facing portal (role: GIAO_VIEN, NHAN_VIEN) that currently looks like a stripped-down admin panel with a left sidebar. The redesign aims to make it feel like a friendly, education-oriented self-service portal optimized for mobile phones.

## Design Decisions

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Navigation | Bottom Tab Bar (5 tabs) | Familiar mobile pattern, 1-tap access, hidden on desktop |
| Color palette | Ocean Calm (Blue 500 primary) | Calm, trustworthy, education-portal feel |
| Dashboard | Bento Generous grid | Hero + uneven bento cards + feed + actions |
| Sub-pages | Calendar-Centric | Header + stat row + full calendar/list content |
| Tone | Friendly, approachable | Warm spacing, rounded corners, emoji accents |

## Color System (Ocean Calm)

```
Primary:      #3b82f6 (Blue 500)
Primary Dark: #1e3a5f (Blue 900)
Primary Light:#93c5fd (Blue 300)
Background:   #f8fafc (Slate 50)
Card BG:      #ffffff + border #e2e8f0
Accent:       #f59e0b (Amber 500) for warnings/pending
Success:      #059669 (Emerald 600)
Danger:       #dc2626 (Red 600)
Text Primary: #1e3a5f
Text Secondary:#64748b
Text Muted:   #94a3b8
```

## Typography

Keep existing Be Vietnam Pro font (already loaded in root layout). Weight hierarchy:
- 800: Large stat numbers
- 700: Headings, card titles
- 600: Labels, badges
- 400: Body text
- 300: Captions

## Responsive Strategy

### Mobile (< 1024px)
- Bottom tab bar fixed at bottom, 5 tabs
- No sidebar
- Full-width content, padding 16px
- Cards use single column or 2-column bento grid

### Desktop (>= 1024px)
- Left sidebar (similar to current but Ocean Calm styled)
- No bottom tab bar
- Content area with max-width container
- Cards can use wider grid layouts

## Pages

### 1. Dashboard (`/employee`)

**Layout (top to bottom):**

1. **Hero banner** - Blue gradient (`#1e3a5f → #3b82f6`), white text
   - Greeting: "Xin chào" + emoji
   - Full name, position, department
   - Avatar/initials circle (top right)

2. **Bento stat grid** (2 columns, uneven)
   - 2 large cards: Leave remaining, Work days this month
   - 1 wide card + 1 small card: Pending requests (wide) + Work coefficient (small)
   - Each card: icon + label + large number + subtitle
   - Background tints: blue for primary stats, amber for warnings, green for success

3. **Activity feed card** (full width)
   - Title: "Hoat dong gan day"
   - 2-3 recent items with icon + description + timestamp + status badge
   - "Xem tat ca →" link

4. **Quick action buttons** (3 columns)
   - "Xin nghi" (filled blue), "QR cua toi" (filled dark blue), "Xem luong" (outlined blue)

**API:** `GET /api/v1/nhan-vien/dashboard`

### 2. Cham cong / Attendance (`/employee/cham-cong`)

**Layout (top to bottom):**

1. **Header bar** - Blue gradient with page title + month/year selector dropdown

2. **Mini stat row** (3 columns)
   - Present days (blue), Leave (amber), Absent (red)

3. **Calendar month view** (full width, 7-column grid)
   - Day headers: T2, T3, T4, T5, T6, T7, CN
   - Color-coded day cells:
     - Blue filled: present
     - Amber: on leave
     - Red tint: unexcused absence
     - Slate: weekend/holiday
     - Blue outline: today
   - Each cell shows date number, rounded corners

4. **Legend** - color dots with labels

**API:** `GET /api/v1/nhan-vien/nghi-phep/cham-cong/me?thang=X&nam=Y`

### 3. Nghi phep / Leave (`/employee/nghi-phep`)

**Layout (top to bottom):**

1. **Header bar** - Blue gradient with title + "Xin nghi" button

2. **Stat cards** (3 columns)
   - Remaining leave (green), Pending (amber), Approved (blue)

3. **Leave request list** (vertical cards)
   - Each card: leave type icon + type name + date range + day count + status badge
   - Status badges: Cho duyet (amber), Da duyet (green), Tu choi (red), Da huy (slate)
   - Cancel button for pending requests

4. **Create leave dialog** (keep existing CreateEmployeeDonNghiDialog with Ocean Calm styling)

**API:** `GET /api/v1/nhan-vien/nghi-phep/me`, `POST /api/v1/nhan-vien/nghi-phep/don`, `PUT /api/v1/nhan-vien/nghi-phep/don/{id}/huy`

### 4. Luong / Salary (`/employee/luong`)

**Layout (top to bottom):**

1. **Header bar** - Blue gradient with title + year selector

2. **Stat cards** (2 columns)
   - Total net pay (blue), Month count

3. **Latest payslip card** (full width, detailed)
   - Grid layout: Base salary, Allowance, Bonus (income - blue/green)
   - Deductions: Insurance, Tax, Other (red/slate)
   - Net pay prominently displayed

4. **Salary history** (vertical list)
   - Each item: month/year, base salary, tax, net pay
   - Tap to expand detail

**API:** `GET /api/v1/nhan-vien/luong/me?nam=X`

### 5. Ho so / Profile (`/employee/profile`)

**Layout (top to bottom):**

1. **Profile header** (centered)
   - Avatar circle with initials (blue gradient background)
   - Name, employee type badge, status badge
   - Employee code + department

2. **Info cards** (full width each)
   - Personal info: Gender, DOB, CCCD, Hometown (read-only)
   - Contact info: Email (read-only), Phone/Personal email/Address (editable inline)
   - Work info: Department, Position, Start date, Type (read-only)
   - Edit/Save/Cancel buttons for contact section

**API:** `GET /api/v1/nhan-vien/profile`, `PUT /api/v1/nhan-vien/profile`

### 6. QR cua toi (`/employee/my-qr`)

**Layout (centered card):**
- Employee avatar + name + code
- QR code image (from base64)
- Refresh button
- Note text about QR rotation

**API:** `GET /api/v1/nhan-vien/cham-cong/my-qr`

## Component Architecture

### New/Modified Components

| Component | Type | Description |
|-----------|------|-------------|
| `EmployeeBottomTabBar` | New | Fixed bottom navigation for mobile |
| `EmployeeSidebar` | Modify | Restyle with Ocean Calm colors |
| `EmployeeLayout` | Modify | Add responsive bottom tab / sidebar switch |
| `EmployeeDashboard` | Modify | Redesign with bento grid |
| `EmployeeChamCong` | Modify | Calendar-centric redesign |
| `EmployeeNghiPhep` | Modify | Header + stats + list redesign |
| `EmployeeLuong` | Modify | Header + payslip card redesign |
| `EmployeeProfile` | Modify | Centered header + info cards |
| `EmployeeMyQR` | Modify | Centered card restyle |
| `PageHeader` | New | Reusable gradient header with title + actions |
| `BentoCard` | New | Reusable stat card with icon/label/value/subtitle |

### Shared Patterns

- All pages use `PageHeader` for consistent gradient header
- All stat cards use same `BentoCard` component with color variants
- Bottom tab bar appears on all employee pages (mobile only)
- Desktop sidebar shows same navigation items as bottom tabs

## File Changes

### Files to modify:
- `src/app/(employee)/layout.tsx` - responsive layout with bottom tab/sidebar
- `src/app/(employee)/employee/page.tsx` - dashboard redesign
- `src/app/(employee)/employee/cham-cong/page.tsx` - attendance redesign
- `src/app/(employee)/employee/nghi-phep/page.tsx` - leave redesign
- `src/app/(employee)/employee/nghi-phep/_components/create-don-nghi-dialog.tsx` - style update
- `src/app/(employee)/employee/luong/page.tsx` - salary redesign
- `src/app/(employee)/employee/profile/page.tsx` - profile redesign
- `src/app/(employee)/employee/my-qr/page.tsx` - QR redesign
- `src/components/forms/employee/employee-sidebar.tsx` - Ocean Calm restyle

### Files to create:
- `src/components/employee-bottom-tab-bar.tsx` - bottom navigation
- `src/components/employee/page-header.tsx` - reusable gradient header
- `src/components/employee/bento-card.tsx` - reusable stat card

### Files NOT changed:
- All hooks (`src/hooks/employee/*`)
- All types (`src/types/employee.types.ts`)
- All schemas (`src/schemas/employee.schema.ts`)
- Admin-side anything
- Backend API
- `src/components/ui/*` (reuse existing shadcn components)

## Animation

- Page load: staggered reveal of bento cards (framer-motion, 50ms delay between cards)
- Tab switch: subtle fade transition
- Card hover: slight scale + shadow lift (desktop only)
- Pull-to-refresh consideration for future

## Out of Scope

- Admin portal redesign
- Dark mode
- Offline support
- Push notifications
- Any backend changes
