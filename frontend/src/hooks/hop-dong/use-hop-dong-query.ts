import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { HopDong, HopDongFormData } from "@/types/hop-dong.types";

export const hopDongQueryKeys = {
  all: ["hop-dong"] as const,
  list: (nhanVienId: string) => [...hopDongQueryKeys.all, "list", nhanVienId] as const,
  detail: (nhanVienId: string, id: string) => [...hopDongQueryKeys.all, "detail", nhanVienId, id] as const,
};

export function useHopDongList(nhanVienId: string) {
  return useQuery({
    queryKey: hopDongQueryKeys.list(nhanVienId),
    queryFn: () => apiGateway.get<HopDong[]>(ApiEndpoints.HOP_DONG_LIST(nhanVienId)),
    enabled: !!nhanVienId,
  });
}

export function useHopDongDetail(nhanVienId: string, hopDongId: string) {
  return useQuery({
    queryKey: hopDongQueryKeys.detail(nhanVienId, hopDongId),
    queryFn: () => apiGateway.get<HopDong>(ApiEndpoints.HOP_DONG_DETAIL(nhanVienId, hopDongId)),
    enabled: !!nhanVienId && !!hopDongId,
  });
}

export function useCreateHopDong(nhanVienId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HopDongFormData) =>
      apiGateway.post(ApiEndpoints.HOP_DONG_CREATE(nhanVienId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hopDongQueryKeys.list(nhanVienId) });
    },
  });
}

export function useUpdateHopDong(nhanVienId: string, hopDongId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HopDongFormData>) =>
      apiGateway.put(ApiEndpoints.HOP_DONG_UPDATE(nhanVienId, hopDongId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hopDongQueryKeys.list(nhanVienId) });
      queryClient.invalidateQueries({ queryKey: hopDongQueryKeys.detail(nhanVienId, hopDongId) });
    },
  });
}

export function useDeleteHopDong(nhanVienId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hopDongId: string) =>
      apiGateway.delete(ApiEndpoints.HOP_DONG_DELETE(nhanVienId, hopDongId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hopDongQueryKeys.list(nhanVienId) });
    },
  });
}
