# RBAC Initialization Script

## Overview

This script initializes the Role-Based Access Control (RBAC) system for the HR Management application. It creates:

- **Roles**: 6 default roles (ADMIN, HIEU_TRUONG, HIEU_PHO, TO_TRUONG, GIAO_VIEN, NHAN_VIEN)
- **Permissions**: 30+ permissions organized by resource (nhan_vien, phong_ban, chuc_vu, luong, cham_cong, nghi_phep)
- **Role-Permission mappings**: Pre-configured permission assignments for each role

## Usage

```bash
cd backend
python scripts/init_rbac.py
```

## Environment Variables

The script uses `DATABASE_URL` environment variable. Default:

```
postgresql+asyncpg://postgres:postgres@localhost:5432/hr_management
```

## Roles

| Role | Description | Priority |
|------|-------------|----------|
| ADMIN | Quản trị viên | 100 |
| HIEU_TRUONG | Hiệu trưởng | 90 |
| HIEU_PHO | Hiệu phó | 80 |
| TO_TRUONG | Tổ trưởng | 70 |
| GIAO_VIEN | Giáo viên | 50 |
| NHAN_VIEN | Nhân viên | 40 |

## Permissions by Resource

### nhan_vien (Nhân viên)
- `nhan_vien:read` - Xem danh sách nhân viên
- `nhan_vien:create` - Tạo nhân viên mới
- `nhan_vien:update` - Cập nhật thông tin nhân viên
- `nhan_vien:delete` - Xóa nhân viên

### phong_ban (Phòng ban)
- `phong_ban:read` - Xem phòng ban
- `phong_ban:create` - Tạo phòng ban
- `phong_ban:update` - Cập nhật phòng ban
- `phong_ban:delete` - Xóa phòng ban

### chuc_vu (Chức vụ)
- `chuc_vu:read` - Xem chức vụ
- `chuc_vu:create` - Tạo chức vụ
- `chuc_vu:update` - Cập nhật chức vụ
- `chuc_vu:delete` - Xóa chức vụ

### luong (Lương)
- `luong:read` - Xem bảng lương
- `luong:manage` - Quản lý lương
- `luong:export` - Xuất bảng lương
- `luong:view_own` - Xem lương cá nhân

### cham_cong (Chấm công)
- `cham_cong:read` - Xem chấm công
- `cham_cong:manage` - Quản lý chấm công
- `cham_cong:export` - Xuất bảng chấm công
- `cham_cong:view_own` - Xem chấm công cá nhân

### nghi_phep (Nghỉ phép)
- `nghi_phep:read` - Xem đơn nghỉ phép
- `nghi_phep:approve` - Duyệt đơn nghỉ phép
- `nghi_phep:manage` - Quản lý nghỉ phép
- `nghi_phep:create` - Tạo đơn nghỉ phép
- `nghi_phep:view_own` - Xem đơn nghỉ phép cá nhân

### dashboard
- `dashboard:view_admin` - Xem dashboard quản trị
- `dashboard:view_employee` - Xem dashboard nhân viên

### profile
- `profile:read` - Xem hồ sơ
- `profile:update` - Cập nhật hồ sơ

## Role-Permission Mapping

| Role | Permissions |
|------|------------|
| ADMIN | Tất cả permissions |
| HIEU_TRUONG | nhan_vien:* (trừ delete), phong_ban:read, luong:*, cham_cong:*, nghi_phep:read, approve |
| HIEU_PHO | nhan_vien:read, phong_ban:read, luong:read, cham_cong:read, nghi_phep:read, approve |
| TO_TRUONG | nhan_vien:read, phong_ban:read, cham_cong:manage, nghi_phep:read, approve |
| GIAO_VIEN | luong:view_own, cham_cong:view_own, nghi_phep:create, view_own, profile:* |
| NHAN_VIEN | luong:view_own, cham_cong:view_own, nghi_phep:create, view_own, profile:* |

## Database Tables Created

- `roles` - Lưu thông tin các vai trò
- `permissions` - Lưu thông tin các quyền
- `role_permissions` - Liên kết vai trò với quyền
- `user_roles` - Liên kết người dùng với vai trò

## Notes

- Script sử dụng `CREATE TABLE IF NOT EXISTS` nên có thể chạy nhiều lần an toàn
- System roles (is_system=True) không nên bị xóa
- Có thể chạy lại script để cập nhật permissions mới
