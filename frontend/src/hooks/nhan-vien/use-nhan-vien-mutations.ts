import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import { toastSuccess, toastError } from "@/lib/utils";
import { nhanVienQueryKeys } from "./use-nhan-vien-query";
import type { NhanVien } from "@/types/nhan-vien.types";

export function useCreateNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NhanVien) =>
      apiGateway.post<NhanVien>(ApiEndpoints.NHAN_VIEN_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.list() });
      toastSuccess("Thêm nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thêm nhân viên thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useUpdateNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NhanVien> }) =>
      apiGateway.put<NhanVien>(ApiEndpoints.NHAN_VIEN_UPDATE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Cập nhật nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Cập nhật thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDeleteNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete<void>(ApiEndpoints.NHAN_VIEN_DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.list() });
      toastSuccess("Xóa nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useRestoreNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.post<NhanVien>(ApiEndpoints.NHAN_VIEN_RESTORE(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      toastSuccess("Khôi phục nhân viên thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Khôi phục thất bại";
      toastError("Lỗi", message);
    },
  });
}

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: { row: number; ho_ten: string; error: string }[]
}

export function useImportNhanVien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: Record<string, unknown>[]) =>
      apiGateway.post<ImportResult>(ApiEndpoints.NHAN_VIEN_IMPORT, { rows }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: nhanVienQueryKeys.all });
      if (result.failed === 0) {
        toastSuccess(`Import thành công ${result.success} nhân viên`);
      } else {
        toastSuccess(`Import: ${result.success} thành công, ${result.failed} thất bại`);
      }
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Import thất bại";
      toastError("Lỗi", message);
    },
  });
}
