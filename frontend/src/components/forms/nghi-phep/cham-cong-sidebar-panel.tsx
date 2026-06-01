"use client"

import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  User,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  RefreshCw,
  FileText,
} from "lucide-react"
import { useChamCongThangList } from "@/hooks/nghi-phep"

interface ChamCongSidebarPanelProps {
  onRefresh: () => void
}

export function ChamCongSidebarPanel({ onRefresh }: ChamCongSidebarPanelProps) {
  const now = new Date()
  const { data, isLoading } = useChamCongThangList({
    page: 1,
    page_size: 100,
    thang: now.getMonth() + 1,
    nam: now.getFullYear(),
  })

  const items = data?.data || []

  const tongNV = items.length
  const coMat = items.reduce((s, c) => s + (c.so_ngay_co_mat || 0), 0)
  const vangCP = items.reduce((s, c) => s + (c.so_ngay_vang_co_phep || 0), 0)
  const vangKP = items.reduce((s, c) => s + (c.so_ngay_vang_khong_phep || 0), 0)

  const trangThaiCounts = items.reduce<Record<string, number>>((acc, c) => {
    acc[c.trang_thai] = (acc[c.trang_thai] || 0) + 1
    return acc
  }, {})

  const TRANG_THAI: Record<string, { label: string; color: string }> = {
    chua_chot: { label: "Chưa chốt", color: "text-amber-600 bg-amber-50 border-amber-200" },
    da_xac_nhan: { label: "Đã xác nhận", color: "text-primary bg-accent/50 border-primary/20" },
    da_duyet: { label: "Đã duyệt", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    da_chot: { label: "Đã chốt", color: "text-purple-600 bg-purple-50 border-purple-200" },
  }

  const statsCards = [
    { label: "Tổng NV", value: tongNV, icon: User, color: "text-muted-foreground bg-muted border-border" },
    { label: "Có mặt", value: coMat, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Vắng CP", value: vangCP, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Vắng KP", value: vangKP, icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Chấm công</h2>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          Tháng {now.getMonth() + 1}/{now.getFullYear()}
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới dữ liệu
        </button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {statsCards.map((s) => (
            <div key={s.label} className={`rounded-lg border p-2.5 ${s.color}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3 w-3" />
                <span className="text-[10px] font-medium opacity-80">{s.label}</span>
              </div>
              <div className="text-lg font-bold leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Trạng thái tháng này
          </div>
          {Object.entries(TRANG_THAI).map(([key, cfg]) => {
            const count = trangThaiCounts[key] || 0
            if (count === 0 && !isLoading) return null
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <Badge variant="outline" className={cfg.color + " text-[10px]"}>{cfg.label}</Badge>
                <span className="text-sm font-semibold text-foreground">{count}</span>
              </div>
            )
          })}
          {items.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  )
}
