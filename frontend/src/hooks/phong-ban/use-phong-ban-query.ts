import { useQuery } from "@tanstack/react-query";
import { apiGateway, axiosInstance } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { PhongBan } from "@/types/phong-ban.types";

export interface PhongBanFilterParams {
  search?: string;
  loai?: string;
  trang_thai?: boolean | string;
  sort_by?: string;
  sort_desc?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export const phongBanQueryKeys = {
  all: ["phong-ban"] as const,
  list: (params?: PhongBanFilterParams & { page?: number; page_size?: number }) =>
    [...phongBanQueryKeys.all, "list", params] as const,
  allList: () => [...phongBanQueryKeys.all, "all"] as const,
  detail: (id: string) => [...phongBanQueryKeys.all, "detail", id] as const,
} as const;

export function usePhongBanList(
  params: PhongBanFilterParams & { page?: number; page_size?: number } = {}
) {
  const { page = 1, page_size = 20, ...filters } = params;

  return useQuery({
    queryKey: phongBanQueryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("page_size", String(page_size));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });

      const response = await axiosInstance.get<{
        message: string;
        data: PhongBan[];
        metadata: PaginatedResponse<PhongBan>["metadata"];
      }>(`${ApiEndpoints.PHONG_BAN_LIST}?${searchParams.toString()}`);

      return {
        data: response.data.data,
        metadata: response.data.metadata,
      };
    },
  });
}

export function usePhongBanAll(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: phongBanQueryKeys.allList(),
    queryFn: async () => {
      const response = await axiosInstance.get<{
        message: string;
        data: PhongBan[];
        metadata: { total: number };
      }>(`${ApiEndpoints.PHONG_BAN_LIST}?page=1&page_size=100`);

      return response.data.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function usePhongBanDetail(id: string) {
  return useQuery({
    queryKey: phongBanQueryKeys.detail(id),
    queryFn: () => apiGateway.get<PhongBan>(ApiEndpoints.PHONG_BAN_DETAIL(id)),
    enabled: !!id,
  });
}
