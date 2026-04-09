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
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 30000,
} as const;
