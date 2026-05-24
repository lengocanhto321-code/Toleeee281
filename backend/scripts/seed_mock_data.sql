-- =============================================
-- MOCK DATA - HR Management THPT Thăng Long
-- =============================================

-- 1. CHỨC VỤ
INSERT INTO chuc_vu (id, ma_chuc_vu, ten_chuc_vu, cap_bac, he_so_phu_cap, mo_ta, tieu_chuan, trang_thai, created_at, updated_at) VALUES
('cv01', 'CV001', 'Hiệu trưởng',       10, 1.30, 'Người đứng đầu trường học', 'Thạc sĩ trở lên, 10 năm kinh nghiệm', TRUE, NOW(), NOW()),
('cv02', 'CV002', 'Phó Hiệu trưởng',    9, 1.00, 'Phụ trách chuyên môn hoặc cơ sở vật chất', 'Thạc sĩ, 8 năm kinh nghiệm', TRUE, NOW(), NOW()),
('cv03', 'CV003', 'Tổ trưởng',           7, 0.50, 'Trưởng tổ chuyên môn', 'Giáo viên giỏi cấp trường', TRUE, NOW(), NOW()),
('cv04', 'CV004', 'Tổ phó',              6, 0.30, 'Phó tổ chuyên môn', 'Giáo viên có kinh nghiệm', TRUE, NOW(), NOW()),
('cv05', 'CV005', 'Giáo viên',           4, 0.00, 'Giáo viên bộ môn', 'Cử nhân sư phạm', TRUE, NOW(), NOW()),
('cv06', 'CV006', 'Giáo viên tập sự',    2, 0.00, 'Giáo viên thử việc', 'Cử nhân sư phạm', TRUE, NOW(), NOW()),
('cv07', 'CV007', 'Trưởng phòng',        8, 0.70, 'Trưởng phòng hành chính', '5 năm kinh nghiệm quản lý', TRUE, NOW(), NOW()),
('cv08', 'CV008', 'Nhân viên văn phòng',  3, 0.00, 'Nhân viên hành chính', 'Cao đẳng trở lên', TRUE, NOW(), NOW());

-- 2. PHÒNG BAN
INSERT INTO phong_ban (id, ma_phong_ban, ten_phong_ban, loai, cha_id, truong_phong, trang_thai, created_at, updated_at) VALUES
('pb01', 'PB001', 'Ban Giám hiệu',       'hanh_chinh',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb02', 'PB002', 'Phòng Hành chính',     'hanh_chinh',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb03', 'PB003', 'Phòng Tài vụ',         'hanh_chinh',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb04', 'PB004', 'Tổ Toán - Tin',        'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb05', 'PB005', 'Tổ Ngữ văn',           'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb06', 'PB006', 'Tổ Tiếng Anh',         'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb07', 'PB007', 'Tổ Vật lý - Công nghệ','chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb08', 'PB008', 'Tổ Hóa - Sinh',        'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb09', 'PB009', 'Tổ Sử - Địa - GDCD',   'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb10', 'PB010', 'Tổ Thể dục - GDQP',    'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb11', 'PB011', 'Tổ Nghệ thuật',        'chuyen_mon',  NULL,   NULL, TRUE, NOW(), NOW()),
('pb12', 'PB012', 'Phòng Thiết bị - CNTT','hanh_chinh',  'pb02', NULL, TRUE, NOW(), NOW());

-- 3. NHÂN VIÊN
INSERT INTO nhan_vien (id, ma_nhan_vien, ho_ten, gioi_tinh, ngay_sinh, email, so_dien_thoai, loai_nhan_vien, mon_day, loai_hop_dong, la_dang_vien, la_doan_vien, trang_thai, created_at, updated_at) VALUES
-- Ban Giám hiệu
('nv01', 'NV001', 'Trần Văn Hùng',    'Nam', '1970-03-15', 'hung.tv@thanglong.edu.vn',   '0912345001', 'giao_vien', NULL,       'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv02', 'NV002', 'Nguyễn Thị Mai',    'Nữ',  '1975-07-22', 'mai.nt@thanglong.edu.vn',    '0912345002', 'giao_vien', NULL,       'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv03', 'NV003', 'Lê Quốc Bảo',      'Nam', '1972-11-08', 'bao.lq@thanglong.edu.vn',    '0912345003', 'giao_vien', NULL,       'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),

-- Tổ Toán - Tin
('nv04', 'NV004', 'Phạm Minh Tuấn',   'Nam', '1980-01-10', 'tuan.pm@thanglong.edu.vn',   '0912345004', 'giao_vien', 'Toán',     'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv05', 'NV005', 'Đỗ Thị Hoa',       'Nữ',  '1985-05-20', 'hoa.dt@thanglong.edu.vn',    '0912345005', 'giao_vien', 'Toán',     'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv06', 'NV006', 'Vũ Đức Anh',       'Nam', '1988-09-14', 'anh.vd@thanglong.edu.vn',    '0912345006', 'giao_vien', 'Tin học',  'vien_chuc', FALSE, TRUE,  'dang_lam', NOW(), NOW()),
('nv07', 'NV007', 'Hoàng Thị Lan',    'Nữ',  '1990-12-03', 'lan.ht@thanglong.edu.vn',    '0912345007', 'giao_vien', 'Toán',     'hop_dong',  FALSE, TRUE,  'dang_lam', NOW(), NOW()),
('nv08', 'NV008', 'Bùi Văn Nam',      'Nam', '1992-04-25', 'nam.bv@thanglong.edu.vn',    '0912345008', 'giao_vien', 'Tin học',  'hop_dong',  FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Ngữ văn
('nv09', 'NV009', 'Trịnh Thị Ngọc',   'Nữ',  '1978-06-18', 'ngoc.tt@thanglong.edu.vn',   '0912345009', 'giao_vien', 'Ngữ văn', 'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv10', 'NV010', 'Ngô Văn Đức',      'Nam', '1983-02-28', 'duc.nv@thanglong.edu.vn',    '0912345010', 'giao_vien', 'Ngữ văn', 'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv11', 'NV011', 'Lý Thị Phương',    'Nữ',  '1987-08-12', 'phuong.lt@thanglong.edu.vn', '0912345011', 'giao_vien', 'Ngữ văn', 'vien_chuc', FALSE, TRUE,  'dang_lam', NOW(), NOW()),
('nv12', 'NV012', 'Đặng Văn Khoa',    'Nam', '1995-10-05', 'khoa.dv@thanglong.edu.vn',   '0912345012', 'giao_vien', 'Ngữ văn', 'hop_dong',  FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Tiếng Anh
('nv13', 'NV013', 'Phan Thị Thanh',   'Nữ',  '1982-04-07', 'thanh.pt@thanglong.edu.vn',  '0912345013', 'giao_vien', 'Tiếng Anh','vien_chuc',TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv14', 'NV014', 'Cao Minh Quân',    'Nam', '1986-11-19', 'quan.cm@thanglong.edu.vn',   '0912345014', 'giao_vien', 'Tiếng Anh','vien_chuc',FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv15', 'NV015', 'Trương Thị Yến',   'Nữ',  '1991-03-30', 'yen.tt@thanglong.edu.vn',    '0912345015', 'giao_vien', 'Tiếng Anh','hop_dong', FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Vật lý - Công nghệ
('nv16', 'NV016', 'Hồ Sĩ Minh',      'Nam', '1979-08-21', 'minh.hs@thanglong.edu.vn',   '0912345016', 'giao_vien', 'Vật lý',  'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv17', 'NV017', 'Mai Thị Hằng',     'Nữ',  '1984-12-14', 'hang.mt@thanglong.edu.vn',   '0912345017', 'giao_vien', 'Vật lý',  'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv18', 'NV018', 'Tạ Quốc Cường',    'Nam', '1993-06-09', 'cuong.tq@thanglong.edu.vn',  '0912345018', 'giao_vien', 'Công nghệ','hop_dong', FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Hóa - Sinh
('nv19', 'NV019', 'Lương Thị Thu',     'Nữ',  '1981-09-26', 'thu.lt@thanglong.edu.vn',    '0912345019', 'giao_vien', 'Hóa học', 'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv20', 'NV020', 'Dương Văn Phúc',   'Nam', '1986-01-17', 'phuc.dv@thanglong.edu.vn',   '0912345020', 'giao_vien', 'Sinh học','vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv21', 'NV021', 'Đinh Thị Ánh',     'Nữ',  '1990-07-04', 'anh.dt@thanglong.edu.vn',    '0912345021', 'giao_vien', 'Hóa học', 'hop_dong',  FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Sử - Địa - GDCD
('nv22', 'NV022', 'Nguyễn Hữu Long',  'Nam', '1977-05-11', 'long.nh@thanglong.edu.vn',   '0912345022', 'giao_vien', 'Lịch sử', 'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),
('nv23', 'NV023', 'Trần Thị Bích',    'Nữ',  '1984-10-29', 'bich.tt@thanglong.edu.vn',   '0912345023', 'giao_vien', 'Địa lý',  'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv24', 'NV024', 'Lê Thị Hạnh',      'Nữ',  '1989-02-16', 'hanh.lt@thanglong.edu.vn',   '0912345024', 'giao_vien', 'GDCD',    'vien_chuc', FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Tổ Thể dục - GDQP
('nv25', 'NV025', 'Võ Minh Trí',      'Nam', '1985-07-08', 'tri.vm@thanglong.edu.vn',    '0912345025', 'giao_vien', 'Thể dục', 'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv26', 'NV026', 'Phạm Đức Thắng',   'Nam', '1983-11-23', 'thang.pd@thanglong.edu.vn',  '0912345026', 'giao_vien', 'GDQP',    'vien_chuc', TRUE,  FALSE, 'dang_lam', NOW(), NOW()),

-- Tổ Nghệ thuật
('nv27', 'NV027', 'Hoàng Minh Châu',  'Nữ',  '1991-04-13', 'chau.hm@thanglong.edu.vn',   '0912345027', 'giao_vien', 'Âm nhạc', 'hop_dong',  FALSE, TRUE,  'dang_lam', NOW(), NOW()),

-- Phòng Hành chính
('nv28', 'NV028', 'Đoàn Thị Liên',    'Nữ',  '1988-08-05', 'lien.dt@thanglong.edu.vn',   '0912345028', 'nhan_vien', NULL,       'hop_dong',  FALSE, FALSE, 'dang_lam', NOW(), NOW()),
('nv29', 'NV029', 'Nguyễn Văn Sơn',   'Nam', '1990-12-20', 'son.nv@thanglong.edu.vn',    '0912345029', 'nhan_vien', NULL,       'hop_dong',  FALSE, FALSE, 'dang_lam', NOW(), NOW()),

-- Phòng Tài vụ
('nv30', 'NV030', 'Trần Thị Hương',   'Nữ',  '1982-03-18', 'huong.tt@thanglong.edu.vn',  '0912345030', 'nhan_vien', NULL,       'vien_chuc', FALSE, FALSE, 'dang_lam', NOW(), NOW()),

-- Nhân viên nghỉ
('nv31', 'NV031', 'Lê Văn Thành',     'Nam', '1965-06-30', 'thanh.lv@thanglong.edu.vn',  '0912345031', 'giao_vien', 'Toán',     'vien_chuc', TRUE,  FALSE, 'nghi_huu', NOW(), NOW()),
('nv32', 'NV032', 'Phạm Thị Dung',    'Nữ',  '1992-09-11', 'dung.pt@thanglong.edu.vn',   '0912345032', 'giao_vien', 'Tiếng Anh','hop_dong', FALSE, TRUE,  'nghi_viec', NOW(), NOW());

-- 4. NHÂN VIÊN CÔNG TÁC (gán phòng ban + chức vụ)
INSERT INTO nhan_vien_cong_tac (id, nhan_vien_id, phong_ban_id, chuc_vu_id, ngay_bat_dau, is_primary, trang_thai, created_at, updated_at) VALUES
-- Ban Giám hiệu
('ct01', 'nv01', 'pb01', 'cv01', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct02', 'nv02', 'pb01', 'cv02', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct03', 'nv03', 'pb01', 'cv02', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Toán - Tin
('ct04', 'nv04', 'pb04', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct05', 'nv05', 'pb04', 'cv04', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct06', 'nv06', 'pb04', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct07', 'nv07', 'pb04', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct08', 'nv08', 'pb04', 'cv06', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Ngữ văn
('ct09', 'nv09', 'pb05', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct10', 'nv10', 'pb05', 'cv04', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct11', 'nv11', 'pb05', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct12', 'nv12', 'pb05', 'cv06', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Tiếng Anh
('ct13', 'nv13', 'pb06', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct14', 'nv14', 'pb06', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct15', 'nv15', 'pb06', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Vật lý - Công nghệ
('ct16', 'nv16', 'pb07', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct17', 'nv17', 'pb07', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct18', 'nv18', 'pb07', 'cv06', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Hóa - Sinh
('ct19', 'nv19', 'pb08', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct20', 'nv20', 'pb08', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct21', 'nv21', 'pb08', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Sử - Địa - GDCD
('ct22', 'nv22', 'pb09', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct23', 'nv23', 'pb09', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct24', 'nv24', 'pb09', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Thể dục - GDQP
('ct25', 'nv25', 'pb10', 'cv03', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct26', 'nv26', 'pb10', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Tổ Nghệ thuật
('ct27', 'nv27', 'pb11', 'cv05', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Phòng Hành chính
('ct28', 'nv28', 'pb02', 'cv08', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),
('ct29', 'nv29', 'pb12', 'cv08', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW()),

-- Phòng Tài vụ
('ct30', 'nv30', 'pb03', 'cv07', NOW(), TRUE, 'dang_cong_tac', NOW(), NOW());
