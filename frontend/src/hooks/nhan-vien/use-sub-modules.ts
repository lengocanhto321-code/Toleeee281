import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import { toastSuccess, toastError } from "@/lib/utils";
import { nhanVienQueryKeys } from "./use-nhan-vien-query";
import type {
  NguoiThan,
  BangCap,
  KhenThuong,
  KyLuat,
} from "@/types/nhan-vien.types";

const subModuleKeys = {
  nguoiThan: (nvId: string) => [...nhanVienQueryKeys.detail(nvId), "nguoi-than"] as const,
  bangCap: (nvId: string) => [...nhanVienQueryKeys.detail(nvId), "bang-cap"] as const,
  khenThuongKyLuat: (nvId: string) => [...nhanVienQueryKeys.detail(nvId), "khen-thuong-ky-luat"] as const,
};

// ============ NGUOI THAN ============

export function useNguoiThanList(nhanVienId: string) {
  return useQuery({
    queryKey: subModuleKeys.nguoiThan(nhanVienId),
    queryFn: () => apiGateway.get<NguoiThan[]>(ApiEndpoints.NGUOI_THAN_LIST(nhanVienId)),
    enabled: !!nhanVienId,
  });
}

export function useCreateNguoiThan(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NguoiThan>) =>
      apiGateway.post<NguoiThan>(ApiEndpoints.NGUOI_THAN_CREATE(nhanVienId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.nguoiThan(nhanVienId) });
      toastSuccess("Thêm người thân thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Thêm thất bại");
    },
  });
}

export function useUpdateNguoiThan(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NguoiThan> }) =>
      apiGateway.put<NguoiThan>(ApiEndpoints.NGUOI_THAN_UPDATE(nhanVienId, id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.nguoiThan(nhanVienId) });
      toastSuccess("Cập nhật người thân thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Cập nhật thất bại");
    },
  });
}

export function useDeleteNguoiThan(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete(ApiEndpoints.NGUOI_THAN_DELETE(nhanVienId, id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.nguoiThan(nhanVienId) });
      toastSuccess("Xóa người thân thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Xóa thất bại");
    },
  });
}

// ============ BANG CAP ============

export function useBangCapList(nhanVienId: string) {
  return useQuery({
    queryKey: subModuleKeys.bangCap(nhanVienId),
    queryFn: () => apiGateway.get<BangCap[]>(ApiEndpoints.BANG_CAP_LIST(nhanVienId)),
    enabled: !!nhanVienId,
  });
}

export function useCreateBangCap(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BangCap>) =>
      apiGateway.post<BangCap>(ApiEndpoints.BANG_CAP_CREATE(nhanVienId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.bangCap(nhanVienId) });
      toastSuccess("Thêm bằng cấp thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Thêm thất bại");
    },
  });
}

export function useUpdateBangCap(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BangCap> }) =>
      apiGateway.put<BangCap>(ApiEndpoints.BANG_CAP_UPDATE(nhanVienId, id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.bangCap(nhanVienId) });
      toastSuccess("Cập nhật bằng cấp thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Cập nhật thất bại");
    },
  });
}

export function useDeleteBangCap(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete(ApiEndpoints.BANG_CAP_DELETE(nhanVienId, id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.bangCap(nhanVienId) });
      toastSuccess("Xóa bằng cấp thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Xóa thất bại");
    },
  });
}

// ============ KHEN THUONG / KY LUAT ============

export function useKhenThuongKyLuatList(nhanVienId: string, loai?: string) {
  return useQuery({
    queryKey: [...subModuleKeys.khenThuongKyLuat(nhanVienId), loai],
    queryFn: () => {
      const url = ApiEndpoints.KHEN_THUONG_KY_LUAT_LIST(nhanVienId);
      const params = loai ? `?loai=${loai}` : "";
      return apiGateway.get<(KhenThuong | KyLuat)[]>(url + params);
    },
    enabled: !!nhanVienId,
  });
}

export function useCreateKhenThuongKyLuat(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiGateway.post(ApiEndpoints.KHEN_THUONG_KY_LUAT_CREATE(nhanVienId), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.khenThuongKyLuat(nhanVienId) });
      toastSuccess("Thêm thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Thêm thất bại");
    },
  });
}

export function useDeleteKhenThuongKyLuat(nhanVienId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete(ApiEndpoints.KHEN_THUONG_KY_LUAT_DELETE(nhanVienId, id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subModuleKeys.khenThuongKyLuat(nhanVienId) });
      toastSuccess("Xóa thành công");
    },
    onError: (error: unknown) => {
      toastError("Lỗi", (error as { message?: string })?.message || "Xóa thất bại");
    },
  });
}
