import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastSuccess, toastError } from "@/lib/utils"
import type { LichChamCong, CreateLichChamCongData, ToggleLichChamCongData } from "@/types/lich-cham-cong.types"

export const lichChamCongKeys = {
  all: ["lich-cham-cong"] as const,
  config: () => [...lichChamCongKeys.all, "config"] as const,
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
