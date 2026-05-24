import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { toastSuccess, toastError } from "@/lib/utils";
import { ApiEndpoints } from "@/types/api.types";
import { luongQueryKeys } from "./use-luong-query";
import type { 
  Luong, 
  KyLuong, 
  CauHinhLuong, 
  ChayLuongResult,
  LuongFormData,
  ChayLuongFormData 
} from "@/types/luong.types";

// Create Cau Hinh Luong
export function useCreateCauHinhLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CauHinhLuong>) => 
      apiGateway.post<CauHinhLuong>(ApiEndpoints.LUONG_CAU_HINH_CREATE, data),
    onSuccess: () => {
      toastSuccess("Tạo cấu hình lương thành công");
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.cauHinh.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Tạo cấu hình thất bại";
      toastError("Lỗi", message);
    },
  });
}

// Activate Cau Hinh Luong
export function useActivateCauHinhLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiGateway.put<CauHinhLuong>(ApiEndpoints.LUONG_CAU_HINH_ACTIVATE(id), {}),
    onSuccess: () => {
      toastSuccess("Đã kích hoạt cấu hình lương");
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.cauHinh.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Kích hoạt thất bại";
      toastError("Lỗi", message);
    },
  });
}

// Create Luong
export function useCreateLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LuongFormData) => 
      apiGateway.post<Luong>(ApiEndpoints.LUONG_CREATE, data),
    onSuccess: () => {
      toastSuccess("Tạo bảng lương thành công");
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.luong.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Tạo bảng lương thất bại";
      toastError("Lỗi", message);
    },
  });
}

// Chay Luong
export function useChayLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChayLuongFormData) => 
      apiGateway.post<ChayLuongResult>(ApiEndpoints.LUONG_CHAY, data),
    onSuccess: (data) => {
      toastSuccess(`Đã tính lương tháng ${data.thang}/${data.nam} cho ${data.tong_nhan_vien} nhân viên`);
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.kyLuong.all() });
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.traLuong.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Chạy lương thất bại";
      toastError("Lỗi", message);
    },
  });
}

// Duyet Ky Luong
export function useDuyetKyLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiGateway.put<KyLuong>(ApiEndpoints.KY_LUONG_DUYET(id), {}),
    onSuccess: () => {
      toastSuccess("Duyệt kỳ lương thành công");
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.kyLuong.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Duyệt kỳ lương thất bại";
      toastError("Lỗi", message);
    },
  });
}

// Chot Ky Luong
export function useChotKyLuong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiGateway.put<KyLuong>(ApiEndpoints.KY_LUONG_CHOT(id), {}),
    onSuccess: () => {
      toastSuccess("Chốt kỳ lương thành công");
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.kyLuong.all() });
      queryClient.invalidateQueries({ queryKey: luongQueryKeys.traLuong.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Chốt kỳ lương thất bại";
      toastError("Lỗi", message);
    },
  });
}
