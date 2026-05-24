import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { ChucVu, ChucVuLoai } from "@/types/chuc-vu.types";

export const chucVuQueryKeys = {
  all: ["chuc-vu"] as const,
  list: (loai?: ChucVuLoai) => [...chucVuQueryKeys.all, "list", loai ?? "all"] as const,
  detail: (id: string) => [...chucVuQueryKeys.all, "detail", id] as const,
} as const;

export const LOAI_MAPPING = {
  giao_vien: "giao_vien" as ChucVuLoai,
  can_bo: "quan_ly" as ChucVuLoai,
  nhan_vien: "nhan_vien" as ChucVuLoai,
} as const;

export function useChucVuList(loai?: ChucVuLoai, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chucVuQueryKeys.list(loai),
    queryFn: async () => {
      const params = loai ? { loai, page_size: 100 } : { page_size: 100 };
      const result = await apiGateway.get<ChucVu[]>(ApiEndpoints.CHUC_VU_LIST, { params });
      return result ?? [];
    },
    enabled: options?.enabled ?? true,
  });
}

export function useChucVuDetail(id: string) {
  return useQuery({
    queryKey: chucVuQueryKeys.detail(id),
    queryFn: () => apiGateway.get<ChucVu>(ApiEndpoints.CHUC_VU_DETAIL(id)),
    enabled: !!id,
  });
}
