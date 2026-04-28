"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useBaoCaoNhanSuTongHop } from "@/hooks/bao-cao/use-bao-cao-nhan-su"
import React, { useState } from 'react'

interface NhanSuTongHopTabProps {
  filters: BaoCaoFilters
}

export const NhanSuTongHopTab = React.memo(function NhanSuTongHopTab({ filters }: NhanSuTongHopTabProps) {
  const [modalData, setModalData] = useState<{ name: string; value: number; percent?: number } | null>(null)
  const { data, isLoading, error } = useBaoCaoNhanSuTongHop(filters)

  const statCards = React.useMemo(() => {
    if (!data) return []
    return [
      { title: "Tổng nhân sự", value: String(data.tong_nhan_vien), icon: Users, color: "text-blue-600 bg-blue-50", change: String(data.dang_lam) },
      { title: "Đang làm việc", value: String(data.dang_lam), icon: UserCheck, color: "text-emerald-600 bg-emerald-50", change: data.tong_nhan_vien > 0 ? `${Math.round((data.dang_lam / data.tong_nhan_vien) * 100)}%` : "0%" },
      { title: "Nghỉ việc", value: String(data.nghi_viec), icon: UserX, color: "text-red-600 bg-red-50", change: String(data.nghi_viec) },
      { title: "Nghỉ hưu", value: String(data.nghi_huu), icon: TrendingUp, color: "text-amber-600 bg-amber-50", change: String(data.nghi_huu) },
    ]
  }, [data])

  const pieOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'item' },
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
        type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        },
        select: { itemStyle: { shadowBlur: 10, shadowColor: '#1e40af' } },
        data: [
          { value: data.theo_gioi_tinh.nam, name: 'Nam', itemStyle: { color: '#1e40af' } },
          { value: data.theo_gioi_tinh.nu, name: 'Nữ', itemStyle: { color: '#059669' } },
        ],
      }],
    }
  }, [data])

  const barOption = React.useMemo(() => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'category', data: data.theo_phong_ban.map(pb => pb.ten_phong_ban) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar', data: data.theo_phong_ban.map(pb => pb.so_luong),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#1e40af' },
        barWidth: '40%',
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(30, 64, 175, 0.5)' } }
      }],
    }
  }, [data])

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  if (error) return <div className="text-center py-8 text-red-500">Lỗi tải dữ liệu</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cơ cấu giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper
              option={pieOption}
              height={300}
              onEvents={{
                'click': (params: any) => {
                  setModalData({ name: params.name, value: params.value, percent: params.percent })
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nhân sự theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper
              option={barOption}
              height={300}
              onEvents={{
                'click': (params: any) => {
                  setModalData({ name: params.name, value: params.value })
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
