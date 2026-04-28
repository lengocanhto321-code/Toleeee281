"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function LuongChiPhiTab({ filters }: { filters: BaoCaoFilters }) {
  const areaOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Chi phí lương'] },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: { type: 'value', name: 'Triệu VND' },
    series: [{
      name: 'Chi phí lương', type: 'line', smooth: true, areaStyle: { opacity: 0.3 },
      data: [120, 125, 122, 130, 128, 135, 140, 138, 142, 145, 148, 150],
      lineStyle: { color: '#d97706', width: 3 },
      itemStyle: { color: '#d97706' },
    }],
  }

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách chi phí lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu chi phí lương sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Chi phí lương theo tháng (Area Chart)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={areaOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
