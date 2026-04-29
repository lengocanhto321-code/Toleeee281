import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { LichSuChucVu } from "@/types/cong-tac.types";

export const lichSuChucVuQueryKeys = {
  all: ["lich-su-chuc-vu"] as const,
  list: (nhanVienId: string) => [...lichSuChucVuQueryKeys.all, "list", nhanVienId] as const,
};

export function useLichSuChucVuList(nhanVienId: string) {
  return useQuery({
    queryKey: lichSuChucVuQueryKeys.list(nhanVienId),
    queryFn: () => apiGateway.get<{ items: LichSuChucVu[] }>(
      ApiEndpoints.LICH_SU_CHUC_VU_LIST,
      { params: { nhan_vien_id: nhanVienId } }
    ),
    enabled: !!nhanVienId,
  });
}
