"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function NhanSuDemoGraphicsTab({ filters }: { filters: BaoCaoFilters }) {
  const stackedBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['22-30 tuổi', '31-40 tuổi', '41-50 tuổi', '51+ tuổi'] },
    xAxis: { type: 'category', data: ['THPT', 'Cử nhân', 'Thạc sĩ', 'Tiến sĩ'] },
    yAxis: { type: 'value' },
    series: [
      { name: '22-30 tuổi', type: 'bar', stack: 'total', data: [5, 8, 3, 0], color: '#1e40af' },
      { name: '31-40 tuổi', type: 'bar', stack: 'total', data: [3, 10, 5, 1], color: '#059669' },
      { name: '41-50 tuổi', type: 'bar', stack: 'total', data: [1, 5, 3, 2], color: '#d97706' },
      { name: '51+ tuổi', type: 'bar', stack: 'total', data: [0, 2, 1, 1], color: '#7c3aed' },
    ],
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Nhân sự theo trình độ và độ tuổi</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={stackedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
