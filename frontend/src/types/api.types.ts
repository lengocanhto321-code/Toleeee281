/**
 * API Gateway Types
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export const ApiEndpoints = {
  // Auth - không có prefix /auth trong backend
  AUTH_LOGIN: "/api/v1/login",
  AUTH_LOGOUT: "/api/v1/logout",
  AUTH_REFRESH: "/api/v1/refresh",
  AUTH_ME: "/api/v1/me",

  // Nhan Vien
  NHAN_VIEN_LIST: "/api/v1/nhan-vien",
  NHAN_VIEN_DETAIL: (id: string) => `/api/v1/nhan-vien/${id}`,
  NHAN_VIEN_CREATE: "/api/v1/nhan-vien",
  NHAN_VIEN_UPDATE: (id: string) => `/api/v1/nhan-vien/${id}`,
  NHAN_VIEN_DELETE: (id: string) => `/api/v1/nhan-vien/${id}`,

  // Phong Ban
  PHONG_BAN_LIST: "/api/v1/phong-ban",
  PHONG_BAN_DETAIL: (id: string) => `/api/v1/phong-ban/${id}`,
  PHONG_BAN_CREATE: "/api/v1/phong-ban",
  PHONG_BAN_UPDATE: (id: string) => `/api/v1/phong-ban/${id}`,
  PHONG_BAN_DELETE: (id: string) => `/api/v1/phong-ban/${id}`,

  // Chuc Vu
  CHUC_VU_LIST: "/api/v1/chuc-vu",
  CHUC_VU_DETAIL: (id: string) => `/api/v1/chuc-vu/${id}`,
  CHUC_VU_CREATE: "/api/v1/chuc-vu",
  CHUC_VU_UPDATE: (id: string) => `/api/v1/chuc-vu/${id}`,
  CHUC_VU_DELETE: (id: string) => `/api/v1/chuc-vu/${id}`,

  // Luong
  LUONG_CAU_HINH_LIST: "/api/v1/luong/cau-hinh",
  LUONG_CAU_HINH_CREATE: "/api/v1/luong/cau-hinh",
  LUONG_LIST: "/api/v1/luong",
  LUONG_CREATE: "/api/v1/luong",
  LUONG_HIEN_TAI: (nhanVienId: string) => `/api/v1/luong/${nhanVienId}/hien-tai`,
  LUONG_PREVIEW: "/api/v1/luong/preview",
  LUONG_CHAY: "/api/v1/luong/chay-luong",
  KY_LUONG_LIST: "/api/v1/luong/ky-luong",
  KY_LUONG_DUYET: (id: string) => `/api/v1/luong/ky-luong/${id}/duyet`,
  KY_LUONG_CHOT: (id: string) => `/api/v1/luong/ky-luong/${id}/chot`,
  TRA_LUONG_BY_KY: (kyLuongId: string) => `/api/v1/luong/ky-luong/${kyLuongId}/tra-luong`,
  TRA_LUONG_DETAIL: (id: string) => `/api/v1/luong/tra-luong/${id}`,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 30000,
} as const;
