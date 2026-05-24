/**
 * CRUD Operation Hooks with Toast
 * Hook chung cho các thao tác CRUD với toast notifications
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { toastSuccess, toastError } from "@/lib/utils";

/**
 * Options cho CRUD operation
 */
interface CrudOptions<T> {
  onSuccessMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook tạo mutation với toast
 */
export function useCreateMutation<TData, TVariables>(
  endpoint: string,
  options: CrudOptions<TData> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TVariables) => apiGateway.post<TData>(endpoint, data),
    onSuccess: (data) => {
      if (options.onSuccessMessage) {
        toastSuccess(options.onSuccessMessage);
      }
      options.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Thao tác thất bại";
      toastError("Lỗi", message);
      options.onError?.(error);
    },
  });
}

/**
 * Hook update mutation với toast
 */
export function useUpdateMutation<TData, TVariables>(
  endpointFn: (id: string) => string,
  options: CrudOptions<TData> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TVariables }) =>
      apiGateway.put<TData>(endpointFn(id), data),
    onSuccess: (data) => {
      if (options.onSuccessMessage) {
        toastSuccess(options.onSuccessMessage);
      }
      options.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Cập nhật thất bại";
      toastError("Lỗi", message);
      options.onError?.(error);
    },
  });
}

/**
 * Hook delete mutation với toast
 */
export function useDeleteMutation(
  endpointFn: (id: string) => string,
  options: CrudOptions<void> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiGateway.delete<void>(endpointFn(id)),
    onSuccess: () => {
      if (options.onSuccessMessage) {
        toastSuccess(options.onSuccessMessage);
      }
      options.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
      options.onError?.(error);
    },
  });
}

/**
 * Hook batch delete mutation với toast
 */
export function useBatchDeleteMutation(
  endpoint: string,
  options: CrudOptions<void> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => apiGateway.post<void>(endpoint, { ids }),
    onSuccess: () => {
      if (options.onSuccessMessage) {
        toastSuccess(options.onSuccessMessage);
      }
      options.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = (error as { message?: string })?.message || "Xóa thất bại";
      toastError("Lỗi", message);
      options.onError?.(error);
    },
  });
}
