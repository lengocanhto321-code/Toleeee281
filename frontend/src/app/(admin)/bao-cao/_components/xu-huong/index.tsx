"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoXuHuong } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const XuHuongTab = React.memo(function XuHuongTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoXuHuong(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Xu hướng", headers: [], rows: [] }
    return {
      title: "Báo cáo Xu hướng",
      subtitle: `Tháng ${filters.thang}/${filters.nam}`,
      headers: ["Tháng", "Nhân sự", "Lương (triệu)", "Nghỉ phép (ngày)"],
      rows: data.xu_huong_nhan_su.map((item, i) => [
        item.thang,
        item.so_luong,
        data.xu_huong_luong[i]?.tong_luong ?? 0,
        data.xu_huong_nghi_phep[i]?.so_ngay ?? 0,
      ]),
      stats: [
        { label: "So với tháng trước", value: `${data.change_thang_truoc.direction === "up" ? "+" : ""}${data.change_thang_truoc.percent}%` },
        { label: "So với năm trước", value: `${data.change_nam_truoc.direction === "up" ? "+" : ""}${data.change_nam_truoc.percent}%` },
      ],
    }
  }, [data, filters])

  const lineOption = React.useMemo(() => {
    if (!data) return {}
    const months = data.xu_huong_nhan_su.map(item => item.thang)
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Nhân sự', 'Lương (triệu)', 'Nghỉ phép (ngày)'] },
      xAxis: { type: 'category', data: months },
      yAxis: [
        { type: 'value', name: 'Nhân sự' },
        { type: 'value', name: 'Lương' },
        { type: 'value', name: 'Nghỉ phép' },
      ],
      series: [
        {
          name: 'Nhân sự', type: 'line',
          data: data.xu_huong_nhan_su.map(item => item.so_luong),
          smooth: true, color: '#1e40af',
        },
        {
          name: 'Lương (triệu)', type: 'line', yAxisIndex: 1,
          data: data.xu_huong_luong.map(item => item.tong_luong),
          smooth: true, color: '#d97706',
        },
        {
          name: 'Nghỉ phép (ngày)', type: 'line', yAxisIndex: 2,
          data: data.xu_huong_nghi_phep.map(item => item.so_ngay),
          smooth: true, color: '#dc2626',
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
        <h2 className="text-sm font-medium text-muted-foreground">Xu hướng</h2>
        <ExportButton reportType="xu-huong" reportLabel="Xu hướng" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Xu hướng thay đổi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.change_thang_truoc.direction === 'up' ? '+' : ''}{data.change_thang_truoc.percent}%</div>
              <div className="text-xs text-muted-foreground">So với tháng trước</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.change_nam_truoc.direction === 'up' ? '+' : ''}{data.change_nam_truoc.percent}%</div>
              <div className="text-xs text-muted-foreground">So với năm trước</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Xu hướng nhân sự, lương & nghỉ phép</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
