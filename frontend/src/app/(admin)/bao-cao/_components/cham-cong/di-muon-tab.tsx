"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import React from "react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoDiMuon } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"

export const DiMuonTab = React.memo(function DiMuonTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoDiMuon(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Chấm công - Đi muộn", headers: [], rows: [] }
    return {
      title: "Báo cáo Chấm công - Đi muộn",
      subtitle: `Tháng ${filters.thang}/${filters.nam}`,
      headers: ["Nhân viên", "Phòng ban", "Số lần muộn", "Số lần về sớm"],
      rows: data.chi_tiet.map(item => [item.ho_ten, item.phong_ban, item.so_lan_muon, item.so_lan_ve_som]),
      stats: [
        { label: "Tổng đi muộn", value: data.tong_muon },
        { label: "Tổng về sớm", value: data.tong_ve_som },
        { label: "Tỷ lệ đúng giờ", value: `${data.ty_le_dung_gio}%` },
        { label: "Vi phạm", value: data.vi_pham },
      ],
    }
  }, [data, filters])

  const heatmapOption = React.useMemo(() => {
    if (!data || !data.theo_ngay.length) return {}
    const days = data.theo_ngay.map(item => item.ngay)
    const heatData: [number, number, number][] = []
    data.theo_ngay.forEach((item, dayIdx) => {
      heatData.push([0, dayIdx, item.muon])
      heatData.push([1, dayIdx, item.ve_som])
    })
    const maxVal = Math.max(...data.theo_ngay.map(item => Math.max(item.muon, item.ve_som)), 1)
    return {
      tooltip: { position: 'top' },
      grid: { top: '10%', bottom: '15%' },
      xAxis: { type: 'category', data: ['Đi muộn', 'Về sớm'], splitArea: { show: true } },
      yAxis: { type: 'category', data: days, splitArea: { show: true } },
      visualMap: {
        min: 0, max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: { color: ['#fef3c7', '#fde68a', '#f59e0b', '#dc2626'] },
      },
      series: [{
        type: 'heatmap',
        data: heatData,
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Chấm công - Đi muộn</h2>
        <ExportButton reportType="cham-cong-di-muon" reportLabel="Chấm công - Đi muộn" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp đi muộn / về sớm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_muon}</div>
              <div className="text-xs text-muted-foreground">Tổng đi muộn</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.tong_ve_som}</div>
              <div className="text-xs text-muted-foreground">Tổng về sớm</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{data.ty_le_dung_gio}%</div>
              <div className="text-xs text-muted-foreground">Tỷ lệ đúng giờ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.vi_pham}</div>
              <div className="text-xs text-muted-foreground">Vi phạm</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Đi muộn / Về sớm theo ngày</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={heatmapOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
