---
title: 'Nhân Viên - Phòng Ban - Chức Vụ CRUD Foundation'
type: 'feature'
created: '2026-04-08T23:00:00Z'
status: 'done'
baseline_commit: '9c4a42a704ed1b56c5b9e1da527dfce413ff77fc'
completed_at: '2026-04-08T23:30:00Z'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Models NhanVien, PhongBan, ChucVu thiếu soft-delete và relationships. Repository + UseCases cho NhanVien/ChucVu chưa implement.

**Approach:** Migration để add soft-delete + relationships, implement repositories + use cases với basic CRUD, expose RESTful APIs. **Phase 1: Foundation only** - basic CRUD operations. Complex business logic deferred.

## Boundaries & Constraints

**Always:**
- UUID v4 hex primary keys (String(32)), snake_case Vietnamese field names
- Soft-delete via `deleted_at` DateTime nullable (not boolean flag)
- Repository + UseCase patterns, Result<Success, Error> return type
- Audit log cho create/update/delete, validate in UseCase (not Route)
- FK constraints với CASCADE/SET NULL

**Ask First:**
- Seed data cho test needed?
- Search/filter ngay hay basic CRUD only?

**Never:**
- No business logic in Routes, no hardcode values, no skip audit/logging
- No synchronous DB operations, no skip validation

## I/O & Edge-Case Matrix

### PhongBan

| Scenario | Input | Expected | Error |
|----------|-------|----------|-------|
| CREATE valid | Valid ma, ten | Created | - |
| CREATE duplicate | Existing ma | Error: code_exists | Return.err |
| UPDATE valid | Valid data | Updated | - |
| DELETE | DELETE req | Set deleted_at | - |
| GET list | Pagination | Paginated list | - |

### NhanVien

| Scenario | Input | Expected | Error |
|----------|-------|----------|-------|
| CREATE valid | Valid, unique | Created | - |
| CREATE dup email | Existing email | Error: email_exists | Return.err |
| CREATE dup cccd | Existing cccd | Error: cccd_exists | Return.err |
| UPDATE valid | Valid data | Updated | - |
| DELETE | DELETE req | Set deleted_at | - |
| GET list | Pagination | Paginated list | - |

### ChucVu

| Scenario | Input | Expected | Error |
|----------|-------|----------|-------|
| CREATE valid | Valid ma, ten | Created | - |
| CREATE duplicate | Existing ma | Error: code_exists | Return.err |
| UPDATE valid | Valid data | Updated | - |
| DELETE | DELETE req | Set deleted_at | - |
| GET list | Pagination | Paginated list | - |

</frozen-after-approval>

## Code Map

**Migration:**
- `backend/migration/versions/` -- Add deleted_at, cha_id, cap_bac, junction table

**Models:**
- `backend/src/domain/models/nhan_vien.py` -- Add deleted_at, relationships
- `backend/src/domain/models/phong_ban.py` -- Add deleted_at, cha_id FK
- `backend/src/domain/models/chuc_vu.py` -- Add deleted_at, cap_bac
- `backend/src/domain/models/nhan_vien_phong_ban.py` -- NEW: Junction table

**Repositories:**
- `backend/src/repository/nhan_vien_repository.py` -- NEW: CRUD + soft-delete filter
- `backend/src/repository/chuc_vu_repository.py` -- NEW: CRUD + soft-delete filter
- `backend/src/repository/phong_ban_repository.py` -- UPDATE: Add soft-delete filter
- `backend/src/service/unit_of_work.py` -- Register new repos

**UseCases:**
- `backend/src/app/usecases/nhan_vien/` -- NEW: Create, Update, Delete, GetList, GetDetail
- `backend/src/app/usecases/chuc_vu/` -- NEW: Create, Update, Delete, GetList, GetDetail
- `backend/src/app/usecases/phong_ban/` -- UPDATE: Add soft-delete

**API:**
- `backend/src/api/schemas/nhan_vien.py` -- NEW: Request/Response schemas
- `backend/src/api/schemas/chuc_vu.py` -- NEW: Request/Response schemas
- `backend/src/api/schemas/phong_ban.py` -- UPDATE: Add deleted_at
- `backend/src/api/routes/nhan_vien.py` -- NEW: CRUD endpoints
- `backend/src/api/routes/chuc_vu.py` -- NEW: CRUD endpoints
- `backend/src/api/routes/phong_ban.py` -- UPDATE: Soft-delete handling

## Tasks & Acceptance

**Execution:**

**Phase 1A: Migration**
- [x] `backend/migration/versions/427ebab6ea94_add_soft_delete_and_relationships.py` -- Created migration with deleted_at, cha_id, cap_bac, junction table

**Phase 1B: Models**
- [x] `backend/src/domain/models/nhan_vien.py` -- Added deleted_at, relationships to PhongBan/ChucVu
- [x] `backend/src/domain/models/phong_ban.py` -- Added deleted_at, cha_id self-FK, parent-child relationships
- [x] `backend/src/domain/models/chuc_vu.py` -- Added deleted_at, cap_bac Integer field
- [x] `backend/src/domain/models/nhan_vien.py` -- Created junction table (nhan_vien_phong_ban) in model

**Phase 1C: Repositories**
- [x] `backend/src/repository/nhan_vien_repository.py` -- Created CRUD with soft-delete filter
- [x] `backend/src/repository/chuc_vu_repository.py` -- Created CRUD with soft-delete filter, sorted by cap_bac
- [x] `backend/src/repository/phong_ban_repository.py` -- Updated with soft-delete filter
- [x] `backend/src/service/unit_of_work.py` -- Registered nhan_vien and chuc_vu repositories

**Phase 1D: UseCases**
- [x] `backend/src/app/usecases/nhan_vien/` -- Created Create, Update, Delete, GetList, GetDetail UCs
- [x] `backend/src/app/usecases/chuc_vu/` -- Created Create, Update, Delete, GetList, GetDetail UCs
- [x] `backend/src/app/usecases/phong_ban/delete_phong_ban_uc.py` -- Updated with soft-delete support

**Phase 1E: API**
- [x] `backend/src/api/schemas/nhan_vien.py` -- Created Request/Response schemas with validation
- [x] `backend/src/api/schemas/chuc_vu.py` -- Created Request/Response schemas with validation
- [x] `backend/src/api/schemas/phong_ban.py` -- Updated with deleted_at field
- [x] `backend/src/api/routes/nhan_vien.py` -- Created CRUD endpoints
- [x] `backend/src/api/routes/chuc_vu.py` -- Created CRUD endpoints
- [x] `backend/src/api/routes/__init__.py` -- Registered new routes

**Acceptance Criteria:**

**Schema:**
- Given migration executed, when query schema, then deleted_at exists (all tables), cha_id FK (phong_ban), cap_bac (chuc_vu), nhan_vien_phong_ban exists

**NhanVien:**
- Given CreateNhanVienUC with valid data, when execute, then create with deleted_at=NULL
- Given CreateNhanVienUC with dup email/cccd, when execute, then return Error(email_exists/cccd_exists)
- Given GetNhanVienUC list, when execute, then return paginated (deleted_at IS NULL)
- Given DeleteNhanVienUC, when execute, then set deleted_at=NOW()

**PhongBan:**
- Given CreatePhongBanUC with valid data, when execute, then create with deleted_at=NULL
- Given CreatePhongBanUC with dup ma, when execute, then return Error(code_exists)
- Given UpdatePhongBanUC with cha_id, when execute, then update with parent

**ChucVu:**
- Given CreateChucVuUC with valid data, when execute, then create with deleted_at=NULL, cap_bac set
- Given GetChucVuUC list, when execute, then return paginated sorted by cap_bac

**API:**
- Given POST /api/nhan-vien valid, when call, then return 201
- Given POST /api/nhan-vien dup email, when call, then return 409
- Given GET /api/nhan-vien, when call, then return 200 paginated
- Given DELETE /api/nhan-vien/{id}, when call, then return 200 (soft-delete)
- Given any CRUD, when execute, then AuditLog created

## Spec Change Log

<!-- Empty until first review loop -->

## Design Notes

**Soft-Delete:**
`deleted_at` DateTime nullable. Delete: `deleted_at = NOW()`. Query: `WHERE deleted_at IS NULL`. Enables audit trail + future restore.

**Parent-Child (PhongBan):**
Self-FK `cha_id` → `phong_ban.id`. Root = `cha_id = NULL`. Phase 1: basic structure, no cycle validation (deferred Phase 2).

**M:N (NhanVien-PhongBan):**
Junction `nhan_vien_phong_ban`: nhan_vien_id, phong_ban_id, ngay_bat_dau, is_primary. Phase 1: structure only, validation deferred.

**ChucVu Level:**
`cap_bac` Integer default 1. Phase 1: storage only, business logic deferred.

**Migration:**
`add_soft_delete_and_relationships.py`:
1. Add deleted_at to nhan_vien, phong_ban, chuc_vu
2. Add cha_id to phong_ban (FK self, nullable)
3. Add cap_bac to chuc_vu (Integer, default 1)
4. Create nhan_vien_phong_ban junction table
5. Backfill deleted_at=NULL
6. Indexes: deleted_at, cha_id, cap_bac, (nhan_vien_id, phong_ban_id)

## Verification

**Commands:**
- `cd backend && uv run alembic upgrade head` -- Migration success
- `cd backend && uv run python -c "from src.domain.models import NhanVien, PhongBan, ChucVu; print('OK')"` -- Models load
- `cd backend && uv run python -c "from src.repository.nhan_vien_repository import NhanVienRepository; print('OK')"` -- Repo loads
- `cd backend && uv run python -c "from src.app.usecases.nhan_vien.create_nhan_vien_uc import CreateNhanVienUseCase; print('OK')"` -- UC loads

**Manual:**
- Migration has upgrade/downgrade methods
- Models have new fields (deleted_at, cha_id, cap_bac)
- Repos filter soft-deleted in all queries
- UCs validate duplicates (email, cccd, codes)
- API routes registered
- Schemas validate correctly
- Test endpoints: POST/GET/PUT/DELETE cho all 3 entities
- Audit logs created for each operation
- Soft-deleted not in list results
