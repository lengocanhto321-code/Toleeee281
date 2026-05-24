import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import type { EmployeeDashboard } from "@/types/employee.types"

export const employeeQueryKeys = {
  all: ["employee"] as const,
  dashboard: () => [...employeeQueryKeys.all, "dashboard"] as const,
}

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: employeeQueryKeys.dashboard(),
    queryFn: () => apiGateway.get<EmployeeDashboard>("/api/v1/nhan-vien/dashboard"),
  })
}
