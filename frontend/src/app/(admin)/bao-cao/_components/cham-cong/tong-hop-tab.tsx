"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useBaoCaoChamCongTongHop } from "@/hooks/bao-cao/use-bao-cao-cham-cong"
import React from 'react'

export const ChamCongTongHopTab = React.memo(function ChamCongTongHopTab({ filters }: { filters: BaoCaoFilters }) {
  const { data, isLoading, error } = useBaoCaoChamCongTongHop(filters)

  const barOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: data.theo_phong_ban.map(pb => pb.ten_phong_ban) },
      yAxis: { type: 'value', name: 'TB ngày công' },
      series: [{
        type: 'bar',
        data: data.theo_phong_ban.map(pb => pb.tb_ngay_cong),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#059669' },
        barWidth: '40%',
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
            Tổng hợp chấm công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.tong_so_nhan_vien}</div>
              <div className="text-xs text-muted-foreground">Tổng nhân viên</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.tb_ngay_cong}</div>
              <div className="text-xs text-muted-foreground">TB ngày công</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Ngày công trung bình theo phòng ban</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={barOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
