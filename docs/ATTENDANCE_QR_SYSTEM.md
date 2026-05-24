# Hệ thống Chấm công QR Code

> Document này mô tả thiết kế và triển khai hệ thống chấm công QR Code cho nhân viên.

---

## 1. Tổng quan

### 1.1 Mô tả

Thay vì mock data, nhân viên sẽ **quẹt thẻ QR** mỗi ngày để ghi nhận chấm công. QR chứa thông tin vị trí và thời gian, đảm bảo nhân viên có mặt tại nơi làm việc.

### 1.2 Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG CHẤM CÔNG QR                        │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│  │   ADMIN  │     │  FRONTEND │     │  DEVICE  │               │
│  │ Generate │     │  Display  │     │  Scanner │               │
│  │   QR     │     │   QR      │     │   POST   │               │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘               │
│       │                │                │                       │
│       ▼                ▼                ▼                       │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                    API ENDPOINTS                    │         │
│  │  POST /api/nv/cham-cong/check-in                  │         │
│  │  GET  /api/ql/cham-cong/daily-qr                  │         │
│  │  GET  /api/ql/cham-cong/thang                     │         │
│  └─────────────────────┬───────────────────────────────┘         │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                   USE CASES                          │         │
│  │  - GenerateQRUseCase                               │         │
│  │  - CheckInUseCase                                  │         │
│  │  - AggregateMonthlyUseCase                         │         │
│  └─────────────────────┬───────────────────────────────┘         │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────┐         │
│  │                   DATABASE                           │         │
│  │  - qr_config (QR mã cho ngày)                     │         │
│  │  - check_in_out (Bản ghi check-in/out)            │         │
│  │  - cham_cong_thang (Tổng hợp tháng)               │         │
│  └─────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Bảng QR Config (`qr_config`)

Lưu QR code cho mỗi ngày làm việc.

```python
class QRConfig(Base):
    """QR Code cho mỗi ngày làm việc."""
    
    __tablename__ = "qr_config"
    
    id = Column(String(32), primary_key=True, default=generate_uuid)
    ngay = Column(Date, nullable=False, unique=True)  # Ngày có hiệu lực
    
    # QR payload data
    qr_payload = Column(Text, nullable=False)  # JSON payload encoded
    secret_key = Column(String(64), nullable=False)  # HMAC secret
    
    # Thời gian hiệu lực trong ngày
    gio_bat_dau = Column(Time, nullable=False, default="07:00")
    gio_ket_thuc = Column(Time, nullable=False, default="17:30")
    
    # Vị trí (tùy chọn)
    vi_tri = Column(String(100))  # "Truong THPT Thang Long"
    kinh_do = Column(Float)  # Latitude
    vi_do = Column(Float)    # Longitude
    ban_kinh_cho_phep = Column(Integer, default=100)  # mét
    
    # Trạng thái
    trang_thai = Column(String(20), default="active")  # active, expired, cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(32), ForeignKey("tai_khoan.id"))
```

### 2.2 Bảng Check-in/Out (`check_in_out`)

Lưu từng lần check-in/out của nhân viên.

```python
class CheckInOut(Base):
    """Bản ghi check-in/out của nhân viên."""
    
    __tablename__ = "check_in_out"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "ngay", "loai", 
                        name="uq_check_in_out_daily"),
    )
    
    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(String(32), ForeignKey("nhan_vien.id"), nullable=False)
    ngay = Column(Date, nullable=False)
    
    # Loại check
    loai = Column(String(10), nullable=False)  # "check_in" | "check_out"
    
    # Thời gian thực
    thoi_gian = Column(DateTime, nullable=False)
    
    # QR đã sử dụng
    qr_config_id = Column(String(32), ForeignKey("qr_config.id"), nullable=False)
    
    # Vị trí khi check (từ device)
    kinh_do = Column(Float)
    vi_do = Column(Float)
    
    # Khoảng cách từ vị trí QR
    khoang_cach_met = Column(Float)
    
    # Trạng thái
    trang_thai = Column(String(20), default="valid")  # valid, invalid, late
    
    # Metadata
    device_info = Column(String(100))  # User-Agent, device ID
    ghi_chu = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

### 2.3 Bảng ChamCongThang (có sẵn, cập nhật)

```python
class ChamCongThang(Base):
    """Tổng hợp chấm công tháng - cập nhật từ check-in/out."""
    
    __tablename__ = "cham_cong_thang"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "thang", "nam", 
                        name="uq_cham_cong_thang"),
    )
    
    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(String(32), ForeignKey("nhan_vien.id"), nullable=False)
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)
    
    # Số ngày (từ check-in/out + nghỉ phép)
    so_ngay_lam_chuan = Column(Numeric(4, 1), default=26)
    so_ngay_co_mat = Column(Numeric(4, 1), default=0)      # ✅ Từ check-in/out
    so_ngay_vang_co_phep = Column(Numeric(4, 1), default=0)  # Từ đơn nghỉ
    so_ngay_vang_khong_phep = Column(Numeric(4, 1), default=0)  # ✅ Từ check-in/out
    so_ngay_nghi_le_tet = Column(Numeric(4, 1), default=0)   # Từ ngày lễ
    so_ngay_cong_tac = Column(Numeric(4, 1), default=0)     # Từ đơn công tác
    
    he_so_ngay_cong = Column(Numeric(4, 4), default=1.0)
    trang_thai = Column(String(20), default="chua_chot")  # chua_chot, da_chot
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

---

## 3. QR Payload Design

### 3.1 QR Content Structure

```json
{
  "v": 1,                    // Version
  "ngay": "2026-04-14",     // Ngày
  "pb_id": "abc123",        // Phòng ban ID (optional)
  "loc": {                   // Vị trí
    "lat": 21.0285,
    "lng": 105.8542,
    "name": "Trường THPT Thăng Long",
    "radius": 100            // mét
  },
  "sig": "hmac_sha256..."   // Signature
}
```

### 3.2 QR Generation

```python
def generate_qr_payload(ngay: date, phong_ban_id: str = None, vi_tri: dict = None) -> str:
    """Generate QR payload với HMAC signature."""
    import json
    import hmac
    import hashlib
    import base64
    
    payload = {
        "v": 1,
        "ngay": ngay.isoformat(),
        "pb_id": phong_ban_id,
        "loc": vi_tri,
    }
    
    # Tạo signature
    data_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        SECRET_KEY.encode(),
        data_str.encode(),
        hashlib.sha256
    ).hexdigest()
    
    payload["sig"] = signature
    
    # Encode to base64
    return base64.b64encode(json.dumps(payload).encode()).decode()
```

### 3.3 QR Validation

```python
def validate_qr(qr_data: str, secret_key: str) -> Tuple[bool, dict]:
    """Validate QR data và signature."""
    import json
    import hmac
    import hashlib
    import base64
    
    try:
        decoded = base64.b64decode(qr_data).decode()
        payload = json.loads(decoded)
        
        # Tách signature
        sig = payload.pop("sig")
        
        # Verify signature
        data_str = json.dumps(payload, sort_keys=True)
        expected = hmac.new(
            secret_key.encode(),
            data_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(sig, expected):
            return False, {"error": "Invalid signature"}
        
        return True, payload
        
    except Exception as e:
        return False, {"error": str(e)}
```

---

## 4. API Endpoints

### 4.1 Nhân viên (Employee)

```python
# backend/src/api/routes/nhan_vien/cham_cong.py

router = APIRouter(prefix="/nv/cham-cong", tags=["Chấm công"])

@router.get("/qr/{ngay}")
async def get_qr_code(
    ngay: str = Path(..., description="YYYY-MM-DD"),
    user_context: UserContext = Depends(require_permission("cham_cong:view_own")),
):
    """
    Lấy QR code chấm công cho một ngày.
    Nhân viên scan QR này để check-in/out.
    """
    # Trả về QR image (base64) hoặc payload để frontend generate
    pass

@router.post("/check-in")
async def check_in(
    body: CheckInRequest,
    user_context: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Check-in bằng QR code.
    - Validate QR signature
    - Validate thời gian (trong giờ làm việc)
    - Validate vị trí (nếu có GPS)
    - Lưu CheckInOut record
    """
    pass

@router.post("/check-out")
async def check_out(
    body: CheckOutRequest,
    user_context: UserContext = Depends(require_permission("cham_cong:check_in")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Check-out bằng QR code.
    - Phải có check-in trước đó
    - Validate thời gian hợp lệ
    """
    pass

@router.get("/lich-su")
async def get_my_attendance_history(
    thang: int = Query(None, ge=1, le=12),
    nam: int = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("cham_cong:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Lấy lịch sử chấm công của user hiện tại.
    Trả về chi tiết từng ngày.
    """
    pass

@router.get("/thang")
async def get_my_monthly_attendance(
    thang: int = Query(None, ge=1, le=12),
    nam: int = Query(None, ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("cham_cong:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Lấy tổng hợp chấm công tháng của user hiện tại.
    """
    pass
```

### 4.2 Quản lý (Admin)

```python
# backend/src/api/routes/quan_ly/cham_cong.py

router = APIRouter(prefix="/ql/cham-cong", tags=["Chấm công"])

@router.post("/qr/generate")
async def generate_daily_qr(
    body: GenerateQRRequest,
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Tạo QR code cho một ngày.
    Admin có thể tạo QR trước cho cả tuần/tháng.
    """
    pass

@router.post("/qr/generate-bulk")
async def generate_bulk_qr(
    body: BulkGenerateQRRequest,
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Tạo QR codes hàng loạt cho nhiều ngày.
    """
    pass

@router.get("/qr/list")
async def list_qr_codes(
    tu_ngay: date = Query(...),
    den_ngay: date = Query(...),
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
):
    """
    Lấy danh sách QR codes đã tạo.
    """
    pass

@router.get("/thang")
async def get_monthly_attendance(
    thang: int = Query(..., ge=1, le=12),
    nam: int = Query(..., ge=2000, le=2100),
    phong_ban_id: str = Query(None),
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Lấy bảng chấm công tháng của tất cả nhân viên.
    """
    pass

@router.post("/aggregate")
async def aggregate_monthly(
    thang: int = Query(..., ge=1, le=12),
    nam: int = Query(..., ge=2000, le=2100),
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Tổng hợp chấm công tháng từ check-in/out records.
    Chạy cuối tháng để cập nhật ChamCongThang.
    """
    pass

@router.put("/{nhan_vien_id}/{thang}/{nam}/manual")
async def update_manual_attendance(
    nhan_vien_id: str,
    thang: int,
    nam: int,
    body: ManualUpdateRequest,
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Admin sửa chấm công thủ công cho nhân viên.
    Ghi log ai đã sửa.
    """
    pass

@router.get("/bao-cao")
async def get_attendance_report(
    thang: int = Query(...),
    nam: int = Query(...),
    phong_ban_id: str = Query(None),
    user_context: UserContext = Depends(require_permission("cham_cong:manage")),
):
    """
    Xuất báo cáo chấm công.
    """
    pass
```

---

## 5. Business Logic

### 5.1 Check-in Validation

```python
async def validate_check_in(
    qr_payload: dict,
    nhan_vien_id: str,
    thoi_gian: datetime,
    vi_tri: dict = None,
) -> Tuple[bool, str]:
    """
    Validate check-in request.
    
    Returns:
        (is_valid, error_message)
    """
    
    # 1. Validate QR signature
    if not validate_qr_signature(qr_payload):
        return False, "QR không hợp lệ"
    
    # 2. Validate ngày
    if qr_payload["ngay"] != thoi_gian.date().isoformat():
        return False, "QR không đúng ngày"
    
    # 3. Validate thời gian
    gio_checkin = thoi_gian.time()
    if gio_checkin < datetime.strptime("06:00").time():
        return False, "Chưa đến giờ check-in"
    if gio_checkin > datetime.strptime("22:00").time():
        return False, "Đã quá giờ check-in"
    
    # 4. Validate đã check-in hôm nay chưa
    existing = await check_in_out_repo.find_today(
        nhan_vien_id, thoi_gian.date(), "check_in"
    )
    if existing:
        return False, "Đã check-in hôm nay rồi"
    
    # 5. Validate vị trí (nếu có)
    if vi_tri and qr_payload.get("loc"):
        distance = calculate_distance(
            vi_tri["lat"], vi_tri["lng"],
            qr_payload["loc"]["lat"], qr_payload["loc"]["lng"]
        )
        if distance > qr_payload["loc"]["radius"]:
            return False, f"Cách vị trí {distance}m (tối đa {qr_payload['loc']['radius']}m)"
    
    return True, ""
```

### 5.2 Check-out Validation

```python
async def validate_check_out(
    nhan_vien_id: str,
    thoi_gian: datetime,
) -> Tuple[bool, str]:
    """
    Validate check-out request.
    """
    
    # 1. Validate đã check-in chưa
    check_in = await check_in_out_repo.find_today(
        nhan_vien_id, thoi_gian.date(), "check_in"
    )
    if not check_in:
        return False, "Chưa check-in hôm nay"
    
    # 2. Validate chưa check-out
    existing_out = await check_in_out_repo.find_today(
        nhan_vien_id, thoi_gian.date(), "check_out"
    )
    if existing_out:
        return False, "Đã check-out hôm nay rồi"
    
    # 3. Check thời gian tối thiểu (ít nhất 1 giờ sau check-in)
    min_time = check_in.thoi_gian + timedelta(hours=1)
    if thoi_gian < min_time:
        return False, f"Phải làm ít nhất 1 giờ (đến {min_time.strftime('%H:%M')})"
    
    return True, ""
```

### 5.3 Late Detection

```python
def detect_late(arrival_time: time, standard_time: time = time(7, 30)) -> bool:
    """Phát hiện đi muộn."""
    return arrival_time > standard_time
```

### 5.4 Monthly Aggregation

```python
async def aggregate_monthly(
    thang: int,
    nam: int,
    uow: UnitOfWork,
) -> List[ChamCongThang]:
    """
    Tổng hợp chấm công tháng từ check-in/out.
    """
    
    results = []
    
    # Lấy tất cả nhân viên đang làm
    nhan_viens = await uow.nhan_vien_repository.find_all_by_status("dang_lam")
    
    for nv in nhan_viens:
        # Đếm ngày check-in hợp lệ trong tháng
        check_ins = await uow.check_in_out_repository.get_monthly_valid(
            nv.id, thang, nam
        )
        
        # Tính số ngày có mặt
        so_ngay_co_mat = len(check_ins)
        
        # Lấy ngày nghỉ có phép từ đơn nghỉ
        don_nghi_phep = await uow.don_xin_nghi_repository.get_approved_monthly(
            nv.id, thang, nam
        )
        so_ngay_vang_co_phep = sum(d.so_ngay for d in don_nghi_phep)
        
        # Lấy ngày công tác
        cong_tac = await uow.don_xin_nghi_repository.get_cong_tac_monthly(
            nv.id, thang, nam
        )
        so_ngay_cong_tac = sum(c.so_ngay for c in cong_tac)
        
        # Tính ngày vắng không phép
        so_ngay_lam_chuan = cham_cong_service.tinh_so_ngay_lam_viec(thang, nam)
        so_ngay_vang_khong_phep = max(0, 
            so_ngay_lam_chuan - so_ngay_co_mat - so_ngay_vang_co_phep
        )
        
        # Upsert ChamCongThang
        cham_cong = await uow.cham_cong_thang_repository.upsert(
            nhan_vien_id=nv.id,
            thang=thang,
            nam=nam,
            so_ngay_co_mat=so_ngay_co_mat,
            so_ngay_vang_co_phep=so_ngay_vang_co_phep,
            so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
            so_ngay_cong_tac=so_ngay_cong_tac,
        )
        
        results.append(cham_cong)
    
    return results
```

---

## 6. Use Cases

### 6.1 Files cần tạo

```
backend/src/app/usecases/cham_cong/
├── __init__.py
├── generate_qr_uc.py           # Generate QR code cho ngày
├── bulk_generate_qr_uc.py     # Generate hàng loạt
├── check_in_uc.py              # Check-in
├── check_out_uc.py             # Check-out
├── get_my_history_uc.py        # Lịch sử của nhân viên
├── aggregate_monthly_uc.py     # Tổng hợp tháng
├── get_monthly_attendance_uc.py # Bảng chấm công tháng
└── update_manual_uc.py        # Sửa thủ công
```

### 6.2 Use Case Templates

```python
# generate_qr_uc.py
@dataclass
class GenerateQRCommand:
    ngay: str
    phong_ban_id: Optional[str] = None
    vi_tri: Optional[dict] = None
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"

@dataclass
class GenerateQRResult:
    id: str
    ngay: str
    qr_payload: str
    qr_image_base64: Optional[str] = None

class GenerateQRUseCase:
    async def execute(self, command: GenerateQRCommand) -> Result[GenerateQRResult, Error]:
        # Validate ngày không trùng
        # Tạo QR payload
        # Hash và lưu vào DB
        # Return payload và image (nếu cần)
        pass
```

```python
# check_in_uc.py
@dataclass
class CheckInCommand:
    qr_data: str
    thoi_gian: str  # ISO datetime
    vi_tri: Optional[dict] = None  # {lat, lng}
    device_info: Optional[str] = None

@dataclass
class CheckInResult:
    id: str
    thoi_gian: str
    trang_thai: str
    is_late: bool = False

class CheckInUseCase:
    async def execute(self, command: CheckInCommand) -> Result[CheckInResult, Error]:
        # Validate QR
        # Validate thời gian
        # Validate đã check-in chưa
        # Lưu CheckInOut
        # Return kết quả
        pass
```

---

## 7. Frontend Implementation

### 7.1 Employee App

```tsx
// Employee Attendance Page
const AttendancePage = () => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [todayStatus, setTodayStatus] = useState<{
    checkedIn: boolean;
    checkedOut: boolean;
    checkInTime?: string;
    checkOutTime?: string;
  }>();
  
  // Camera view for scanning
  const [cameraActive, setCameraActive] = useState(false);
  
  // Lấy QR cho hôm nay
  useEffect(() => {
    fetchTodayQR();
    fetchTodayStatus();
  }, []);
  
  const handleScan = async (data: string) => {
    try {
      const response = await api.post('/nv/cham-cong/check-in', {
        qr_data: data,
        thoi_gian: new Date().toISOString(),
        vi_tri: await getCurrentLocation(),
      });
      toast.success('Check-in thành công!');
      refreshStatus();
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div>
      {/* Hiển thị trạng thái hôm nay */}
      <TodayStatusCard status={todayStatus} />
      
      {/* Nút check-in/out */}
      {!todayStatus.checkedIn && (
        <Button onClick={() => setCameraActive(true)}>
          Quẹt QR Check-in
        </Button>
      )}
      
      {todayStatus.checkedIn && !todayStatus.checkedOut && (
        <Button onClick={() => handleCheckOut()}>
          Check-out
        </Button>
      )}
      
      {/* Camera scanner modal */}
      <CameraScanner 
        active={cameraActive} 
        onScan={handleScan}
        onClose={() => setCameraActive(false)}
      />
    </div>
  );
};
```

### 7.2 Admin Dashboard

```tsx
// Admin QR Management
const QRManagement = () => {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  
  const generateBulkQR = async () => {
    await api.post('/ql/cham-cong/qr/generate-bulk', {
      tu_ngay: dateRange.start,
      den_ngay: dateRange.end,
      vi_tri: { lat: 21.0285, lng: 105.8542, radius: 100 }
    });
    toast.success('Đã tạo QR codes!');
    refreshList();
  };
  
  return (
    <div>
      <DateRangePicker 
        value={dateRange}
        onChange={setDateRange}
      />
      <Button onClick={generateBulkQR}>
        Tạo QR hàng loạt
      </Button>
      
      {/* QR list with download options */}
      <QRList dates={dateRange} />
    </div>
  );
};
```

---

## 8. Security Considerations

### 8.1 QR Signature

```python
SECRET_KEY = os.environ.get("QR_SECRET_KEY", "your-secret-key-here")

def sign_qr(data: dict) -> str:
    """Tạo HMAC signature cho QR."""
    import hmac
    import hashlib
    
    message = json.dumps(data, sort_keys=True)
    return hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_qr(data: dict, signature: str) -> bool:
    """Verify QR signature."""
    return hmac.compare_digest(sign_qr(data), signature)
```

### 8.2 Rate Limiting

```python
# Chống spam check-in/out
@router.post("/check-in")
@limiter.limit("10/minute")  # Max 10 lần check-in mỗi phút
async def check_in(...):
    pass
```

### 8.3 Anti-replay

```python
# QR chỉ có hiệu lực trong ngày
# Server validate timestamp trong payload
```

---

## 9. Implementation Checklist

### Phase 1: Core (QR Generation + Check-in)
- [ ] Tạo bảng `qr_config`
- [ ] Tạo bảng `check_in_out`
- [ ] Implement `GenerateQRUseCase`
- [ ] Implement `CheckInUseCase`
- [ ] API endpoint `POST /nv/cham-cong/check-in`
- [ ] API endpoint `GET /nv/cham-cong/qr/{ngay}`

### Phase 2: Check-out + History
- [ ] Implement `CheckOutUseCase`
- [ ] API endpoint `POST /nv/cham-cong/check-out`
- [ ] Implement `GetMyHistoryUseCase`
- [ ] API endpoint `GET /nv/cham-cong/lich-su`

### Phase 3: Admin Features
- [ ] Implement `BulkGenerateQRUseCase`
- [ ] API endpoint `POST /ql/cham-cong/qr/generate-bulk`
- [ ] Implement `AggregateMonthlyUseCase`
- [ ] API endpoint `POST /ql/cham-cong/aggregate`
- [ ] Implement `GetMonthlyAttendanceUseCase`
- [ ] API endpoint `GET /ql/cham-cong/thang`

### Phase 4: Frontend
- [ ] Employee: QR Scanner page
- [ ] Employee: Attendance history page
- [ ] Admin: QR generation page
- [ ] Admin: Monthly attendance table
- [ ] Admin: Manual edit feature

### Phase 5: Cleanup
- [ ] Xóa `MockGenerateChamCongUseCase`
- [ ] Update `BUSINESS_LOGIC.md`
- [ ] Update `EMPLOYEE_FEATURES.md`
- [ ] Update RBAC permissions

---

## 10. Dependencies

```bash
# QR Code generation
pip install qrcode[pil]

# QR scanning (frontend)
# npm install @yudiel/react-qr-scanner

# Location
# npm install @react-native-community/geolocation
```

---

**Last Updated:** 2026-04-14
