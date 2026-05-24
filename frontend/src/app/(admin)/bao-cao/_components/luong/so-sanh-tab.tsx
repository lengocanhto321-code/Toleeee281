"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoLuongSoSanh } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const LuongSoSanhTab = React.memo(function LuongSoSanhTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoLuongSoSanh(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Lương - So sánh", headers: [], rows: [] }
    return {
      title: "Báo cáo Lương - So sánh",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Phòng ban", "Lương TB", "Số lượng NV"],
      rows: data.theo_phong_ban?.map(pb => [pb.phong_ban, pb.luong_tb, pb.so_luong]) || [],
      stats: [
        { label: "Lương trung bình", value: data.luong_tb?.toLocaleString() ?? "—" },
        { label: "Lương cao nhất", value: data.luong_cao_nhat?.toLocaleString() ?? "—" },
        { label: "Lương thấp nhất", value: data.luong_thap_nhat?.toLocaleString() ?? "—" },
        { label: "Chênh lệch", value: data.chenh_lech?.toLocaleString() ?? "—" },
      ],
    }
  }, [data, filters])

  const groupedBarOption = React.useMemo(() => {
    if (!data?.theo_phong_ban) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Lương TB', 'Số lượng NV'] },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
      xAxis: { type: 'category', data: data.theo_phong_ban.map(pb => pb.phong_ban) },
      yAxis: [
        { type: 'value', name: 'Lương TB' },
        { type: 'value', name: 'Số lượng' },
      ],
      series: [
        {
          name: 'Lương TB', type: 'bar',
          data: data.theo_phong_ban.map(pb => pb.luong_tb),
          barWidth: '30%', color: '#d97706',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'Số lượng NV', type: 'bar', yAxisIndex: 1,
          data: data.theo_phong_ban.map(pb => pb.so_luong),
          barWidth: '30%', color: '#1e40af',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Lương - So sánh</h2>
        <ExportButton reportType="luong-so-sanh" reportLabel="Lương - So sánh" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp so sánh lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.luong_tb?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Lương TB</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.luong_cao_nhat?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Lương cao nhất</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.luong_thap_nhat?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Lương thấp nhất</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.chenh_lech?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Chênh lệch</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">So sánh lương theo phòng ban</CardTitle></CardHeader>
        <CardContent>
          {data?.theo_phong_ban?.length ? (
            <EChartsWrapper option={groupedBarOption} height={400} />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
              Chưa có dữ liệu phòng ban để so sánh
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})
