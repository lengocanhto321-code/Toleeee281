let counter = Date.now()
let phoneCounter = 1000000000

export const testData = {
  get phongBan() {
    return {
      ten: `Phòng Test ${counter++}`,
      tenSua: `Phòng Test ${counter++} (Đã sửa)`,
      loai: 'Tổ chuyên môn',
      moTa: 'Phòng ban test',
    }
  },

  get chucVu() {
    return {
      ten: `Chức vụ Test ${counter++}`,
      tenSua: `Chức vụ Test ${counter++} (Đã sửa)`,
      loai: 'Giáo viên',
      capBac: 'Cấp 1',
      heSoPhuCap: '0.5',
    }
  },

  get nhanVien() {
    const id = counter++
    const phone = phoneCounter++
    return {
      hoTen: `Nguyễn Văn Test ${id}`,
      hoTenSua: `Nguyễn Văn Test ${id} (Đã sửa)`,
      gioiTinh: 'Nam',
      ngaySinh: '15',
      noiSinh: 'TP. Hồ Chí Minh',
      danToc: 'Kinh',
      tonGiao: 'Không',
      soDienThoai: `${phone}`,
      emailTruong: `test${id}@thanglong.edu.vn`,
      emailCaNhan: `test${id}@gmail.com`,
      tinhTrangHonNhan: 'Độc thân',
      queQuan: 'Quận 1, TP. Hồ Chí Minh',
      diaChiThuongTru: '123 Đường ABC, Quận 1',
      soCCCD: `${String(phone).slice(0, 9)}${String(id).slice(-3)}`,
      ngayCapCCCD: '01/01/2015',
      noiCapCCCD: 'CA TP. Hồ Chí Minh',
      trangThai: 'Đang làm',
      monDay: 'Toán',
      capHoc: 'THPT',
      loaiHopDong: 'Viên chức',
      soHopDong: `HD-TEST-${id}`,
      ngayVaoLam: '01/01/2026',
      hinhThucTuyenDung: 'Thi tuyển',
      noiKyHopDong: 'TP. Hồ Chí Minh',
      heSoLuong: '2.34',
      bacLuong: 'Bậc 1',
      username: '',
      password: '',
    }
  },

  get nguoiThan() {
    return {
      hoTen: `Nguyễn Thị Test ${counter++}`,
      quanHe: 'Vợ',
      namSinh: '1993',
      ngheNghiep: 'Giáo viên',
      soDienThoai: '0909123456',
    }
  },

  get bangCap() {
    return {
      loaiBang: 'Đại học',
      tenBang: `Cử nhân Toán ${counter++}`,
      namCap: '2015',
      chuyenNganh: 'Toán học',
      truongCap: 'ĐH Sư phạm Hà Nội',
      xepLoai: 'Giỏi',
    }
  },

  get khenThuong() {
    return {
      loai: 'Khen thưởng',
      hinhThuc: 'Bằng khen',
      lyDo: 'Thành tích xuất sắc trong giảng dạy',
      ngayQuyetDinh: '2026-03-15',
    }
  },

  get kyLuat() {
    return {
      loai: 'Kỷ luật',
      hinhThuc: 'Khiển trách',
      lyDo: 'Vi phạm nội quy nhà trường',
      ngayQuyetDinh: '2026-03-20',
    }
  },

  get hopDong() {
    const id = counter++
    return {
      soHopDong: `HC-E2E-${id}`,
      loaiHopDong: 'Viên chức',
      ngayBatDau: '2026-06-01',
      ngayKetThuc: '2027-06-01',
      luongCoBan: '5000000',
      hinhThucTuyenDung: 'Thi tuyển',
    }
  },
}
