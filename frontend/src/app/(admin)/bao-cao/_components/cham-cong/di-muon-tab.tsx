"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import React, { useState } from "react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'

export const DiMuonTab = React.memo(function DiMuonTab({ filters }: { filters: BaoCaoFilters }) {
  const hours = ['7:30', '7:40', '7:50', '8:00', '8:10', '8:20']
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  
  const [data] = useState(() => {
    const result = []
    for (let i = 0; i < days.length; i++) {
      for (let j = 0; j < hours.length; j++) {
        result.push([j, i, Math.floor(Math.random() * 5)])
      }
    }
    return result
  })

  const heatmapOption = React.useMemo(() => ({
    tooltip: { position: 'top' },
    grid: { top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: hours, splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: {
      min: 0, max: 5,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#fef3c7', '#fde68a', '#f59e0b', '#dc2626'] },
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
    }],
  }), [data])

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách đi muộn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu đi muộn sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Heatmap: Giờ đi muộn trong tuần</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={heatmapOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
