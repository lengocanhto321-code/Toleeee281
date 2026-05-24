"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoLuongThueBHXH } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const ThueBHXHTab = React.memo(function ThueBHXHTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoLuongThueBHXH(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Lương - Thuế & BHXH", headers: [], rows: [] }
    return {
      title: "Báo cáo Lương - Thuế & BHXH",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Hạng mục", "Giá trị"],
      rows: [
        ["BHXH", data.tong_bhxh?.toLocaleString() ?? "—"],
        ["BHYT", data.tong_bhyt?.toLocaleString() ?? "—"],
        ["Thuế TNCN", data.tong_thue_tncn?.toLocaleString() ?? "—"],
        ["Tổng cộng", data.tong_cong?.toLocaleString() ?? "—"],
      ],
      stats: [
        { label: "BHXH", value: data.tong_bhxh?.toLocaleString() ?? "—" },
        { label: "BHYT", value: data.tong_bhyt?.toLocaleString() ?? "—" },
        { label: "Thuế TNCN", value: data.tong_thue_tncn?.toLocaleString() ?? "—" },
        { label: "Tổng cộng", value: data.tong_cong?.toLocaleString() ?? "—" },
      ],
    }
  }, [data, filters])

  const pieOption = React.useMemo(() => {
    if (!data?.phan_bo) return {}
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
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '42%'],
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
        data: data.phan_bo,
      }],
    }
  }, [data])

  const stackedAreaOption = React.useMemo(() => {
    if (!data?.theo_thang) return {}
    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['BHXH', 'BHYT', 'Thuế TNCN'],
        top: 5,
        left: 'center',
        textStyle: { fontSize: 11, color: '#475569' },
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        padding: [5, 10],
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
      xAxis: { type: 'category', data: data.theo_thang.map(item => item.thang), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'BHXH', type: 'line', stack: 'total',
          data: data.theo_thang.map(item => item.bhxh),
          areaStyle: { opacity: 0.3 },
          color: '#2563eb',
          itemStyle: { color: '#2563eb' },
        },
        {
          name: 'BHYT', type: 'line', stack: 'total',
          data: data.theo_thang.map(item => item.bhyt),
          areaStyle: { opacity: 0.3 },
          color: '#16a34a',
          itemStyle: { color: '#16a34a' },
        },
        {
          name: 'Thuế TNCN', type: 'line', stack: 'total',
          data: data.theo_thang.map(item => item.thue),
          areaStyle: { opacity: 0.3 },
          color: '#dc2626',
          itemStyle: { color: '#dc2626' },
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
        <h2 className="text-sm font-medium text-muted-foreground">Lương - Thuế & BHXH</h2>
        <ExportButton reportType="luong-thue-bhxh" reportLabel="Lương - Thuế & BHXH" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp thuế & BHXH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{data.tong_bhxh?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">BHXH</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.tong_bhyt?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">BHYT</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.tong_thue_tncn?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Thuế TNCN</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.tong_cong?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Tổng cộng</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Phân bổ theo hạng mục</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={350} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Xu hướng theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={stackedAreaOption} height={350} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
