import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { PhongBan } from "@/types/phong-ban.types";

export const phongBanQueryKeys = {
  all: ["phong-ban"] as const,
  list: () => [...phongBanQueryKeys.all, "list"] as const,
  detail: (id: string) => [...phongBanQueryKeys.all, "detail", id] as const,
} as const;

export function usePhongBanList() {
  return useQuery({
    queryKey: phongBanQueryKeys.list(),
    queryFn: () => apiGateway.get<PhongBan[]>(ApiEndpoints.PHONG_BAN_LIST),
  });
}

export function usePhongBanDetail(id: string) {
  return useQuery({
    queryKey: phongBanQueryKeys.detail(id),
    queryFn: () => apiGateway.get<PhongBan>(ApiEndpoints.PHONG_BAN_DETAIL(id)),
    enabled: !!id,
  });
}
