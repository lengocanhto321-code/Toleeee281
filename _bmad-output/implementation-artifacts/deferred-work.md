# Deferred Work - NhanVien/PhongBan/ChucVu Enhancement

## Phase 2: Complex Business Logic

**Priority:** High
**Dependencies:** Phase 1 complete

**Goals:**
- Implement complex validators (age-based, contract-based, state machine)
- Hierarchy constraints (depth limits, cycle detection, type compatibility)
- Assignment rules (max 2 chuyen_mon departments, 1 hanh_chinh department)
- Leadership requirements (party membership for cap_bac >= 8)
- Complex operations (transfer department, promotion workflows)
- Advanced queries (get_tree, get_ancestors, state transitions)

**Deferred Features:**
- Age validation (MIN_AGE=18, MAX_AGE_M=60, MAX_AGE_F=55)
- State machine transitions (dang_lam → nghi_viec → nghi_huu)
- Contract date validation (ngay_vao_lam < ngay_het_hop_dong)
- Hierarchy depth validation (max 3 levels)
- Cycle detection in parent-child relationships
- Type compatibility (chuyen_mon cannot be child of hanh_chinh)
- Department assignment limits validation
- Leadership position validation with party membership
- TransferDepartmentUseCase with limit validation
- PromoteUseCase with transactional updates
- Tree queries for hierarchical structures

## Phase 3: Advanced Features

**Priority:** Medium
**Dependencies:** Phase 2 complete

**Goals:**
- Historical tracking (effective dates, assignment history)
- Advanced reporting (org charts, workforce analytics)
- Bulk operations (bulk assign, bulk promote, bulk transfer)
- Export/import functionality
- Advanced search and filtering

**Deferred Features:**
- Time-bound assignments with ngay_bat_dau, ngay_ket_thuc
- Assignment history tracking in junction table
- Restore soft-deleted records
- Org chart generation with hierarchy visualization
- Workforce analytics by department, position, age
- Bulk operations with transactional safety
- CSV export/import for master data management
- Advanced search with multiple filters and sorting
- Aggregated queries (counts, averages by department/position)
- Audit log querying and reporting
