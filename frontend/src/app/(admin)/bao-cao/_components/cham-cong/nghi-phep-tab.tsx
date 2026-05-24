"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoChamCongNghiPhep } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const NghiPhepTab = React.memo(function NghiPhepTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoChamCongNghiPhep(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Chấm công - Nghỉ phép", headers: [], rows: [] }
    return {
      title: "Báo cáo Chấm công - Nghỉ phép",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Lý do", "Số lượng"],
      rows: data.theo_ly_do?.map(item => [item.name, item.value]) || [],
      stats: [
        { label: "Tổng đơn", value: data.tong_don },
        { label: "Đã duyệt", value: data.da_duyet },
        { label: "Chờ duyệt", value: data.cho_duyet },
        { label: "Tổng ngày nghỉ", value: data.tong_ngay_nghi },
      ],
    }
  }, [data, filters])

  const pieOption = React.useMemo(() => {
    if (!data?.theo_ly_do) return {}
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      grid: { left: '3%', right: '20%', top: '5%', bottom: '3%', containLabel: true },
      legend: {
        orient: 'vertical', right: '2%', top: 'center',
        textStyle: { fontSize: 12, color: '#475569' },
        icon: 'roundRect', itemWidth: 12, itemHeight: 12,
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['28%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        data: data.theo_ly_do,
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
        data: data.theo_thang.map(item => item.so_don),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        color: '#8b5cf6',
        itemStyle: { color: '#8b5cf6' },
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Chấm công - Nghỉ phép</h2>
        <ExportButton reportType="cham-cong-nghi-phep" reportLabel="Chấm công - Nghỉ phép" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp nghỉ phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_don}</div>
              <div className="text-xs text-muted-foreground">Tổng đơn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.da_duyet}</div>
              <div className="text-xs text-muted-foreground">Đã duyệt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.cho_duyet}</div>
              <div className="text-xs text-muted-foreground">Chờ duyệt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{data.tong_ngay_nghi}</div>
              <div className="text-xs text-muted-foreground">Tổng ngày nghỉ</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Nghỉ phép theo lý do</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={350} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Số đơn theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={areaOption} height={350} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
