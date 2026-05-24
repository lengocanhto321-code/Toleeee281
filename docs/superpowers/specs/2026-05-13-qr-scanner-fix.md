# QR Attendance Fix + Employee Scanner Spec

## Backend Bug Fixes

### Bug 1: check-in route field mismatch
**File:** `backend/src/api/routes/nhan_vien/cham_cong.py` lines 51-56
**Problem:** Route passes `user_id`, `latitude`, `longitude` but `CheckInCommand` expects `nhan_vien_id`, `thoi_gian`, `vi_tri`
**Fix:** Map route fields correctly to command, auto-generate `thoi_gian` from `datetime.now()`

### Bug 2: check-out route field mismatch
**File:** `backend/src/api/routes/nhan_vien/cham_cong.py` lines 82-86
**Problem:** Same mismatch as check-in. Also `check_out_uc.py` line 69-70 sets `trang_thai` twice.
**Fix:** Map fields correctly, remove duplicate assignment

### Bug 3: bulk generate QR field mismatch
**File:** `backend/src/app/usecases/cham_cong/bulk_generate_qr_uc.py` lines 71-72
**Problem:** Uses `qr_payload`/`secret_key` but `QRConfig` model has `qr_data`/`mac`
**Fix:** Use correct field names matching `generate_qr_uc.py`

## Frontend: Replace My QR → QR Scanner

### Changes:
- Install `html5-qrcode` for camera QR scanning
- Replace `my-qr/page.tsx` with scanner page (2 buttons: check-in / check-out)
- Add check-in/check-out mutation hooks
- Update sidebar labels: "QR Cá nhân" → "Quét QR"
- Update bottom tab bar: replace User icon with QrCode icon for scanner tab
- Keep backend `/my-qr` endpoint (no breaking changes needed)

### Scanner Page UX:
1. Two large buttons: "Check-in" / "Check-out"
2. Tap button → camera opens → scan QR → send API → show result
3. Result displayed inline (success with time, or error message)
4. If already checked in, show status and disable check-in button
5. Today's attendance status shown at top

### API Endpoints Used:
- `POST /api/v1/nhan-vien/cham-cong/check-in` body: `{ qr_data, latitude?, longitude? }`
- `POST /api/v1/nhan-vien/cham-cong/check-out` body: `{ latitude?, longitude? }`
- `GET /api/v1/nhan-vien/cham-cong/history?page=1&page_size=1` for today's status
