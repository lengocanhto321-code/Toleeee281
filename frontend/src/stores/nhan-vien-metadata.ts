import { create } from "zustand"

interface ThongKe {
  tong_dang_lam: number
  sinh_nhat_thang: number
  ky_niem_thang: number
  nv_moi_thang: number
}

interface PhongBanOption {
  id: string
  ten_phong_ban: string
}

interface NhanVienMetadataState {
  thongKe: ThongKe | null
  phongBanList: PhongBanOption[]
  setMetadata: (thongKe: ThongKe | null, phongBanList: PhongBanOption[]) => void
}

export const useNhanVienMetadata = create<NhanVienMetadataState>((set) => ({
  thongKe: null,
  phongBanList: [],
  setMetadata: (thongKe, phongBanList) => set({ thongKe, phongBanList }),
}))
