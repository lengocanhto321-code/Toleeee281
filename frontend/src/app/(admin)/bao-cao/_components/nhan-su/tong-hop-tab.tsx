"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { Users, UserCheck, UserX, TrendingUp, TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface NhanSuTongHopTabProps {
  filters: BaoCaoFilters
}

const statCards = [
  { title: "Tổng nhân sự", value: "45", icon: Users, color: "text-blue-600 bg-blue-50", change: "+2" },
  { title: "Đang làm việc", value: "42", icon: UserCheck, color: "text-emerald-600 bg-emerald-50", change: "93%" },
  { title: "Nghỉ việc", value: "3", icon: UserX, color: "text-red-600 bg-red-50", change: "-1" },
  { title: "Tuyển mới", value: "5", icon: TrendingUp, color: "text-amber-600 bg-amber-50", change: "+3" },
]

export function NhanSuTongHopTab({ filters }: NhanSuTongHopTabProps) {
  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: [
        { value: 25, name: 'Nam' },
        { value: 20, name: 'Nữ' },
      ],
    }],
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['Ban Giám hiệu', 'Tổ Toán', 'Tổ Văn', 'Tổ Anh', 'Tổ Lý', 'Tổ Hóa', 'Văn phòng'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [5, 8, 7, 6, 6, 5, 8], itemStyle: { borderRadius: [4, 4, 0, 0], color: '#1e40af' }, barWidth: '40%' }],
  }

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

      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Bảng dữ liệu nhân sự sẽ hiển thị tại đây
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cơ cấu giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={pieOption} height={300} />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nhân sự theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={barOption} height={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
