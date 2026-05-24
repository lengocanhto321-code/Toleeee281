"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  RefreshCw,
  Check,
  FileText,
  FileSpreadsheet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  generateMultiSheetExcel,
  generateStyledPDF,
  buildMultiSectionPreviewHtml,
  captureVisibleCharts,
  type ReportSection,
  type MultiSectionReport,
} from "@/lib/report-export"
import { apiGateway } from "@/lib/axios"
import {
  useBaoCaoTongQuan,
  useBaoCaoHopDong,
  useBaoCaoDiMuon,
  useBaoCaoLuongSoSanh,
  useBaoCaoKhenThuong,
  useBaoCaoXuHuong,
  useBaoCaoNhanSuBienDong,
  useBaoCaoNhanSuDemo,
  useBaoCaoNhanSuTrinhDo,
  useBaoCaoChamCongTongHop,
  useBaoCaoChamCongNghiPhep,
  useBaoCaoLuongChiPhi,
  useBaoCaoLuongThueBHXH,
} from "@/hooks/bao-cao/use-bao-cao"
import type { BaoCaoFilters } from "@/types/bao-cao.types"
import { format as formatDate, subMonths } from "date-fns"

interface ExportAllDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SubDef {
  id: string
  label: string
  enabled: boolean
}

interface CatDef {
  id: string
  label: string
  subs: SubDef[]
}

type ExportFormat = "excel" | "pdf"

const DEFAULT_CATEGORIES: CatDef[] = [
  {
    id: "nhan-su", label: "Nhân sự",
    subs: [
      { id: "tong-hop", label: "Tổng hợp", enabled: true },
      { id: "bien-dong", label: "Biến động", enabled: true },
      { id: "demo", label: "Demographics", enabled: true },
      { id: "trinh-do", label: "Trình độ", enabled: true },
      { id: "hop-dong", label: "Hợp đồng", enabled: true },
    ],
  },
  {
    id: "cham-cong", label: "Chấm công",
    subs: [
      { id: "tong-hop", label: "Tổng hợp", enabled: true },
      { id: "nghi-phep", label: "Nghỉ phép", enabled: true },
      { id: "di-muon", label: "Đi muộn", enabled: true },
    ],
  },
  {
    id: "luong", label: "Lương",
    subs: [
      { id: "chi-phi", label: "Chi phí", enabled: true },
      { id: "thue-bhxh", label: "Thuế & BHXH", enabled: true },
      { id: "so-sanh", label: "So sánh", enabled: true },
    ],
  },
  {
    id: "khen-thuong", label: "Khen thưởng",
    subs: [{ id: "_", label: "Khen thưởng", enabled: true }],
  },
  {
    id: "xu-huong", label: "Xu hướng",
    subs: [{ id: "_", label: "Xu hướng", enabled: true }],
  },
]

function extractSection(
  key: string,
  d: any,
  catLabel: string,
  subLabel: string
): ReportSection | null {
  if (!d) return null
  const base: ReportSection = {
    id: key,
    categoryLabel: catLabel,
    label: subLabel,
    stats: [],
    headers: [],
    rows: [],
  }

  switch (key) {
    case "nhan-su-tong-hop":
      base.stats = [
        { label: "Tổng nhân viên", value: d.tong_nhan_vien ?? 0 },
        { label: "Giáo viên", value: d.tong_giao_vien ?? 0 },
        { label: "Cán bộ", value: d.tong_can_bo ?? 0 },
        { label: "Đang làm", value: d.dang_lam ?? 0 },
        { label: "Nghỉ việc", value: d.nghi_viec ?? 0 },
        { label: "Nghỉ hưu", value: d.nghi_huu ?? 0 },
        { label: "Tỷ lệ có mặt", value: `${d.ty_le_co_mat ?? 0}%` },
      ]
      base.headers = ["Trạng thái", "Số lượng"]
      base.rows = [
        ["Đang làm", d.dang_lam ?? 0],
        ["Nghỉ việc", d.nghi_viec ?? 0],
        ["Nghỉ hưu", d.nghi_huu ?? 0],
      ]
      break
    case "nhan-su-bien-dong":
      base.stats = [
        { label: "NV mới", value: d.tong_vao ?? 0 },
        { label: "Nghỉ việc", value: d.tong_ra ?? 0 },
        { label: "Chuyển công tác", value: d.tong_chuyen ?? 0 },
      ]
      if (d.theo_thang?.length) {
        base.headers = ["Tháng", "Vào", "Ra"]
        base.rows = d.theo_thang.map((i: any) => [i.thang, i.vao, i.ra])
      }
      break
    case "nhan-su-demo":
      if (d.gioi_tinh?.length) {
        base.stats = d.gioi_tinh.map((i: any) => ({ label: i.name, value: i.value }))
      }
      if (d.do_tuoi?.length) {
        base.headers = ["Độ tuổi", "Số lượng"]
        base.rows = d.do_tuoi.map((i: any) => [i.name, i.value])
      }
      break
    case "nhan-su-trinh-do":
      if (d.trinh_do_hoc_van?.length) {
        base.stats = d.trinh_do_hoc_van.map((i: any) => ({ label: i.name, value: i.value }))
      }
      if (d.chuyen_mon?.length) {
        base.headers = ["Chuyên môn", "Số lượng"]
        base.rows = d.chuyen_mon.map((i: any) => [i.name, i.value])
      }
      break
    case "nhan-su-hop-dong":
      base.stats = [
        { label: "Tổng HĐ", value: d.tong ?? 0 },
        { label: "Sắp hết hạn", value: d.sap_het_han ?? 0 },
        { label: "Đã hết hạn", value: d.da_het_han ?? 0 },
        { label: "Cần gia hạn", value: d.can_gia_han ?? 0 },
      ]
      if (d.items?.length) {
        base.headers = ["Nhân viên", "Loại HĐ", "Ngày hết hạn", "Phòng ban"]
        base.rows = d.items.map((i: any) => [
          i.ho_ten, i.loai_hop_dong, i.ngay_het_han, i.phong_ban,
        ])
      }
      break
    case "cham-cong-tong-hop":
      base.stats = [
        { label: "Tổng có mặt", value: d.tong_co_mat ?? 0 },
        { label: "Tổng chuẩn", value: d.tong_chuan ?? 0 },
        { label: "Số NV", value: d.tong_nhan_vien ?? 0 },
        { label: "Tỷ lệ có mặt", value: `${d.ty_le_co_mat ?? 0}%` },
      ]
      if (d.theo_phong_ban?.length) {
        base.headers = ["Phòng ban", "Có mặt", "Chuẩn", "Số NV", "Tỷ lệ"]
        base.rows = d.theo_phong_ban.map((i: any) => [
          i.phong_ban, i.co_mat, i.chuan, i.so_nv, `${i.ty_le}%`,
        ])
      }
      break
    case "cham-cong-nghi-phep":
      base.stats = [
        { label: "Tổng đơn", value: d.tong_don ?? 0 },
        { label: "Đã duyệt", value: d.da_duyet ?? 0 },
        { label: "Chờ duyệt", value: d.cho_duyet ?? 0 },
        { label: "Tổng ngày nghỉ", value: d.tong_ngay_nghi ?? 0 },
      ]
      if (d.theo_thang?.length) {
        base.headers = ["Tháng", "Số đơn", "Số ngày"]
        base.rows = d.theo_thang.map((i: any) => [i.thang, i.so_don, i.so_ngay])
      }
      break
    case "cham-cong-di-muon":
      base.stats = [
        { label: "Tổng đi muộn", value: d.tong_muon ?? 0 },
        { label: "Tổng về sớm", value: d.tong_ve_som ?? 0 },
        { label: "Đúng giờ", value: d.dung_gio ?? 0 },
        { label: "Tỷ lệ đúng giờ", value: `${d.ty_le_dung_gio ?? 0}%` },
      ]
      if (d.theo_ngay?.length) {
        base.headers = ["Ngày", "Đi muộn", "Về sớm"]
        base.rows = d.theo_ngay.map((i: any) => [i.ngay, i.muon, i.ve_som])
      }
      break
    case "luong-chi-phi":
      base.stats = [
        { label: "Tổng chi phí", value: (d.tong_chi_phi ?? 0).toLocaleString() },
        { label: "Lương cơ bản", value: (d.tong_luong_co_ban ?? 0).toLocaleString() },
        { label: "Số NV", value: d.so_nhan_vien ?? 0 },
        { label: "Chi phí TB", value: (d.chi_phi_tb ?? 0).toLocaleString() },
      ]
      if (d.theo_thang?.length) {
        base.headers = ["Tháng", "Chi phí"]
        base.rows = d.theo_thang.map((i: any) => [i.thang, i.chi_phi?.toLocaleString()])
      }
      break
    case "luong-thue-bhxh":
      base.stats = [
        { label: "BHXH", value: (d.tong_bhxh ?? 0).toLocaleString() },
        { label: "BHYT", value: (d.tong_bhyt ?? 0).toLocaleString() },
        { label: "Thuế TNCN", value: (d.tong_thue_tncn ?? 0).toLocaleString() },
        { label: "Tổng cộng", value: (d.tong_cong ?? 0).toLocaleString() },
      ]
      if (d.theo_thang?.length) {
        base.headers = ["Tháng", "BHXH", "BHYT", "Thuế"]
        base.rows = d.theo_thang.map((i: any) => [
          i.thang, i.bhxh?.toLocaleString(), i.bhyt?.toLocaleString(), i.thue?.toLocaleString(),
        ])
      }
      break
    case "luong-so-sanh":
      base.stats = [
        { label: "Lương TB", value: (d.luong_tb ?? 0).toLocaleString() },
        { label: "Lương cao nhất", value: (d.luong_cao_nhat ?? 0).toLocaleString() },
        { label: "Lương thấp nhất", value: (d.luong_thap_nhat ?? 0).toLocaleString() },
        { label: "Chênh lệch", value: (d.chenh_lech ?? 0).toLocaleString() },
      ]
      if (d.theo_phong_ban?.length) {
        base.headers = ["Phòng ban", "Lương TB", "Số lượng"]
        base.rows = d.theo_phong_ban.map((i: any) => [
          i.phong_ban, i.luong_tb?.toLocaleString(), i.so_luong,
        ])
      }
      break
    case "khen-thuong":
      base.stats = [
        { label: "Khen thưởng", value: d.tong_khen ?? 0 },
        { label: "Kỷ luật", value: d.tong_ky ?? 0 },
        { label: "Tỷ lệ khen/kỷ", value: `${d.ty_le ?? 0}%` },
        { label: "Tổng tiền", value: (d.tong_tien ?? 0).toLocaleString() },
      ]
      if (d.chi_tiet?.length) {
        base.headers = ["Nhân viên", "Loại", "Hình thức", "Số tiền", "Ngày"]
        base.rows = d.chi_tiet.map((i: any) => [
          i.ho_ten, i.loai, i.hinh_thuc, i.so_tien?.toLocaleString(), i.ngay,
        ])
      }
      break
    case "xu-huong":
      if (d.xu_huong_nhan_su?.length) {
        base.stats = [
          { label: "Tháng trước", value: d.change_thang_truoc ? `${d.change_thang_truoc.percent}%` : "N/A" },
          { label: "Năm trước", value: d.change_nam_truoc ? `${d.change_nam_truoc.percent}%` : "N/A" },
        ]
        base.headers = ["Tháng", "Số lượng NV"]
        base.rows = d.xu_huong_nhan_su.map((i: any) => [i.thang, i.so_luong])
      }
      break
    default:
      return null
  }

  return base.stats.length > 0 || base.rows.length > 0 ? base : null
}

export function ExportAllDialog({ open, onOpenChange }: ExportAllDialogProps) {
  const now = new Date()
  const filters: BaoCaoFilters = {
    start_date: formatDate(subMonths(now, 1), "yyyy-MM-dd"),
    end_date: formatDate(now, "yyyy-MM-dd"),
  }

  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [exporting, setExporting] = useState(false)
  const [title, setTitle] = useState("Báo cáo tổng hợp THPT Thăng Long")
  const [categories, setCategories] = useState<CatDef[]>(
    JSON.parse(JSON.stringify(DEFAULT_CATEGORIES))
  )
  const [previewHtml, setPreviewHtml] = useState("")
  const previewInitiated = useRef(false)

  const hTongQuan = useBaoCaoTongQuan(filters)
  const hBienDong = useBaoCaoNhanSuBienDong(filters)
  const hDemo = useBaoCaoNhanSuDemo(filters)
  const hTrinhDo = useBaoCaoNhanSuTrinhDo(filters)
  const hHopDong = useBaoCaoHopDong(filters)
  const hCCTongHop = useBaoCaoChamCongTongHop(filters)
  const hNghiPhep = useBaoCaoChamCongNghiPhep(filters)
  const hDiMuon = useBaoCaoDiMuon(filters)
  const hChiPhi = useBaoCaoLuongChiPhi(filters)
  const hThueBHXH = useBaoCaoLuongThueBHXH(filters)
  const hLuongSS = useBaoCaoLuongSoSanh(filters)
  const hKhenThuong = useBaoCaoKhenThuong(filters)
  const hXuHuong = useBaoCaoXuHuong(filters)

  const hooksMap: Record<string, any> = {
    "nhan-su-tong-hop": hTongQuan,
    "nhan-su-bien-dong": hBienDong,
    "nhan-su-demo": hDemo,
    "nhan-su-trinh-do": hTrinhDo,
    "nhan-su-hop-dong": hHopDong,
    "cham-cong-tong-hop": hCCTongHop,
    "cham-cong-nghi-phep": hNghiPhep,
    "cham-cong-di-muon": hDiMuon,
    "luong-chi-phi": hChiPhi,
    "luong-thue-bhxh": hThueBHXH,
    "luong-so-sanh": hLuongSS,
    "khen-thuong": hKhenThuong,
    "xu-huong": hXuHuong,
  }

  const isLoading = Object.values(hooksMap).some((h: any) => h.isLoading)

  const collectSections = useCallback((): ReportSection[] => {
    const sections: ReportSection[] = []
    for (const cat of categories) {
      for (const sub of cat.subs) {
        if (!sub.enabled) continue
        const key = cat.id === "khen-thuong" || cat.id === "xu-huong"
          ? cat.id
          : `${cat.id}-${sub.id}`
        const hook = hooksMap[key]
        if (!hook?.data) continue
        const section = extractSection(key, hook.data, cat.label, sub.label)
        if (section) sections.push(section)
      }
    }
    return sections
  }, [categories, hooksMap])

  const buildPreview = useCallback(() => {
    previewInitiated.current = true
    const sections = collectSections()
    const report: MultiSectionReport = {
      title,
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      sections,
    }
    setPreviewHtml(buildMultiSectionPreviewHtml(report))
  }, [collectSections, title, filters])

  useEffect(() => {
    if (previewInitiated.current && !isLoading) {
      const sections = collectSections()
      const report: MultiSectionReport = {
        title,
        subtitle: `${filters.start_date} — ${filters.end_date}`,
        sections,
      }
      setPreviewHtml(buildMultiSectionPreviewHtml(report))
    }
  }, [categories, title, isLoading])

  const toggleSub = (catId: string, subIdx: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              subs: cat.subs.map((s, i) =>
                i === subIdx ? { ...s, enabled: !s.enabled } : s
              ),
            }
          : cat
      )
    )
  }

  const toggleCat = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat
        const allOn = cat.subs.every((s) => s.enabled)
        return {
          ...cat,
          subs: cat.subs.map((s) => ({ ...s, enabled: !allOn })),
        }
      })
    )
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const sections = collectSections()
      const report: MultiSectionReport = {
        title,
        subtitle: `${filters.start_date} — ${filters.end_date}`,
        sections,
      }
      const filename = `${title}_${new Date().toISOString().slice(0, 10)}`
      if (format === "excel") {
        generateMultiSheetExcel(report, filename)
      } else {
        await generateStyledPDF(report, filename)
      }
      try {
        await apiGateway.post("/api/v1/thong-ke/bao-cao/export", null, {
          params: { loai_bao_cao: "tong-hop", dinh_dang: format },
        })
      } catch {}
      onOpenChange(false)
      previewInitiated.current = false
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="full"
        className="h-screen flex flex-col gap-0 p-0 overflow-hidden max-w-[95vw] max-h-[95vh]"
      >
        <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
          <DialogTitle className="text-base">Xuất toàn bộ báo cáo</DialogTitle>
          <DialogDescription>
            Mỗi mục báo cáo hiển thị riêng với thống kê và bảng dữ liệu
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 bg-muted p-4 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full rounded-lg border bg-white shadow-lg"
                title="Full Report Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Nhấn "Xem trước" để tạo bản xem
              </div>
            )}
          </div>

          <div className="w-80 border-l bg-white p-5 overflow-y-auto shrink-0 flex flex-col gap-5">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tiêu đề
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>

            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Chọn mục báo cáo
              </div>
              {categories.map((cat) => {
                const allOn = cat.subs.every((s) => s.enabled)
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={allOn}
                        onCheckedChange={() => toggleCat(cat.id)}
                        className="size-4"
                      />
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {cat.label}
                      </span>
                    </label>
                    <div className="ml-6 space-y-1">
                      {cat.subs.map((sub, idx) => (
                        <label
                          key={`${cat.id}-${sub.id}-${idx}`}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <Checkbox
                            checked={sub.enabled}
                            onCheckedChange={() => toggleSub(cat.id, idx)}
                            className="size-3.5"
                          />
                          <span className="text-xs group-hover:text-primary transition-colors">
                            {sub.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Định dạng
              </div>
              <div className="flex gap-2">
                <Button
                  variant={format === "pdf" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 gap-1.5 text-xs",
                    format === "pdf" && "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => setFormat("pdf")}
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </Button>
                <Button
                  variant={format === "excel" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 gap-1.5 text-xs",
                    format === "excel" && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => setFormat("excel")}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </Button>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t space-y-2">
              <Button
                variant="outline"
                className="w-full gap-1.5 text-xs"
                onClick={buildPreview}
                disabled={isLoading}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Xem trước
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting || isLoading}
                className={cn(
                  "w-full gap-2",
                  format === "pdf"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {exporting ? "Đang xuất..." : "Tải toàn bộ"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
