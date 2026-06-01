import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeLuong } from "@/types/employee.types"

export const employeeLuongQueryKeys = {
  all: ["employee", "luong"] as const,
  list: () => [...employeeLuongQueryKeys.all, "list"] as const,
}

export function useEmployeeLuong(params?: { nam?: number }) {
  return useQuery({
    queryKey: [...employeeLuongQueryKeys.list(), params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.nam) searchParams.set("nam", params.nam.toString())
      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return apiGateway.get<EmployeeLuong["phieu_luong"]>(`/api/v1/nhan-vien/luong/me${query}`)
    },
  })
}
