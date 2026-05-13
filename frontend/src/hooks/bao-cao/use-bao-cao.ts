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
} from "@/types/bao-cao.types"

// ==================== Query Key Factories ====================

const baoCaoKeys = {
  tongQuan: (filters: BaoCaoFilters) => ["bao-cao-tong-quan", filters] as const,
  hopDong: (filters: BaoCaoFilters) => ["bao-cao-hop-dong", filters] as const,
  diMuon: (filters: BaoCaoFilters) => ["bao-cao-di-muon", filters] as const,
  luongSoSanh: (filters: BaoCaoFilters) => ["bao-cao-luong-so-sanh", filters] as const,
  khenThuong: (filters: BaoCaoFilters) => ["bao-cao-khen-thuong", filters] as const,
  xuHuong: (filters: BaoCaoFilters) => ["bao-cao-xu-huong", filters] as const,
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
