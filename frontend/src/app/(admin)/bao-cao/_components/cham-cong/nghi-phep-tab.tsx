"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoNghiPhep } from "@/hooks/bao-cao/use-bao-cao-cham-cong"
import React from 'react'

export const ChamCongNghiPhepTab = React.memo(function ChamCongNghiPhepTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoNghiPhep(filters)

  const pieOption = React.useMemo(() => {
    if (!data) return {}
    const colors = ['#059669', '#d97706', '#dc2626', '#7c3aed', '#1e40af']
    return {
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
        type: 'pie', radius: ['40%', '70%'],
        data: data.theo_loai_nghi.map((item, idx) => ({
          value: item.so_luong,
          name: item.loai,
          itemStyle: { color: colors[idx % colors.length] },
        })),
      }],
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
            Tổng hợp nghỉ phép
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_don}</div>
              <div className="text-xs text-muted-foreground">Tổng đơn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{data.da_duyet}</div>
              <div className="text-xs text-muted-foreground">Đã duyệt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.tu_choi}</div>
              <div className="text-xs text-muted-foreground">Từ chối</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{data.cho_duyet}</div>
              <div className="text-xs text-muted-foreground">Chờ duyệt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Loại nghỉ phép</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
