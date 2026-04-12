/**
 * Types cho Lương (Salary)
 */

export interface CauHinhLuong {
  id: string;
  ten_cau_hinh: string;
  ngay_ap_dung: string;
  luong_co_so: number;
  he_so_dac_thu: number;
  ty_le_bhxh: number;
  ty_le_bhyt: number;
  ty_le_bhtn: number;
  muc_giam_tru_ban_than: number;
  muc_giam_tru_nguoi_phu_thuoc: number;
  trang_thai: "dang_ap_dung" | "sap_hieu_luc" | "da_het_hieu_luc";
  created_at: string;
}

export interface Luong {
  id: string;
  nhan_vien_id: string;
  ma_ngach?: string;
  bac?: number;
  he_so_luong: number;
  so_nam_tham_nien: number;
  ty_le_pc_uu_dai: number;
  he_so_khu_vuc: number;
  phu_cap_chuc_vu: number;
  phu_cap_tham_nien_vuot_khung: number;
  phu_cap_khac: number;
  khau_tru_khac: number;
  hieu_luc_tu: string;
  hieu_luc_den?: string;
  ghi_chu?: string;
  luong_co_ban: number;
  phu_cap_uu_dai: number;
  bhxh: number;
  bhyt: number;
  thue_tncn: number;
  created_at: string;
  updated_at: string;
}

export interface KyLuong {
  id: string;
  thang: number;
  nam: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  trang_thai: "chua_duyet" | "da_duyet" | "da_chot";
  tong_nhan_vien?: number;
  tong_thu_nhap?: number;
  tong_thuc_nhan?: number;
  ngay_duyet?: string;
  nguoi_duyet_id?: string;
  ngay_chot?: string;
  created_at: string;
}

export interface TraLuong {
  id: string;
  nhan_vien_id: string;
  nhan_vien_ho_ten?: string;
  ky_luong_id: string;
  thang: number;
  nam: number;
  ngay_vao?: string;
  ngay_nghi?: string;
  so_ngay_cong_chuan: number;
  so_ngay_cong_thuc_te: number;
  luong_co_ban: number;
  he_so_dac_thu_ap_dung: number;
  loai_cong_thuc: "cu" | "moi";
  phu_cap_chuc_vu: number;
  phu_cap_tham_nien: number;
  phu_cap_uu_dai: number;
  phu_cap_khu_vuc: number;
  phu_cap_tham_nien_vuot_khung: number;
  phu_cap_khac: number;
  tong_phu_cap: number;
  thu_nhap_tang_them: number;
  thuong: number;
  bhxh: number;
  bhyt: number;
  bhtn: number;
  thue_tncn: number;
  khau_tru_khac: number;
  tong_khau_tru: number;
  tong_thu_nhap: number;
  luong_thuc_nhan: number;
  co_tam_dinh_chi: boolean;
  tam_dinh_chi_id?: string;
  co_ky_luat: boolean;
  ky_luat_id?: string;
  hinh_thuc_ky_luat?: string;
  ngay_chay: string;
  trang_thai: "chua_tra" | "da_tra" | "da_chot";
}

export interface PreviewLuong {
  nhan_vien_id: string;
  thang: number;
  nam: number;
  ngay_vao?: string;
  ngay_nghi?: string;
  loai_cong_thuc: "cu" | "moi";
  he_so_dac_thu_ap_dung: number;
  so_ngay_cong_chuan: number;
  so_ngay_cong_thuc_te: number;
  he_so_ngay_cong: number;
  luong_co_ban: number;
  phu_cap_chuc_vu: number;
  phu_cap_tham_nien: number;
  phu_cap_uu_dai: number;
  phu_cap_khu_vuc: number;
  phu_cap_tham_nien_vuot_khung: number;
  phu_cap_khac: number;
  tong_phu_cap: number;
  bhxh: number;
  bhyt: number;
  bhtn: number;
  thue_tncn: number;
  khau_tru_khac: number;
  tong_thu_nhap: number;
  tong_khau_tru: number;
  luong_thuc_nhan: number;
  co_tam_dinh_chi: boolean;
  tam_dinh_chi_id?: string;
  co_ky_luat: boolean;
  ky_luat_id?: string;
  hinh_thuc_ky_luat?: string;
}

export interface ChayLuongResult {
  ky_luong_id: string;
  thang: number;
  nam: number;
  tong_nhan_vien: number;
  tong_thu_nhap: number;
  tong_thuc_nhan: number;
  danh_sach: Array<{
    nhan_vien_id: string;
    ho_ten: string;
    luong_thuc_nhan: number;
  }>;
}

// Form data types
export interface LuongFormData {
  nhan_vien_id: string;
  ma_ngach?: string;
  bac?: number;
  he_so_luong: number;
  so_nam_tham_nien: number;
  ty_le_pc_uu_dai: number;
  he_so_khu_vuc: number;
  phu_cap_chuc_vu: number;
  phu_cap_tham_nien_vuot_khung: number;
  phu_cap_khac: number;
  khau_tru_khac: number;
  hieu_luc_tu: string;
  hieu_luc_den?: string;
  ghi_chu?: string;
}

export interface PreviewLuongFormData {
  nhan_vien_id: string;
  thang: number;
  nam: number;
}

export interface ChayLuongFormData {
  thang: number;
  nam: number;
  danh_sach_nhan_vien_ids?: string[];
}
