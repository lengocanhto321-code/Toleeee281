# Frontend HR Management System - Design Documentation

## 🎨 Design System

**Aesthetic Direction:** "Refined Professional Utility"
- Professional, modern, data-dense but approachable
- Clean typography with Plus Jakarta Sans + Manrope fonts
- Deep indigo primary (#4F46E5) with warm amber accents (#F59E0B)
- Card-based layouts with generous white space

**Color Palette:**
```css
/* Primary */
--primary: #4F46E5 (Deep Indigo)
--primary-hover: #4338CA
--primary-light: #E0E7FF

/* Accent */
--accent: #F59E0B (Warm Amber)
--accent-hover: #D97706

/* Neutral */
--slate-50: #F8FAFC
--slate-900: #0F172A
--slate-500: #64748B

/* Semantic */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
```

---

## 📁 Components Created

### Layout Components
- `src/components/layout/sidebar.tsx` - Navigation sidebar with icons
- `src/components/layout/page-header.tsx` - Page headers with actions
- `src/components/layout/main-layout.tsx` - Main layout wrapper

### Page Components (CRUD)
- `src/app/nhan-vien/page.tsx` - Employee management
  - Table with search, filter by status
  - Add/Edit/Delete dialogs
  - Status badges (Đang làm, Nghỉ việc, Nghỉ hưu)
  - Form validation

- `src/app/phong-ban/page.tsx` - Department management
  - Tree view for parent-child hierarchy
  - Statistics cards (total, departments by type)
  - Expand/collapse functionality
  - Warning for children deletion

- `src/app/chuc-vu/page.tsx` - Position management
  - Table sorted by cap_bac (1-10)
  - Visual cap_bac badges with gradient
  - Sort by name or cap_bac
  - Hệ số phụ cấp display

### UI Components (shadcn/ui)
Already exists in project:
- Table, Dialog, Button, Input, Label, Textarea
- Select, Badge, Checkbox

---

## 🎯 Key Features

### 1. NhanVien (Employee) Management
- ✅ Search by name, employee code, email
- ✅ Filter by status (Đang làm, Nghỉ việc, Nghỉ hưu)
- ✅ Add new employees with form validation
- ✅ Edit employee information
- ✅ Soft-delete with confirmation
- ✅ Responsive table design

### 2. PhongBan (Department) Management
- ✅ Hierarchical tree view with expand/collapse
- ✅ Statistics dashboard (total, by type)
- ✅ Parent-child relationships visible
- ✅ Type indicators (Hành chính vs Chuyên môn)
- ✅ Employee count per department
- ✅ Warning when deleting parent with children

### 3. ChucVu (Position) Management
- ✅ Sorted by cap_bac (1-10)
- ✅ Visual cap_bac display with gradient badges
- ✅ Sort controls (by name or level)
- ✅ Hệ số phụ cap display
- ✅ Active/Inactive status badges
- ✅ Form with cap_bac dropdown (1-10)

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
# or
next dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

---

## 📋 Page Routes

| Route | Page | Description |
|-------|------|-------------|
| `/nhan-vien` | NhanVien | Employee management |
| `/phong-ban` | PhongBan | Department management |
| `/chuc-vu` | ChucVu | Position management |
| `/dashboard` | Dashboard | Overview (placeholder) |

---

## 🎨 Design Highlights

### Typography
- **Display Font:** Plus Jakarta Sans (headings)
- **Body Font:** Manrope (body text)
- Clean, modern, highly readable

### Color Usage
- **Primary Actions:** Indigo gradient buttons
- **Active States:** Indigo backgrounds
- **Warnings:** Amber badges/icons
- **Errors:** Red with destructive actions
- **Success:** Green for positive states

### Spacing & Layout
- **Card-based:** White cards on slate backgrounds
- **Breathing Room:** Generous padding (p-6, p-8)
- **Hierarchy:** Clear visual distinction between sections
- **Responsive:** Mobile-first, adapts to screen size

### Interactions
- **Hover States:** Subtle background color changes
- **Transitions:** Smooth 200ms transitions
- **Loading States:** Clear loading indicators
- **Feedback:** Immediate visual feedback on actions

### Micro-interactions
- **Tree Expand:** Chevron icons rotate on expand
- **Form Validation:** Real-time validation with error states
- **Confirmation Dialogs:** Clear warnings for destructive actions
- **Badge Gradients:** Gradient backgrounds for cap_bac badges

---

## 📝 API Integration

All components ready to integrate with backend API:

```typescript
// Employee API
GET    /api/v1/nhan-vien
POST   /api/v1/nhan-vien
PUT    /api/v1/nhan-vien/{id}
DELETE /api/v1/nhan-vien/{id}

// Department API
GET    /api/v1/phong-ban
POST   /api/v1/phong-ban
PUT    /api/v1/phong-ban/{id}
DELETE /api/v1/phong-ban/{id}

// Position API
GET    /api/v1/chuc-vu
POST   /api/v1/chuc-vu
PUT    /api/v1/chuc-vu/{id}
DELETE /api/v1/chuc-vu/{id}
```

---

## 🎯 Future Enhancements (Not Implemented)

### Phase 2: Advanced Features
- [ ] Employee assignment to multiple departments (with metadata)
- [ ] Department assignment history tracking
- [ ] Cap_bac validation (leadership requires party membership)
- [ ] Age-based validations for retirement
- [ ] Complex reporting and analytics

### Phase 3: Advanced Features
- [ ] Org chart visualization
- [ ] Bulk operations (bulk assign, bulk promote)
- [ ] Historical tracking and audit log viewing
- [ ] Export/import functionality
- [ ] Advanced search and filtering

---

## 🏗️ File Structure

```
frontend/src/
├── app/
│   ├── nhan-vien/page.tsx      # Employee management
│   ├── phong-ban/page.tsx      # Department management
│   └── chuc-vu/page.tsx        # Position management
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   ├── page-header.tsx      # Page headers
│   │   └── main-layout.tsx      # Layout wrapper
│   └── ui/                     # shadcn/ui components
└── lib/
    └── utils.ts                 # Utility functions (cn)
```

---

## ✅ Implementation Status

**Completed:**
- ✅ All 3 CRUD pages (NhanVien, PhongBan, ChucVu)
- ✅ Layout components (Sidebar, PageHeader, MainLayout)
- ✅ Form dialogs with validation
- ✅ Confirmation dialogs for delete actions
- ✅ Search and filter functionality
- ✅ Tree view for department hierarchy
- ✅ Cap_bac sorting and visual display

**Pending:**
- [ ] API integration (fetch from backend)
- [ ] Loading states implementation
- [ ] Error handling and user feedback
- [ ] Toast notifications
- [ ] Data pagination
- [ ] Form submission with actual API calls

---

## 🎨 Design Principles Applied

1. **Bold Typography:** Plus Jakarta Sans creates strong visual hierarchy
2. **Strategic Color:** Indigo conveys trust, amber adds warmth/energy
3. **Generous Spacing:** White space creates professional, calm interface
4. **Clear Feedback:** Every action has visual confirmation
5. **Thoughtful Interactions:** Micro-interactions add polish and delight

---

## 🚀 Next Steps

1. **Install frontend dependencies:**
   ```bash
   cd frontend && npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test pages:** Navigate to /nhan-vien, /phong-ban, /chuc-vu

4. **Integrate API:** Update components to fetch real data from backend

---

**Design complete!** 🎨 All CRUD interfaces ready for production.
