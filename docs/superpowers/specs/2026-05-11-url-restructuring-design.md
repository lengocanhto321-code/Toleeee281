# URL Restructuring Design

## Overview

Phan chia URL theo vai tro: admin dung `/admin/`, nhan vien dung `/nhan-vien/`. Chi thay doi prefix trong `routes/__init__.py`, khong thay doi logic xu ly trong cac file route.

## URL Mapping

### Auth (giu nguyen - `/api/v1/`)
| Hien tai | Moi | Method | Mo ta |
|----------|-----|--------|-------|
| `/login` | `/login` | POST | Dang nhap |
| `/logout` | `/logout` | POST | Dang xuat |
| `/refresh` | `/refresh` | POST | Refresh token |
| `/me` | `/me` | GET | Thong tin user hien tai |

### Admin (`/api/v1/admin/`)
| Hien tai | Moi | Tags |
|----------|-----|------|
| `/nhan-vien` | `/admin/nhan-vien` | Admin - Nhan Vien |
| `/nhan-vien` (sub) | `/admin/nhan-vien` | Admin - Nhan Vien Sub |
| `/nhan-vien` (cong tac) | `/admin/nhan-vien` | Admin - Nhan Vien CongTac |
| `/nhan-vien` (hop dong) | `/admin/nhan-vien` | Admin - Hop Dong |
| `/phong-ban` | `/admin/phong-ban` | Admin - Phong Ban |
| `/chuc-vu` | `/admin/chuc-vu` | Admin - Chuc Vu |
| `/luong` | `/admin/luong` | Admin - Luong |
| `/nghi-phep` | `/admin/nghi-phep` | Admin - Nghi Phep |
| `/nghi-phep` (cau hinh) | `/admin/nghi-phep` | Admin - Nghi Phep Cau Hinh |
| `/ql/cham-cong` | `/admin/cham-cong` | Admin - Cham Cong |
| `/thong-ke` | `/admin/thong-ke` | Admin - Thong Ke |
| `/thong-ke/bao-cao` | `/admin/thong-ke` | Admin - Thong Ke Bao Cao |
| `/upload` | `/admin/upload` | Admin - Upload |
| `/lich-su-chuc-vu` | `/admin/lich-su-chuc-vu` | Admin - Lich Su Chuc Vu |
| `/cong-tac` | `/admin/cong-tac` | Admin - Cong Tac |

### Nhan Vien (`/api/v1/nhan-vien/`)
| Hien tai | Moi | Tags |
|----------|-----|------|
| `/employee/dashboard` | `/nhan-vien/dashboard` | NV - Employee |
| `/employee/profile` | `/nhan-vien/profile` | NV - Employee |
| `/employee/permissions` | `/nhan-vien/permissions` | NV - Employee |
| `/nv/cham-cong` | `/nhan-vien/cham-cong` | NV - Cham Cong |
| (moi) | `/nhan-vien/nghi-phep` | NV - Nghi Phep |
| (moi) | `/nhan-vien/upload` | NV - Upload |
| `/luong/me` | `/nhan-vien/luong` | NV - Luong |

## Nghi Phep - Tach Route

Hien tai `nghi_phep_router` chua ca endpoint admin va nhan vien. Can tach:

### Admin nghi phep (giu trong `quan_ly/nghi_phep.py`):
- `POST /admin/nghi-phep/don` - tao don (admin)
- `GET /admin/nghi-phep/don` - danh sach don
- `GET /admin/nghi-phep/don/{don_id}` - chi tiet don
- `PUT /admin/nghi-phep/don/{don_id}/duyet` - duyet don
- `PUT /admin/nghi-phep/don/{don_id}/tu-choi` - tu choi don
- `DELETE /admin/nghi-phep/don/{don_id}` - xoa don
- `PUT /admin/nghi-phep/don/{don_id}/duyet-cap-1` - duyet cap 1
- `PUT /admin/nghi-phep/don/{don_id}/duyet-cap-2` - duyet cap 2
- `GET /admin/nghi-phep/so-ngay-phep/{nhan_vien_id}` - so ngay phep
- `POST /admin/nghi-phep/so-ngay-phep/init` - khoi tao ngay phep
- `GET /admin/nghi-phep/cham-cong/thang` - danh sach cham cong thang
- `GET /admin/nghi-phep/cham-cong/thang/{id}` - chi tiet cham cong
- `POST /admin/nghi-phep/cham-cong/mock/generate` - tao mock du lieu
- `PUT /admin/nghi-phep/cham-cong/thang/{id}` - cap nhat cham cong
- `POST /admin/nghi-phep/cham-cong/thang/{id}/xac-nhan` - xac nhan
- `POST /admin/nghi-phep/cham-cong/thang/{id}/duyet` - duyet cham cong
- `POST /admin/nghi-phep/cham-cong/thang/{id}/chot` - chot cham cong

### NV nghi phep (tao router moi `nhan_vien/nghi_phep.py`):
- `POST /nhan-vien/nghi-phep/don` - tao don nghi phep
- `GET /nhan-vien/nghi-phep/don/{don_id}` - xem chi tiet don cua minh
- `GET /nhan-vien/nghi-phep/me` - xem don nghi phep cua minh
- `GET /nhan-vien/nghi-phep/cham-cong/me` - xem cham cong cua minh
- `DELETE /nhan-vien/nghi-phep/don/{don_id}` - xoa don cua minh

## Upload - Tach Route

### Admin upload (giu nguyen `upload/upload.py`):
Giu toan bo endpoint hien tai, chi doi prefix thanh `/admin/upload`.

### NV upload (tao router moi `nhan_vien/upload.py`):
- `POST /nhan-vien/upload/files` - upload avatar/tai lieu ca nhan
- `GET /nhan-vien/upload/tai-lieu` - xem tai lieu cua minh

## Luong - Tach Route

### Admin luong (giu nguyen `quan_ly/luong.py`):
Giu toan bo, doi prefix thanh `/admin/luong`.

### NV luong (tao router moi `nhan_vien/luong.py`):
- `GET /nhan-vien/luong/me` - xem luong cua minh

## Thay doi file

### Chi sua prefix (`routes/__init__.py`):
- `phong_ban_router`: `/phong-ban` -> `/admin/phong-ban`
- `nhan_vien_router`: `/nhan-vien` -> `/admin/nhan-vien`
- `nhan_vien_sub_router`: `/nhan-vien` -> `/admin/nhan-vien`
- `nhan_vien_cong_tac_router`: `/nhan-vien` -> `/admin/nhan-vien`
- `hop_dong_router`: `` -> `/admin` (internal prefix `/nhan-vien` se thanh `/admin/nhan-vien`)
- `chuc_vu_router`: `/chuc-vu` -> `/admin/chuc-vu`
- `luong_router`: `/luong` -> `/admin/luong`
- `nghi_phep_router`: `/nghi-phep` -> `/admin/nghi-phep`
- `cau_hinh_nghi_phep_router`: `/nghi-phep` -> `/admin/nghi-phep`
- `admin_cham_cong_router`: `/ql/cham-cong` -> `/admin/cham-cong`
- `thong_ke_router`: `/thong-ke` -> `/admin/thong-ke`
- `thong_ke_bao_cao_router`: `/thong-ke` -> `/admin/thong-ke`
- `upload_router`: `/upload` -> `/admin/upload`
- `lich_su_chuc_vu_router`: `/lich-su-chuc-vu` -> `/admin/lich-su-chuc-vu`
- `cong_tac_router`: `/cong-tac` -> `/admin/cong-tac`
- `employee_router`: `/employee` -> `/nhan-vien`
- `cham_cong_router`: `/nv/cham-cong` -> `/nhan-vien/cham-cong`

### File moi can tao:
- `routes/nhan_vien/nghi_phep.py` - NV nghi phep router (tach tu `quan_ly/nghi_phep.py`)
- `routes/nhan_vien/upload.py` - NV upload router
- `routes/nhan_vien/luong.py` - NV luong router

### File can sua them:
- `quan_ly/nghi_phep.py` - bo cac endpoint nhan vien (me, view_own)
- `quan_ly/luong.py` - bo endpoint `/me`
- `routes/nhan_vien/__init__.py` - export them router moi
- `routes/quan_ly/__init__.py` - cap nhat export

### Frontend can cap nhat:
- Tat ca API call trong frontend can doi URL tu cu sang moi
