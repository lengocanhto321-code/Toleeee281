import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { TaiLieuNhanVien, UploadResponse } from "@/types/nhan-vien.types";

export const taiLieuQueryKeys = {
  all: ["tai-lieu"] as const,
  list: (filters?: Record<string, string | number | undefined>) => [...taiLieuQueryKeys.all, "list", filters] as const,
  byNhanVien: (nhanVienId: string) => [...taiLieuQueryKeys.all, "nhan-vien", nhanVienId] as const,
  detail: (id: string) => [...taiLieuQueryKeys.all, "detail", id] as const,
} as const;

export function useTaiLieuList(filters?: {
  page?: number | string;
  page_size?: number | string;
  nhan_vien_id?: string;
  loai_tai_lieu?: string;
  trang_thai?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.page_size) params.set("page_size", String(filters.page_size));
  if (filters?.nhan_vien_id) params.set("nhan_vien_id", filters.nhan_vien_id);
  if (filters?.loai_tai_lieu) params.set("loai_tai_lieu", filters.loai_tai_lieu);
  if (filters?.trang_thai) params.set("trang_thai", filters.trang_thai);
  if (filters?.search) params.set("search", filters.search);

  const queryString = params.toString();
  const endpoint = queryString
    ? `${ApiEndpoints.UPLOAD_TAI_LIEU_LIST}?${queryString}`
    : ApiEndpoints.UPLOAD_TAI_LIEU_LIST;

  return useQuery({
    queryKey: taiLieuQueryKeys.list(filters),
    queryFn: () => apiGateway.get<{ data: TaiLieuNhanVien[]; metadata: { total: number } }>(endpoint),
  });
}

export function useTaiLieuByNhanVien(nhanVienId: string, loaiTaiLieu?: string) {
  const params = new URLSearchParams();
  if (loaiTaiLieu) params.set("loai_tai_lieu", loaiTaiLieu);
  const queryString = params.toString();
  const endpoint = `${ApiEndpoints.UPLOAD_TAI_LIEU_BY_NHAN_VIEN(nhanVienId)}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [...taiLieuQueryKeys.byNhanVien(nhanVienId), loaiTaiLieu],
    queryFn: () => apiGateway.get<{ data: TaiLieuNhanVien[] }>(endpoint),
    enabled: !!nhanVienId,
  });
}

export function useUploadTaiLieu() {
  return useMutation({
    mutationFn: async (data: {
      file: File;
      nhan_vien_id: string;
      loai_tai_lieu: string;
      ten_tai_lieu: string;
      ho_ten: string;
      mo_ta?: string;
      ngay_het_han?: string;
      la_ban_chinh?: boolean;
    }): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("nhan_vien_id", data.nhan_vien_id);
      formData.append("loai_tai_lieu", data.loai_tai_lieu);
      formData.append("ten_tai_lieu", data.ten_tai_lieu);
      formData.append("ho_ten", data.ho_ten);
      if (data.mo_ta) formData.append("mo_ta", data.mo_ta);
      if (data.ngay_het_han) formData.append("ngay_het_han", data.ngay_het_han);
      if (data.la_ban_chinh !== undefined) formData.append("la_ban_chinh", String(data.la_ban_chinh));

      const response = await apiGateway.post<UploadResponse>(
        ApiEndpoints.UPLOAD_FILES,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    },
  });
}
