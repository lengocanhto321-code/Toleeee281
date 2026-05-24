import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"

export interface PhongBanSummaryItem {
  ten_phong_ban: string
  so_nhan_vien: number
}

export interface HoatDongItem {
  id: string
  hanh_dong: string
  bang_du_lieu: string
  ban_ghi_id: string
  ghi_chu: string
  thoi_gian: string
  ten_dang_nhap: string
}

export interface AdminDashboardStats {
  tong_nhan_vien: number
  nhan_vien_dang_lam: number
  nhan_vien_nghi_viec: number
  nhan_vien_nghi_huu: number
  so_phong_ban: number
  so_chuc_vu: number
  giao_vien: number
  can_bo: number
  nhan_vien_loai: number
  don_nghi_phep_cho_duyet: number
  nhan_vien_moi_thang_nay: number
  phong_ban_summary: PhongBanSummaryItem[]
  hoat_dong_gan_day: HoatDongItem[]
}

const dashboardKeys = {
  admin: ["admin-dashboard"] as const,
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin,
    queryFn: () => apiGateway.get<AdminDashboardStats>(ApiEndpoints.ADMIN_DASHBOARD),
  })
}
