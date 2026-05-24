export interface LichChamCong {
  id: string
  gio_check_in: string
  gio_check_out: string
  ngay_lam_viec: string
  bat_gps: boolean
  kinh_do: number | null
  vi_do: number | null
  ten_vi_tri: string | null
  ban_kinh_cho_phep: number
  trang_thai: "active" | "inactive"
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateLichChamCongData {
  gio_check_in: string
  gio_check_out: string
  ngay_lam_viec: string
  bat_gps: boolean
  vi_tri?: {
    lat?: number
    lng?: number
    dms?: string
    name?: string
    radius: number
  }
}

export interface ToggleLichChamCongData {
  trang_thai: "active" | "inactive"
}
