"use client"

import React, { useState, useCallback, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Label } from "@/components/ui/label"
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Eye,
  RefreshCw,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  generateExcel,
  generatePDF,
  buildPreviewHtml,
  captureVisibleCharts,
  type ReportExportData,
} from "@/lib/report-export"
import { apiGateway } from "@/lib/axios"

interface ExportButtonProps {
  reportType: string
  reportLabel: string
  data: ReportExportData
}

type ExportFormat = "excel" | "pdf"

export function ExportButton({
  reportType,
  reportLabel,
  data,
}: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [exporting, setExporting] = useState(false)
  const [building, setBuilding] = useState(false)
  const [title, setTitle] = useState(data.title)
  const [subtitle, setSubtitle] = useState(data.subtitle || "")
  const [enabledCols, setEnabledCols] = useState<boolean[]>(
    data.headers.map(() => true)
  )
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [chartImages, setChartImages] = useState<string[]>([])
  const previewVersion = useRef(0)

  const buildFilteredData = useCallback((): ReportExportData => {
    const enabledIndices = enabledCols
      .map((v, i) => (v ? i : -1))
      .filter((i) => i >= 0)
    return {
      title,
      subtitle: subtitle || undefined,
      headers: enabledIndices.map((i) => data.headers[i]),
      rows: data.rows.map((row) => enabledIndices.map((i) => row[i])),
      stats: data.stats,
      chartImages,
    }
  }, [title, subtitle, enabledCols, data, chartImages])

  const refreshPreview = useCallback(() => {
    setBuilding(true)
    const version = ++previewVersion.current
    setTimeout(() => {
      const charts = captureVisibleCharts()
      const enabledIndices = enabledCols
        .map((v, i) => (v ? i : -1))
        .filter((i) => i >= 0)
      const filtered: ReportExportData = {
        title,
        subtitle: subtitle || undefined,
        headers: enabledIndices.map((i) => data.headers[i]),
        rows: data.rows.map((row) => enabledIndices.map((i) => row[i])),
        stats: data.stats,
        chartImages: charts,
      }
      if (version === previewVersion.current) {
        setChartImages(charts)
        setPreviewHtml(buildPreviewHtml(filtered))
        setBuilding(false)
      }
    }, 100)
  }, [title, subtitle, enabledCols, data])

  const handleOpenDialog = (fmt: ExportFormat) => {
    setFormat(fmt)
    setTitle(data.title)
    setSubtitle(data.subtitle || "")
    setEnabledCols(data.headers.map(() => true))
    setChartImages([])
    setPreviewHtml("")
    setDialogOpen(true)

    setTimeout(() => {
      const charts = captureVisibleCharts()
      setChartImages(charts)
      const filtered: ReportExportData = {
        title: data.title,
        subtitle: data.subtitle,
        headers: data.headers,
        rows: data.rows,
        stats: data.stats,
        chartImages: charts,
      }
      setPreviewHtml(buildPreviewHtml(filtered))
    }, 200)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const filteredData = buildFilteredData()
      const filename = `${title}_${new Date().toISOString().slice(0, 10)}`
      if (format === "excel") {
        generateExcel(filteredData, filename)
      } else {
        await generatePDF(filteredData, filename)
      }
      await apiGateway.post("/api/v1/thong-ke/bao-cao/export", null, {
        params: { loai_bao_cao: reportType, dinh_dang: format },
      })
      setDialogOpen(false)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  const toggleCol = (idx: number) => {
    setEnabledCols((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Xuất báo cáo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleOpenDialog("pdf")}
            className="gap-2.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>Xuất PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDialog("excel")}
            className="gap-2.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          size="full"
          className="h-screen flex flex-col gap-0 p-0 overflow-hidden max-w-[95vw] max-h-[95vh]"
          showCloseButton
        >
          <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="w-4 h-4 text-primary" />
              Xem trước báo cáo — {format === "pdf" ? "PDF" : "Excel"}
            </DialogTitle>
            <DialogDescription>
              Chỉnh sửa nội dung, nhấn "Cập nhật" để làm mới xem trước
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex min-h-0">
            <div className="flex-1 bg-muted p-4 overflow-auto">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full rounded-lg border bg-white shadow-lg"
                  title="Report Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo xem trước...
                </div>
              )}
            </div>

            <div className="w-80 border-l bg-white p-5 overflow-y-auto shrink-0 flex flex-col gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Chỉnh sửa
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={refreshPreview}
                    disabled={building}
                  >
                    <RefreshCw className={cn("w-3 h-3", building && "animate-spin")} />
                    Cập nhật
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tiêu đề</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phụ đề</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {data.headers.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cột hiển thị
                  </div>
                  <div className="space-y-1.5">
                    {data.headers.map((header, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <Checkbox
                          checked={enabledCols[idx]}
                          onCheckedChange={() => toggleCol(idx)}
                          className="size-4"
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {header}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {chartImages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Biểu đồ ({chartImages.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {chartImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Chart ${idx + 1}`}
                        className="w-full rounded border bg-muted"
                      />
                    ))}
                  </div>
                </div>
              )}

              {data.stats && data.stats.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tổng quan
                  </div>
                  <div className="space-y-1">
                    {data.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-muted rounded-md px-3 py-1.5"
                      >
                        <span className="text-muted-foreground">
                          {stat.label}
                        </span>
                        <span className="font-semibold">
                          {String(stat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 border-t space-y-2">
                <div className="text-xs text-muted-foreground">
                  {data.rows.length} dòng · {chartImages.length} biểu đồ
                </div>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
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
                  {exporting
                    ? "Đang xuất..."
                    : `Tải ${format === "pdf" ? "PDF" : "Excel"}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
