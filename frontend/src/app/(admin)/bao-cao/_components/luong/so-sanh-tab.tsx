"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import React, { useState } from 'react'

export const LuongSoSanhTab = React.memo(function LuongSoSanhTab({ filters }: { filters: BaoCaoFilters }) {
  const groupedBarOption = React.useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Tháng này', 'Tháng trước'] },
    xAxis: { type: 'category', data: ['Tổng lương', 'Thuế', 'BHXH', 'Thực lĩnh'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Tháng này', type: 'bar', data: [150, 14, 11, 125], barWidth: '30%', color: '#d97706' },
      { name: 'Tháng trước', type: 'bar', data: [145, 13, 10, 122], barWidth: '30%', color: '#7c3aed' },
    ],
  }), [])

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách so sánh lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu so sánh lương sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">So sánh lương tháng này vs tháng trước</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={groupedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
