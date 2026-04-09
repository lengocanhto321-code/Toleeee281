import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { ChucVu } from "@/types/chuc-vu.types";

export const chucVuQueryKeys = {
  all: ["chuc-vu"] as const,
  list: () => [...chucVuQueryKeys.all, "list"] as const,
  detail: (id: string) => [...chucVuQueryKeys.all, "detail", id] as const,
} as const;

export function useChucVuList() {
  return useQuery({
    queryKey: chucVuQueryKeys.list(),
    queryFn: () => apiGateway.get<ChucVu[]>(ApiEndpoints.CHUC_VU_LIST),
  });
}

export function useChucVuDetail(id: string) {
  return useQuery({
    queryKey: chucVuQueryKeys.detail(id),
    queryFn: () => apiGateway.get<ChucVu>(ApiEndpoints.CHUC_VU_DETAIL(id)),
    enabled: !!id,
  });
}
