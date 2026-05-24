"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoTongQuan } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const TongHopTab = React.memo(function TongHopTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoTongQuan(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Nhân sự - Tổng hợp", headers: [], rows: [] }
    return {
      title: "Báo cáo Nhân sự - Tổng hợp",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Chỉ số", "Giá trị"],
      rows: [
        ["Tổng nhân viên", data.tong_nhan_vien],
        ["Đang làm", data.dang_lam],
        ["Nghỉ việc", data.nghi_viec],
        ["Nghỉ hưu", data.nghi_huu],
        ["Tỷ lệ có mặt", `${data.ty_le_co_mat}%`],
      ],
      stats: [
        { label: "Tổng nhân viên", value: data.tong_nhan_vien },
        { label: "Đang làm", value: data.dang_lam },
        { label: "Nghỉ việc", value: data.nghi_viec },
        { label: "Tỷ lệ có mặt", value: `${data.ty_le_co_mat}%` },
      ],
    }
  }, [data, filters])

  const pieOption = React.useMemo(() => {
    if (!data) return {}
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
        data: [
          { value: data.dang_lam, name: 'Đang làm', itemStyle: { color: '#059669' } },
          { value: data.nghi_viec, name: 'Nghỉ việc', itemStyle: { color: '#dc2626' } },
          { value: data.nghi_huu, name: 'Nghỉ hưu', itemStyle: { color: '#6b7280' } },
        ].filter(d => d.value > 0),
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

  const lineOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.xu_huong.map(item => item.thang),
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: '#64748b' },
      },
      series: [{
        type: 'line',
        data: data.xu_huong.map(item => item.so_luong),
        smooth: true,
        areaStyle: { color: 'rgba(37, 99, 235, 0.1)' },
        lineStyle: { color: '#2563eb', width: 2 },
        itemStyle: { color: '#2563eb' },
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Nhân sự - Tổng hợp</h2>
        <ExportButton reportType="nhan-su-tong-hop" reportLabel="Nhân sự - Tổng hợp" data={exportData} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Tổng nhân viên</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.tong_nhan_vien}</div></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Đang làm</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-chart-2">{data.dang_lam}</div></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Nghỉ việc</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{data.nghi_viec}</div></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Tỷ lệ có mặt</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{data.ty_le_co_mat}%</div></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Phân bố trạng thái</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Xu hướng nhân sự 6 tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
