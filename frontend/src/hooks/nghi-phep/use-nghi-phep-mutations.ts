/**
 * TanStack Query Mutations cho Nghỉ phép
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { toastSuccess, toastError } from "@/lib/utils";
import { ApiEndpoints } from "@/types/api.types";
import { nghiPhepQueryKeys } from "./use-nghi-phep-query";
import type {
  DonXinNghi,
  CreateDonXinNghiData,
  MockGenerateChamCongData,
} from "@/types/nghi-phep.types";

export function useCreateDonXinNghi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDonXinNghiData) =>
      apiGateway.post<DonXinNghi>(ApiEndpoints.NGHI_PHEP_DON_CREATE, data),
    onSuccess: () => {
      toastSuccess("Tạo đơn nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: nghiPhepQueryKeys.don.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Tạo đơn nghỉ phép thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useDuyetDonXinNghi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donId: string) =>
      apiGateway.put<DonXinNghi>(ApiEndpoints.NGHI_PHEP_DON_DUYET(donId), {}),
    onSuccess: () => {
      toastSuccess("Duyệt đơn nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: nghiPhepQueryKeys.don.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Duyệt đơn thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useTuChoiDonXinNghi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ donId, lyDo }: { donId: string; lyDo: string }) =>
      apiGateway.put<DonXinNghi>(ApiEndpoints.NGHI_PHEP_DON_TU_CHOI(donId), { ly_do: lyDo }),
    onSuccess: () => {
      toastSuccess("Từ chối đơn nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: nghiPhepQueryKeys.don.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Từ chối đơn thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useHuyDonXinNghi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donId: string) =>
      apiGateway.delete<void>(ApiEndpoints.NGHI_PHEP_DON_DETAIL(donId)),
    onSuccess: () => {
      toastSuccess("Hủy đơn nghỉ phép thành công");
      queryClient.invalidateQueries({ queryKey: nghiPhepQueryKeys.don.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Hủy đơn thất bại";
      toastError("Lỗi", message);
    },
  });
}

export function useMockGenerateChamCong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MockGenerateChamCongData) =>
      apiGateway.post<{ message: string; count: number }>(ApiEndpoints.NGHI_PHEP_CHAM_CONG_MOCK, data),
    onSuccess: (data) => {
      toastSuccess(`Đã tạo chấm công cho ${data.count} nhân viên`);
      queryClient.invalidateQueries({ queryKey: nghiPhepQueryKeys.chamCong.all() });
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Tạo chấm công thất bại";
      toastError("Lỗi", message);
    },
  });
}
