/**
 * TanStack Query Hooks cho Nghỉ phép
 */

import { useQuery } from "@tanstack/react-query";
import { apiGateway, axiosInstance } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type {
  DonXinNghi,
  SoNgayPhep,
  ChamCongThang,
  DonXinNghiListResponse,
  ChamCongThangListResponse,
  DonXinNghiParams,
  ChamCongThangParams,
} from "@/types/nghi-phep.types";

export const nghiPhepQueryKeys = {
  all: ["nghi-phep"] as const,
  don: {
    all: () => [...nghiPhepQueryKeys.all, "don"] as const,
    list: (params?: DonXinNghiParams) => [...nghiPhepQueryKeys.don.all(), "list", params] as const,
    detail: (id: string) => [...nghiPhepQueryKeys.don.all(), "detail", id] as const,
  },
  soNgayPhep: {
    all: () => [...nghiPhepQueryKeys.all, "so-ngay-phep"] as const,
    byNhanVien: (nhanVienId: string, nam?: number) => 
      [...nghiPhepQueryKeys.soNgayPhep.all(), nhanVienId, nam] as const,
  },
  chamCong: {
    all: () => [...nghiPhepQueryKeys.all, "cham-cong"] as const,
    list: (params?: ChamCongThangParams) => [...nghiPhepQueryKeys.chamCong.all(), "list", params] as const,
    detail: (id: string) => [...nghiPhepQueryKeys.chamCong.all(), "detail", id] as const,
  },
} as const;

// Don Xin Nghi Queries
export function useDonXinNghiList(params?: DonXinNghiParams) {
  return useQuery({
    queryKey: nghiPhepQueryKeys.don.list(params),
    queryFn: async (): Promise<DonXinNghiListResponse> => {
      const res = await axiosInstance.get(ApiEndpoints.NGHI_PHEP_DON_LIST, {
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
          nhan_vien_id: params?.nhan_vien_id,
          trang_thai: params?.trang_thai !== "all" ? params?.trang_thai : undefined,
          loai_nghi: params?.loai_nghi !== "all" ? params?.loai_nghi : undefined,
        },
      })
      const body = res.data
      return {
        data: body.data ?? [],
        metadata: body.metadata ?? { total: 0, page: 1, per_page: 20, total_pages: 0 },
      }
    },
  });
}

export function useDonXinNghiDetail(id: string) {
  return useQuery({
    queryKey: nghiPhepQueryKeys.don.detail(id),
    queryFn: () => apiGateway.get<DonXinNghi>(ApiEndpoints.NGHI_PHEP_DON_DETAIL(id)),
    enabled: !!id,
  });
}

// So Ngay Phep Queries
export function useSoNgayPhep(nhanVienId: string, nam?: number) {
  return useQuery({
    queryKey: nghiPhepQueryKeys.soNgayPhep.byNhanVien(nhanVienId, nam),
    queryFn: () => {
      const query = nam ? `?nam=${nam}` : "";
      return apiGateway.get<SoNgayPhep>(`${ApiEndpoints.NGHI_PHEP_SO_NGAY_PHEP(nhanVienId)}${query}`);
    },
    enabled: !!nhanVienId,
  });
}

// Cham Cong Thang Queries
export function useChamCongThangList(params?: ChamCongThangParams) {
  return useQuery({
    queryKey: nghiPhepQueryKeys.chamCong.list(params),
    queryFn: () => apiGateway.get<ChamCongThangListResponse>(ApiEndpoints.NGHI_PHEP_CHAM_CONG_LIST, {
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
        nhan_vien_id: params?.nhan_vien_id,
        thang: params?.thang,
        nam: params?.nam,
      },
    }),
  });
}

export function useChamCongThangDetail(id: string) {
  return useQuery({
    queryKey: nghiPhepQueryKeys.chamCong.detail(id),
    queryFn: () => apiGateway.get<ChamCongThang>(`${ApiEndpoints.NGHI_PHEP_CHAM_CONG_LIST}/${id}`),
    enabled: !!id,
  });
}
