import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastError, toastSuccess } from "@/lib/utils"
import { getTodayVN } from "@/lib/date-utils"

export const employeeAttendanceKeys = {
  all: ["employee-attendance"] as const,
  today: () => [...employeeAttendanceKeys.all, "today"] as const,
}

interface CheckInResponse {
  id: string
  thoi_gian: string
  trang_thai: string
  is_late: boolean
  message: string
}

interface CheckOutResponse {
  id: string
  thoi_gian: string
  trang_thai: string
  message: string
}

interface TodayRecord {
  id: string
  check_in_time: string | null
  check_out_time: string | null
  trang_thai: string
  check_in_status: string | null
}

interface HistoryResponse {
  data: TodayRecord[]
  total: number
}

export function useEmployeeTodayAttendance() {
  return useQuery({
    queryKey: employeeAttendanceKeys.today(),
    queryFn: async () => {
      const res = await apiGateway.get<HistoryResponse>(
        ApiEndpoints.EMPLOYEE_ATTENDANCE_HISTORY,
        { params: { page: 1, page_size: 1 } }
      )
      const today = getTodayVN()
      const record = res.data?.data?.[0]
      if (record && record.check_in_time?.startsWith(today)) {
        return record
      }
      return null
    },
    refetchOnWindowFocus: true,
  })
}

export function useEmployeeCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { qr_data: string; latitude?: number; longitude?: number; dms?: string }) => {
      return apiGateway.post<CheckInResponse>(ApiEndpoints.EMPLOYEE_CHECK_IN, data)
    },
    onSuccess: (res) => {
      toastSuccess("Check-in", res.message || "Check-in thành công")
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.today() })
    },
    onError: (err: any) => {
      toastError("Check-in thất bại", err?.response?.data?.detail?.message || "Lỗi không xác định")
    },
  })
}

export function useEmployeeCheckInByCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { ma_nhap: string; latitude?: number; longitude?: number; dms?: string }) => {
      return apiGateway.post<CheckInResponse>(ApiEndpoints.EMPLOYEE_CHECK_IN_BY_CODE, data)
    },
    onSuccess: (res) => {
      toastSuccess("Check-in", res.message || "Check-in thành công")
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.today() })
    },
    onError: (err: any) => {
      toastError("Check-in thất bại", err?.response?.data?.detail?.message || "Mã không hợp lệ")
    },
  })
}

export function useEmployeeCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data?: { latitude?: number; longitude?: number; dms?: string }) => {
      return apiGateway.post<CheckOutResponse>(ApiEndpoints.EMPLOYEE_CHECK_OUT, data || {})
    },
    onSuccess: (res) => {
      toastSuccess("Check-out", res.message || "Check-out thành công")
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.today() })
    },
    onError: (err: any) => {
      toastError("Check-out thất bại", err?.response?.data?.detail?.message || "Lỗi không xác định")
    },
  })
}
