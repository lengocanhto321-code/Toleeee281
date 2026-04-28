"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function HopDongTab({ filters }: { filters: BaoCaoFilters }) {
  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['30%', '60%'],
      data: [
        { value: 25, name: 'Hợp đồng xác định thời hạn', itemStyle: { color: '#1e40af' } },
        { value: 15, name: 'Hợp đồng không xác định thời hạn', itemStyle: { color: '#059669' } },
        { value: 3, name: 'Hợp đồng thử việc', itemStyle: { color: '#d97706' } },
        { value: 2, name: 'Hợp đồng thời vụ', itemStyle: { color: '#7c3aed' } },
      ],
    }],
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Nhân sự theo loại hợp đồng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
