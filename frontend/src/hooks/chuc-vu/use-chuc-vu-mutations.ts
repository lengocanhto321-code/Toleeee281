import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import { toastSuccess, toastError } from "@/lib/utils";
import { chucVuQueryKeys } from "./use-chuc-vu-query";
import type { ChucVu, ChucVuFormData } from "@/types/chuc-vu.types";

export function useCreateChucVu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChucVuFormData) =>
      apiGateway.post<ChucVu>(ApiEndpoints.CHUC_VU_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chucVuQueryKeys.list() });
      toastSuccess("Thêm chức vụ thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thêm chức vụ thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useUpdateChucVu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChucVuFormData }) =>
      apiGateway.put<ChucVu>(ApiEndpoints.CHUC_VU_UPDATE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chucVuQueryKeys.all });
      toastSuccess("Cập nhật chức vụ thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Cập nhật thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDeleteChucVu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete<void>(ApiEndpoints.CHUC_VU_DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chucVuQueryKeys.list() });
      toastSuccess("Xóa chức vụ thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
    },
  });
}
