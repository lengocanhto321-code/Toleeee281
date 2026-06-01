import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastSuccess, toastError } from "@/lib/utils"
import type { LichChamCong, CreateLichChamCongData, ToggleLichChamCongData } from "@/types/lich-cham-cong.types"

export const lichChamCongKeys = {
  all: ["lich-cham-cong"] as const,
  config: () => [...lichChamCongKeys.all, "config"] as const,
  todayQr: () => [...lichChamCongKeys.all, "today-qr"] as const,
}

export function useLichChamCong() {
  return useQuery({
    queryKey: lichChamCongKeys.config(),
    queryFn: () => apiGateway.get<LichChamCong | null>(ApiEndpoints.ADMIN_CHAM_CONG_LICH),
  })
}

export function useCreateLichChamCong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLichChamCongData) =>
      apiGateway.post<LichChamCong>(ApiEndpoints.ADMIN_CHAM_CONG_LICH, data),
    onSuccess: () => {
      toastSuccess("Thành công", "Đã lưu cấu hình lịch chấm công")
      queryClient.invalidateQueries({ queryKey: lichChamCongKeys.all })
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Lưu cấu hình thất bại"
      toastError("Lỗi", message)
    },
  })
}

export function useToggleLichChamCong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleLichChamCongData }) =>
      apiGateway.patch<LichChamCong>(ApiEndpoints.ADMIN_CHAM_CONG_LICH_TOGGLE(id), data),
    onSuccess: (_, variables) => {
      const action = variables.data.trang_thai === "active" ? "bật" : "tắt"
      toastSuccess("Thành công", `Đã ${action} lịch tự động`)
      queryClient.invalidateQueries({ queryKey: lichChamCongKeys.all })
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thao tác thất bại"
      toastError("Lỗi", message)
    },
  })
}

export function useGenerateQr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      ngay: string
      loai: string
      phong_ban_id?: string
      vi_tri?: { lat?: number; lng?: number; dms?: string; name?: string; radius: number }
      gio_bat_dau: string
      gio_ket_thuc: string
      bat_gps: boolean
    }) => apiGateway.post(ApiEndpoints.ADMIN_CHAM_CONG_QR_GENERATE, data),
    onSuccess: () => {
      toastSuccess("Thành công", "Đã tạo mã QR chấm công")
      queryClient.invalidateQueries({ queryKey: lichChamCongKeys.todayQr() })
    },
    onError: (error: unknown) => {
      const message = (error as { response?: any })?.response?.data?.detail?.message || "Tạo mã QR thất bại"
      toastError("Lỗi", message)
    },
  })
}

interface TodayQR {
  id: string
  ngay: string
  qr_data: string
  ma_nhap: string | null
  trang_thai: string
}

export function useTodayQR() {
  const today = new Date().toISOString().slice(0, 10)
  return useQuery({
    queryKey: lichChamCongKeys.todayQr(),
    queryFn: () => {
      const qs = new URLSearchParams({ ngay: today })
      return apiGateway.get<TodayQR[]>(`${ApiEndpoints.ADMIN_CHAM_CONG_QR_BY_DATE}?${qs}`)
    },
    select: (data) => data?.[0] ?? null,
    refetchInterval: 30000,
  })
}
