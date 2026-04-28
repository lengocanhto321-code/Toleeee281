"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoBienDong } from "@/hooks/bao-cao/use-bao-cao-nhan-su"
import React from 'react'

export const NhanSuBienDongTab = React.memo(function NhanSuBienDongTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoBienDong(filters)

  const lineOption = React.useMemo(() => {
    if (!data) return {}
    const labels = ['Kỳ trước', 'Kỳ hiện tại']
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Tổng nhân sự', 'Tăng', 'Giảm'] },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Tổng nhân sự', type: 'line',
          data: [data.ky_truoc.tong, data.ky_hien_tai.tong],
          smooth: true, color: '#059669',
          areaStyle: { opacity: 0.1 },
        },
        {
          name: 'Tăng', type: 'bar',
          data: [0, data.bien_dong.tang],
          itemStyle: { color: '#1e40af', borderRadius: [4, 4, 0, 0] },
          barWidth: '30%',
        },
        {
          name: 'Giảm', type: 'bar',
          data: [0, data.bien_dong.giam],
          itemStyle: { color: '#dc2626', borderRadius: [4, 4, 0, 0] },
          barWidth: '30%',
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
        <CardHeader><CardTitle className="text-base">Biến động nhân sự</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
