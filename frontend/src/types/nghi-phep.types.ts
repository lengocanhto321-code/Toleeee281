/**
 * Types cho Nghỉ phép (Leave Management)
 */

export interface DonXinNghi {
  id: string;
  nhan_vien_id: string;
  nhan_vien_ho_ten?: string;
  loai_nghi: LoaiNghi;
  ten_loai_nghi: string;
  tu_ngay: string;
  den_ngay: string;
  so_ngay: number;
  ly_do?: string;
  files?: string[];
  trang_thai: TrangThaiDon;
  cap_duyet_hien_tai?: number;
  nguoi_duyet_cap_1_id?: string;
  nguoi_duyet_cap_1?: string;
  nguoi_duyet_cap_2_id?: string;
  nguoi_duyet_cap_2?: string;
  ngay_duyet_cap_1?: string;
  ngay_duyet_cap_2?: string;
  ghi_chu_duyet_cap_1?: string;
  ghi_chu_duyet_cap_2?: string;
  lich_su_duyet?: LichSuDuyet[];
  ghi_chu_duyet?: string;
  ngay_duyet?: string;
  nguoi_duyet_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface LichSuDuyet {
  id: string;
  don_xin_nghi_id: string;
  hanh_dong: "tao_moi" | "duyet" | "tu_choi" | "huy";
  trang_thai_cu?: TrangThaiDon;
  trang_thai_moi: TrangThaiDon;
  nguoi_thuc_hien_id: string;
  nguoi_thuc_hien_ho_ten?: string;
  ghi_chu?: string;
  created_at: string;
}

export interface SoNgayPhep {
  nhan_vien_id: string;
  nam: number;
  phep_nam_duoc_phep: number;
  phep_nam_da_su_dung: number;
  phep_nam_con_lai: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChamCongThang {
  id: string;
  nhan_vien_id: string;
  nhan_vien_ho_ten?: string;
  thang: number;
  nam: number;
  so_ngay_lam_chuan: number;
  so_ngay_co_mat: number;
  so_ngay_vang_co_phep: number;
  so_ngay_vang_khong_phep: number;
  so_ngay_nghi_le_tet: number;
  so_ngay_cong_tac: number;
  he_so_ngay_cong: number;
  trang_thai: string;
  mau_trang_thai?: string;
  ghi_chu?: string;
  created_at?: string;
  updated_at?: string;
}

export type LoaiNghi = 
  | "phep_nam" 
  | "nghi_om" 
  | "viec_rieng" 
  | "ket_hon" 
  | "mai_tang" 
  | "thai_san" 
  | "cong_tac";

export type TrangThaiDon = "cho_duyet" | "da_duyet" | "tu_choi" | "huy";

// Query params types
export interface DonXinNghiParams {
  page?: number;
  page_size?: number;
  nhan_vien_id?: string;
  trang_thai?: TrangThaiDon | "all";
  loai_nghi?: LoaiNghi | "all";
}

export interface ChamCongThangParams {
  page?: number;
  page_size?: number;
  nhan_vien_id?: string;
  thang?: number;
  nam?: number;
}

// Form data types
export interface CreateDonXinNghiData {
  nhan_vien_id: string;
  loai_nghi: LoaiNghi;
  tu_ngay: string;
  den_ngay: string;
  ly_do?: string;
  files?: string[];
}

export interface DuyetDonXinNghiData {
  don_id: string;
}

export interface TuChoiDonXinNghiData {
  don_id: string;
  ly_do: string;
}

export interface MockGenerateChamCongData {
  thang: number;
  nam: number;
}

// API Response types
export interface DonXinNghiListResponse {
  data: DonXinNghi[];
  metadata: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ChamCongThangListResponse {
  data: ChamCongThang[];
  metadata: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}
