"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoKhenThuong } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const KhenThuongTab = React.memo(function KhenThuongTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoKhenThuong(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Khen thưởng", headers: [], rows: [] }
    return {
      title: "Báo cáo Khen thưởng",
      subtitle: `Tháng ${filters.thang}/${filters.nam}`,
      headers: ["Nhân viên", "Loại", "Hình thức", "Số tiền", "Ngày"],
      rows: data.chi_tiet.map(item => [item.ho_ten, item.loai, item.hinh_thuc, item.so_tien, item.ngay]),
      stats: [
        { label: "Tổng khen thưởng", value: data.tong_khen },
        { label: "Tổng kỷ luật", value: data.tong_ky },
        { label: "Tỷ lệ khen/kỷ", value: `${data.ty_le}%` },
        { label: "Tổng tiền", value: data.tong_tien.toLocaleString() },
      ],
    }
  }, [data, filters])

  const barOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Khen thưởng', 'Kỷ luật'] },
      xAxis: { type: 'category', data: data.theo_thang.map(item => item.thang) },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Khen thưởng', type: 'bar',
          data: data.theo_thang.map(item => item.khen),
          itemStyle: { borderRadius: [4, 4, 0, 0], color: '#7c3aed' },
          barWidth: '30%',
        },
        {
          name: 'Kỷ luật', type: 'bar',
          data: data.theo_thang.map(item => item.ky),
          itemStyle: { borderRadius: [4, 4, 0, 0], color: '#dc2626' },
          barWidth: '30%',
        },
      ],
    }
  }, [data])

  const pieOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        right: 10,
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
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.ty_le_chart.map(item => ({
          value: item.value,
          name: item.name,
        })),
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Khen thưởng</h2>
        <ExportButton reportType="khen-thuong" reportLabel="Khen thưởng" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp khen thưởng & kỷ luật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{data.tong_khen}</div>
              <div className="text-xs text-muted-foreground">Khen thưởng</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.tong_ky}</div>
              <div className="text-xs text-muted-foreground">Kỷ luật</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.ty_le}%</div>
              <div className="text-xs text-muted-foreground">Tỷ lệ khen/kỷ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.tong_tien.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tổng tiền</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Khen thưởng & Kỷ luật theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={barOption} height={300} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Tỷ lệ Khen thưởng vs Kỷ luật</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={300} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
