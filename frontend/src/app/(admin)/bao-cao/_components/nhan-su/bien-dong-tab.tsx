"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function NhanSuBienDongTab({ filters }: { filters: BaoCaoFilters }) {
  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Tuyển mới', 'Nghỉ việc', 'Tổng nhân sự'] },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Tuyển mới', type: 'line', data: [2, 3, 1, 5, 2, 4, 3, 2, 1, 3, 2, 1], smooth: true, color: '#1e40af' },
      { name: 'Nghỉ việc', type: 'line', data: [1, 0, 2, 1, 1, 0, 1, 2, 1, 0, 1, 1], smooth: true, color: '#dc2626' },
      { name: 'Tổng nhân sự', type: 'line', data: [40, 43, 42, 46, 47, 51, 53, 53, 52, 55, 56, 56], smooth: true, color: '#059669' },
    ],
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Biến động nhân sự theo tháng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
