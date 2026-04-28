"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoTrinhDo } from "@/hooks/bao-cao/use-bao-cao-nhan-su"
import React from 'react'

export const NhanSuTrinhDoTab = React.memo(function NhanSuTrinhDoTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoTrinhDo(filters)

  const radarOption = React.useMemo(() => {
    if (!data) return {}
    const maxVal = Math.max(...data.theo_bang_cap.map(item => item.so_luong), 1) + 2
    return {
      tooltip: {},
      radar: {
        indicator: data.theo_bang_cap.map(item => ({
          name: item.ten_bang,
          max: maxVal,
        })),
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: data.theo_bang_cap.map(item => item.so_luong),
            name: 'Số lượng',
            areaStyle: { opacity: 0.3 },
            lineStyle: { color: '#1e40af' },
            itemStyle: { color: '#1e40af' },
          },
        ],
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Trình độ nhân sự (Radar Chart)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={radarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
