"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function LuongSoSanhTab({ filters }: { filters: BaoCaoFilters }) {
  const groupedBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Tháng này', 'Tháng trước'] },
    xAxis: { type: 'category', data: ['Tổng lương', 'Thuế', 'BHXH', 'Thực lĩnh'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Tháng này', type: 'bar', data: [150, 14, 11, 125], barWidth: '30%', color: '#d97706' },
      { name: 'Tháng trước', type: 'bar', data: [145, 13, 10, 122], barWidth: '30%', color: '#7c3aed' },
    ],
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">So sánh lương tháng này vs tháng trước</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={groupedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
