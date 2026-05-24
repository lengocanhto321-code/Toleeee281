# URL Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize API URLs so admin routes use `/admin/` prefix and employee routes use `/nhan-vien/` prefix.

**Architecture:** Change router prefixes in `routes/__init__.py`, create 3 new NV route files (nghi-phep, upload, luong) by extracting employee-specific endpoints from admin files, and remove those endpoints from the admin files.

**Tech Stack:** Python 3.11, FastAPI, Pydantic

---

### Task 1: Change all admin router prefixes in `routes/__init__.py`

**Files:**
- Modify: `backend/src/api/routes/__init__.py`

- [ ] **Step 1: Update all `include_router` calls to use `/admin/` prefix for admin routers and `/nhan-vien/` prefix for employee routers**

```python
from fastapi import APIRouter

from .auth import router as auth_router
from .quan_ly import (
    nhan_vien_router,
    nhan_vien_sub_router,
    nhan_vien_cong_tac_router,
    phong_ban_router,
    chuc_vu_router,
    luong_router,
    nghi_phep_router,
    thong_ke_router,
    lich_su_chuc_vu_router,
    cong_tac_router,
    hop_dong_router,
    cham_cong_router as admin_cham_cong_router,
    cau_hinh_nghi_phep_router,
)
from .nhan_vien import employee_router, cham_cong_router, nv_nghi_phep_router, nv_upload_router, nv_luong_router
from .upload import upload_router
from .thong_ke.bao_cao import router as thong_ke_bao_cao_router

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])

# Admin routes - prefix /admin/
router.include_router(phong_ban_router, prefix="/admin/phong-ban", tags=["Admin - Phong Ban"])
router.include_router(nhan_vien_router, prefix="/admin/nhan-vien", tags=["Admin - Nhan Vien"])
router.include_router(nhan_vien_sub_router, prefix="/admin/nhan-vien", tags=["Admin - Nhan Vien Sub"])
router.include_router(
    nhan_vien_cong_tac_router, prefix="/admin/nhan-vien", tags=["Admin - Nhan Vien CongTac"]
)
router.include_router(chuc_vu_router, prefix="/admin/chuc-vu", tags=["Admin - Chuc Vu"])
router.include_router(luong_router, prefix="/admin/luong", tags=["Admin - Luong"])
router.include_router(nghi_phep_router, prefix="/admin/nghi-phep", tags=["Admin - Nghi Phep"])
router.include_router(
    cau_hinh_nghi_phep_router, prefix="/admin/nghi-phep", tags=["Admin - Nghi Phep Cau Hinh"]
)
router.include_router(upload_router, prefix="/admin/upload", tags=["Admin - Upload"])
router.include_router(thong_ke_router, prefix="/admin/thong-ke", tags=["Admin - Thong Ke"])
router.include_router(
    lich_su_chuc_vu_router, prefix="/admin/lich-su-chuc-vu", tags=["Admin - Lich Su Chuc Vu"]
)
router.include_router(cong_tac_router, prefix="/admin/cong-tac", tags=["Admin - Cong Tac"])
router.include_router(hop_dong_router, prefix="/admin", tags=["Admin - Hop Dong"])

router.include_router(
    admin_cham_cong_router, prefix="/admin/cham-cong", tags=["Admin - Cham Cong QR"]
)

router.include_router(
    thong_ke_bao_cao_router, prefix="/admin/thong-ke", tags=["Admin - Thong Ke Bao Cao"]
)

# Employee routes - prefix /nhan-vien/
router.include_router(employee_router, prefix="/nhan-vien", tags=["NV - Employee"])
router.include_router(cham_cong_router, prefix="/nhan-vien/cham-cong", tags=["NV - Cham Cong"])
router.include_router(nv_nghi_phep_router, prefix="/nhan-vien/nghi-phep", tags=["NV - Nghi Phep"])
router.include_router(nv_upload_router, prefix="/nhan-vien/upload", tags=["NV - Upload"])
router.include_router(nv_luong_router, prefix="/nhan-vien/luong", tags=["NV - Luong"])
```

---

### Task 2: Remove internal prefix from `hop_dong.py` (now handled by `__init__.py`)

**Files:**
- Modify: `backend/src/api/routes/quan_ly/hop_dong.py`

- [ ] **Step 1: Change the router definition to remove the internal `/nhan-vien` prefix**

In `backend/src/api/routes/quan_ly/hop_dong.py` line 30, change:

```python
router = APIRouter(prefix="/nhan-vien", tags=["hop-dong"])
```

to:

```python
router = APIRouter(tags=["hop-dong"])
```

This is needed because the prefix `/admin` is now set in `__init__.py` via `include_router(hop_dong_router, prefix="/admin")`, and all hop_dong routes already have `/nhan-vien` in their path strings (e.g. `/{nhan_vien_id}/hop-dong`). The paths will resolve to `/api/v1/admin/{nhan_vien_id}/hop-dong`.

---

### Task 3: Create NV nghi phep router file

**Files:**
- Create: `backend/src/api/routes/nhan_vien/nghi_phep.py`

- [ ] **Step 1: Create the file with employee leave request endpoints extracted from `quan_ly/nghi_phep.py`**

```python
from typing import Optional
from fastapi import APIRouter, Depends, Query, Path, status

from libs.result import is_err
import libs.result
from src.api.auth import (
    UserContext,
    require_permission,
)
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.error import ClientError, ServerError
from src.app.usecases.nghi_phep import (
    CreateDonNghiUseCase,
    CreateDonNghiCommand,
    GetDonNghiQuery,
    GetDonNghiDetailQuery,
    GetListDonNghiUseCase,
    GetDonNghiDetailUseCase,
    DeleteDonNghiUseCase,
    DeleteDonNghiCommand,
)

router = APIRouter(tags=["NV - Nghi Phep"])


@router.post("/don", status_code=status.HTTP_201_CREATED)
async def nv_create_don_nghi(
    body: dict,
    user_context: UserContext = Depends(
        require_permission("nghi_phep:create", "nghi_phep:view_own")
    ),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.repository.rbac_repository import RBACRepository

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )

    command = CreateDonNghiCommand(
        nhan_vien_id=tai_khoan.nhan_vien_id,
        loai_nghi=body.get("loai_nghi"),
        tu_ngay=body.get("tu_ngay"),
        den_ngay=body.get("den_ngay"),
        ly_do=body.get("ly_do", ""),
        files=body.get("files", []),
        nguoi_tao_id=user_context.user_id,
    )

    use_case = CreateDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code in ["invalid_data", "missing_document"]:
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Tao don nghi phep thanh cong", "data": result.value.don}


@router.get("/don/{don_id}")
async def nv_get_don_nghi_detail(
    don_id: str = Path(..., description="ID don nghi phep"),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    query = GetDonNghiDetailQuery(don_id=don_id)

    use_case = GetDonNghiDetailUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        raise ServerError(base_error=error)

    return {"message": "Lay chi tiet thanh cong", "data": result.value.don}


@router.get("/me")
async def nv_get_my_don_nghi(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    trang_thai: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.repository.rbac_repository import RBACRepository

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )

    query = GetDonNghiQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=tai_khoan.nhan_vien_id,
        trang_thai=trang_thai,
        loai_nghi=None,
    )

    use_case = GetListDonNghiUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    return {
        "message": "Lay danh sach thanh cong",
        "data": result.value.items,
        "metadata": {
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    }


@router.get("/cham-cong/me")
async def nv_get_my_cham_cong(
    thang: Optional[int] = Query(None, ge=1, le=12),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.repository.rbac_repository import RBACRepository
    from datetime import datetime

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )

    now = datetime.now()
    thang = thang or now.month
    nam = nam or now.year

    cham_cong = await uow.cham_cong_thang_repository.get_by_nhan_vien_thang_nam(
        tai_khoan.nhan_vien_id, thang, nam
    )

    if not cham_cong:
        return {
            "message": "Chua co du lieu cham cong",
            "data": [],
        }

    return {
        "message": "Lay du lieu thanh cong",
        "data": [
            {
                "id": cham_cong.id,
                "thang": cham_cong.thang,
                "nam": cham_cong.nam,
                "nhan_vien_id": cham_cong.nhan_vien_id,
                "nhan_vien_ho_ten": cham_cong.nhan_vien.ho_ten
                if cham_cong.nhan_vien
                else None,
                "tong_ngay_lam": cham_cong.tong_ngay_lam,
                "so_ngay_cong": cham_cong.so_ngay_cong,
                "ngay_cong": {
                    "co_mat": cham_cong.so_ngay_co_mat,
                    "vang_co_phep": cham_cong.so_ngay_vang_co_phep,
                    "vang_khong_phep": cham_cong.so_ngay_vang_khong_phep,
                    "nghi_le": cham_cong.so_ngay_nghi_le_tet,
                },
                "he_so": cham_cong.he_so_ngay_cong,
                "trang_thai": cham_cong.trang_thai,
            }
        ],
    }


@router.delete("/don/{don_id}")
async def nv_delete_don_nghi(
    don_id: str = Path(..., description="ID don nghi phep"),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    command = DeleteDonNghiCommand(
        don_id=don_id,
        nguoi_xoa_id=user_context.user_id,
    )

    use_case = DeleteDonNghiUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code == "not_found":
            raise ClientError(base_error=error, status_code=status.HTTP_404_NOT_FOUND)
        if error.code == "invalid_status":
            raise ClientError(base_error=error, status_code=status.HTTP_400_BAD_REQUEST)
        raise ServerError(base_error=error)

    return {"message": "Xoa don nghi phep thanh cong", "data": result.value}
```

---

### Task 4: Create NV upload router file

**Files:**
- Create: `backend/src/api/routes/nhan_vien/upload.py`

- [ ] **Step 1: Create the file with employee upload endpoints**

```python
import os
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    Query,
)

from libs.result import is_err
import libs.result
from src.api.auth import UserContext, require_permission
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.service.upload_service import UploadService
from src.app.usecases.tai_lieu import (
    UploadTaiLieuCommand,
    UploadTaiLieuUseCase,
    GetTaiLieuByNhanVienQuery,
    GetTaiLieuByNhanVienUseCase,
)
from src.api.schemas.upload import (
    TaiLieuUploadResponse,
    UploadResponse,
)
from src.api.schemas.common import APIResponse
from src.api.error import ClientError, ServerError

router = APIRouter(tags=["NV - Upload"])

UPLOAD_DIR = "/home/enles04/hr_management/backend/uploads"


def get_upload_service() -> UploadService:
    return UploadService(upload_dir=UPLOAD_DIR)


@router.post("/files", response_model=APIResponse[UploadResponse])
async def nv_upload_file(
    file: UploadFile = File(..., description="File can upload"),
    loai_tai_lieu: str = Form(..., description="Loai tai lieu"),
    ten_tai_lieu: str = Form(..., description="Ten tai lieu"),
    mo_ta: Optional[str] = Form(None, description="Mo ta"),
    ngay_het_han: Optional[str] = Form(None, description="Ngay het han (YYYY-MM-DD)"),
    la_ban_chinh: bool = Form(False, description="La ban chinh"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "create")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from datetime import date as date_type
    from src.repository.rbac_repository import RBACRepository

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=404,
        )

    content = await file.read()
    content_type = file.content_type or "application/octet-stream"

    parsed_ngay_het_han = None
    if ngay_het_han:
        try:
            parsed_ngay_het_han = date_type.fromisoformat(ngay_het_han)
        except ValueError:
            pass

    upload_service = get_upload_service()

    command = UploadTaiLieuCommand(
        nhan_vien_id=tai_khoan.nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
        ten_tai_lieu=ten_tai_lieu,
        ho_ten=tai_khoan.nhan_vien_id,
        file_content=content,
        original_filename=file.filename or "unknown",
        mo_ta=mo_ta,
        ngay_het_han=parsed_ngay_het_han,
        la_ban_chinh=la_ban_chinh,
    )

    use_case = UploadTaiLieuUseCase(uow, upload_service)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in [
            "invalid_file_type",
            "file_too_large",
            "invalid_loai_tai_lieu",
        ]:
            raise ClientError(base_error=error, status_code=400)
        if error.code == "file_save_error":
            raise ServerError(base_error=error)
        raise ClientError(base_error=error, status_code=400)

    result_value = result.value

    return APIResponse(
        message="Upload file thanh cong",
        data={
            "url": result_value.url,
            "file_name": result_value.file_name,
            "file_size": result_value.file_size,
            "content_type": result_value.content_type,
            "path": result_value.path,
        },
    )


@router.get(
    "/tai-lieu", response_model=APIResponse[list[TaiLieuUploadResponse]]
)
async def nv_get_my_tai_lieu(
    loai_tai_lieu: Optional[str] = Query(None, description="Loc theo loai tai lieu"),
    user_context: UserContext = Depends(require_permission("tai_lieu", "read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.repository.rbac_repository import RBACRepository

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=404,
        )

    query = GetTaiLieuByNhanVienQuery(
        nhan_vien_id=tai_khoan.nhan_vien_id,
        loai_tai_lieu=loai_tai_lieu,
    )

    use_case = GetTaiLieuByNhanVienUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = [TaiLieuUploadResponse(**item) for item in result.value.items]

    return APIResponse(
        message="Lay danh sach tai lieu thanh cong",
        data=items,
    )
```

---

### Task 5: Create NV luong router file

**Files:**
- Create: `backend/src/api/routes/nhan_vien/luong.py`

- [ ] **Step 1: Create the file with employee salary endpoint**

```python
from typing import Optional

from fastapi import APIRouter, Depends, Query

from libs.result import is_err
import libs.result
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponseWithMetadata
from src.api.error import ClientError, ServerError
from src.app.usecases.luong import (
    GetListLuongQuery,
    GetListLuongUseCase,
)

router = APIRouter(tags=["NV - Luong"])


@router.get("/me", response_model=APIResponseWithMetadata[list[dict]])
async def nv_get_my_luong(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    nam: Optional[int] = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("luong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    from src.repository.rbac_repository import RBACRepository

    rbac_repo = RBACRepository(uow.session)
    tai_khoan = await rbac_repo.get_tai_khoan_by_id(user_context.user_id)
    if not tai_khoan or not tai_khoan.nhan_vien_id:
        raise ClientError(
            base_error=libs.result.Error(
                code="not_found", message="Khong tim thay thong tin nhan vien"
            ),
            status_code=404,
        )

    query = GetListLuongQuery(
        page=page,
        page_size=page_size,
        nhan_vien_id=tai_khoan.nhan_vien_id,
        hieu_luc=None,
    )

    use_case = GetListLuongUseCase(uow)
    result = await use_case.execute(query)

    if is_err(result):
        raise ServerError(base_error=result.value)

    items = []
    for luong in result.value.items:
        items.append(
            {
                "id": luong.id,
                "thang": luong.thang,
                "nam": luong.nam,
                "nhan_vien_id": luong.nhan_vien_id,
                "nhan_vien_ho_ten": luong.nhan_vien.ho_ten if luong.nhan_vien else None,
                "tong_thu_nhap": luong.tong_thu_nhap,
                "tong_khau_tru": luong.tong_khau_tru,
                "luong_thuc_nhan": luong.luong_thuc_nhan,
                "ngay_thanh_toan": luong.ngay_thanh_toan,
                "chi_tiet": {
                    "luong_co_ban": luong.luong_co_ban,
                    "phu_cap": luong.phu_cap_chuc_vu + luong.phu_cap_khac,
                    "thuong": luong.thuong,
                    "bao_hiem": luong.bhxh + luong.bhyt + luong.bhtn,
                    "thue": luong.thue_tncn,
                    "khac": luong.khau_tru_khac,
                },
            }
        )

    return APIResponseWithMetadata(
        message="Lay danh sach luong thanh cong",
        data=items,
        metadata={
            "total": result.value.total,
            "page": page,
            "per_page": page_size,
            "total_pages": (result.value.total + page_size - 1) // page_size,
        },
    )
```

---

### Task 6: Update `nhan_vien/__init__.py` to export new routers

**Files:**
- Modify: `backend/src/api/routes/nhan_vien/__init__.py`

- [ ] **Step 1: Add the 3 new router imports and exports**

```python
from .employee import router as employee_router
from .cham_cong import router as cham_cong_router
from .nghi_phep import router as nv_nghi_phep_router
from .upload import router as nv_upload_router
from .luong import router as nv_luong_router

__all__ = [
    "employee_router",
    "cham_cong_router",
    "nv_nghi_phep_router",
    "nv_upload_router",
    "nv_luong_router",
]
```

---

### Task 7: Remove employee endpoints from `quan_ly/nghi_phep.py`

**Files:**
- Modify: `backend/src/api/routes/quan_ly/nghi_phep.py`

- [ ] **Step 1: Remove the `get_my_don_nghi` endpoint (function `get_my_don_nghi` at line 143-191)**

Delete the entire function including the `@router.get("/me")` decorator.

- [ ] **Step 2: Remove the `get_my_cham_cong` endpoint (function `get_my_cham_cong` at line 194-256)**

Delete the entire function including the `@router.get("/cham-cong/me")` decorator.

---

### Task 8: Remove employee endpoint from `quan_ly/luong.py`

**Files:**
- Modify: `backend/src/api/routes/quan_ly/luong.py`

- [ ] **Step 1: Remove the `get_my_luong` endpoint (function at line 200-271)**

Delete the entire function including the `@router.get("/me")` decorator and its body.

---

### Task 9: Verify the app starts successfully

- [ ] **Step 1: Start the FastAPI app and check for import/prefix errors**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "from src.api.routes import router; print('OK')"`

Expected: `OK` with no import errors.

- [ ] **Step 2: Check all registered routes**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "from src.api.routes import router; [print(f'{r.methods} {r.path}') for r in router.routes]"`

Expected: All admin routes start with `/api/v1/admin/`, all employee routes start with `/api/v1/nhan-vien/`, auth routes stay at `/api/v1/`.
