# Hệ Thống Quản Lý Nhân Sự (HR Management System)

Hệ thống quản lý nhân sự toàn diện với kiến trúc **Frontend (Next.js) + Backend (FastAPI)** theo mô hình Clean Architecture.

## Công Nghệ Sử Dụng

### Frontend
- **Next.js 16** + React 19 — App Router, Server Components, React Compiler
- **Tailwind CSS v4** — Utility-first CSS
- **shadcn/ui** — Component library (Radix UI)
- **TanStack React Query v5** — Quản lý server state
- **Zustand v5** — Quản lý client state
- **React Hook Form + Zod v4** — Form & validation
- **ECharts v6 + Recharts v3** — Biểu đồ, thống kê

### Backend
- **FastAPI** — REST API (Clean Architecture: Routes → Use Cases → Repositories → Domain)
- **SQLAlchemy 2.0** (async) — ORM
- **Alembic** — Database migrations
- **PostgreSQL** — Cơ sở dữ liệu
- **JWT** — Xác thực (httpOnly cookies + Bearer token)
- **Result Pattern** — Xử lý lỗi nhất quán
- **APScheduler** — Tác vụ nền (check-in hết hạn, tự động commit công)

## Yêu Cầu Hệ Thống

- **Python** ≥ 3.11
- **Node.js** (phiên bản tương thích với Next.js 16)
- **PostgreSQL** (đã chạy sẵn)
- **uv** (Python package manager) — cài đặt: `pip install uv` hoặc `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Cài Đặt

### 1. Clone dự án

```bash
git clone <repo-url>
cd hr_management
```

### 2. Cài đặt Backend

```bash
cd backend

# Tạo virtual environment
uv venv

# Kích hoạt (Linux/macOS)
source .venv/bin/activate
# Hoặc (Windows)
# .venv\Scripts\activate

# Cài đặt dependencies
uv sync

# Tạo file cấu hình
cp env.example.yaml env.yaml

# Sửa file env.yaml với thông tin database của bạn
```

**Nội dung file `backend/env.yaml`:**

```yaml
DB_URI: postgresql+asyncpg://postgres:123456789@localhost:5432/hr
MIGRATION_DB_URI: postgresql://postgres:123456789@localhost:5432/hr
HOST: localhost
PORT: 8000
CORS_ORIGINS: ["http://localhost:3000"]

# JWT
JWT_SECRET: "_tf@hp5oqfyx_2mm_+f1++@*sc@36075l@x8e+7#&tfg!kzmv8^*!nc"
JWT_ALGORITHM: "HS256"
JWT_EXP_MIN: 60
```

> **Lưu ý:** Thay đổi thông tin kết nối database (`postgres:123456789@localhost:5432/hr`) cho phù hợp với môi trường của bạn.

### 3. Tạo Database

```bash
# Kết nối PostgreSQL và tạo database
psql -U postgres
CREATE DATABASE hr;
\q
```

### 4. Khởi tạo Database (Migration + Seed Data)

Script `setup_database.py` sẽ tự động chạy tất cả các bước sau:
1. Alembic migrations (tạo bảng)
2. Thêm các cột còn thiếu
3. Seed RBAC (6 vai trò, 39 quyền)
4. Tạo tài khoản admin + hồ sơ nhân viên
5. Seed cấu hình lương, hệ số lương
6. Seed cấu hình nghỉ phép
7. Seed phòng ban (15 phòng/tổ bộ môn)
8. Seed chức vụ (8 chức vụ)
9. Seed lịch chấm công mặc định
10. Seed cấu hình thưởng Tết

```bash
cd backend
source .venv/bin/activate
uv run python scripts/setup_database.py
```

### 5. Cài đặt Frontend

```bash
cd frontend
npm install
```

### 6. Cấu hình Frontend (nếu cần)

Mặc định API gọi tới `http://localhost:8000`. Nếu backend chạy ở địa chỉ khác, tạo file `.env.local`:

```bash
cd frontend
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

## Chạy Ứng Dụng

### Chạy Backend

```bash
cd backend
source .venv/bin/activate
python main.py
```

Server chạy tại: **http://localhost:8000**

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Chạy Frontend

```bash
cd frontend
npm run dev
```

Server chạy tại: **http://localhost:3000**

## Tài Khoản Mặc Định (Development)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| Admin | `admin` | `Admin123!` |

## Cấu Trúc Dự Án

```
hr_management/
├── backend/                          # Python FastAPI backend
│   ├── src/
│   │   ├── api/                      # FastAPI routes, schemas, dependencies
│   │   ├── app/usecases/             # Business logic use cases
│   │   ├── domain/models/            # SQLAlchemy ORM models (28 tables)
│   │   └── repository/               # Data access layer
│   ├── migration/                    # Alembic migrations
│   ├── main.py                       # Entry point
│   ├── config.py                     # Configuration loader
│   └── pyproject.toml                # Python dependencies
│
├── frontend/                         # Next.js frontend
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── (admin)/              # Admin routes
│   │   │   ├── (auth)/               # Auth routes (login)
│   │   │   └── (employee)/           # Employee self-service
│   │   ├── components/               # React components (shadcn/ui)
│   │   ├── hooks/                    # Custom hooks (TanStack Query)
│   │   ├── stores/                   # Zustand stores
│   │   ├── lib/                      # Utilities (axios, helpers)
│   │   └── schemas/                  # Zod validation schemas
│   └── package.json
│
└── docs/                             # Tài liệu
```

## Tính Năng Chính

### Quản lý Nhân sự
- CRUD nhân viên, phòng ban, chức vụ
- Quản lý hợp đồng, quá trình công tác, lịch sử chức vụ
- Hồ sơ nhân viên: người thân, bằng cấp, khen thưởng/kỷ luật
- Điều chuyển nhân viên giữa các phòng ban

### Chấm công & Nghỉ phép
- Check-in bằng QR code
- Quản lý ca làm việc, bảng chấm công tháng
- Đơn xin nghỉ phép, theo dõi ngày phép còn lại

### Lương & Báo cáo
- Cấu hình lương, hệ số lương
- Tính lương, trả lương
- Biểu đồ thống kê (Dashboard)
- Xuất báo cáo Excel, PDF (phiếu lương)

### Phân quyền (RBAC)
- Vai trò: Admin, Quản lý, Nhân viên
- Phân quyền chi tiết theo module và hành động

## Testing

### Backend (pytest)

```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend (Playwright E2E)

```bash
cd frontend
npx playwright test
```
