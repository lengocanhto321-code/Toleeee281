/**
 * Zod Schemas cho Nghỉ phép
 */

import { z } from "zod";

const LOAI_NGHI = ["phep_nam", "nghi_om", "viec_rieng", "ket_hon", "mai_tang", "thai_san", "cong_tac"] as const;
const TRANG_THAI_DON = ["cho_duyet", "da_duyet", "tu_choi", "huy"] as const;

export const createDonXinNghiSchema = z.object({
  nhan_vien_id: z.string().min(1, "Vui lòng chọn nhân viên"),
  loai_nghi: z.enum(LOAI_NGHI, { message: "Vui lòng chọn loại nghỉ" }),
  tu_ngay: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  den_ngay: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  ly_do: z.string().optional(),
  files: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.tu_ngay && data.den_ngay) {
    return new Date(data.tu_ngay) <= new Date(data.den_ngay);
  }
  return true;
}, {
  message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
  path: ["den_ngay"],
});

export const tuChoiDonXinNghiSchema = z.object({
  don_id: z.string().min(1, "ID đơn không hợp lệ"),
  ly_do: z.string().min(1, "Vui lòng nhập lý do từ chối"),
});

export const duyetDonXinNghiSchema = z.object({
  don_id: z.string().min(1, "ID đơn không hợp lệ"),
});

export const mockGenerateChamCongSchema = z.object({
  thang: z.number().int().min(1).max(12, "Tháng phải từ 1-12"),
  nam: z.number().int().min(2000).max(2100, "Năm không hợp lệ"),
});

export const donXinNghiParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  page_size: z.number().int().positive().max(100).optional().default(20),
  nhan_vien_id: z.string().optional(),
  trang_thai: z.enum([...TRANG_THAI_DON, "all"]).optional(),
  loai_nghi: z.enum([...LOAI_NGHI, "all"]).optional(),
});

export const chamCongThangParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  page_size: z.number().int().positive().max(100).optional().default(20),
  nhan_vien_id: z.string().optional(),
  thang: z.number().int().min(1).max(12).optional(),
  nam: z.number().int().min(2000).max(2100).optional(),
});

export type CreateDonXinNghiInput = z.infer<typeof createDonXinNghiSchema>;
export type TuChoiDonXinNghiInput = z.infer<typeof tuChoiDonXinNghiSchema>;
export type DuyetDonXinNghiInput = z.infer<typeof duyetDonXinNghiSchema>;
export type MockGenerateChamCongInput = z.infer<typeof mockGenerateChamCongSchema>;
export type DonXinNghiParamsInput = z.infer<typeof donXinNghiParamsSchema>;
export type ChamCongThangParamsInput = z.infer<typeof chamCongThangParamsSchema>;
