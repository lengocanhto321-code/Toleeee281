export interface PhongBanBrief {
  id: string;
  ten_phong_ban: string;
}

export interface ChucVuBrief {
  id: string;
  ten_chuc_vu: string;
}

export interface CongTac {
  id: string;
  nhan_vien_id: string;
  phong_ban_id: string;
  chuc_vu_id: string;
  phong_ban?: PhongBanBrief;
  chuc_vu?: ChucVuBrief;
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  is_primary: boolean;
  he_so_luong?: number;
  bac_luong?: string;
  ghi_chu?: string;
  trang_thai: "dang_cong_tac" | "da_nghi" | "da_chuyen";
  created_at: string;
  updated_at: string;
}

export interface LichSuChucVu {
  id: string;
  nhan_vien_id: string;
  chuc_vu_id: string;
  phong_ban_id?: string;
  tu_ngay: string;
  den_ngay?: string;
  ly_do?: string;
  so_quyet_dinh?: string;
  ghi_chu?: string;
  created_at: string;
  updated_at: string;
}
