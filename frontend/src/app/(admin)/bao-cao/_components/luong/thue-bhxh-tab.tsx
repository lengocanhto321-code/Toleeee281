"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import React, { useState } from 'react'

export const LuongThueBHXHTab = React.memo(function LuongThueBHXHTab({ filters }: { filters: BaoCaoFilters }) {
  const stackedBarOption = React.useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Lương cơ bản', 'Thuế TNCN', 'BHXH'] },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Lương cơ bản', type: 'bar', stack: 'total', data: [100, 105, 102, 110, 108, 115], color: '#d97706' },
      { name: 'Thuế TNCN', type: 'bar', stack: 'total', data: [10, 12, 11, 13, 12, 14], color: '#7c3aed' },
      { name: 'BHXH', type: 'bar', stack: 'total', data: [8, 9, 8, 10, 9, 11], color: '#1e40af' },
    ],
  }), [])

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách lương, thuế & BHXH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu lương, thuế & BHXH sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Lương, Thuế & BHXH (Stacked Bar)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={stackedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
