"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoNhanSuBienDong } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const BienDongTab = React.memo(function BienDongTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoNhanSuBienDong(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Nhân sự - Biến động", headers: [], rows: [] }
    return {
      title: "Báo cáo Nhân sự - Biến động",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Chỉ số", "Giá trị"],
      rows: [
        ["Nhân viên mới", data.tong_vao],
        ["Nghỉ việc", data.tong_ra],
        ["Chuyển công tác", data.tong_chuyen],
      ],
      stats: [
        { label: "Nhân viên mới", value: data.tong_vao },
        { label: "Nghỉ việc", value: data.tong_ra },
        { label: "Chuyển công tác", value: data.tong_chuyen },
      ],
    }
  }, [data, filters])

  const barOption = React.useMemo(() => {
    if (!data?.theo_thang) return {}
    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['Nhân viên mới', 'Nghỉ việc'],
        top: 5,
        left: 'center',
        textStyle: { fontSize: 11, color: '#475569' },
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        padding: [5, 10],
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.theo_thang.map(item => item.thang),
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      series: [
        {
          name: 'Nhân viên mới',
          type: 'bar',
          data: data.theo_thang.map(item => item.vao),
          itemStyle: { color: '#2563eb' },
          barGap: '10%',
        },
        {
          name: 'Nghỉ việc',
          type: 'bar',
          data: data.theo_thang.map(item => item.ra),
          itemStyle: { color: '#dc2626' },
        },
      ],
    }
  }, [data])

  const pieOption = React.useMemo(() => {
    if (!data?.ly_do) return {}
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'center',
        textStyle: { fontSize: 12, color: '#475569' },
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 12,
      },
      grid: {
        left: '3%',
        right: '20%',
        top: '5%',
        bottom: '3%',
        containLabel: true,
      },
      series: [{
        type: 'pie', radius: ['30%', '60%'], center: ['28%', '50%'],
        data: data.ly_do.map(item => ({
          value: item.so_luong,
          name: item.ly_do,
        })).filter(d => d.value > 0),
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Nhân sự - Biến động</h2>
        <ExportButton reportType="nhan-su-bien-dong" reportLabel="Nhân sự - Biến động" data={exportData} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Nhân viên mới</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{data.tong_vao}</div></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Nghỉ việc</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{data.tong_ra}</div></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Chuyển công tác</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{data.tong_chuyen}</div></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Biến động theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Lý do nghỉ việc</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
