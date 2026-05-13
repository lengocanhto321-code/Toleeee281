import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeLuong } from "@/types/employee.types"

export const employeeLuongQueryKeys = {
  all: ["employee", "luong"] as const,
  list: () => [...employeeLuongQueryKeys.all, "list"] as const,
}

interface LuongResponse {
  items: EmployeeLuong["phieu_luong"]
  total: number
}

export function useEmployeeLuong(params?: { nam?: number }) {
  return useQuery({
    queryKey: [...employeeLuongQueryKeys.list(), params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.nam) searchParams.set("nam", params.nam.toString())
      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return apiGateway.get<LuongResponse>(`/api/luong/me${query}`)
    },
  })
}
