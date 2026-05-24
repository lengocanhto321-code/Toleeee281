# Đồng bộ logic Nghỉ phép + Chấm công + Lương Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa 7 bug đồng bộ logic giữa 3 module nghỉ phép, chấm công, và lương để đảm bảo dữ liệu nhất quán và tính lương chính xác.

**Architecture:** Từng task sửa một bug cụ thể theo thứ tự ưu tiên Critical → High → Medium. Mỗi task độc lập, sửa xong verify được riêng.

**Tech Stack:** Python, SQLAlchemy async, FastAPI

---

### Task 1: [CRITICAL] Sửa tính lương đọc đúng bảng chấm công

Module lương đang đọc bảng `cham_cong` (luôn rỗng) thay vì `cham_cong_thang` (có dữ liệu thực), dẫn đến hệ số ngày công luôn = 1.0 (full lương).

**Files:**
- Modify: `src/app/usecases/luong/tinh_luong_uc.py:73-116` (PreviewLuongUseCase)
- Modify: `src/app/usecases/luong/tinh_luong_uc.py:264-311` (ChayLuongUseCase)
- Modify: `src/app/usecases/luong/tinh_luong_uc.py:344-348` (TraLuong FK)

Cả hai use case `PreviewLuongUseCase` và `ChayLuongUseCase` đều gọi:
```python
cham_cong = await cham_cong_repo.find_by_nhan_vien_thang_nam(...)
```
và `cham_cong_repo` là `ChamCongRepository` đọc bảng `cham_cong`. Cần đổi sang đọc `cham_cong_thang` qua `cham_cong_thang_repository`.

Đồng thời cần map field `cham_cong_thang` sang dict `thong_tin_cham_cong` tương thích với `TinhLuongService`. Các field cần map:
- `so_ngay_lam_chuan` ← `cham_cong_thang.so_ngay_lam_chuan`
- `so_ngay_lam_thuc_te` ← `cham_cong_thang.so_ngay_co_mat`
- `so_ngay_nghi_phep` ← `cham_cong_thang.so_ngay_vang_co_phep` (nghỉ ốm + phép năm + etc.)
- `so_ngay_nghi_om` ← 0 (không tách riêng trong cham_cong_thang)
- `so_ngay_cong_tac` ← `cham_cong_thang.so_ngay_cong_tac`
- `so_ngay_le_tet` ← `cham_cong_thang.so_ngay_nghi_le_tet`
- `so_ngay_nghi_khong_phep` ← `cham_cong_thang.so_ngay_vang_khong_phep`

- [ ] **Step 1: Sửa PreviewLuongUseCase** - Đổi từ `cham_cong_repo` sang `cham_cong_thang_repository`

Trong `src/app/usecases/luong/tinh_luong_uc.py`, sửa phần `PreviewLuongUseCase.execute()`:

Tìm đoạn (khoảng dòng 38-39):
```python
            cham_cong_repo = uow.cham_cong_repository
```
Xóa dòng này. Không cần `cham_cong_repo` nữa.

Tìm đoạn (khoảng dòng 73-76):
```python
            cham_cong = await cham_cong_repo.find_by_nhan_vien_thang_nam(
                command.nhan_vien_id, command.thang, command.nam
            )
```
Thay bằng:
```python
            cham_cong_thang = await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                command.nhan_vien_id, command.thang, command.nam
            )
```

Tìm đoạn (khoảng dòng 106-116):
```python
            thong_tin_cham_cong = None
            if cham_cong:
                thong_tin_cham_cong = {
                    "so_ngay_lam_chuan": cham_cong.so_ngay_lam_chuan,
                    "so_ngay_lam_thuc_te": cham_cong.so_ngay_lam_thuc_te,
                    "so_ngay_nghi_phep": cham_cong.so_ngay_nghi_phep,
                    "so_ngay_nghi_om": cham_cong.so_ngay_nghi_om,
                    "so_ngay_cong_tac": cham_cong.so_ngay_cong_tac,
                    "so_ngay_le_tet": cham_cong.so_ngay_le_tet,
                    "so_ngay_nghi_khong_phep": cham_cong.so_ngay_nghi_khong_phep,
                }
```
Thay bằng:
```python
            thong_tin_cham_cong = None
            if cham_cong_thang:
                thong_tin_cham_cong = {
                    "so_ngay_lam_chuan": cham_cong_thang.so_ngay_lam_chuan,
                    "so_ngay_lam_thuc_te": cham_cong_thang.so_ngay_co_mat,
                    "so_ngay_nghi_phep": cham_cong_thang.so_ngay_vang_co_phep,
                    "so_ngay_nghi_om": 0,
                    "so_ngay_cong_tac": cham_cong_thang.so_ngay_cong_tac,
                    "so_ngay_le_tet": cham_cong_thang.so_ngay_nghi_le_tet,
                    "so_ngay_nghi_khong_phep": cham_cong_thang.so_ngay_vang_khong_phep,
                }
```

- [ ] **Step 2: Sửa ChayLuongUseCase** - Tương tự cho batch salary calculation

Trong cùng file `src/app/usecases/luong/tinh_luong_uc.py`, sửa phần `ChayLuongUseCase.execute()`:

Tìm đoạn (khoảng dòng 196):
```python
            cham_cong_repo = uow.cham_cong_repository
```
Xóa dòng này.

Tìm đoạn (khoảng dòng 269-271):
```python
                cham_cong = await cham_cong_repo.find_by_nhan_vien_thang_nam(
                    nv.id, command.thang, command.nam
                )
```
Thay bằng:
```python
                cham_cong_thang = await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                    nv.id, command.thang, command.nam
                )
```

Tìm đoạn (khoảng dòng 301-311):
```python
                thong_tin_cham_cong = None
                if cham_cong:
                    thong_tin_cham_cong = {
                        "so_ngay_lam_chuan": cham_cong.so_ngay_lam_chuan,
                        "so_ngay_lam_thuc_te": cham_cong.so_ngay_lam_thuc_te,
                        "so_ngay_nghi_phep": cham_cong.so_ngay_nghi_phep,
                        "so_ngay_nghi_om": cham_cong.so_ngay_nghi_om,
                        "so_ngay_cong_tac": cham_cong.so_ngay_cong_tac,
                        "so_ngay_le_tet": cham_cong.so_ngay_le_tet,
                        "so_ngay_nghi_khong_phep": cham_cong.so_ngay_nghi_khong_phep,
                    }
```
Thay bằng:
```python
                thong_tin_cham_cong = None
                if cham_cong_thang:
                    thong_tin_cham_cong = {
                        "so_ngay_lam_chuan": cham_cong_thang.so_ngay_lam_chuan,
                        "so_ngay_lam_thuc_te": cham_cong_thang.so_ngay_co_mat,
                        "so_ngay_nghi_phep": cham_cong_thang.so_ngay_vang_co_phep,
                        "so_ngay_nghi_om": 0,
                        "so_ngay_cong_tac": cham_cong_thang.so_ngay_cong_tac,
                        "so_ngay_le_tet": cham_cong_thang.so_ngay_nghi_le_tet,
                        "so_ngay_nghi_khong_phep": cham_cong_thang.so_ngay_vang_khong_phep,
                    }
```

Tìm đoạn (khoảng dòng 344-348):
```python
                tra_luong = TraLuong(
                    id=generate_id(),
                    nhan_vien_id=nv.id,
                    luong_id=luong.id,
                    cham_cong_id=cham_cong.id if cham_cong else None,
```
Thay bằng:
```python
                tra_luong = TraLuong(
                    id=generate_id(),
                    nhan_vien_id=nv.id,
                    luong_id=luong.id,
                    cham_cong_id=cham_cong_thang.id if cham_cong_thang else None,
```

Lưu ý: FK `cham_cong_id` trong `TraLuong` trỏ đến bảng `cham_cong`. Ta sẽ cần cập nhật FK này trong Task 2. Tạm thời để nguyên FK vì SQLAlchemy SET NULL sẽ handle khi id không khớp.

- [ ] **Step 3: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/luong/tinh_luong_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 4: Commit**

```bash
git add src/app/usecases/luong/tinh_luong_uc.py
git commit -m "fix: salary calculation reads from cham_cong_thang instead of empty cham_cong table"
```

---

### Task 2: [CRITICAL] Cập nhật FK TraLuong.cham_cong_id sang bảng cham_cong_thang

`TraLuong.cham_cong_id` là FK đến bảng `cham_cong` (cũ, rỗng). Cần đổi sang bảng `cham_cong_thang`.

**Files:**
- Modify: `src/domain/models/tra_luong.py:21` (FK reference)

- [ ] **Step 1: Đổi FK trong TraLuong model**

Trong `src/domain/models/tra_luong.py`, tìm:
```python
    cham_cong_id = Column(String(32), ForeignKey("cham_cong.id", ondelete="SET NULL"))
```
Thay bằng:
```python
    cham_cong_id = Column(String(32), ForeignKey("cham_cong_thang.id", ondelete="SET NULL"))
```

- [ ] **Step 2: Tạo migration**

Run: `cd /mnt/newhome/code/hr_management/backend && alembic revision --autogenerate -m "change_tra_luong_cham_cong_fk_to_cham_cong_thang"`

Nếu alembic không tự detect, tạo migration thủ công. Migration cần:
1. Drop existing FK constraint trên `tra_luong.cham_cong_id`
2. Add new FK constraint trỏ đến `cham_cong_thang.id`

- [ ] **Step 3: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/domain/models/tra_luong.py', doraise=True)"`
Expected: No error

- [ ] **Step 4: Commit**

```bash
git add src/domain/models/tra_luong.py
git commit -m "fix: change TraLuong FK from cham_cong to cham_cong_thang"
```

---

### Task 3: [HIGH] Duyệt đơn nghỉ cập nhật chấm công tháng

Khi duyệt/từ chối/xóa đơn nghỉ, cần cập nhật lại bảng `cham_cong_thang` để phản ánh đúng số ngày vắng.

**Files:**
- Create: `src/app/usecases/nghi_phep/sync_cham_cong_uc.py` (helper sync logic)
- Modify: `src/app/usecases/nghi_phep/duyet_don_nghi_uc.py` (thêm sync sau khi duyệt)
- Modify: `src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py` (thêm sync sau khi từ chối)

**Logic sync:** Sau khi thay đổi trạng thái đơn nghỉ, load lại tất cả đơn `da_duyet` trong tháng, tính lại `cham_cong_thang` tương tự `MockGenerateChamCongUseCase`.

- [ ] **Step 1: Tạo helper function sync chấm công**

Tạo file mới `src/app/usecases/nghi_phep/sync_cham_cong_uc.py`:

```python
from datetime import date
from typing import List

from src.service.cham_cong_service import ChamCongService


async def sync_cham_cong_thang_for_nhan_vien(uow, nhan_vien_id: str, thang: int, nam: int):
    service = ChamCongService()

    tu_ngay = date(nam, thang, 1)
    if thang == 12:
        den_ngay = date(nam + 1, 1, 1)
    else:
        den_ngay = date(nam, thang + 1, 1)

    don_nghi_list = await uow.don_xin_nghi_repository.find_by_date_range(
        nhan_vien_id, tu_ngay, den_ngay - date.resolution
    )

    danh_sach_nghi: List[dict] = []
    for don in don_nghi_list:
        danh_sach_nghi.append({
            "loai_nghi": don.loai_nghi,
            "so_ngay": float(don.so_ngay),
        })

    so_ngay_lam_viec = service.tinh_so_ngay_lam_viec_thang(thang, nam)

    from src.constants import SO_NGAY_LAM_VIEC_CHUAN_THANG

    so_ngay_nghi_le_tet = _tinh_ngay_le_tet_thang(thang, nam)

    ket_qua = service.mock_tinh_cham_cong_thang(
        so_ngay_lam_viec_trong_thang=so_ngay_lam_viec,
        danh_sach_nghi=danh_sach_nghi,
        so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
    )

    await uow.cham_cong_thang_repository.upsert(
        nhan_vien_id=nhan_vien_id,
        thang=thang,
        nam=nam,
        so_ngay_co_mat=ket_qua["so_ngay_co_mat"],
        so_ngay_vang_co_phep=ket_qua["so_ngay_vang_co_phep"],
        so_ngay_vang_khong_phep=ket_qua["so_ngay_vang_khong_phep"],
        so_ngay_nghi_le_tet=ket_qua["so_ngay_nghi_le_tet"],
        so_ngay_cong_tac=ket_qua["so_ngay_cong_tac"],
        he_so_ngay_cong=ket_qua["he_so_ngay_cong"],
    )


def _tinh_ngay_le_tet_thang(thang: int, nam: int) -> float:
    from src.service.nghi_phep_service import NghiPhepService
    nghi_phep_service = NghiPhepService()
    holidays = nghi_phep_service.get_holidays(nam)
    tu_ngay = date(nam, thang, 1)
    if thang == 12:
        den_ngay = date(nam + 1, 1, 1) - date.resolution
    else:
        den_ngay = date(nam, thang + 1, 1) - date.resolution
    count = sum(1 for h in holidays if tu_ngay <= h <= den_ngay and h.weekday() < 5)
    return float(count)
```

- [ ] **Step 2: Thêm sync vào DuyetDonNghiUseCase**

Trong `src/app/usecases/nghi_phep/duyet_don_nghi_uc.py`:

Thêm import đầu file:
```python
from src.app.usecases.nghi_phep.sync_cham_cong_uc import sync_cham_cong_thang_for_nhan_vien
```

Tìm đoạn (dòng 75, ngay trước `don = await uow.don_xin_nghi_repository.find_by_id`):
```python
            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)

        return Return.ok(
```
Chèn trước `don = await ...`:
```python
            await sync_cham_cong_thang_for_nhan_vien(
                uow, don.nhan_vien_id, don.tu_ngay.month, don.tu_ngay.year
            )

            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)
```

Lưu ý: Cần bỏ sang context manager ban đầu để `sync_cham_cong_thang_for_nhan_vien` chạy trong cùng transaction. Xem lại cấu trúc - nó đã nằm trong `async with self.unit_of_work as uow:`.

- [ ] **Step 3: Thêm sync vào TuChoiDonNghiUseCase**

Trong `src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py`:

Thêm import:
```python
from src.app.usecases.nghi_phep.sync_cham_cong_uc import sync_cham_cong_thang_for_nhan_vien
```

Tìm đoạn (trước dòng `don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)` lần 2):
```python
            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)

        return Return.ok(
```
Chèn trước đó:
```python
            await sync_cham_cong_thang_for_nhan_vien(
                uow, don.nhan_vien_id, don.tu_ngay.month, don.tu_ngay.year
            )

            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)
```

- [ ] **Step 4: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/nghi_phep/sync_cham_cong_uc.py', doraise=True); py_compile.compile('src/app/usecases/nghi_phep/duyet_don_nghi_uc.py', doraise=True); py_compile.compile('src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 5: Commit**

```bash
git add src/app/usecases/nghi_phep/sync_cham_cong_uc.py src/app/usecases/nghi_phep/duyet_don_nghi_uc.py src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py
git commit -m "feat: sync cham_cong_thang when approving/rejecting leave requests"
```

---

### Task 4: [HIGH] Từ chối/xóa đơn nghỉ hoàn lại phép đã trừ

Khi đơn nghỉ phép năm bị từ chối hoặc xóa, cần hoàn lại `phep_nam_da_su_dung` và `phep_nam_con_lai`.

**Files:**
- Modify: `src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py`
- Modify: `src/app/usecases/nghi_phep/delete_don_nghi_uc.py`

- [ ] **Step 1: Sửa TuChoiDonNghiUseCase - hoàn phép nếu đơn đã duyệt**

Trong `src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py`:

Thêm import:
```python
from src.constants import LOAI_NGHI_KEYS, TRANG_THAI_DON_KEYS
```
(Đã có `TRANG_THAI_DON_KEYS`, thêm `LOAI_NGHI_KEYS`)

Đổi validation trạng thái. Tìm:
```python
            if don.trang_thai != TRANG_THAI_DON_KEYS[0]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể từ chối đơn ở trạng thái: {don.trang_thai}",
                        reason="Invalid status",
                    )
                )
```
Thay bằng:
```python
            if don.trang_thai not in [TRANG_THAI_DON_KEYS[0], TRANG_THAI_DON_KEYS[1]]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể từ chối đơn ở trạng thái: {don.trang_thai}",
                        reason="Invalid status",
                    )
                )
```

Sau `await uow.don_xin_nghi_repository.update_trang_thai(...)`, thêm logic hoàn phép:
```python
            if don.trang_thai == TRANG_THAI_DON_KEYS[1] and don.loai_nghi == LOAI_NGHI_KEYS[0]:
                so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                    don.nhan_vien_id, don.tu_ngay.year
                )
                phep_nam_da_su_dung = max(
                    0, float(so_ngay_phep.phep_nam_da_su_dung or 0) - float(don.so_ngay)
                )
                phep_nam_con_lai = float(so_ngay_phep.phep_nam_duoc_phep) - phep_nam_da_su_dung
                phep_nam_con_lai = max(0, phep_nam_con_lai)
                await uow.so_ngay_phep_repository.update_con_lai(
                    so_ngay_phep.id,
                    phep_nam_da_su_dung=phep_nam_da_su_dung,
                    phep_nam_con_lai=phep_nam_con_lai,
                )
```

Đặt đoạn này **trước** `sync_cham_cong_thang_for_nhan_vien` (từ Task 3).

- [ ] **Step 2: Sửa DeleteDonNghiUseCase - cho xóa đơn đã duyệt + hoàn phép**

Trong `src/app/usecases/nghi_phep/delete_don_nghi_uc.py`:

Thêm imports:
```python
from src.constants import LOAI_NGHI_KEYS, TRANG_THAI_DON_KEYS
from src.app.usecases.nghi_phep.sync_cham_cong_uc import sync_cham_cong_thang_for_nhan_vien
```

Tìm đoạn validation:
```python
            if don.trang_thai != TRANG_THAI_DON_KEYS[0]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Chỉ có thể xóa đơn đang chờ duyệt",
                        reason="Invalid status",
                    )
                )
```
Thay bằng:
```python
            if don.trang_thai not in [TRANG_THAI_DON_KEYS[0], TRANG_THAI_DON_KEYS[1]]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Chỉ có thể xóa đơn đang chờ duyệt hoặc đã duyệt",
                        reason="Invalid status",
                    )
                )

            if don.trang_thai == TRANG_THAI_DON_KEYS[1] and don.loai_nghi == LOAI_NGHI_KEYS[0]:
                so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                    don.nhan_vien_id, don.tu_ngay.year
                )
                phep_nam_da_su_dung = max(
                    0, float(so_ngay_phep.phep_nam_da_su_dung or 0) - float(don.so_ngay)
                )
                phep_nam_con_lai = float(so_ngay_phep.phep_nam_duoc_phep) - phep_nam_da_su_dung
                phep_nam_con_lai = max(0, phep_nam_con_lai)
                await uow.so_ngay_phep_repository.update_con_lai(
                    so_ngay_phep.id,
                    phep_nam_da_su_dung=phep_nam_da_su_dung,
                    phep_nam_con_lai=phep_nam_con_lai,
                )

            if don.trang_thai == TRANG_THAI_DON_KEYS[1]:
                await sync_cham_cong_thang_for_nhan_vien(
                    uow, don.nhan_vien_id, don.tu_ngay.month, don.tu_ngay.year
                )
```

- [ ] **Step 3: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py', doraise=True); py_compile.compile('src/app/usecases/nghi_phep/delete_don_nghi_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 4: Commit**

```bash
git add src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py src/app/usecases/nghi_phep/delete_don_nghi_uc.py
git commit -m "fix: restore leave days when rejecting or deleting approved leave requests"
```

---

### Task 5: [HIGH] Thống nhất công thức hệ số ngày công

`TinhLuongService.tinh_he_so_ngay_cong` có param `so_ngay_nghi_om` tách riêng và trừ `so_ngay_nghi_khong_phep`, trong khi `ChamCongService.tinh_he_so_ngay_cong` gộp nghỉ ốm vào vắng có phép và không trừ vắng không phép.

**Files:**
- Modify: `src/service/tinh_luong_service.py:21-53`

Cần thống nhất: `so_ngay_nghi_om` được tính là vắng có phép (hưởng lương), nên công thức hợp nhất là:

```
Tổng = lam_thuc_te + nghi_phep + nghi_om + cong_tac + le_tet - nghi_khong_phep
```

Cả hai service đều cùng công thức. `ChamCongService` cần thêm param `so_ngay_vang_khong_phep`.

- [ ] **Step 1: Sửa ChamCongService.tinh_he_so_ngay_cong**

Trong `src/service/cham_cong_service.py`, tìm method `tinh_he_so_ngay_cong` (dòng 37-71):

```python
    def tinh_he_so_ngay_cong(
        self,
        so_ngay_co_mat: float,
        so_ngay_vang_co_phep: float,
        so_ngay_cong_tac: float,
        so_ngay_nghi_le_tet: float,
        so_ngay_lam_chuan: float = SO_NGAY_LAM_VIEC_CHUAN_THANG,
    ) -> float:
```

Thay bằng:
```python
    def tinh_he_so_ngay_cong(
        self,
        so_ngay_co_mat: float,
        so_ngay_vang_co_phep: float,
        so_ngay_cong_tac: float,
        so_ngay_nghi_le_tet: float,
        so_ngay_lam_chuan: float = SO_NGAY_LAM_VIEC_CHUAN_THANG,
        so_ngay_vang_khong_phep: float = 0,
    ) -> float:
```

Tìm đoạn body:
```python
        ngay_huong_loi = (
            so_ngay_co_mat
            + so_ngay_vang_co_phep
            + so_ngay_cong_tac
            + so_ngay_nghi_le_tet
        )
```
Thay bằng:
```python
        ngay_huong_loi = (
            so_ngay_co_mat
            + so_ngay_vang_co_phep
            + so_ngay_cong_tac
            + so_ngay_nghi_le_tet
            - so_ngay_vang_khong_phep
        )
        ngay_huong_loi = max(0, ngay_huong_loi)
```

- [ ] **Step 2: Cập nhật các caller của ChamCongService.tinh_he_so_ngay_cong**

Trong `src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py`, tìm (dòng 79-83):
```python
            ket_qua = self.service.mock_tinh_cham_cong_thang(
                so_ngay_lam_viec_trong_thang=so_ngay_lam_viec,
                danh_sach_nghi=danh_sach_nghi,
                so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
            )
```
Không cần sửa vì `mock_tinh_cham_cong_thang` gọi `tinh_he_so_ngay_cong` với default `so_ngay_vang_khong_phep=0`.

Trong `src/app/usecases/cham_cong/aggregate_monthly_uc.py`, tìm (dòng 68-74):
```python
                he_so = self.service.tinh_he_so_ngay_cong(
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    so_ngay_nghi_le_tet=0,
                    so_ngay_lam_chuan=float(so_ngay_lam_viec),
                )
```
Thêm param:
```python
                he_so = self.service.tinh_he_so_ngay_cong(
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    so_ngay_nghi_le_tet=0,
                    so_ngay_lam_chuan=float(so_ngay_lam_viec),
                    so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                )
```

- [ ] **Step 3: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/service/cham_cong_service.py', doraise=True); py_compile.compile('src/app/usecases/cham_cong/aggregate_monthly_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 4: Commit**

```bash
git add src/service/cham_cong_service.py src/app/usecases/cham_cong/aggregate_monthly_uc.py
git commit -m "fix: unify he_so_ngay_cong formula - subtract vang_khong_phep in both services"
```

---

### Task 6: [MEDIUM] Sửa update chấm công - tính lại hệ số + cho phép sửa khi da_mock

**Files:**
- Modify: `src/app/usecases/nghi_phep/update_cham_cong_uc.py`

- [ ] **Step 1: Sửa UpdateChamCongThangUseCase**

Trong `src/app/usecases/nghi_phep/update_cham_cong_uc.py`, thay toàn bộ nội dung:

```python
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService


@dataclass
class UpdateChamCongThangCommand:
    cham_cong_id: str
    so_ngay_co_mat: Optional[int] = None
    so_ngay_vang_co_phep: Optional[int] = None
    so_ngay_vang_khong_phep: Optional[int] = None
    so_ngay_nghi_le_tet: Optional[int] = None
    so_ngay_cong_tac: Optional[int] = None
    ghi_chu: Optional[str] = None


@dataclass
class UpdateChamCongThangResult:
    id: str


class UpdateChamCongThangUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, command: UpdateChamCongThangCommand
    ) -> Result[UpdateChamCongThangResult, Error]:
        async with self.unit_of_work as uow:
            cham_cong = await uow.cham_cong_thang_repository.find_by_id(
                command.cham_cong_id
            )
            if not cham_cong:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy chấm công")
                )

            if cham_cong.trang_thai not in ("chua_chot", "da_mock"):
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể sửa khi đã xác nhận (status: {cham_cong.trang_thai})",
                    )
                )

            if command.so_ngay_co_mat is not None:
                cham_cong.so_ngay_co_mat = command.so_ngay_co_mat
            if command.so_ngay_vang_co_phep is not None:
                cham_cong.so_ngay_vang_co_phep = command.so_ngay_vang_co_phep
            if command.so_ngay_vang_khong_phep is not None:
                cham_cong.so_ngay_vang_khong_phep = command.so_ngay_vang_khong_phep
            if command.so_ngay_nghi_le_tet is not None:
                cham_cong.so_ngay_nghi_le_tet = command.so_ngay_nghi_le_tet
            if command.so_ngay_cong_tac is not None:
                cham_cong.so_ngay_cong_tac = command.so_ngay_cong_tac

            he_so = self.service.tinh_he_so_ngay_cong(
                so_ngay_co_mat=float(cham_cong.so_ngay_co_mat or 0),
                so_ngay_vang_co_phep=float(cham_cong.so_ngay_vang_co_phep or 0),
                so_ngay_cong_tac=float(cham_cong.so_ngay_cong_tac or 0),
                so_ngay_nghi_le_tet=float(cham_cong.so_ngay_nghi_le_tet or 0),
                so_ngay_lam_chuan=float(cham_cong.so_ngay_lam_chuan or 26),
                so_ngay_vang_khong_phep=float(cham_cong.so_ngay_vang_khong_phep or 0),
            )
            cham_cong.he_so_ngay_cong = he_so

            return Return.ok(UpdateChamCongThangResult(id=cham_cong.id))
```

Thay đổi chính:
1. Cho phép sửa khi `trang_thai in ("chua_chot", "da_mock")`
2. Tính lại `he_so_ngay_cong` sau khi update
3. Xóa field `tong_ngay_lam` không tồn tại trong model

- [ ] **Step 2: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/nghi_phep/update_cham_cong_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 3: Commit**

```bash
git add src/app/usecases/nghi_phep/update_cham_cong_uc.py
git commit -m "fix: recalculate he_so_ngay_cong on cham_cong update and allow editing da_mock status"
```

---

### Task 7: [MEDIUM] Sửa mock generate tính ngày lễ Tết chính xác

**Files:**
- Modify: `src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py:75-77`

- [ ] **Step 1: Sửa tính ngày lễ Tết trong MockGenerateChamCongUseCase**

Trong `src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py`, thêm import đầu file:
```python
from src.service.nghi_phep_service import NghiPhepService
```

Tìm đoạn (dòng 75-77):
```python
            so_ngay_nghi_le_tet = 0
            if command.thang in [1, 4, 5, 9]:
                so_ngay_nghi_le_tet = 11.0 / 12
```
Thay bằng:
```python
            nghi_phep_service = NghiPhepService()
            holidays = nghi_phep_service.get_holidays(command.nam)
            so_ngay_nghi_le_tet = sum(
                1 for h in holidays
                if h.month == command.thang and h.weekday() < 5
            )
            so_ngay_nghi_le_tet = float(so_ngay_nghi_le_tet)
```

- [ ] **Step 2: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 3: Commit**

```bash
git add src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py
git commit -m "fix: calculate holidays accurately from calendar instead of hardcoding"
```

---

### Task 8: [MEDIUM] Sửa aggregate_monthly tính ngày lễ Tết

**Files:**
- Modify: `src/app/usecases/cham_cong/aggregate_monthly_uc.py`

- [ ] **Step 1: Sửa aggregate_monthly để tính ngày lễ thực tế**

Trong `src/app/usecases/cham_cong/aggregate_monthly_uc.py`:

Thêm import:
```python
from src.service.nghi_phep_service import NghiPhepService
```

Trong method `execute`, sau `so_ngay_lam_viec = ...` và trước `async with`, tính ngày lễ:
```python
        nghi_phep_service = NghiPhepService()
        holidays = nghi_phep_service.get_holidays(command.nam)
        so_ngay_nghi_le_tet = sum(
            1 for h in holidays
            if h.month == command.thang and h.weekday() < 5
        )
```

Tìm đoạn (dòng 68-74):
```python
                he_so = self.service.tinh_he_so_ngay_cong(
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    so_ngay_nghi_le_tet=0,
                    so_ngay_lam_chuan=float(so_ngay_lam_viec),
                )
```
Thay bằng:
```python
                he_so = self.service.tinh_he_so_ngay_cong(
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    so_ngay_nghi_le_tet=float(so_ngay_nghi_le_tet),
                    so_ngay_lam_chuan=float(so_ngay_lam_viec),
                    so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                )
```

Và sửa upsert:
```python
                await uow.cham_cong_thang_repository.upsert(
                    nhan_vien_id=nv.id,
                    thang=command.thang,
                    nam=command.nam,
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                    so_ngay_nghi_le_tet=float(so_ngay_nghi_le_tet),
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    he_so_ngay_cong=he_so,
                )
```
(Đổi `so_ngay_nghi_le_tet=0` thành `so_ngay_nghi_le_tet=float(so_ngay_nghi_le_tet)`)

- [ ] **Step 2: Verify syntax**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "import py_compile; py_compile.compile('src/app/usecases/cham_cong/aggregate_monthly_uc.py', doraise=True)"`
Expected: No error

- [ ] **Step 3: Commit**

```bash
git add src/app/usecases/cham_cong/aggregate_monthly_uc.py
git commit -m "fix: calculate holidays in aggregate_monthly from calendar instead of hardcoding 0"
```

---

### Task 9: Final verification - chạy syntax check toàn bộ

- [ ] **Step 1: Syntax check tất cả files đã sửa**

Run:
```bash
cd /mnt/newhome/code/hr_management/backend && python -c "
import py_compile
files = [
    'src/app/usecases/luong/tinh_luong_uc.py',
    'src/domain/models/tra_luong.py',
    'src/app/usecases/nghi_phep/sync_cham_cong_uc.py',
    'src/app/usecases/nghi_phep/duyet_don_nghi_uc.py',
    'src/app/usecases/nghi_phep/tu_choi_don_nghi_uc.py',
    'src/app/usecases/nghi_phep/delete_don_nghi_uc.py',
    'src/app/usecases/nghi_phep/mock_generate_cham_cong_uc.py',
    'src/app/usecases/nghi_phep/update_cham_cong_uc.py',
    'src/service/cham_cong_service.py',
    'src/app/usecases/cham_cong/aggregate_monthly_uc.py',
]
for f in files:
    py_compile.compile(f, doraise=True)
    print(f'OK: {f}')
print('All files OK')
"
```
Expected: "All files OK"

- [ ] **Step 2: Verify imports work**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "from src.app.usecases.luong.tinh_luong_uc import PreviewLuongUseCase, ChayLuongUseCase; print('import OK')"`
Expected: "import OK"
