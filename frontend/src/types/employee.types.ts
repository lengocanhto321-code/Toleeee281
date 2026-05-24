export interface EmployeeDashboard {
  nhan_vien: {
    id: string
    ma_nhan_vien: string
    ho_ten: string
    email?: string
    so_dien_thoai?: string
    dia_chi?: string
    phong_ban?: {
      id: string
      ten_phong_ban: string
    }
    chuc_vu?: {
      id: string
      ten_chuc_vu: string
    }
  }
  nghi_phep: {
    so_ngay_phep_con_lai: number
    tong_ngay_phep_nam: number
    don_cho_duyet: number
    da_duyet_thang_nay: number
    don_gan_nhat?: {
      id: string
      loai_nghi: string
      tu_ngay: string
      den_ngay: string
      trang_thai: string
    }
  }
  cham_cong: {
    thang_hien_tai: {
      thang: number
      nam: number
      so_ngay_cong: number
      he_so: number
    }
  }
}

export interface EmployeeNghiPhep {
  don_xin_nghi: DonXinNghiEmployee[]
  thong_ke: {
    phep_con_lai: number
    phep_nam: number
    dang_cho_duyet: number
    da_duyet_thang_nay: number
  }
}

export interface DonXinNghiEmployee {
  id: string
  loai_nghi: string
  ten_loai_nghi: string
  tu_ngay: string
  den_ngay: string
  so_ngay: number
  trang_thai: string
  ly_do?: string
  ngay_tao: string
  ghi_chu_duyet?: string
  files?: string[]
}

export interface EmployeeChamCong {
  thang: number
  nam: number
  tong_ngay_lam: number
  ngay_cong: {
    co_mat: number
    vang_co_phep: number
    vang_khong_phep: number
    nghi_le: number
  }
  chi_tiet: ChamCongChiTiet[]
}

export interface ChamCongChiTiet {
  ngay: number
  trang_thai: "co_mat" | "vang" | "nghi_le" | "cuoi_tuan"
  ghi_chu?: string
}

export interface EmployeeLuong {
  phieu_luong: PhieuLuongEmployee[]
}

export interface PhieuLuongEmployee {
  id: string
  thang: number
  nam: number
  tong_thu_nhap: number
  tong_khau_tru: number
  luong_thuc_nhan: number
  ngay_thanh_toan?: string
  chi_tiet: {
    luong_co_ban: number
    phu_cap: number
    thuong: number
    bao_hiem: number
    thue: number
    khac: number
  }
}

export interface EmployeeProfile {
  id: string
  ma_nhan_vien: string
  ho_ten: string
  gioi_tinh: string
  ngay_sinh: string
  que_quan?: string
  dia_chi?: string
  so_dien_thoai?: string
  email?: string
  email_ca_nhan?: string
  so_cccd?: string
  ngay_cap_cccd?: string
  noi_cap_cccd?: string
  loai_nhan_vien: string
  phong_ban?: {
    id: string
    ten_phong_ban: string
  }
  chuc_vu?: {
    id: string
    ten_chuc_vu: string
  }
  ngay_vao_lam?: string
  trang_thai: string
}

export interface UpdateProfileInput {
  email?: string
  so_dien_thoai?: string
  dia_chi?: string
}

export const LOAI_NGHI_LABELS: Record<string, string> = {
  phep_nam: "Phép năm",
  nghi_om: "Nghỉ ốm",
  viec_rieng: "Việc riêng",
  cong_tac: "Công tác",
  ket_hon: "Kết hôn",
  mai_tang: "Ma táng",
  thai_san: "Thai sản",
}

export const TRANG_THAI_DON_LABELS: Record<string, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
  huy: "Đã hủy",
}

export const TRANG_THAI_DON_COLORS: Record<string, string> = {
  cho_duyet: "bg-amber-100 text-amber-700 border-amber-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-red-100 text-red-700 border-red-200",
  huy: "bg-slate-100 text-slate-700 border-slate-200",
}
