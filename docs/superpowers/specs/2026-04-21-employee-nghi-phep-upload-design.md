# Employee Nghi Phep Page + File Upload Design

## Date: 2026-04-21

## Summary

Add file upload capability to the Employee leave request form. When creating a leave request for types that require documentation (nghi_om, thai_san, cong_tac), employees must upload supporting documents. The backend already fully supports this — only frontend work is needed.

## What Already Exists

- **Backend `POST /api/v1/upload/files`**: Multipart file upload endpoint
- **Backend `POST /api/v1/nghi-phep/don`**: Creates leave request, accepts `files: List[str]`
- **Backend validation**: `kiem_tra_ho_so()` checks `can_giay_to` per leave type, returns `missing_document` error
- **Frontend `useUploadTaiLieu()`**: Upload mutation hook
- **Frontend `useCreateEmployeeDonNghi()`**: Create don nghi mutation hook
- **Frontend types**: `CreateDonXinNghiData.files` already has `string[] | optional`
- **Frontend schema (admin)**: `createDonXinNghiSchema` already has `files` field
- **UploadService**: Saves files organized by `{ho_ten}-{nhan_vien_id}/{loai_tai_lieu}/`

## What Needs To Be Done

### 1. Update Employee Schema

**File**: `frontend/src/schemas/employee.schema.ts`

Add `files` field to `createDonXinNghiEmployeeSchema`:
```
files: z.array(z.string()).optional()
```

### 2. Rewrite Employee Nghi Phep Page

**File**: `frontend/src/app/(employee)/employee/nghi-phep/page.tsx`

Replace static placeholder with functional page:
- List employee's leave requests using `useEmployeeNghiPhepList()`
- Status badges (cho_duyet, da_duyet, tu_choi, da_huy)
- "Tao don nghi" button opens create dialog
- View detail of existing requests (including attached files)

### 3. Create Employee Don Nghi Dialog Component

**File**: `frontend/src/app/(employee)/employee/nghi-phep/_components/create-don-nghi-dialog.tsx`

Form fields:
- Loai nghi (select from CauHinhNghiPhep types)
- Tu ngay / Den ngay (date pickers)
- Ly do (textarea, required if `bat_buoc_ghi_ly_do`)
- **File upload area** — only shown when selected loai nghi has `can_giay_to = true`

File upload behavior:
- Uses existing `useUploadTaiLieu()` hook
- Supports drag-and-drop + click to browse
- Accepted: images (jpg, png) + documents (pdf)
- Shows upload progress per file
- Preview thumbnails for uploaded files
- Remove button for each uploaded file
- Files upload to server first, URLs collected, then submitted with form

### 4. Data Flow

```
Employee fills form → selects files
→ Each file uploaded via useUploadTaiLieu → receives URL
→ All files uploaded → URLs stored in state
→ Submit form with { loai_nghi, tu_ngay, den_ngay, ly_do, files: ["url1"...] }
→ Backend validates can_giay_to requirement
→ Success: toast + refresh list
→ Error (missing_document): highlight file upload area
```

## Files to Modify

| File | Action |
|------|--------|
| `frontend/src/schemas/employee.schema.ts` | Add `files` field |
| `frontend/src/app/(employee)/employee/nghi-phep/page.tsx` | Rewrite with API integration |
| `frontend/src/app/(employee)/employee/nghi-phep/_components/create-don-nghi-dialog.tsx` | New file |

## No Backend Changes Needed

All backend infrastructure is already in place.
