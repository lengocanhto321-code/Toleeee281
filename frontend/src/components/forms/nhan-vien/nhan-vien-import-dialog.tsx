"use client"

import { useState, useCallback, useMemo } from "react"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useImportNhanVien, type ImportResult } from "@/hooks/nhan-vien/use-nhan-vien-mutations"

const COLUMN_MAP: Record<string, string> = {
  "họ tên": "ho_ten",
  "hoten": "ho_ten",
  "họ và tên": "ho_ten",
  "giới tính": "gioi_tinh",
  "gioitinh": "gioi_tinh",
  "ngày sinh": "ngay_sinh",
  "ngaysinh": "ngay_sinh",
  "quê quán": "que_quan",
  "quequan": "que_quan",
  "địa chỉ": "dia_chi_thuong_tru",
  "diachi": "dia_chi_thuong_tru",
  "số điện thoại": "so_dien_thoai",
  "sodienthoai": "so_dien_thoai",
  "điện thoại": "so_dien_thoai",
  "email": "email",
  "số cccd": "so_cccd",
  "socccd": "so_cccd",
  "cccd": "so_cccd",
  "nơi sinh": "noi_sinh",
  "noisinh": "noi_sinh",
  "dân tộc": "dan_toc",
  "dantoc": "dan_toc",
  "tôn giáo": "ton_giao",
  "tongiao": "ton_giao",
  "loại nhân viên": "loai_nhan_vien",
  "loainhanvien": "loai_nhan_vien",
  "cấp học": "cap_hoc",
  "caphoc": "cap_hoc",
  "môn dạy": "mon_day",
  "monday": "mon_day",
  "loại hợp đồng": "loai_hop_dong",
  "loaihopdong": "loai_hop_dong",
  "ngày vào làm": "ngay_vao_lam",
  "ngayvaolam": "ngay_vao_lam",
  "tình trạng hôn nhân": "tinh_trang_hon_nhan",
  "ghi chú": "ghi_chu",
  "trạng thái": "trang_thai",
  "trangthai": "trang_thai",
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[\s_-]+/g, "")
}

function mapRowToFields(rawRow: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rawRow)) {
    if (value == null || value === "") continue
    const normalized = normalizeHeader(key)
    const fieldKey = COLUMN_MAP[normalized]
    if (fieldKey) {
      mapped[fieldKey] = value
    }
  }

  if (mapped.gioi_tinh && typeof mapped.gioi_tinh === "string") {
    const g = mapped.gioi_tinh.toLowerCase().trim()
    if (g === "nam" || g === "m") mapped.gioi_tinh = "Nam"
    else if (g === "nữ" || g === "nu" || g === "f") mapped.gioi_tinh = "Nữ"
    else mapped.gioi_tinh = "Khác"
  }

  if (mapped.loai_nhan_vien && typeof mapped.loai_nhan_vien === "string") {
    const loai = (mapped.loai_nhan_vien as string).toLowerCase().trim()
    if (loai.includes("giáo viên") || loai === "gv" || loai === "giao_vien") mapped.loai_nhan_vien = "giao_vien"
    else if (loai.includes("cán bộ") || loai === "cb" || loai === "can_bo") mapped.loai_nhan_vien = "can_bo"
    else if (loai.includes("nhân viên") || loai === "nv" || loai === "nhan_vien") mapped.loai_nhan_vien = "nhan_vien"
  }

  if (mapped.trang_thai && typeof mapped.trang_thai === "string") {
    const st = (mapped.trang_thai as string).toLowerCase().trim()
    if (st.includes("đang làm") || st === "dang_lam") mapped.trang_thai = "dang_lam"
    else if (st.includes("nghỉ việc") || st === "nghi_viec") mapped.trang_thai = "nghi_viec"
    else if (st.includes("nghỉ hưu") || st === "nghi_huu") mapped.trang_thai = "nghi_huu"
  }

  return mapped
}

interface NhanVienImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NhanVienImportDialog({ open, onOpenChange }: NhanVienImportDialogProps) {
  const [parsedRows, setParsedRows] = useState<Record<string, unknown>[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [fileName, setFileName] = useState("")
  const importMutation = useImportNhanVien()
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportResult(null)
    setParseErrors([])

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array", cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })

        if (rawRows.length === 0) {
          setParseErrors(["File trống hoặc không có dữ liệu"])
          setParsedRows([])
          return
        }

        const errors: string[] = []
        const mapped: Record<string, unknown>[] = []

        for (let i = 0; i < rawRows.length; i++) {
          const row = mapRowToFields(rawRows[i])
          if (!row.ho_ten || String(row.ho_ten).trim().length < 2) {
            errors.push(`Dòng ${i + 2}: Thiếu họ tên`)
            continue
          }
          mapped.push(row)
        }

        setParseErrors(errors)
        setParsedRows(mapped)
      } catch {
        setParseErrors(["Không thể đọc file. Vui lòng kiểm tra định dạng Excel."])
        setParsedRows([])
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ""
  }, [])

  const handleImport = () => {
    if (parsedRows.length === 0) return
    importMutation.mutate(parsedRows, {
      onSuccess: (result) => {
        setImportResult(result)
        if (result.failed === 0) {
          setTimeout(() => {
            onOpenChange(false)
            resetState()
          }, 2000)
        }
      },
    })
  }

  const resetState = () => {
    setParsedRows([])
    setParseErrors([])
    setFileName("")
    setImportResult(null)
    importMutation.reset()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleDownloadTemplate = () => {
    const headers = [
      "Họ tên", "Giới tính", "Ngày sinh", "Quê quán", "Địa chỉ",
      "Số điện thoại", "Email", "Số CCCD", "Nơi sinh", "Dân tộc",
      "Tôn giáo", "Loại nhân viên", "Cấp học", "Môn dạy",
      "Loại hợp đồng", "Ngày vào làm", "Tình trạng hôn nhân",
      "Ghi chú", "Trạng thái",
    ]
    const ws = XLSX.utils.aoa_to_sheet([headers])
    ws["!cols"] = headers.map(() => ({ wch: 18 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([buf], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template-import-nhan-vien.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount = parsedRows.length
  const showResult = importResult !== null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import nhân viên từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx) chứa danh sách nhân viên. Hệ thống sẽ tự động nhận diện cột dữ liệu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {!showResult ? (
            <>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Tải template
                </Button>
              </div>

              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer"
                onClick={() => document.getElementById("import-file-input")?.click()}
              >
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  {fileName || "Chọn file Excel hoặc kéo thả vào đây"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Hỗ trợ .xlsx, .xls</p>
                <input
                  id="import-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {parseErrors.length} dòng bị bỏ qua
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {parseErrors.map((err, i) => (
                      <p key={i} className="text-xs text-amber-700">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              {validCount > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Xem trước ({validCount} nhân viên)
                    </p>
                    <Badge variant="secondary">{validCount} dòng hợp lệ</Badge>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">#</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Họ tên</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Giới tính</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Loại NV</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">SĐT</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {parsedRows.slice(0, 20).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 text-slate-500">{i + 1}</td>
                              <td className="px-3 py-1.5 font-medium text-slate-900">{String(row.ho_ten || "")}</td>
                              <td className="px-3 py-1.5 text-slate-600">{String(row.gioi_tinh || "")}</td>
                              <td className="px-3 py-1.5 text-slate-600">{String(row.loai_nhan_vien || "")}</td>
                              <td className="px-3 py-1.5 text-slate-600">{String(row.so_dien_thoai || "")}</td>
                              <td className="px-3 py-1.5 text-slate-600">{String(row.email || "")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {validCount > 20 && (
                        <p className="text-xs text-slate-500 text-center py-2">... và {validCount - 20} dòng khác</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                {importResult.failed === 0 ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    Import hoàn tất
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="text-emerald-600 font-medium">{importResult.success} thành công</span>
                    {importResult.failed > 0 && (
                      <span className="text-amber-600 font-medium">, {importResult.failed} thất bại</span>
                    )}
                    {" "}trên tổng {importResult.total} dòng
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    Chi tiết lỗi
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-700">
                        Dòng {err.row} ({err.ho_ten}): {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {showResult ? "Đóng" : "Hủy"}
          </Button>
          {!showResult && (
            <Button
              onClick={handleImport}
              disabled={validCount === 0 || importMutation.isPending}
              className="gap-1.5"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {validCount} nhân viên
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
