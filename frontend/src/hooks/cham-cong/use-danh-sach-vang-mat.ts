import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/axios"

interface VangMatParams {
  ngay?: string
  phong_ban_id?: string
  loai_vang?: string
  page?: number
  page_size?: number
}

interface VangMatItem {
  id: string
  nhan_vien_id: string
  nhan_vien_ho_ten: string
  phong_ban: string
  ngay: string
  trang_thai: "vang_mat_co_phep" | "vang_mat_khong_phep"
  ghi_chu_vang: string
  created_at: string
}

interface VangMatStats {
  tong_vang: number
  tong_co_phep: number
  tong_khong_phep: number
}

interface VangMatResponse {
  data: VangMatItem[]
  metadata: {
    page: number
    per_page: number
    total: number
    total_pages: number
    thong_ke: VangMatStats
  }
}

export const vangMatQueryKeys = {
  all: ["cham-cong", "vang-mat"] as const,
  list: (params: VangMatParams) => [...vangMatQueryKeys.all, params] as const,
}

export function useDanhSachVangMat(params: VangMatParams = {}) {
  return useQuery<VangMatResponse>({
    queryKey: vangMatQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.ngay) searchParams.set("ngay", params.ngay)
      if (params.phong_ban_id) searchParams.set("phong_ban_id", params.phong_ban_id)
      if (params.loai_vang) searchParams.set("loai_vang", params.loai_vang)
      if (params.page) searchParams.set("page", String(params.page))
      if (params.page_size) searchParams.set("page_size", String(params.page_size))

      const response = await axiosInstance.get<VangMatResponse>(
        `/api/v1/quan-ly/cham-cong/vang-mat?${searchParams.toString()}`
      )
      return response.data
    },
  })
}
