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
  NHAN_VIEN_RESTORE: (id: string) => `/api/v1/nhan-vien/${id}/restore`,
  NHAN_VIEN_IMPORT: "/api/v1/nhan-vien/import",

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

  // Nghi Phep
  NGHI_PHEP_DON_LIST: "/api/v1/nghi-phep/don",
  NGHI_PHEP_DON_DETAIL: (id: string) => `/api/v1/nghi-phep/don/${id}`,
  NGHI_PHEP_DON_CREATE: "/api/v1/nghi-phep/don",
  NGHI_PHEP_DON_DUYET: (id: string) => `/api/v1/nghi-phep/don/${id}/duyet`,
  NGHI_PHEP_DON_TU_CHOI: (id: string) => `/api/v1/nghi-phep/don/${id}/tu-choi`,
  NGHI_PHEP_SO_NGAY_PHEP: (nhanVienId: string) => `/api/v1/nghi-phep/so-ngay-phep/${nhanVienId}`,
  NGHI_PHEP_CHAM_CONG_LIST: "/api/v1/nghi-phep/cham-cong/thang",
  NGHI_PHEP_CHAM_CONG_MOCK: "/api/v1/nghi-phep/cham-cong/mock/generate",

  // Upload
  UPLOAD_FILES: "/api/v1/upload/files",
  UPLOAD_TAI_LIEU_LIST: "/api/v1/upload/tai-lieu",
  UPLOAD_TAI_LIEU_DETAIL: (id: string) => `/api/v1/upload/tai-lieu/${id}`,
  UPLOAD_TAI_LIEU_BY_NHAN_VIEN: (nhanVienId: string) => `/api/v1/upload/tai-lieu/nhan-vien/${nhanVienId}`,

  // Sub-modules (Nguoi Than, Bang Cap, Khen Thuong Ky Luat)
  NGUOI_THAN_LIST: (nvId: string) => `/api/v1/nhan-vien/${nvId}/nguoi-than`,
  NGUOI_THAN_CREATE: (nvId: string) => `/api/v1/nhan-vien/${nvId}/nguoi-than`,
  NGUOI_THAN_UPDATE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/nguoi-than/${id}`,
  NGUOI_THAN_DELETE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/nguoi-than/${id}`,

  BANG_CAP_LIST: (nvId: string) => `/api/v1/nhan-vien/${nvId}/bang-cap`,
  BANG_CAP_CREATE: (nvId: string) => `/api/v1/nhan-vien/${nvId}/bang-cap`,
  BANG_CAP_UPDATE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/bang-cap/${id}`,
  BANG_CAP_DELETE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/bang-cap/${id}`,

  KHEN_THUONG_KY_LUAT_LIST: (nvId: string) => `/api/v1/nhan-vien/${nvId}/khen-thuong-ky-luat`,
  KHEN_THUONG_KY_LUAT_CREATE: (nvId: string) => `/api/v1/nhan-vien/${nvId}/khen-thuong-ky-luat`,
  KHEN_THUONG_KY_LUAT_UPDATE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/khen-thuong-ky-luat/${id}`,
  KHEN_THUONG_KY_LUAT_DELETE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/khen-thuong-ky-luat/${id}`,

  ADMIN_DASHBOARD: "/api/v1/thong-ke/dashboard",

  // CongTac
  CONG_TAC_LIST: (nvId: string) => `/api/v1/nhan-vien/${nvId}/cong-tac`,
  CONG_TAC_CURRENT: (nvId: string) => `/api/v1/nhan-vien/${nvId}/cong-tac/hien-tai`,
  CONG_TAC_CREATE: (nvId: string) => `/api/v1/nhan-vien/${nvId}/cong-tac`,
  CONG_TAC_END: (nvId: string, ctId: string) => `/api/v1/nhan-vien/${nvId}/cong-tac/${ctId}/ket-thuc`,

  // Lich Su Chuc Vu
  LICH_SU_CHUC_VU_LIST: "/api/v1/lich-su-chuc-vu",
  LICH_SU_CHUC_VU_CREATE: (nvId: string) => `/api/v1/lich-su-chuc-vu?nhan_vien_id=${nvId}`,

  // Hop Dong
  HOP_DONG_LIST: (nvId: string) => `/api/v1/nhan-vien/${nvId}/hop-dong`,
  HOP_DONG_DETAIL: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/hop-dong/${id}`,
  HOP_DONG_CREATE: (nvId: string) => `/api/v1/nhan-vien/${nvId}/hop-dong`,
  HOP_DONG_UPDATE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/hop-dong/${id}`,
  HOP_DONG_DELETE: (nvId: string, id: string) => `/api/v1/nhan-vien/${nvId}/hop-dong/${id}`,

  // Thong Ke / Bao Cao
  THONG_KE_BAO_CAO_TONG_QUAN: "/api/v1/thong-ke/bao-cao/tong-quan",
  THONG_KE_BAO_CAO_HOP_DONG_SAP_HET_HAN: "/api/v1/thong-ke/bao-cao/hop-dong/sap-het-han",
  THONG_KE_BAO_CAO_CHAM_CONG_DI_MUON: "/api/v1/thong-ke/bao-cao/cham-cong/di-muon",
  THONG_KE_BAO_CAO_LUONG_SO_SANH: "/api/v1/thong-ke/bao-cao/luong/so-sanh",
  THONG_KE_BAO_CAO_KHEN_THUONG: "/api/v1/thong-ke/bao-cao/khen-thuong",
  THONG_KE_BAO_CAO_XU_HUONG: "/api/v1/thong-ke/bao-cao/xu-huong",
  THONG_KE_BAO_CAO_EXPORT: "/api/v1/thong-ke/bao-cao/export",
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 30000,
} as const;
