"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import React, { useState } from 'react'

export const ChamCongNghiPhepTab = React.memo(function ChamCongNghiPhepTab({ filters }: { filters: BaoCaoFilters }) {
  const pieOption = React.useMemo(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ngày ({d}%)' },
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
      type: 'pie', radius: ['40%', '70%'],
      data: [
        { value: 15, name: 'Nghỉ phép năm', itemStyle: { color: '#059669' } },
        { value: 8, name: 'Nghỉ ốm', itemStyle: { color: '#d97706' } },
        { value: 5, name: 'Nghỉ không lương', itemStyle: { color: '#dc2626' } },
        { value: 3, name: 'Nghỉ thai sản', itemStyle: { color: '#7c3aed' } },
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
            Danh sách nghỉ phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu nghỉ phép sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Loại nghỉ phép</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
