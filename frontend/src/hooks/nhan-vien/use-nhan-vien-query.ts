import { useQuery } from "@tanstack/react-query";
import { apiGateway, axiosInstance } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { NhanVien } from "@/types/nhan-vien.types";

export interface NhanVienFilterParams {
  search?: string;
  trang_thai?: string;
  loai_nhan_vien?: string;
  gioi_tinh?: string;
  cap_hoc?: string;
  phong_ban_id?: string;
  loai_hop_dong?: string;
  hang_chuc_danh?: string;
  ngay_vao_lam_tu?: string;
  ngay_vao_lam_den?: string;
  ngay_sinh_tu?: string;
  ngay_sinh_den?: string;
  he_so_luong_tu?: number;
  he_so_luong_den?: number;
  la_dang_vien?: boolean;
  la_doan_vien?: boolean;
  co_bhxh?: boolean;
  co_ngan_hang?: boolean;
  sort_by?: string;
  sort_desc?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export const nhanVienQueryKeys = {
  all: ["nhan-vien"] as const,
  list: (params?: NhanVienFilterParams & { page?: number; page_size?: number }) =>
    [...nhanVienQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...nhanVienQueryKeys.all, "detail", id] as const,
} as const;

export function useNhanVienList(
  params: NhanVienFilterParams & { page?: number; page_size?: number } = {}
) {
  const { page = 1, page_size = 20, ...filters } = params;

  return useQuery({
    queryKey: nhanVienQueryKeys.list(params),
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
        data: NhanVien[];
        metadata: PaginatedResponse<NhanVien>["metadata"];
      }>(`${ApiEndpoints.NHAN_VIEN_LIST}?${searchParams.toString()}`);

      return {
        data: response.data.data,
        metadata: response.data.metadata,
      };
    },
  });
}

export function useNhanVienDetail(id: string) {
  return useQuery({
    queryKey: nhanVienQueryKeys.detail(id),
    queryFn: () => apiGateway.get<NhanVien>(ApiEndpoints.NHAN_VIEN_DETAIL(id)),
    enabled: !!id,
  });
}

export function useDieuChuyenTuyChon(id: string) {
  return useQuery({
    queryKey: [...nhanVienQueryKeys.detail(id), "dieu-chuyen-tuy-chon"],
    queryFn: async () => {
      const response = await apiGateway.get<{
        data: import("./use-nhan-vien-mutations").TransferOptions;
      }>(ApiEndpoints.NHAN_VIEN_DIEU_CHUYEN_TUY_CHON(id));
      return response.data;
    },
    enabled: !!id,
  });
}

export function useDieuChuyenLichSu(id: string) {
  return useQuery({
    queryKey: [...nhanVienQueryKeys.detail(id), "dieu-chuyen-lich-su"],
    queryFn: async () => {
      const response = await apiGateway.get<{
        data: { items: unknown[] };
      }>(ApiEndpoints.NHAN_VIEN_DIEU_CHUYEN_LICH_SU(id));
      return response.data;
    },
    enabled: !!id,
  });
}
