import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { CongTac } from "@/types/cong-tac.types";

export const congTacQueryKeys = {
  all: ["cong-tac"] as const,
  list: (nhanVienId: string) => [...congTacQueryKeys.all, "list", nhanVienId] as const,
  current: (nhanVienId: string) => [...congTacQueryKeys.all, "current", nhanVienId] as const,
} as const;

export function useCongTacList(nhanVienId: string) {
  return useQuery({
    queryKey: congTacQueryKeys.list(nhanVienId),
    queryFn: () => apiGateway.get<{ items: CongTac[] }>(ApiEndpoints.CONG_TAC_LIST(nhanVienId)),
    enabled: !!nhanVienId,
  });
}

export function useCongTacCurrent(nhanVienId: string) {
  return useQuery({
    queryKey: congTacQueryKeys.current(nhanVienId),
    queryFn: () => apiGateway.get<CongTac | null>(ApiEndpoints.CONG_TAC_CURRENT(nhanVienId)),
    enabled: !!nhanVienId,
  });
}
