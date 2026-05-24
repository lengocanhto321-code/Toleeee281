"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoLuongChiPhi } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const ChiPhiTab = React.memo(function ChiPhiTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoLuongChiPhi(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Lương - Chi phí", headers: [], rows: [] }
    return {
      title: "Báo cáo Lương - Chi phí",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Phòng ban", "Chi phí", "Số NV"],
      rows: data.theo_phong_ban?.map(item => [item.phong_ban, item.chi_phi?.toLocaleString(), item.so_nv]) || [],
      stats: [
        { label: "Tổng chi phí", value: data.tong_chi_phi?.toLocaleString() },
        { label: "Lương cơ bản", value: data.tong_luong_co_ban?.toLocaleString() },
        { label: "Số NV", value: data.so_nhan_vien },
        { label: "Chi phí TB", value: data.chi_phi_tb?.toLocaleString() },
      ],
    }
  }, [data, filters])

  const barOption = React.useMemo(() => {
    if (!data?.theo_phong_ban) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: data.theo_phong_ban.map(item => item.phong_ban) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: data.theo_phong_ban.map(item => item.chi_phi),
        barWidth: '40%',
        color: '#1e40af',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      }],
    }
  }, [data])

  const areaOption = React.useMemo(() => {
    if (!data?.theo_thang) return {}
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: data.theo_thang.map(item => item.thang), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{
        type: 'line',
        data: data.theo_thang.map(item => item.chi_phi),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        color: '#d97706',
        itemStyle: { color: '#d97706' },
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Lương - Chi phí</h2>
        <ExportButton reportType="luong-chi-phi" reportLabel="Lương - Chi phí" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp chi phí lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_chi_phi?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Tổng chi phí</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.tong_luong_co_ban?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Lương cơ bản</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.so_nhan_vien ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Số NV</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{data.chi_phi_tb?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Chi phí TB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Chi phí theo phòng ban</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={barOption} height={350} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Xu hướng chi phí theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={areaOption} height={350} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
