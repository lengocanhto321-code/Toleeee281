"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { generateExcel, generatePDF, type ReportExportData } from "@/lib/report-export"
import { apiGateway } from "@/lib/axios"

interface ExportButtonProps {
  reportType: string
  reportLabel: string
  data: ReportExportData
}

export function ExportButton({ reportType, reportLabel, data }: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(format)
    setOpen(false)
    try {
      const filename = `${reportLabel}_${new Date().toISOString().slice(0, 10)}`
      if (format === "excel") {
        generateExcel(data, filename)
      } else {
        generatePDF(data, filename)
      }
      await apiGateway.post("/api/v1/thong-ke/bao-cao/export", null, {
        params: { loai_bao_cao: reportType, dinh_dang: format },
      })
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={!!exporting}
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Xuất báo cáo
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <button
          onClick={() => handleExport("excel")}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Excel (.xlsx)</span>
        </button>
        <button
          onClick={() => handleExport("pdf")}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>PDF</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}
