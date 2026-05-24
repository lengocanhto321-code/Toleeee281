/**
 * Bao Cao Hooks - HR Reporting System
 * 
 * Provides React Query hooks for consuming backend Bao Cao APIs.
 * Following existing hook patterns in the codebase.
 */

import { useQuery } from "@tanstack/react-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import type {
  BaoCaoFilters,
  BaoCaoTongQuanData,
  BaoCaoHopDongData,
  BaoCaoDiMuonData,
  BaoCaoLuongData,
  BaoCaoKhenThuongData,
  BaoCaoXuHuongData,
  BaoCaoNhanSuBienDongData,
  BaoCaoNhanSuDemoData,
  BaoCaoNhanSuTrinhDoData,
  BaoCaoChamCongTongHopData,
  BaoCaoNghiPhepData,
  BaoCaoChiPhiData,
  BaoCaoThueBHXHData,
} from "@/types/bao-cao.types"

// ==================== Query Key Factories ====================

const baoCaoKeys = {
  tongQuan: (filters: BaoCaoFilters) => ["bao-cao-tong-quan", filters] as const,
  hopDong: (filters: BaoCaoFilters) => ["bao-cao-hop-dong", filters] as const,
  diMuon: (filters: BaoCaoFilters) => ["bao-cao-di-muon", filters] as const,
  luongSoSanh: (filters: BaoCaoFilters) => ["bao-cao-luong-so-sanh", filters] as const,
  khenThuong: (filters: BaoCaoFilters) => ["bao-cao-khen-thuong", filters] as const,
  xuHuong: (filters: BaoCaoFilters) => ["bao-cao-xu-huong", filters] as const,
  nhanSuBienDong: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-bien-dong", filters] as const,
  nhanSuDemo: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-demo", filters] as const,
  nhanSuTrinhDo: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-trinh-do", filters] as const,
  chamCongTongHop: (filters: BaoCaoFilters) => ["bao-cao-cham-cong-tong-hop", filters] as const,
  chamCongNghiPhep: (filters: BaoCaoFilters) => ["bao-cao-cham-cong-nghi-phep", filters] as const,
  luongChiPhi: (filters: BaoCaoFilters) => ["bao-cao-luong-chi-phi", filters] as const,
  luongThueBHXH: (filters: BaoCaoFilters) => ["bao-cao-luong-thue-bhxh", filters] as const,
}

// ==================== Tong Quan ====================

/**
 * Get overview statistics for HR dashboard
 * 
 * @param filters - Optional filters: thang, nam
 * @returns BaoCaoTongQuanData with employee counts, salary totals, etc.
 */
export function useBaoCaoTongQuan(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.tongQuan(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoTongQuanData>(
        ApiEndpoints.THONG_KE_BAO_CAO_TONG_QUAN,
        { params: filters }
      ),
  })
}

// ==================== Hop Dong Sap Het Han ====================

/**
 * Get expiring contracts report
 * 
 * @param filters - Optional filters: ngay_chieu, phong_ban_id
 * @returns BaoCaoHopDongData with contract expiry statistics
 */
export function useBaoCaoHopDong(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.hopDong(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoHopDongData>(
        ApiEndpoints.THONG_KE_BAO_CAO_HOP_DONG_SAP_HET_HAN,
        { params: filters }
      ),
  })
}

// ==================== Di Muon ====================

/**
 * Get late attendance report
 * 
 * @param filters - Optional filters: thang, nam
 * @returns BaoCaoDiMuonData with late/early leave statistics
 */
export function useBaoCaoDiMuon(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.diMuon(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoDiMuonData>(
        ApiEndpoints.THONG_KE_BAO_CAO_CHAM_CONG_DI_MUON,
        { params: filters }
      ),
  })
}

// ==================== Luong So Sanh ====================

/**
 * Get salary comparison report
 * 
 * @param filters - Optional filters: thang, nam
 * @returns BaoCaoLuongData with salary statistics
 */
export function useBaoCaoLuongSoSanh(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.luongSoSanh(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoLuongData>(
        ApiEndpoints.THONG_KE_BAO_CAO_LUONG_SO_SANH,
        { params: filters }
      ),
  })
}

// ==================== Khen Thuong ====================

/**
 * Get rewards/disciplinary report
 * 
 * @param filters - Optional filters: thang, nam
 * @returns BaoCaoKhenThuongData with reward statistics
 */
export function useBaoCaoKhenThuong(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.khenThuong(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoKhenThuongData>(
        ApiEndpoints.THONG_KE_BAO_CAO_KHEN_THUONG,
        { params: filters }
      ),
  })
}

// ==================== Xu Huong ====================

/**
 * Get HR trends over time
 * 
 * @param filters - Optional filters: so_thang
 * @returns BaoCaoXuHuongData with trend data
 */
export function useBaoCaoXuHuong(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.xuHuong(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoXuHuongData>(
        ApiEndpoints.THONG_KE_BAO_CAO_XU_HUONG,
        { params: filters }
      ),
  })
}

export function useBaoCaoNhanSuBienDong(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.nhanSuBienDong(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoNhanSuBienDongData>(
        ApiEndpoints.THONG_KE_BAO_CAO_NHAN_SU_BIEN_DONG,
        { params: filters }
      ),
  })
}

export function useBaoCaoNhanSuDemo(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.nhanSuDemo(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoNhanSuDemoData>(
        ApiEndpoints.THONG_KE_BAO_CAO_NHAN_SU_DEMO,
        { params: filters }
      ),
  })
}

export function useBaoCaoNhanSuTrinhDo(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.nhanSuTrinhDo(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoNhanSuTrinhDoData>(
        ApiEndpoints.THONG_KE_BAO_CAO_NHAN_SU_TRINH_DO,
        { params: filters }
      ),
  })
}

export function useBaoCaoChamCongTongHop(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.chamCongTongHop(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoChamCongTongHopData>(
        ApiEndpoints.THONG_KE_BAO_CAO_CHAM_CONG_TONG_HOP,
        { params: filters }
      ),
  })
}

export function useBaoCaoChamCongNghiPhep(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.chamCongNghiPhep(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoNghiPhepData>(
        ApiEndpoints.THONG_KE_BAO_CAO_CHAM_CONG_NGHI_PHEP,
        { params: filters }
      ),
  })
}

export function useBaoCaoLuongChiPhi(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.luongChiPhi(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoChiPhiData>(
        ApiEndpoints.THONG_KE_BAO_CAO_LUONG_CHI_PHI,
        { params: filters }
      ),
  })
}

export function useBaoCaoLuongThueBHXH(filters: BaoCaoFilters = {}) {
  return useQuery({
    queryKey: baoCaoKeys.luongThueBHXH(filters),
    queryFn: () =>
      apiGateway.get<BaoCaoThueBHXHData>(
        ApiEndpoints.THONG_KE_BAO_CAO_LUONG_THUE_BHXH,
        { params: filters }
      ),
  })
}
