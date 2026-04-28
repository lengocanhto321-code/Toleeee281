"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function ChamCongTongHopTab({ filters }: { filters: BaoCaoFilters }) {
  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: { type: 'value', name: 'Số ngày công' },
    series: [{
      type: 'bar',
      data: [22, 20, 23, 21, 22, 20, 23, 22, 21, 23, 20, 22],
      itemStyle: { borderRadius: [4, 4, 0, 0], color: '#059669' },
      barWidth: '40%',
    }],
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Số ngày công theo tháng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
