"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoNhanSuDemo } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

function buildPieOption(chartData: { name: string; value: number }[]) {
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
      data: chartData.filter(d => d.value > 0),
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
}

function buildBarOption(chartData: { name: string; value: number }[], color: string = '#1e40af') {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLabel: { fontSize: 11, color: '#475569' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#475569' },
    },
    series: [{
      type: 'bar',
      data: chartData.map(d => d.value),
      barWidth: '50%',
      itemStyle: { color, borderRadius: [6, 6, 0, 0] },
      emphasis: {
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 11,
        fontWeight: 600,
        color: '#334155',
      },
    }],
  }
}

export const DemoGraphicsTab = React.memo(function DemoGraphicsTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoNhanSuDemo(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Nhân sự - Demographics", headers: [], rows: [] }
    const rows: (string | number)[][] = []
    data.gioi_tinh?.forEach(item => rows.push(["Giới tính", item.name, item.value]))
    data.do_tuoi?.forEach(item => rows.push(["Độ tuổi", item.name, item.value]))
    data.loai_nhan_vien?.forEach(item => rows.push(["Loại NV", item.name, item.value]))
    return {
      title: "Báo cáo Nhân sự - Demographics",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Nhóm", "Phân loại", "Số lượng"],
      rows,
    }
  }, [data, filters])

  const gioiTinhOption = React.useMemo(() => {
    if (!data?.gioi_tinh) return {}
    return buildPieOption(data.gioi_tinh)
  }, [data])

  const doTuoiOption = React.useMemo(() => {
    if (!data?.do_tuoi) return {}
    return buildBarOption(data.do_tuoi, '#7c3aed')
  }, [data])

  const loaiNvOption = React.useMemo(() => {
    if (!data?.loai_nhan_vien) return {}
    return buildPieOption(data.loai_nhan_vien)
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Nhân sự - Demographics</h2>
        <ExportButton reportType="nhan-su-demo" reportLabel="Nhân sự - Demographics" data={exportData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Giới tính</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={gioiTinhOption} height={400} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Độ tuổi</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={doTuoiOption} height={400} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Loại nhân viên</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={loaiNvOption} height={400} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
