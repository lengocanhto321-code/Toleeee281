"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function XuHuongTab({ filters }: { filters: BaoCaoFilters }) {
  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Nhân sự', 'Lương (triệu)', 'Chấm công (%)'] },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: [
      { type: 'value', name: 'Nhân sự' },
      { type: 'value', name: 'Lương' },
      { type: 'value', name: 'Chấm công', max: 100 },
    ],
    series: [
      { name: 'Nhân sự', type: 'line', data: [40, 43, 42, 46, 47, 51, 53, 53, 52, 55, 56, 56], smooth: true, color: '#1e40af' },
      { name: 'Lương (triệu)', type: 'line', yAxisIndex: 1, data: [120, 125, 122, 130, 128, 135, 140, 138, 142, 145, 148, 150], smooth: true, color: '#d97706' },
      { name: 'Chấm công (%)', type: 'line', yAxisIndex: 2, data: [95, 96, 94, 98, 97, 96, 98, 99, 98, 98, 97, 98], smooth: true, color: '#dc2626' },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách xu hướng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu xu hướng sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Xu hướng nhân sự, lương & chấm công</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
