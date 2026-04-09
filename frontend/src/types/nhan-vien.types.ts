export interface NhanVien {
  id: string;
  ma_nhan_vien: string;
  ho_ten: string;
  gioi_tinh: string;
  ngay_sinh: string;
  que_quan?: string;
  dia_chi_thuong_tru?: string;
  so_dien_thoai?: string;
  email?: string;
  so_cccd?: string;
  anh_dai_dien?: string;
  loai_nhan_vien: string;
  mon_day?: string;
  hang_chuc_danh?: string;
  loai_hop_dong: string;
  so_hop_dong?: string;
  ngay_vao_lam?: string;
  ngay_het_hop_dong?: string;
  la_dang_vien: boolean;
  la_doan_vien: boolean;
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
