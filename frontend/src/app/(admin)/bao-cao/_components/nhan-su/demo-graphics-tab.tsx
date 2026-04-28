"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoDemoGraphics } from "@/hooks/bao-cao/use-bao-cao-nhan-su"
import React from 'react'

export const NhanSuDemoGraphicsTab = React.memo(function NhanSuDemoGraphicsTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoDemoGraphics(filters)

  const stackedBarOption = React.useMemo(() => {
    if (!data) return {}
    const ageGroups = [...new Set(data.phan_bo_tuoi.map(item => item.nhom_tuoi))]
    const genders = [...new Set(data.phan_bo_tuoi.map(item => item.gioi_tinh))]
    const colors: Record<string, string> = { 'Nam': '#1e40af', 'Nữ': '#059669', 'Khác': '#d97706' }
    const series = genders.map(gender => ({
      name: gender,
      type: 'bar' as const,
      stack: 'total',
      data: ageGroups.map(age => {
        const found = data.phan_bo_tuoi.find(item => item.nhom_tuoi === age && item.gioi_tinh === gender)
        return found ? found.so_luong : 0
      }),
      color: colors[gender] || '#7c3aed',
    }))
    return {
      tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
      legend: { data: genders },
      xAxis: { type: 'category' as const, data: ageGroups },
      yAxis: { type: 'value' as const },
      series,
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Phân bố nhân sự theo độ tuổi và giới tính</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={stackedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
