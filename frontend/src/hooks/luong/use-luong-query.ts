import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { 
  Luong, 
  KyLuong, 
  TraLuong, 
  CauHinhLuong,
  PreviewLuong,
  ChayLuongResult 
} from "@/types/luong.types";

export const luongQueryKeys = {
  all: ["luong"] as const,
  cauHinh: {
    all: () => [...luongQueryKeys.all, "cau-hinh"] as const,
    list: () => [...luongQueryKeys.cauHinh.all(), "list"] as const,
  },
  luong: {
    all: () => [...luongQueryKeys.all, "luong"] as const,
    list: () => [...luongQueryKeys.luong.all(), "list"] as const,
    hienTai: (nhanVienId: string) => [...luongQueryKeys.luong.all(), "hien-tai", nhanVienId] as const,
  },
  kyLuong: {
    all: () => [...luongQueryKeys.all, "ky-luong"] as const,
    list: () => [...luongQueryKeys.kyLuong.all(), "list"] as const,
    detail: (id: string) => [...luongQueryKeys.kyLuong.all(), "detail", id] as const,
  },
  traLuong: {
    all: () => [...luongQueryKeys.all, "tra-luong"] as const,
    byKyLuong: (kyLuongId: string) => [...luongQueryKeys.traLuong.all(), "by-ky-luong", kyLuongId] as const,
    detail: (id: string) => [...luongQueryKeys.traLuong.all(), "detail", id] as const,
  },
} as const;

// Cau Hinh Luong
export function useCauHinhLuongList(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...luongQueryKeys.cauHinh.list(), params],
    queryFn: () => apiGateway.get<{ data: CauHinhLuong[]; metadata: { total: number; page: number; per_page: number; total_pages: number } }>(
      ApiEndpoints.LUONG_CAU_HINH_LIST,
      { params: params ? {
        page: params.page,
        page_size: params.page_size,
      } : undefined }
    ),
  });
}

// Luong
export function useLuongList(params?: { page?: number; page_size?: number; nhan_vien_id?: string }) {
  return useQuery({
    queryKey: [...luongQueryKeys.luong.list(), params],
    queryFn: () => apiGateway.get<{ data: Luong[]; metadata: { total: number; page: number; per_page: number; total_pages: number } }>(
      ApiEndpoints.LUONG_LIST,
      { params }
    ),
  });
}

export function useLuongHienTai(nhanVienId: string) {
  return useQuery({
    queryKey: luongQueryKeys.luong.hienTai(nhanVienId),
    queryFn: () => apiGateway.get<Luong>(ApiEndpoints.LUONG_HIEN_TAI(nhanVienId)),
    enabled: !!nhanVienId,
  });
}

// Ky Luong
export function useKyLuongList(params?: { page?: number; page_size?: number; thang?: number; nam?: number; trang_thai?: string }) {
  return useQuery({
    queryKey: [...luongQueryKeys.kyLuong.list(), params],
    queryFn: () => apiGateway.get<{ data: KyLuong[]; metadata: { total: number; page: number; per_page: number; total_pages: number } }>(
      ApiEndpoints.KY_LUONG_LIST,
      { params }
    ),
  });
}

export function useKyLuongDetail(id: string) {
  return useQuery({
    queryKey: luongQueryKeys.kyLuong.detail(id),
    queryFn: () => apiGateway.get<KyLuong>(`${ApiEndpoints.KY_LUONG_LIST}/${id}`),
    enabled: !!id,
  });
}

// Tra Luong
export function useTraLuongByKyLuong(kyLuongId: string, params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: [...luongQueryKeys.traLuong.byKyLuong(kyLuongId), params],
    queryFn: () => apiGateway.get<{ data: TraLuong[]; metadata: { total: number; page: number; per_page: number; total_pages: number } }>(
      ApiEndpoints.TRA_LUONG_BY_KY(kyLuongId),
      { params: params ? {
        page: params.page,
        page_size: params.page_size,
      } : undefined }
    ),
    enabled: !!kyLuongId,
  });
}

export function useTraLuongDetail(id: string) {
  return useQuery({
    queryKey: luongQueryKeys.traLuong.detail(id),
    queryFn: () => apiGateway.get<TraLuong>(ApiEndpoints.TRA_LUONG_DETAIL(id)),
    enabled: !!id,
  });
}

// Preview Luong
export function usePreviewLuong(nhanVienId: string, thang: number, nam: number) {
  return useQuery({
    queryKey: [...luongQueryKeys.all, "preview", nhanVienId, thang, nam] as const,
    queryFn: () => apiGateway.post<PreviewLuong>(ApiEndpoints.LUONG_PREVIEW, {
      nhan_vien_id: nhanVienId,
      thang,
      nam,
    }),
    enabled: !!nhanVienId && !!thang && !!nam,
  });
}
