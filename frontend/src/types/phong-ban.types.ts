export interface PhongBan {
  id: string;
  ma_phong_ban: string;
  ten_phong_ban: string;
  loai: "chuyen_mon" | "hanh_chinh";
  trang_thai: boolean;
  cha_id?: string;
  so_luong_nhan_vien?: number;
}

export interface PhongBanFormData {
  ma_phong_ban?: string;
  ten_phong_ban: string;
  loai: "chuyen_mon" | "hanh_chinh";
  trang_thai: boolean;
  cha_id: string;
}
