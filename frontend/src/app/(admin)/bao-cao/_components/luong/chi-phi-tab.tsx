"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoChiPhi } from "@/hooks/bao-cao/use-bao-cao-luong"
import React from 'react'

export const LuongChiPhiTab = React.memo(function LuongChiPhiTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoChiPhi(filters)

  const areaOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Tổng chi phí', 'Lương TB'] },
      xAxis: { type: 'category', data: data.theo_phong_ban.map(pb => pb.ten_phong_ban) },
      yAxis: { type: 'value', name: 'VNĐ' },
      series: [
        {
          name: 'Tổng chi phí', type: 'bar',
          data: data.theo_phong_ban.map(pb => pb.tong_chi_phi),
          itemStyle: { borderRadius: [4, 4, 0, 0], color: '#d97706' },
          barWidth: '30%',
        },
        {
          name: 'Lương TB', type: 'line', smooth: true,
          data: data.theo_phong_ban.map(pb => pb.tb_luong),
          lineStyle: { color: '#1e40af', width: 3 },
          itemStyle: { color: '#1e40af' },
        },
      ],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp chi phí lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_chi_phi.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tổng chi phí</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.tb_luong.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Lương TB</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{data.luong_cao_nhat.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Lương cao nhất</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.luong_thap_nhat.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Lương thấp nhất</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Chi phí lương theo phòng ban</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={areaOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
