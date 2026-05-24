import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeProfile } from "@/types/employee.types"
import type { UpdateProfileInput } from "@/schemas/employee.schema"
import { toast } from "sonner"
import { employeeQueryKeys } from "./use-employee-dashboard"

export const employeeProfileQueryKeys = {
  all: ["employee", "profile"] as const,
  detail: () => [...employeeProfileQueryKeys.all, "detail"] as const,
}

export function useEmployeeProfile() {
  return useQuery({
    queryKey: employeeProfileQueryKeys.detail(),
    queryFn: () => apiGateway.get<EmployeeProfile>("/api/v1/nhan-vien/profile"),
  })
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiGateway.put("/api/v1/nhan-vien/profile", data),
    onSuccess: () => {
      toast.success("Cập nhật thành công!", {
        description: "Thông tin cá nhân đã được lưu.",
      })
      queryClient.invalidateQueries({ queryKey: employeeProfileQueryKeys.detail() })
    },
    onError: () => {
      toast.error("Cập nhật thất bại!", {
        description: "Vui lòng thử lại sau.",
      })
    },
  })
}
