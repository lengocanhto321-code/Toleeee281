"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import React, { useState } from 'react'

export const KhenThuongTab = React.memo(function KhenThuongTab({ filters }: { filters: BaoCaoFilters }) {
  const barOption = React.useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [5, 3, 7, 4, 6, 8],
      itemStyle: { borderRadius: [4, 4, 0, 0], color: '#7c3aed' },
      barWidth: '40%',
    }],
  }), [])

  const pieOption = React.useMemo(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12, color: '#475569' },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
    },
    grid: {
      left: '3%',
      right: '20%',
      top: '5%',
      bottom: '3%',
      containLabel: true,
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 15, name: 'Khen thưởng', itemStyle: { color: '#7c3aed' } },
        { value: 8, name: 'Kỷ luật', itemStyle: { color: '#dc2626' } },
      ],
    }],
  }), [])

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách khen thưởng & kỷ luật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu khen thưởng & kỷ luật sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Số lượng khen thưởng theo tháng</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={barOption} height={300} /></CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="text-base">Tỷ lệ Khen thưởng vs Kỷ luật</CardTitle></CardHeader>
          <CardContent><EChartsWrapper option={pieOption} height={300} /></CardContent>
        </Card>
      </div>
    </div>
  )
})
