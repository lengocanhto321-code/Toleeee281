export interface SalaryParams {
  heSoLuong: number
  luongCoSo: number
  heSoDacThu: number
}

export interface AttendanceData {
  soNgayCoMat: number
  soNgayVangCoPhep: number
  soNgayVangKhongPhep: number
  soNgayNghiLeTet: number
  soNgayCongTac: number
  soNgayLamChuan: number
}

export interface ExpectedSalary {
  heSoNgayCong: number
  luongCoBan: number
  bhxh: number
  bhyt: number
  bhtn: number
  tongBaoHiem: number
  tongThuNhap: number
  luongThucNhan: number
}

function tinhHeSoNgayCong(att: AttendanceData): number {
  const ngayDuocTinh = att.soNgayCoMat + att.soNgayVangCoPhep + att.soNgayNghiLeTet
    + att.soNgayCongTac - att.soNgayVangKhongPhep
  const heSo = Math.max(0, ngayDuocTinh) / att.soNgayLamChuan
  return Math.min(1.0, Math.round(heSo * 10000) / 10000)
}

export function tinhLuongExpected(params: SalaryParams, att: AttendanceData): ExpectedSalary {
  const hsl = params.heSoLuong
  const lcs = params.luongCoSo
  const hdt = params.heSoDacThu

  const heSoNgayCong = tinhHeSoNgayCong(att)

  const luongCoBan = Math.round(hsl * lcs * hdt * heSoNgayCong)

  const baseBH = hsl * lcs
  const bhxh = Math.round(baseBH * 8 / 100)
  const bhyt = Math.round(baseBH * 1.5 / 100)
  const bhtn = Math.round(baseBH * 1 / 100)
  const tongBaoHiem = bhxh + bhyt + bhtn

  const tongThuNhap = luongCoBan
  const thueTncn = 0 // income below threshold
  const luongThucNhan = tongThuNhap - tongBaoHiem - thueTncn

  return { heSoNgayCong, luongCoBan, bhxh, bhyt, bhtn, tongBaoHiem, tongThuNhap, luongThucNhan }
}
