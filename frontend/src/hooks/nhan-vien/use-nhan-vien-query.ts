import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { NhanVien } from "@/types/nhan-vien.types";

export const nhanVienQueryKeys = {
  all: ["nhan-vien"] as const,
  list: () => [...nhanVienQueryKeys.all, "list"] as const,
  detail: (id: string) => [...nhanVienQueryKeys.all, "detail", id] as const,
} as const;

export function useNhanVienList() {
  return useQuery({
    queryKey: nhanVienQueryKeys.list(),
    queryFn: () => apiGateway.get<NhanVien[]>(ApiEndpoints.NHAN_VIEN_LIST),
  });
}

export function useNhanVienDetail(id: string) {
  return useQuery({
    queryKey: nhanVienQueryKeys.detail(id),
    queryFn: () => apiGateway.get<NhanVien>(ApiEndpoints.NHAN_VIEN_DETAIL(id)),
    enabled: !!id,
  });
}
