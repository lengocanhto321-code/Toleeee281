"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoThueBHXH } from "@/hooks/bao-cao/use-bao-cao-luong"
import React from 'react'

export const LuongThueBHXHTab = React.memo(function LuongThueBHXHTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoThueBHXH(filters)

  const stackedBarOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Thuế TNCN', 'BHXH', 'BHYT'] },
      xAxis: { type: 'category', data: ['Tổng'] },
      yAxis: { type: 'value' },
      series: [
        { name: 'Thuế TNCN', type: 'bar', stack: 'total', data: [data.tong_thue_tncn], color: '#7c3aed', barWidth: '40%' },
        { name: 'BHXH', type: 'bar', stack: 'total', data: [data.tong_bhxh_nv], color: '#1e40af', barWidth: '40%' },
        { name: 'BHYT', type: 'bar', stack: 'total', data: [data.tong_bhyt_nv], color: '#d97706', barWidth: '40%' },
      ],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Tổng hợp Thuế & BHXH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{data.tong_thue_tncn.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tổng thuế TNCN</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{data.tong_bhxh_nv.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tổng BHXH</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.tong_bhyt_nv.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tổng BHYT</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Thuế TNCN, BHXH & BHYT (Stacked Bar)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={stackedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
