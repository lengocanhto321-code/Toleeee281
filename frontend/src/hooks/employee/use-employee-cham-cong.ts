import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeChamCong } from "@/types/employee.types"

export const employeeChamCongQueryKeys = {
  all: ["employee", "cham-cong"] as const,
  thang: (thang: number, nam: number) => [...employeeChamCongQueryKeys.all, thang, nam] as const,
}

interface ChamCongResponse {
  items: EmployeeChamCong[]
  total: number
}

export function useEmployeeChamCong(params?: { thang?: number; nam?: number }) {
  return useQuery({
    queryKey: [...employeeChamCongQueryKeys.all, params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.thang) searchParams.set("thang", params.thang.toString())
      if (params?.nam) searchParams.set("nam", params.nam.toString())
      const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
      return apiGateway.get<ChamCongResponse>(`/api/cham-cong/me${query}`)
    },
  })
}

export function useEmployeeChamCongThang(thang: number, nam: number) {
  return useQuery({
    queryKey: employeeChamCongQueryKeys.thang(thang, nam),
    queryFn: () => apiGateway.get<EmployeeChamCong>(`/api/cham-cong/me/${thang}/${nam}`),
    enabled: !!thang && !!nam,
  })
}
