"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoChamCongTongHop } from "@/hooks/bao-cao/use-bao-cao"
import { ExportButton } from "../export-button"
import type { ReportExportData } from "@/lib/report-export"
import React from 'react'

export const ChamCongTongHopTab = React.memo(function ChamCongTongHopTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoChamCongTongHop(filters)

  const exportData = React.useMemo((): ReportExportData => {
    if (!data) return { title: "Chấm công - Tổng hợp", headers: [], rows: [] }
    return {
      title: "Báo cáo Chấm công - Tổng hợp",
      subtitle: `${filters.start_date} — ${filters.end_date}`,
      headers: ["Phòng ban", "Có mặt", "Chuẩn", "Số NV", "Tỷ lệ"],
      rows: data.theo_phong_ban?.map(item => [item.phong_ban, item.co_mat, item.chuan, item.so_nv, `${item.ty_le}%`]) || [],
      stats: [
        { label: "Tổng có mặt", value: data.tong_co_mat },
        { label: "Tổng chuẩn", value: data.tong_chuan },
        { label: "Số NV", value: data.tong_nhan_vien },
        { label: "Tỷ lệ có mặt", value: `${data.ty_le_co_mat}%` },
      ],
    }
  }, [data, filters])

  const barOption = React.useMemo(() => {
    if (!data?.theo_phong_ban) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: data.theo_phong_ban.map(item => item.phong_ban) },
      series: [{
        type: 'bar',
        data: data.theo_phong_ban.map(item => item.ty_le),
        barWidth: '50%',
        color: '#2563eb',
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', formatter: '{c}%' },
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Chấm công - Tổng hợp</h2>
        <ExportButton reportType="cham-cong-tong-hop" reportLabel="Chấm công - Tổng hợp" data={exportData} />
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp chấm công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_co_mat}</div>
              <div className="text-xs text-muted-foreground">Tổng có mặt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.tong_chuan}</div>
              <div className="text-xs text-muted-foreground">Tổng chuẩn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.tong_nhan_vien}</div>
              <div className="text-xs text-muted-foreground">Số NV</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{data.ty_le_co_mat}%</div>
              <div className="text-xs text-muted-foreground">Tỷ lệ có mặt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Tỷ lệ có mặt theo phòng ban</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
