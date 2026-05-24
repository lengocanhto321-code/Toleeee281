"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import {
  createNhanVienColumns,
  NhanVienToolbar,
  NhanVienFormDialog,
  AccountInfoDialog,
  NhanVienBatchActionsBar,
} from "@/components/forms/nhan-vien"
import { useNhanVienList, useCreateNhanVien, useUpdateNhanVien, useResetPassword } from "@/hooks/nhan-vien"
import { useNhanVienMetadata } from "@/stores/nhan-vien-metadata"
import type { NhanVien } from "@/types/nhan-vien.types"
import { TRANG_THAI_LABELS, LOAI_NHAN_VIEN_LABELS, LOAI_HOP_DONG_LABELS, CAP_HOC_LABELS, LOAI_BANG_CAP_LABELS, TINH_TRANG_HON_NHANH_LABELS } from "@/types/nhan-vien.types"
import type { NhanVienFilterParams } from "@/hooks/nhan-vien/use-nhan-vien-query"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"

function parseSortParams(sortValue: string): { sort_by: string; sort_desc: boolean } {
  const parts = sortValue.split("_")
  const dir = parts.pop()
  const field = parts.join("_")
  if (dir === "desc") return { sort_by: field, sort_desc: true }
  return { sort_by: field, sort_desc: false }
}

export default function NhanVienPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<NhanVienFilterParams>({})
  const [sortValue, setSortValue] = useState("ho_ten_asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [formOpen, setFormOpen] = useState(false)
  const [editingNhanVien, setEditingNhanVien] = useState<NhanVien | null>(null)
  const [accountInfo, setAccountInfo] = useState<{ hoTen: string; taiKhoan: { ten_dang_nhap: string; mat_khau_goc: string } | null } | null>(null)
  const [resetPwResult, setResetPwResult] = useState<{ ho_ten: string; ten_dang_nhap: string; mat_khau_moi: string } | null>(null)
  const [selectedNhanViens, setSelectedNhanViens] = useState<NhanVien[]>([])

  const resetPwMutation = useResetPassword()

  const { sort_by, sort_desc } = parseSortParams(sortValue)
  const queryFilters: NhanVienFilterParams & { page: number; page_size: number } = {
    ...filters,
    search: search || undefined,
    sort_by,
    sort_desc,
    page,
    page_size: pageSize,
  }

  const { data: listResult, isLoading } = useNhanVienList(queryFilters)
  const createMutation = useCreateNhanVien()
  const updateMutation = useUpdateNhanVien()
  const setMetadata = useNhanVienMetadata((s) => s.setMetadata)

  const nhanViens = listResult?.data || []
  const metadata = listResult?.metadata as any

  const phongBanOptions = useMemo(() =>
    (metadata?.phong_ban_list || []).map((pb: any) => ({ value: pb.id, label: pb.ten_phong_ban })),
    [metadata?.phong_ban_list]
  )

  useEffect(() => {
    setMetadata(metadata?.thong_ke || null, metadata?.phong_ban_list || [])
  }, [metadata?.thong_ke, metadata?.phong_ban_list, setMetadata])

  const total = metadata?.total || 0
  const currentPage = metadata?.page || 1
  const totalPages = metadata?.total_pages || 1

  useEffect(() => {
    const handler = () => { setEditingNhanVien(null); setFormOpen(true) }
    window.addEventListener("sidebar:nhan-vien:add", handler)
    return () => window.removeEventListener("sidebar:nhan-vien:add", handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, filters, sortValue, pageSize])

  const handleExport = useCallback(async () => {
    try {
      const ExcelJS = await import("exceljs")
      const EB = (ExcelJS as any).default || ExcelJS

      const allNV: NhanVien[] = []
      let curPage = 1
      let hasMore = true

      while (hasMore) {
        const res = await apiGateway.get<any>(`${ApiEndpoints.NHAN_VIEN_LIST}?page=${curPage}&page_size=100`)
        const items = Array.isArray(res) ? res : []
        allNV.push(...items)
        const meta = (res as any)?.metadata
        hasMore = meta ? curPage < meta.total_pages : false
        curPage++
      }

      if (!allNV.length) return

      const detailMap = new Map<string, any>()
      for (let i = 0; i < allNV.length; i += 5) {
        const batch = allNV.slice(i, i + 5)
        const results = await Promise.allSettled(
          batch.map((nv) =>
            apiGateway.get<any>(ApiEndpoints.NHAN_VIEN_DETAIL(nv.id))
              .then((d) => ({ id: nv.id, detail: d }))
              .catch(() => null)
          )
        )
        for (const r of results) {
          if (r.status === "fulfilled" && r.value) detailMap.set(r.value.id, r.value.detail)
        }
      }

      const workbook = new EB.Workbook()
      workbook.creator = "HR Management"
      workbook.created = new Date()

      const LABELS = {
        trangThai: TRANG_THAI_LABELS as Record<string, string>,
        loaiNV: LOAI_NHAN_VIEN_LABELS as Record<string, string>,
        loaiHD: LOAI_HOP_DONG_LABELS as Record<string, string>,
        capHoc: CAP_HOC_LABELS as Record<string, string>,
        loaiBC: LOAI_BANG_CAP_LABELS as Record<string, string>,
        tinhTrangHN: TINH_TRANG_HON_NHANH_LABELS as Record<string, string>,
      }

      const GRP_BG = "1E3A5F"
      const GRP_FG = "FFFFFF"
      const SUB_BG = "D6E4F0"
      const SUB_FG = "1E3A5F"
      const BORDER_CLR = "B4C6E7"
      const ZEBRA = "F2F7FB"
      const ACCENT = "2E75B6"

      type Col = { key: string; header: string; width: number; parent: string }
      const columns: Col[] = [
        { key: "stt", header: "STT", width: 5, parent: "Thông tin cơ bản" },
        { key: "ma_nv", header: "Mã NV", width: 10, parent: "Thông tin cơ bản" },
        { key: "ho_ten", header: "Họ tên", width: 22, parent: "Thông tin cơ bản" },
        { key: "gioi_tinh", header: "Giới tính", width: 9, parent: "Thông tin cơ bản" },
        { key: "ngay_sinh", header: "Ngày sinh", width: 12, parent: "Thông tin cơ bản" },
        { key: "noi_sinh", header: "Nơi sinh", width: 16, parent: "Thông tin cơ bản" },
        { key: "que_quan", header: "Quê quán", width: 16, parent: "Thông tin cơ bản" },
        { key: "dan_toc", header: "Dân tộc", width: 10, parent: "Thông tin cơ bản" },
        { key: "ton_giao", header: "Tôn giáo", width: 10, parent: "Thông tin cơ bản" },
        { key: "tinh_trang_hn", header: "Tình trạng HN", width: 14, parent: "Thông tin cơ bản" },

        { key: "so_cccd", header: "Số CCCD", width: 14, parent: "CCCD & Địa chỉ" },
        { key: "ngay_cap_cccd", header: "Ngày cấp", width: 12, parent: "CCCD & Địa chỉ" },
        { key: "noi_cap_cccd", header: "Nơi cấp", width: 14, parent: "CCCD & Địa chỉ" },
        { key: "dia_chi_thuong_tru", header: "Địa chỉ thường trú", width: 25, parent: "CCCD & Địa chỉ" },
        { key: "dia_chi_tam_tru", header: "Địa chỉ tạm trú", width: 25, parent: "CCCD & Địa chỉ" },

        { key: "so_dien_thoai", header: "Số ĐT", width: 13, parent: "Liên hệ" },
        { key: "email", header: "Email cơ quan", width: 22, parent: "Liên hệ" },
        { key: "email_ca_nhan", header: "Email cá nhân", width: 22, parent: "Liên hệ" },

        { key: "loai_nv", header: "Loại NV", width: 12, parent: "Công tác" },
        { key: "phong_ban", header: "Phòng ban", width: 18, parent: "Công tác" },
        { key: "chuc_vu", header: "Chức vụ", width: 16, parent: "Công tác" },
        { key: "ngay_vao_lam", header: "Ngày vào làm", width: 13, parent: "Công tác" },
        { key: "hinh_thuc_td", header: "Hình thức TD", width: 14, parent: "Công tác" },
        { key: "cap_hoc", header: "Cấp học", width: 10, parent: "Công tác" },
        { key: "mon_day", header: "Môn dạy", width: 14, parent: "Công tác" },
        { key: "trang_thai", header: "Trạng thái", width: 12, parent: "Công tác" },

        { key: "loai_hd", header: "Loại HĐ", width: 14, parent: "Hợp đồng" },
        { key: "so_hd", header: "Số HĐ", width: 14, parent: "Hợp đồng" },
        { key: "ngay_het_hd", header: "Ngày hết HĐ", width: 13, parent: "Hợp đồng" },

        { key: "ngach_luong", header: "Ngạch lương", width: 12, parent: "Lương" },
        { key: "bac_luong", header: "Bậc lương", width: 11, parent: "Lương" },
        { key: "he_so_luong", header: "Hệ số lương", width: 12, parent: "Lương" },
        { key: "so_nam_tham_nien", header: "Năm thâm niên", width: 13, parent: "Lương" },
        { key: "phu_cap_cv", header: "Phụ cấp CV", width: 12, parent: "Lương" },

        { key: "so_bhxh", header: "Số BHXH", width: 14, parent: "Bảo hiểm" },
        { key: "ngay_tham_gia_bhxh", header: "Ngày tham gia BHXH", width: 16, parent: "Bảo hiểm" },

        { key: "ten_ngan_hang", header: "Ngân hàng", width: 16, parent: "Ngân hàng" },
        { key: "so_tk", header: "Số TK", width: 18, parent: "Ngân hàng" },

        { key: "la_dang_vien", header: "Đảng viên", width: 10, parent: "Đảng / Đoàn" },
        { key: "ngay_vao_dang", header: "Ngày vào Đảng", width: 13, parent: "Đảng / Đoàn" },
        { key: "la_doan_vien", header: "Đoàn viên", width: 10, parent: "Đảng / Đoàn" },
        { key: "ngay_vao_doan", header: "Ngày vào Đoàn", width: 13, parent: "Đảng / Đoàn" },

        { key: "ghi_chu", header: "Ghi chú", width: 20, parent: "Ghi chú" },
      ]

      const ws = workbook.addWorksheet("Danh sách nhân viên", {
        views: [{ state: "frozen", ySplit: 3 }],
      })
      ws.columns = columns.map((c) => ({ key: c.key, width: c.width }))

      const thinBorder: any = {
        top: { style: "thin", color: { argb: BORDER_CLR } },
        left: { style: "thin", color: { argb: BORDER_CLR } },
        bottom: { style: "thin", color: { argb: BORDER_CLR } },
        right: { style: "thin", color: { argb: BORDER_CLR } },
      }

      ws.getRow(1).height = 32
      ws.mergeCells(1, 1, 1, columns.length)
      const titleCell = ws.getCell(1, 1)
      titleCell.value = "DANH SÁCH NHÂN VIÊN"
      titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: GRP_FG } }
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRP_BG } }
      titleCell.alignment = { horizontal: "center", vertical: "middle" }

      const parentGroups: { name: string; startCol: number; endCol: number }[] = []
      let lastParent = ""
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].parent !== lastParent) {
          if (lastParent) parentGroups[parentGroups.length - 1].endCol = i
          parentGroups.push({ name: columns[i].parent, startCol: i + 1, endCol: i + 1 })
          lastParent = columns[i].parent
        } else {
          parentGroups[parentGroups.length - 1].endCol = i + 1
        }
      }

      ws.getRow(2).height = 24
      const parentColors: Record<string, string> = {
        "Thông tin cơ bản": "1E3A5F",
        "CCCD & Địa chỉ": "2C5F8A",
        "Liên hệ": "3A7AB5",
        "Công tác": "2C5F8A",
        "Hợp đồng": "1E3A5F",
        "Lương": "3A7AB5",
        "Bảo hiểm": "2C5F8A",
        "Ngân hàng": "1E3A5F",
        "Đảng / Đoàn": "3A7AB5",
        "Ghi chú": "808080",
      }
      for (const g of parentGroups) {
        if (g.startCol < g.endCol) ws.mergeCells(2, g.startCol, 2, g.endCol)
        const cell = ws.getCell(2, g.startCol)
        cell.value = g.name
        cell.font = { name: "Arial", size: 11, bold: true, color: { argb: GRP_FG } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: parentColors[g.name] || GRP_BG } }
        cell.alignment = { horizontal: "center", vertical: "middle" }
        cell.border = thinBorder
      }

      ws.getRow(3).height = 20
      for (let i = 0; i < columns.length; i++) {
        const cell = ws.getCell(3, i + 1)
        cell.value = columns[i].header
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: SUB_FG } }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUB_BG } }
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
        cell.border = thinBorder
      }

      const mapNV = (nv: NhanVien, idx: number) => ({
        stt: idx + 1,
        ma_nv: nv.ma_nhan_vien || "",
        ho_ten: nv.ho_ten || "",
        gioi_tinh: nv.gioi_tinh || "",
        ngay_sinh: nv.ngay_sinh || "",
        noi_sinh: nv.noi_sinh || "",
        que_quan: nv.que_quan || "",
        dan_toc: nv.dan_toc || "",
        ton_giao: nv.ton_giao || "",
        tinh_trang_hn: nv.tinh_trang_hon_nhan ? (LABELS.tinhTrangHN[nv.tinh_trang_hon_nhan] || nv.tinh_trang_hon_nhan) : "",
        so_cccd: nv.so_cccd || "",
        ngay_cap_cccd: nv.ngay_cap_cccd || "",
        noi_cap_cccd: nv.noi_cap_cccd || "",
        dia_chi_thuong_tru: nv.dia_chi_thuong_tru || "",
        dia_chi_tam_tru: nv.dia_chi_tam_tru || "",
        so_dien_thoai: nv.so_dien_thoai || "",
        email: nv.email || "",
        email_ca_nhan: nv.email_ca_nhan || "",
        loai_nv: LABELS.loaiNV[nv.loai_nhan_vien] || nv.loai_nhan_vien || "",
        phong_ban: nv.phong_ban?.ten_phong_ban || "",
        chuc_vu: nv.chuc_vu?.ten_chuc_vu || "",
        ngay_vao_lam: nv.ngay_vao_lam || "",
        hinh_thuc_td: nv.hinh_thuc_tuyen_dung || "",
        cap_hoc: nv.cap_hoc ? (LABELS.capHoc[nv.cap_hoc] || nv.cap_hoc) : "",
        mon_day: nv.mon_day || "",
        trang_thai: LABELS.trangThai[nv.trang_thai] || nv.trang_thai || "",
        loai_hd: LABELS.loaiHD[nv.loai_hop_dong] || nv.loai_hop_dong || "",
        so_hd: nv.so_hop_dong || "",
        ngay_het_hd: nv.ngay_het_hop_dong || "",
        ngach_luong: nv.ngach_luong || "",
        bac_luong: nv.bac_luong || "",
        he_so_luong: nv.he_so_luong || "",
        so_nam_tham_nien: nv.so_nam_tham_nien || "",
        phu_cap_cv: nv.phu_cap_chuc_vu || "",
        so_bhxh: nv.so_bao_hiem || "",
        ngay_tham_gia_bhxh: nv.ngay_tham_gia_bhxh || "",
        ten_ngan_hang: nv.ten_ngan_hang || "",
        so_tk: nv.so_tai_khoan_ngan_hang || "",
        la_dang_vien: nv.la_dang_vien ? "✓" : "",
        ngay_vao_dang: nv.ngay_vao_dang || "",
        la_doan_vien: nv.la_doan_vien ? "✓" : "",
        ngay_vao_doan: nv.ngay_vao_doan || "",
        ghi_chu: nv.ghi_chu || "",
      })

      const statusColors: Record<string, string> = {
        dang_lam: "E8F5E9",
        nghi_viec: "FFEBEE",
        nghi_huu: "FFF3E0",
        da_xoa: "F5F5F5",
      }

      for (let idx = 0; idx < allNV.length; idx++) {
        const nv = allNV[idx]
        const row = ws.getRow(4 + idx)
        row.values = mapNV(nv, idx) as any
        row.height = 20

        const isZebra = idx % 2 === 1
        const statusKey = nv.trang_thai || ""
        for (let c = 1; c <= columns.length; c++) {
          const cell = row.getCell(c)
          cell.font = { name: "Arial", size: 10 }
          cell.alignment = { vertical: "middle" }
          cell.border = thinBorder

          const colKey = columns[c - 1].key
          if (colKey === "trang_thai" && statusColors[statusKey]) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColors[statusKey] } }
          } else if (colKey === "stt" || colKey === "ho_ten") {
            cell.font = { name: "Arial", size: 10, bold: colKey === "ho_ten" }
          } else if (isZebra) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } }
          }
        }
      }

      const addDetailSheet = (name: string, parentHeaders: string[], rows: any[]) => {
        if (!rows.length) return
        const s = workbook.addWorksheet(name)
        s.getRow(1).height = 28
        s.mergeCells(1, 1, 1, parentHeaders.length)
        const tc = s.getCell(1, 1)
        tc.value = name.toUpperCase()
        tc.font = { name: "Arial", size: 14, bold: true, color: { argb: GRP_FG } }
        tc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRP_BG } }
        tc.alignment = { horizontal: "center", vertical: "middle" }

        s.columns = parentHeaders.map((h, i) => ({ header: h, key: h, width: Math.max(h.length * 2, 14) }))
        s.getRow(2).font = { name: "Arial", size: 10, bold: true, color: { argb: SUB_FG } }
        s.getRow(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUB_BG } }
        s.getRow(2).alignment = { horizontal: "center", vertical: "middle" }
        for (const r of rows) {
          const dr = s.addRow(r)
          for (let c = 1; c <= parentHeaders.length; c++) {
            dr.getCell(c).font = { name: "Arial", size: 10 }
            dr.getCell(c).border = thinBorder
          }
        }
        s.views = [{ state: "frozen", ySplit: 2 }]
      }

      const bangCapRows: any[] = []
      const khenThuongRows: any[] = []
      const kyLuatRows: any[] = []
      const nguoiThanRows: any[] = []
      const hopDongRows: any[] = []

      for (const nv of allNV) {
        const d = detailMap.get(nv.id)
        if (!d) continue
        const m = nv.ma_nhan_vien, t = nv.ho_ten
        for (const bc of d.bang_caps || []) bangCapRows.push({ "Mã NV": m, "Họ tên": t, "Loại bằng": LABELS.loaiBC[bc.loai] || bc.loai, "Tên bằng": bc.ten, "Chuyên ngành": bc.chuyen_nganh || "", "Trường": bc.truong || "", "Năm TN": bc.nam_tot_nghiep || "", "Xếp loại": bc.xep_loai || "" })
        for (const kt of d.khen_thuongs || []) khenThuongRows.push({ "Mã NV": m, "Họ tên": t, "Năm": kt.nam, "Hình thức": kt.hinh_thuc, "Lý do": kt.ly_do, "Giá trị": kt.gia_tri_thuong || "", "Số QĐ": kt.so_quyet_dinh || "", "Cơ quan": kt.co_quan_ban_hanh || "", "Ngày QĐ": kt.ngay_quyet_dinh || "" })
        for (const kl of d.ky_luats || []) kyLuatRows.push({ "Mã NV": m, "Họ tên": t, "Năm": kl.nam, "Hình thức": kl.hinh_thuc, "Lý do": kl.ly_do, "Mức độ": kl.muc_do || "", "Số QĐ": kl.so_quyet_dinh || "", "Cơ quan": kl.co_quan_ban_hanh || "", "Ngày QĐ": kl.ngay_quyet_dinh || "" })
        for (const nt of d.nguoi_than || []) nguoiThanRows.push({ "Mã NV": m, "Họ tên": t, "Họ tên NT": nt.ho_ten, "Quan hệ": nt.quan_he, "Năm sinh": nt.nam_sinh, "Nghề nghiệp": nt.nghe_nghiep || "", "Địa chỉ": nt.dia_chi || "", "Số ĐT": nt.so_dien_thoai || "", "Phụ thuộc": nt.nguoi_phu_thuoc ? "Có" : "Không" })
        for (const hd of d.hop_dongs || []) hopDongRows.push({ "Mã NV": m, "Họ tên": t, "Loại HĐ": hd.loai_hop_dong, "Số HĐ": hd.so_hop_dong, "Ngày ký": hd.ngay_ky, "Ngày bắt đầu": hd.ngay_bat_dau, "Ngày kết thúc": hd.ngay_ket_thuc || "", "Nội dung": hd.noi_dung || "", "Trạng thái": hd.trang_thai })
      }

      addDetailSheet("Bằng cấp", ["Mã NV", "Họ tên", "Loại bằng", "Tên bằng", "Chuyên ngành", "Trường", "Năm TN", "Xếp loại"], bangCapRows)
      addDetailSheet("Khen thưởng", ["Mã NV", "Họ tên", "Năm", "Hình thức", "Lý do", "Giá trị", "Số QĐ", "Cơ quan", "Ngày QĐ"], khenThuongRows)
      addDetailSheet("Kỷ luật", ["Mã NV", "Họ tên", "Năm", "Hình thức", "Lý do", "Mức độ", "Số QĐ", "Cơ quan", "Ngày QĐ"], kyLuatRows)
      addDetailSheet("Người thân", ["Mã NV", "Họ tên", "Họ tên NT", "Quan hệ", "Năm sinh", "Nghề nghiệp", "Địa chỉ", "Số ĐT", "Phụ thuộc"], nguoiThanRows)
      addDetailSheet("Hợp đồng", ["Mã NV", "Họ tên", "Loại HĐ", "Số HĐ", "Ngày ký", "Ngày bắt đầu", "Ngày kết thúc", "Nội dung", "Trạng thái"], hopDongRows)

      const buf = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `nhan-vien-full-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
    }
  }, [])

  useEffect(() => {
    const handler = () => { handleExport() }
    window.addEventListener("sidebar:nhan-vien:export", handler)
    return () => window.removeEventListener("sidebar:nhan-vien:export", handler)
  }, [handleExport])

  const handleFiltersChange = useCallback((newFilters: NhanVienFilterParams) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSortValue(value)
  }, [])

  const columns = useMemo(() => createNhanVienColumns({
    onEdit: (nv) => { setEditingNhanVien(nv); setFormOpen(true) },
    onResetPassword: (nv) => {
      resetPwMutation.mutate(nv.id, {
        onSuccess: (res) => setResetPwResult({ ho_ten: nv.ho_ten, ten_dang_nhap: res.ten_dang_nhap, mat_khau_moi: res.mat_khau_moi }),
      })
    },
  }), [])

  const handleFormSubmit = async (data: Record<string, unknown>, editId?: string) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: data as any }, {
        onSuccess: () => {
          setFormOpen(false)
        },
      })
    } else {
      createMutation.mutate(data as any, {
        onSuccess: (response: any) => {
          setFormOpen(false)
          if (response?.tai_khoan) {
            setAccountInfo({
              hoTen: (data as any).ho_ten || "",
              taiKhoan: response.tai_khoan,
            })
          }
        },
      })
    }
  }

  const tableFooter = total > 0 ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Combobox
          options={[
            { value: "10", label: "10 / trang" },
            { value: "20", label: "20 / trang" },
            { value: "50", label: "50 / trang" },
            { value: "100", label: "100 / trang" },
          ]}
          value={String(pageSize)}
          onChange={(v) => { setPageSize(Number(v)); setPage(1) }}
          placeholder="20 / trang"
          searchPlaceholder="Chọn số lượng..."
          className="h-8 text-xs w-32"
        />
        <span className="text-xs text-muted-foreground">
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} / {total}
        </span>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(1)} disabled={page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-end mb-4">
        <p className="text-sm text-muted-foreground">
          {total} nhân viên
        </p>
      </div>

      <div className="mb-4">
        <NhanVienToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          viewMode="table"
          onViewModeChange={() => {}}
          onExport={handleExport}
          phongBanOptions={phongBanOptions}
          totalResults={total}
          totalCount={total}
        />
      </div>

      {selectedNhanViens.length > 0 && (
        <div className="mb-4">
          <NhanVienBatchActionsBar
            selectedNhanViens={selectedNhanViens}
            onClearSelection={() => setSelectedNhanViens([])}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={nhanViens}
        loading={isLoading}
        emptyMessage="Không tìm thấy nhân viên nào"
        disablePagination
        footer={tableFooter}
        onSelectionChange={setSelectedNhanViens}
      />

      <NhanVienFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNhanVien={editingNhanVien}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <AccountInfoDialog
        open={!!accountInfo}
        onOpenChange={(open) => { if (!open) setAccountInfo(null) }}
        hoTen={accountInfo?.hoTen || ""}
        taiKhoan={accountInfo?.taiKhoan || null}
      />

      {resetPwResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setResetPwResult(null)}>
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-1">Đặt lại mật khẩu</h3>
            <p className="text-sm text-muted-foreground mb-4">{resetPwResult.ho_ten}</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground/70 mb-1">Tên đăng nhập</p>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <span className="font-mono text-sm flex-1">{resetPwResult.ten_dang_nhap}</span>
                  <button onClick={() => navigator.clipboard.writeText(resetPwResult.ten_dang_nhap)} className="text-xs text-primary hover:text-primary/80 font-medium">Copy</button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/70 mb-1">Mật khẩu mới</p>
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <span className="font-mono text-sm font-bold text-amber-900 flex-1 tracking-wider">{resetPwResult.mat_khau_moi}</span>
                  <button onClick={() => navigator.clipboard.writeText(resetPwResult.mat_khau_moi)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Copy</button>
                </div>
              </div>
              <p className="text-xs text-red-500">Mật khẩu chỉ hiện 1 lần. Hãy copy và gửi cho nhân viên.</p>
            </div>
            <button onClick={() => setResetPwResult(null)} className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium bg-muted hover:bg-accent transition-colors">Đóng</button>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
