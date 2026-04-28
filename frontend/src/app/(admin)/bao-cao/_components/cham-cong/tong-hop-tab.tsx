"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import React, { useState } from 'react'

export const ChamCongTongHopTab = React.memo(function ChamCongTongHopTab({ filters }: { filters: BaoCaoFilters }) {
  const barOption = React.useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: { type: 'value', name: 'Số ngày công' },
    series: [{
      type: 'bar',
      data: [22, 20, 23, 21, 22, 20, 23, 22, 21, 23, 20, 22],
      itemStyle: { borderRadius: [4, 4, 0, 0], color: '#059669' },
      barWidth: '40%',
    }],
  }), [])

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách chấm công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu chấm công sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Số ngày công theo tháng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
