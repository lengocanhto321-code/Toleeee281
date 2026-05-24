"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoHopDong } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const HopDongTab = React.memo(function HopDongTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoHopDong(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Nhân sự - Hợp đồng", headers: [], rows: [] }
    const con_han = (data.tong ?? 0) - (data.sap_het_han ?? 0) - (data.da_het_han ?? 0) - (data.can_gia_han ?? 0)
    return {
      title: "Báo cáo Nhân sự - Hợp đồng",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Nhân viên", "Loại HĐ", "Ngày hết hạn", "Phòng ban"],
      rows: data.items?.map(item => [item.ho_ten, item.loai_hop_dong, item.ngay_het_han, item.phong_ban]) || [],
      stats: [
        { label: "Tổng hợp đồng", value: data.tong },
        { label: "Sắp hết hạn", value: data.sap_het_han },
        { label: "Đã hết hạn", value: data.da_het_han },
        { label: "Cần gia hạn", value: data.can_gia_han },
        { label: "Còn hạn", value: con_han },
      ],
    }
  }, [data, filters])

  const pieOption = React.useMemo(() => {
    if (!data) return {}
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
        data: [
          { value: data.sap_het_han, name: 'Sắp hết hạn', itemStyle: { color: '#d97706' } },
          { value: data.da_het_han, name: 'Đã hết hạn', itemStyle: { color: '#dc2626' } },
          { value: data.can_gia_han, name: 'Cần gia hạn', itemStyle: { color: '#7c3aed' } },
          { value: data.tong - data.sap_het_han - data.da_het_han - data.can_gia_han, name: 'Còn hạn', itemStyle: { color: '#059669' } },
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

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Nhân sự - Hợp đồng</h2>
        <ExportButton reportType="nhan-su-hop-dong" reportLabel="Nhân sự - Hợp đồng" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Tình trạng hợp đồng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
