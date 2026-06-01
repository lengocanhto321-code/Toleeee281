import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeNghiPhep, DonXinNghiEmployee } from "@/types/employee.types"
import type { CreateDonXinNghiEmployeeInput } from "@/schemas/employee.schema"
import { toast } from "sonner"
import { employeeQueryKeys } from "./use-employee-dashboard"

export const employeeNghiPhepQueryKeys = {
  all: ["employee", "nghi-phep"] as const,
  list: () => [...employeeNghiPhepQueryKeys.all, "list"] as const,
  remaining: () => [...employeeNghiPhepQueryKeys.all, "remaining"] as const,
}

export function useEmployeeNghiPhepList(params?: { trang_thai?: string }) {
  return useQuery({
    queryKey: [...employeeNghiPhepQueryKeys.list(), params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.trang_thai) searchParams.set("trang_thai", params.trang_thai)
      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return apiGateway.get<DonXinNghiEmployee[]>(`/api/v1/nhan-vien/nghi-phep/me${query}`)
    },
  })
}

export function useCreateEmployeeDonNghi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDonXinNghiEmployeeInput & { files?: string[] }) =>
      apiGateway.post("/api/v1/nhan-vien/nghi-phep/don", data),
    onSuccess: () => {
      toast.success("Gửi đơn thành công!", {
        description: "Đơn nghỉ phép của bạn đã được gửi và đang chờ duyệt.",
      })
      queryClient.invalidateQueries({ queryKey: employeeNghiPhepQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.dashboard() })
    },
    onError: (err: any) => {
      toast.error("Gửi đơn thất bại!", {
        description: err?.message || "Vui lòng thử lại sau.",
      })
    },
  })
}

export function useHuyDonNghi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (donId: string) =>
      apiGateway.delete<any>(`/api/v1/nhan-vien/nghi-phep/don/${donId}`),
    onSuccess: () => {
      toast.success("Hủy đơn thành công!")
      queryClient.invalidateQueries({ queryKey: employeeNghiPhepQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.dashboard() })
    },
    onError: (err: any) => {
      toast.error("Hủy đơn thất bại!", {
        description: err?.message || "Vui lòng thử lại sau.",
      })
    },
  })
}
