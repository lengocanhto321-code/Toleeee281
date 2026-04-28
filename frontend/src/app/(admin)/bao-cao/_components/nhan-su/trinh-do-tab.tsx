"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"

export function NhanSuTrinhDoTab({ filters }: { filters: BaoCaoFilters }) {
  const radarOption = {
    tooltip: {},
    legend: { data: ['Nam', 'Nữ'] },
    radar: {
      indicator: [
        { name: 'THPT', max: 20 },
        { name: 'Cử nhân', max: 20 },
        { name: 'Thạc sĩ', max: 10 },
        { name: 'Tiến sĩ', max: 5 },
        { name: 'Chứng chỉ', max: 15 },
      ]
    },
    series: [{
      type: 'radar',
      data: [
        { value: [8, 12, 3, 1, 7], name: 'Nam', areaStyle: { opacity: 0.3 }, lineStyle: { color: '#1e40af' } },
        { value: [5, 10, 5, 2, 8], name: 'Nữ', areaStyle: { opacity: 0.3 }, lineStyle: { color: '#d97706' } },
      ]
    }],
  }

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách trình độ nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu trình độ nhân sự sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Trình độ nhân sự (Radar Chart)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={radarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
