import { z } from "zod"

export const cauHinhLuongSchema = z.object({
  ten_cau_hinh: z.string().min(1, "Tên cấu hình không được để trống"),
  ngay_ap_dung: z.string().min(1, "Ngày áp dụng không được để trống"),
  luong_co_so: z.number().min(0, "Lương cơ sở phải >= 0"),
  he_so_dac_thu: z.number().min(0, "Hệ số đặc thù phải >= 0"),
  ty_le_bhxh: z.number().min(0).max(100, "Tỷ lệ BHXH phải từ 0-100%"),
  ty_le_bhyt: z.number().min(0).max(100, "Tỷ lệ BHYT phải từ 0-100%"),
  ty_le_bhtn: z.number().min(0).max(100, "Tỷ lệ BHTN phải từ 0-100%"),
  muc_giam_tru_ban_than: z.number().min(0, "Mức giảm trừ phải >= 0"),
  muc_giam_tru_nguoi_phu_thuoc: z.number().min(0, "Mức giảm trừ phải >= 0"),
})

export const luongFormSchema = z.object({
  nhan_vien_id: z.string().min(1, "Vui lòng chọn nhân viên"),
  ma_ngach: z.string().optional(),
  bac: z.number().int().min(1).max(15).optional(),
  he_so_luong: z.number().min(0, "Hệ số lương phải >= 0"),
  so_nam_tham_nien: z.number().int().min(0, "Số năm thâm niên phải >= 0").default(0),
  ty_le_pc_uu_dai: z.number().min(0).max(100, "Tỷ lệ PC ưu đãi phải từ 0-100%").default(30),
  he_so_khu_vuc: z.number().min(0, "Hệ số khu vực phải >= 0").default(0),
  phu_cap_chuc_vu: z.number().min(0, "Phụ cấp chức vụ phải >= 0").default(0),
  phu_cap_tham_nien_vuot_khung: z.number().min(0).default(0),
  phu_cap_khac: z.number().min(0).default(0),
  khau_tru_khac: z.number().min(0).default(0),
  hieu_luc_tu: z.string().min(1, "Ngày hiệu lực không được để trống"),
  hieu_luc_den: z.string().optional(),
  ghi_chu: z.string().optional(),
})

export const previewLuongSchema = z.object({
  nhan_vien_id: z.string().min(1, "Vui lòng chọn nhân viên"),
  thang: z.number().int().min(1).max(12, "Tháng phải từ 1-12"),
  nam: z.number().int().min(2000).max(2100, "Năm không hợp lệ"),
})

export const chayLuongSchema = z.object({
  thang: z.number().int().min(1).max(12, "Tháng phải từ 1-12"),
  nam: z.number().int().min(2000).max(2100, "Năm không hợp lệ"),
  danh_sach_nhan_vien_ids: z.array(z.string()).optional(),
})

export type CauHinhLuongInput = z.infer<typeof cauHinhLuongSchema>
export type LuongFormInput = z.infer<typeof luongFormSchema>
export type PreviewLuongInput = z.infer<typeof previewLuongSchema>
export type ChayLuongInput = z.infer<typeof chayLuongSchema>
