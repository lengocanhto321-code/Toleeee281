export type LoaiHopDong = 
  | "vien_chuc"
  | "hop_dong_thu_viec"
  | "hop_dong_1_nam"
  | "hop_dong_2_nam"
  | "hop_dong_3_nam"
  | "hop_dong_khong_thoi_han"
  | "hop_dong_ngan_han"
  | "hop_dong_khac";

export type TrangThaiHopDong = "dang_hieu_luc" | "da_het_han" | "bi_huy";

export interface HopDong {
  id: string;
  nhan_vien_id: string;
  so_hop_dong: string;
  loai_hop_dong: LoaiHopDong;
  ngay_ky?: string;
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  hinh_thuc_tuyen_dung?: string;
  noi_ky_hop_dong?: string;
  luong_co_ban?: string;
  ghi_chu?: string;
  trang_thai: TrangThaiHopDong;
  created_at: string;
  updated_at: string;
}

export interface HopDongFormData {
  so_hop_dong: string;
  loai_hop_dong: LoaiHopDong;
  ngay_ky?: string;
  ngay_bat_dau?: string;
  ngay_ket_thuc?: string;
  hinh_thuc_tuyen_dung?: string;
  noi_ky_hop_dong?: string;
  luong_co_ban?: string;
  ghi_chu?: string;
}

export const LOAI_HOP_DONG_LABELS: Record<LoaiHopDong, string> = {
  vien_chuc: "Viên chức",
  hop_dong_thu_viec: "Hợp đồng thử việc",
  hop_dong_1_nam: "Hợp đồng 1 năm",
  hop_dong_2_nam: "Hợp đồng 2 năm",
  hop_dong_3_nam: "Hợp đồng 3 năm",
  hop_dong_khong_thoi_han: "Hợp đồng không thời hạn",
  hop_dong_ngan_han: "Hợp đồng ngắn hạn",
  hop_dong_khac: "Khác",
};

export const TRANG_THAI_HOP_DONG_LABELS: Record<TrangThaiHopDong, string> = {
  dang_hieu_luc: "Đang hiệu lực",
  da_het_han: "Đã hết hạn",
  bi_huy: "Bị hủy",
};
