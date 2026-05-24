import { z } from "zod"

// ============ Nhân viên Schema ============

export const nhanVienPersonalSchema = z.object({
  ho_ten: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
  gioi_tinh: z.enum(["Nam", "Nữ", "Khác"]),
  ngay_sinh: z.string().min(1, "Vui lòng chọn ngày sinh"),
  que_quan: z.string().min(1, "Vui lòng nhập quê quán"),
  dia_chi_thuong_tru: z.string().min(1, "Vui lòng nhập địa chỉ thường trú"),
  dia_chi_tam_tru: z.string().optional(),
  so_dien_thoai: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  email_ca_nhan: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  dan_toc: z.string().min(1, "Vui lòng nhập dân tộc"),
  ton_giao: z.string().optional(),
  noi_sinh: z.string().min(1, "Vui lòng nhập nơi sinh"),
  tinh_trang_hon_nhan: z.enum(["doc_than", "da_ket_hon", "ly_di", "goa_vo"]),
  so_bao_hiem: z.string().optional(),
  ngay_tham_gia_bhxh: z.string().optional(),
  so_tai_khoan_ngan_hang: z.string().optional(),
  ten_ngan_hang: z.string().optional(),
})

export const nhanVienIdentitySchema = z.object({
  so_cccd: z.string().regex(/^[0-9]{9,12}$/, "Số CCCD phải có 9 hoặc 12 số"),
  ngay_cap_cccd: z.string().min(1, "Vui lòng chọn ngày cấp"),
  noi_cap_cccd: z.string().min(1, "Vui lòng nhập nơi cấp"),
})

export const nhanVienWorkSchema = z.object({
  loai_nhan_vien: z.enum(["giao_vien", "nhan_vien", "can_bo"]),
  trang_thai: z.enum(["dang_lam", "nghi_viec", "nghi_huu"]),
  mon_day: z.string().optional(),
  cap_hoc: z.enum(["mam_non", "tieu_hoc", "thcs", "thpt", "gdtx"]),
  phong_ban_id: z.string().min(1, "Vui lòng chọn phòng ban"),
  chuc_vu_id: z.string().min(1, "Vui lòng chọn chức vụ"),
})

export const nhanVienContractSchema = z.object({
  loai_hop_dong: z.enum(["vien_chuc", "hop_dong", "thu_viec"]),
  so_hop_dong: z.string().optional(),
  ngay_vao_lam: z.string().min(1, "Vui lòng chọn ngày vào làm"),
  ngay_het_hop_dong: z.string().optional(),
  hinh_thuc_tuyen_dung: z.string().optional(),
  noi_ky_hop_dong: z.string().optional(),
  hang_chuc_danh: z.enum(["A1", "A2", "B", "C"]).optional(),
  ngach_luong: z.string().optional(),
  bac_luong: z.coerce.number().int().min(1).max(10).optional(),
  he_so_luong: z.string().optional(),
  so_nam_tham_nien: z.coerce.number().int().min(0).optional(),
})

export const nhanVienPartySchema = z.object({
  la_dang_vien: z.boolean(),
  ngay_vao_dang: z.string().optional(),
  la_doan_vien: z.boolean(),
  ngay_vao_doan: z.string().optional(),
})

export const nhanVienOtherSchema = z.object({
  ghi_chu: z.string().optional(),
  anh_dai_dien: z.string().optional(),
  ngay_bo_nhiem_chuc_vu: z.string().optional(),
})

// Full schema - fields optional for flexible form
export const nhanVienFullSchema = z.object({
  ...nhanVienPersonalSchema.shape,
  ...nhanVienIdentitySchema.shape,
  ...nhanVienWorkSchema.shape,
  ...nhanVienContractSchema.shape,
  ...nhanVienPartySchema.shape,
  ...nhanVienOtherSchema.shape,
})

export type NhanVienPersonalInput = z.infer<typeof nhanVienPersonalSchema>
export type NhanVienIdentityInput = z.infer<typeof nhanVienIdentitySchema>
export type NhanVienWorkInput = z.infer<typeof nhanVienWorkSchema>
export type NhanVienContractInput = z.infer<typeof nhanVienContractSchema>
export type NhanVienPartyInput = z.infer<typeof nhanVienPartySchema>
export type NhanVienOtherInput = z.infer<typeof nhanVienOtherSchema>
export type NhanVienFullInput = z.infer<typeof nhanVienFullSchema>

// ============ Đơn nghỉ phép Schema ============

export const createDonXinNghiEmployeeSchema = z.object({
  loai_nghi: z.enum(["phep_nam", "nghi_om", "viec_rieng", "ket_hon", "mai_tang", "thai_san", "cong_tac"], {
    message: "Vui lòng chọn loại nghỉ",
  }),
  tu_ngay: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  den_ngay: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  ly_do: z.string().optional(),
  files: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.tu_ngay && data.den_ngay) {
    return new Date(data.tu_ngay) <= new Date(data.den_ngay)
  }
  return true
}, {
  message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
  path: ["den_ngay"],
})

export const updateProfileSchema = z.object({
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  so_dien_thoai: z.string().optional(),
  dia_chi: z.string().optional(),
})

export const chamCongFilterSchema = z.object({
  thang: z.number().int().min(1).max(12).optional(),
  nam: z.number().int().min(2000).max(2100).optional(),
})

export type CreateDonXinNghiEmployeeInput = z.infer<typeof createDonXinNghiEmployeeSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChamCongFilterInput = z.infer<typeof chamCongFilterSchema>
