import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { toastSuccess, toastError } from "@/lib/utils"

export function useDuyetCap1() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ghi_chu }: { id: string; ghi_chu?: string }) => {
      return apiGateway.put<any>(`/api/v1/nghi-phep/don/${id}/duyet-cap-1`, {
        ghi_chu,
      })
    },
    onSuccess: () => {
      toastSuccess("Duyệt cấp 1 thành công")
      queryClient.invalidateQueries({ queryKey: ["don-nghi"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Duyệt cấp 1 thất bại")
    },
  })
}

export function useDuyetCap2() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ghi_chu }: { id: string; ghi_chu?: string }) => {
      return apiGateway.put<any>(`/api/v1/nghi-phep/don/${id}/duyet-cap-2`, {
        ghi_chu,
      })
    },
    onSuccess: () => {
      toastSuccess("Duyệt cấp 2 thành công")
      queryClient.invalidateQueries({ queryKey: ["don-nghi"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Duyệt cấp 2 thất bại")
    },
  })
}

export function useTuChoiDon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ghi_chu }: { id: string; ghi_chu: string }) => {
      return apiGateway.put<any>(`/api/v1/admin/nghi-phep/don/${id}/tu-choi`, {
        ly_do: ghi_chu,
      })
    },
    onSuccess: () => {
      toastSuccess("Từ chối đơn thành công")
      queryClient.invalidateQueries({ queryKey: ["nghi-phep"] })
    },
    onError: (error: any) => {
      toastError("Lỗi", error.response?.data?.message || "Từ chối thất bại")
    },
  })
}

export function useChamCongUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: {
        so_ngay_co_mat?: number
        so_ngay_vang_co_phep?: number
        so_ngay_vang_khong_phep?: number
        so_ngay_nghi_le_tet?: number
        so_ngay_cong_tac?: number
        ghi_chu?: string
      }
    }) => {
      return apiGateway.put<any>(`/api/v1/nghi-phep/cham-cong/thang/${id}`, data)
    },
    onSuccess: () => {
      toastSuccess("Cập nhật chấm công thành công")
      queryClient.invalidateQueries({ queryKey: ["cham-cong"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Cập nhật thất bại")
    },
  })
}

export function useChamCongXacNhan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return apiGateway.post<any>(`/api/v1/nghi-phep/cham-cong/thang/${id}/xac-nhan`)
    },
    onSuccess: () => {
      toastSuccess("Xác nhận chấm công thành công")
      queryClient.invalidateQueries({ queryKey: ["cham-cong"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Xác nhận thất bại")
    },
  })
}

export function useChamCongDuyet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return apiGateway.post<any>(`/api/v1/nghi-phep/cham-cong/thang/${id}/duyet`)
    },
    onSuccess: () => {
      toastSuccess("Duyệt chấm công thành công")
      queryClient.invalidateQueries({ queryKey: ["cham-cong"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Duyệt thất bại")
    },
  })
}

export function useChamCongChot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return apiGateway.post<any>(`/api/v1/nghi-phep/cham-cong/thang/${id}/chot`)
    },
    onSuccess: () => {
      toastSuccess("Chốt chấm công thành công")
      queryClient.invalidateQueries({ queryKey: ["cham-cong"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Chốt thất bại")
    },
  })
}

export function useCauHinhNghiPhep() {
  return useQuery({
    queryKey: ["cau-hinh-nghi-phep"],
    queryFn: async () => {
      const res = await apiGateway.get<any>("/api/v1/nghi-phep/cau-hinh")
      return res.data.data
    },
  })
}

export function useCreateCauHinhNghiPhep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      loai_nghi: string
      ten_loai: string
      so_ngay_moi_nam: number
      so_ngay_toi_da_mot_lan?: number
      can_giay_to?: boolean
      bat_buoc_ghi_ly_do?: boolean
    }) => {
      return apiGateway.post<any>("/api/v1/nghi-phep/cau-hinh", data)
    },
    onSuccess: () => {
      toastSuccess("Tạo cấu hình thành công")
      queryClient.invalidateQueries({ queryKey: ["cau-hinh-nghi-phep"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Tạo thất bại")
    },
  })
}

export function useUpdateCauHinhNghiPhep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: {
        ten_loai?: string
        so_ngay_moi_nam?: number
        so_ngay_toi_da_mot_lan?: number
        can_giay_to?: boolean
        bat_buoc_ghi_ly_do?: boolean
        trang_thai?: boolean
        ghi_chu?: string
      }
    }) => {
      return apiGateway.put<any>(`/api/v1/nghi-phep/cau-hinh/${id}`, data)
    },
    onSuccess: () => {
      toastSuccess("Cập nhật cấu hình thành công")
      queryClient.invalidateQueries({ queryKey: ["cau-hinh-nghi-phep"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Cập nhật thất bại")
    },
  })
}

export function useInitAnnualLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nam: number) => {
      return apiGateway.post<any>("/api/v1/nghi-phep/cau-hinh/init-annual", { nam })
    },
    onSuccess: (data: any) => {
      toastSuccess(`Khởi tạo thành công: ${data.data.created}NV, bỏ qua: ${data.data.skipped}NV`)
      queryClient.invalidateQueries({ queryKey: ["so-ngay-phep"] })
    },
    onError: (error: any) => {
      toastError(error.response?.data?.message || "Khởi tạo thất bại")
    },
  })
}

export function useGetMyQR() {
  return useQuery({
    queryKey: ["my-qr"],
    queryFn: async () => {
      const res = await apiGateway.get<any>("/api/v1/nhan-vien/cham-cong/my-qr")
      return res.data.data
    },
  })
}
