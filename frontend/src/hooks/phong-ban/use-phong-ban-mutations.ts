import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import { toastSuccess, toastError } from "@/lib/utils";
import { phongBanQueryKeys } from "./use-phong-ban-query";
import type { PhongBan, PhongBanFormData } from "@/types/phong-ban.types";

export function useCreatePhongBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PhongBanFormData) =>
      apiGateway.post<PhongBan>(ApiEndpoints.PHONG_BAN_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phongBanQueryKeys.list() });
      toastSuccess("Thêm phòng ban thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thêm phòng ban thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useUpdatePhongBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PhongBanFormData }) =>
      apiGateway.put<PhongBan>(ApiEndpoints.PHONG_BAN_UPDATE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phongBanQueryKeys.all });
      toastSuccess("Cập nhật phòng ban thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Cập nhật thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDeletePhongBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiGateway.delete<void>(ApiEndpoints.PHONG_BAN_DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phongBanQueryKeys.list() });
      toastSuccess("Xóa phòng ban thành công");
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
    },
  });
}
