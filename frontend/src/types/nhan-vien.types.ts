export interface NhanVien {
  id: string;
  ma_nhan_vien: string;
  ho_ten: string;
  gioi_tinh: string;
  ngay_sinh: string;
  que_quan?: string;
  dia_chi_thuong_tru?: string;
  dia_chi_tam_tru?: string;
  so_dien_thoai?: string;
  email?: string;
  email_ca_nhan?: string;
  so_cccd?: string;
  ngay_cap_cccd?: string;
  noi_cap_cccd?: string;
  anh_dai_dien?: string;
  loai_nhan_vien: string;
  cap_hoc?: string;
  mon_day?: string;
  hang_chuc_danh?: string;
  ngach_luong?: string;
  bac_luong?: number;
  he_so_luong?: number;
  so_nam_tham_nien?: number;
  
  loai_hop_dong: string;
  so_hop_dong?: string;
  ngay_vao_lam?: string;
  ngay_het_hop_dong?: string;
  hinh_thuc_tuyen_dung?: string;
  noi_ky_hop_dong?: string;
  
  phu_cap_chuc_vu?: number;
  ngay_bo_nhiem_chuc_vu?: string;
  
  la_dang_vien: boolean;
  la_doan_vien: boolean;
  dan_toc?: string;
  ton_giao?: string;
  noi_sinh?: string;
  
  ghi_chu?: string;
  trang_thai: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  phong_ban?: {
    id: string;
    ma_phong_ban: string;
    ten_phong_ban: string;
  };
  chuc_vu?: {
    id: string;
    ma_chuc_vu: string;
    ten_chuc_vu: string;
  };
  
  // Related data
  hop_dongs?: HopDong[];
  bang_caps?: BangCap[];
  chung_chis?: ChungChi[];
  khen_thuongs?: KhenThuong[];
  ky_luats?: KyLuat[];
  nguoi_than?: NguoiThan[];
}

export interface HopDong {
  id: string;
  loai_hop_dong: string;
  so_hop_dong: string;
  ngay_ky: string;
  ngay_bat_dau: string;
  ngay_ket_thuc?: string;
  noi_dung?: string;
  trang_thai: "hieu_luc" | "het_han" | "bi_huy";
}

export interface BangCap {
  id: string;
  loai: string;
  ten: string;
  chuyen_nganh?: string;
  truong?: string;
  nam_tot_nghiep?: number;
  xep_loai?: string;
  file_dinh_kem?: string;
}

export interface ChungChi {
  id: string;
  loai: string;
  ten: string;
  hang_cap?: string;
  nam_cap?: number;
  ngay_het_han?: string;
  file_dinh_kem?: string;
}

export interface KhenThuong {
  id: string;
  nam: number;
  hinh_thuc: string;
  ly_do: string;
  co_quan_ban_hanh?: string;
  ngay_quyet_dinh?: string;
}

export interface KyLuat {
  id: string;
  nam: number;
  hinh_thuc: string;
  ly_do: string;
  muc_do?: string;
  co_quan_ban_hanh?: string;
  ngay_quyet_dinh?: string;
  trang_thai: "dang_xu_ly" | "da_xu_ly" | "da_xoa";
}

export interface NguoiThan {
  id: string;
  ho_ten: string;
  quan_he: string;
  nam_sinh: string;
  nghe_nghiep?: string;
  dia_chi?: string;
  so_dien_thoai?: string;
  nguoi_phu_thuoc: boolean;
}

export interface NhanVienFormData {
  ho_ten: string;
  gioi_tinh: string;
  ngay_sinh: string;
  email: string;
  so_dien_thoai: string;
  loai_nhan_vien: string;
  trang_thai: string;
}

export type TrangThaiNhanVien = "dang_lam" | "nghi_viec" | "nghi_huu" | "da_xoa";

export const TRANG_THAI_LABELS: Record<TrangThaiNhanVien, string> = {
  dang_lam: "Đang làm",
  nghi_viec: "Nghỉ việc",
  nghi_huu: "Nghỉ hưu",
  da_xoa: "Đã xóa",
};

export const TRANG_THAI_COLORS: Record<TrangThaiNhanVien, string> = {
  dang_lam: "bg-emerald-50 text-emerald-700 border-emerald-200",
  nghi_viec: "bg-amber-50 text-amber-700 border-amber-200",
  nghi_huu: "bg-sky-50 text-sky-700 border-sky-200",
  da_xoa: "bg-red-50 text-red-700 border-red-200",
};

export const LOAI_NHAN_VIEN_LABELS: Record<string, string> = {
  giao_vien: "Giáo viên",
  nhan_vien: "Nhân viên",
  can_bo: "Cán bộ",
};

export const LOAI_HOP_DONG_LABELS: Record<string, string> = {
  vien_chuc: "Viên chức",
  hop_dong: "Hợp đồng",
  thu_viec: "Thử việc",
};

export const CAP_HOC_LABELS: Record<string, string> = {
  mam_non: "Mầm non",
  tieu_hoc: "Tiểu học",
  thcs: "THCS",
  thpt: "THPT",
  gdtx: "GDTX",
};

export const HANG_CHUC_DANH_LABELS: Record<string, string> = {
  A1: "Hạng I",
  A2: "Hạng II",
  B: "Hạng III",
  C: "Hạng IV",
};

export const LOAI_BANG_CAP_LABELS: Record<string, string> = {
  dai_hoc: "Đại học",
  cao_dang: "Cao đẳng",
  trung_cap: "Trung cấp",
  chung_chi: "Chứng chỉ",
  bang_khac: "Bằng khác",
};

export const LOAI_CHUNG_CHI_LABELS: Record<string, string> = {
  ngoai_ngu: "Ngoại ngữ",
  tin_hoc: "Tin học",
  nghiep_vu: "Nghiệp vụ",
  khac: "Khác",
};

export const TINH_TRANG_HON_NHANH_LABELS: Record<string, string> = {
  doc_than: "Độc thân",
  da_ket_hon: "Đã kết hôn",
  ly_di: "Ly dị",
  goa_vo: "Góa vợ/chồng",
};
