export type ChucVuLoai = "quan_ly" | "giao_vien" | "nhan_vien";

export interface ChucVu {
  id: string;
  ma_chuc_vu: string;
  ten_chuc_vu: string;
  cap_bac: number;
  he_so_phu_cap: number;
  mo_ta?: string;
  tieu_chuan?: string;
  trang_thai: boolean;
  loai: ChucVuLoai;
}

export interface ChucVuFormData {
  ma_chuc_vu: string;
  ten_chuc_vu: string;
  cap_bac: number;
  he_so_phu_cap: number;
  mo_ta: string;
  tieu_chuan: string;
  trang_thai: boolean;
  loai: ChucVuLoai;
}
