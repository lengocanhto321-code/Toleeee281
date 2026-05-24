"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoNhanSuTrinhDo } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const TrinhDoTab = React.memo(function TrinhDoTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoNhanSuTrinhDo(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Nhân sự - Trình độ", headers: [], rows: [] }
    const rows: (string | number)[][] = []
    data.trinh_do_hoc_van?.forEach(item => rows.push(["Học vấn", item.name, item.value]))
    data.chuyen_mon?.forEach(item => rows.push(["Chuyên môn", item.name, item.value]))
    return {
      title: "Báo cáo Nhân sự - Trình độ",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Nhóm", "Phân loại", "Số lượng"],
      rows,
    }
  }, [data, filters])

  const pieOption = React.useMemo(() => {
    if (!data?.trinh_do_hoc_van) return {}
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: { fontSize: 11, color: '#475569' },
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [{
        type: 'pie', radius: ['30%', '55%'], center: ['50%', '42%'],
        data: data.trinh_do_hoc_van.filter(d => d.value > 0),
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }],
    }
  }, [data])

  const barOption = React.useMemo(() => {
    if (!data?.chuyen_mon) return {}
    const sorted = [...data.chuyen_mon].sort((a, b) => b.value - a.value).slice(0, 10)
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      yAxis: {
        type: 'category',
        data: sorted.map(item => item.name).reverse(),
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      series: [{
        type: 'bar',
        data: sorted.map(item => item.value).reverse(),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#7c3aed' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: '60%',
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Nhân sự - Trình độ</h2>
        <ExportButton reportType="nhan-su-trinh-do" reportLabel="Nhân sự - Trình độ" data={exportData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Trình độ học vấn</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Chuyên môn (Top 10)</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
