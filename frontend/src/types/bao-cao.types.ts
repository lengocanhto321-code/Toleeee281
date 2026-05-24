export interface BaoCaoFilters {
  [key: string]: string | number | boolean | undefined
  start_date?: string
  end_date?: string
  phong_ban_id?: string
  loai_nhan_vien?: string
  trang_thai?: string
  ngay_chieu?: string
  so_thang?: number
}

// ==================== New Bao Cao Types ====================

// Tong Quan
export interface BaoCaoTongQuanData {
  tong_nhan_vien: number
  tong_giao_vien: number
  tong_can_bo: number
  dang_lam: number
  nghi_viec: number
  nghi_huu: number
  ty_le_co_mat: number
  tong_chi_phi_luong: number
  don_cho_duyet: number
  xu_huong: { thang: string; so_luong: number }[]
}

// Hop Dong
export interface BaoCaoHopDongItem {
  nhan_vien_id: string
  ho_ten: string
  loai_hop_dong: string
  ngay_het_han: string
  phong_ban: string
}

export interface BaoCaoHopDongData {
  tong: number
  sap_het_han: number
  da_het_han: number
  can_gia_han: number
  items: BaoCaoHopDongItem[]
}

// Di Muon
export interface BaoCaoDiMuonItem {
  nhan_vien_id: string
  ho_ten: string
  phong_ban: string
  so_lan_muon: number
  so_lan_ve_som: number
}

export interface BaoCaoDiMuonData {
  tong_muon: number
  tong_ve_som: number
  dung_gio: number
  ty_le_dung_gio: number
  vi_pham: number
  theo_ngay: { ngay: string; muon: number; ve_som: number }[]
  xu_huong: { thang: string; ty_le: number }[]
  chi_tiet: BaoCaoDiMuonItem[]
}

// Luong So Sanh
export interface BaoCaoLuongItem {
  nhan_vien_id: string
  ho_ten: string
  phong_ban: string
  luong: number
}

export interface BaoCaoLuongData {
  luong_tb: number
  luong_cao_nhat: number
  luong_thap_nhat: number
  chenh_lech: number
  theo_phong_ban: { phong_ban: string; luong_tb: number; so_luong: number }[]
  top_luong: BaoCaoLuongItem[]
}

// Khen Thuong
export interface BaoCaoKhenThuongItem {
  nhan_vien_id: string
  ho_ten: string
  loai: string
  hinh_thuc: string
  so_tien: number
  ngay: string
}

export interface BaoCaoKhenThuongData {
  tong_khen: number
  tong_ky: number
  ty_le: number
  tong_tien: number
  ty_le_chart: { name: string; value: number }[]
  theo_thang: { thang: string; khen: number; ky: number }[]
  chi_tiet: BaoCaoKhenThuongItem[]
}

// Xu Huong
export interface BaoCaoXuHuongData {
  xu_huong_nhan_su: { thang: string; so_luong: number }[]
  xu_huong_luong: { thang: string; tong_luong: number }[]
  xu_huong_nghi_phep: { thang: string; so_ngay: number }[]
  change_thang_truoc: { percent: number; direction: string }
  change_nam_truoc: { percent: number; direction: string }
}

// Nhan Su - Tong Hop (reuses BaoCaoTongQuanData)

// Nhan Su - Bien Dong
export interface BaoCaoNhanSuBienDongData {
  tong_vao: number
  tong_ra: number
  tong_chuyen: number
  ly_do: { ly_do: string; so_luong: number }[]
  theo_thang: { thang: string; vao: number; ra: number }[]
}

// Nhan Su - Demographics
export interface BaoCaoNhanSuDemoData {
  gioi_tinh: { name: string; value: number }[]
  do_tuoi: { name: string; value: number }[]
  loai_nhan_vien: { name: string; value: number }[]
}

// Nhan Su - Trinh Do
export interface BaoCaoNhanSuTrinhDoData {
  trinh_do_hoc_van: { name: string; value: number }[]
  chuyen_mon: { name: string; value: number }[]
}

// Cham Cong - Tong Hop
export interface BaoCaoChamCongTongHopData {
  tong_co_mat: number
  tong_chuan: number
  tong_nhan_vien: number
  ty_le_co_mat: number
  theo_phong_ban: {
    phong_ban: string
    co_mat: number
    chuan: number
    so_nv: number
    ty_le: number
  }[]
}

// Cham Cong - Nghi Phep
export interface BaoCaoNghiPhepData {
  tong_don: number
  da_duyet: number
  cho_duyet: number
  tong_ngay_nghi: number
  theo_ly_do: { name: string; value: number }[]
  theo_thang: { thang: string; so_don: number; so_ngay: number }[]
}

// Luong - Chi Phi
export interface BaoCaoChiPhiData {
  tong_chi_phi: number
  tong_luong_co_ban: number
  so_nhan_vien: number
  chi_phi_tb: number
  theo_phong_ban: { phong_ban: string; chi_phi: number; so_nv: number }[]
  theo_thang: { thang: string; chi_phi: number }[]
}

// Luong - Thue BHXH
export interface BaoCaoThueBHXHData {
  tong_bhxh: number
  tong_bhyt: number
  tong_thue_tncn: number
  tong_cong: number
  phan_bo: { name: string; value: number }[]
  theo_thang: { thang: string; bhxh: number; bhyt: number; thue: number }[]
}
