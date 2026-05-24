"use client"

import { useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import { useDonXinNghiList } from "@/hooks/nghi-phep"

interface NghiPhepSidebarPanelProps {
  onCreate: () => void
}

export function NghiPhepSidebarPanel({ onCreate }: NghiPhepSidebarPanelProps) {
  const { data } = useDonXinNghiList({ page: 1, page_size: 1000 })
  const items = data?.data || []

  const stats = useMemo(() => {
    const now = new Date()
    const thangNay = items.filter((d) => {
      const dDate = new Date(d.tu_ngay)
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear()
    })
    return {
      total: items.length,
      choDuyet: items.filter((d) => d.trang_thai === "cho_duyet").length,
      daDuyet: items.filter((d) => d.trang_thai === "da_duyet").length,
      tuChoi: items.filter((d) => d.trang_thai === "tu_choi").length,
      thangNay: thangNay.length,
      tongNgayDaDuyet: items
        .filter((d) => d.trang_thai === "da_duyet")
        .reduce((s, d) => s + (d.so_ngay || 0), 0),
    }
  }, [items])

  const cards = [
    { label: "Chờ duyệt", value: stats.choDuyet, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Đã duyệt", value: stats.daDuyet, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Từ chối", value: stats.tuChoi, icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
    { label: "Tháng này", value: stats.thangNay, icon: CalendarDays, color: "text-primary bg-accent/50 border-primary/20" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Nghỉ phép</h2>
      </div>

      <div className="p-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn nghỉ phép
        </button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {cards.map((s) => (
            <div key={s.label} className={`rounded-lg border p-2.5 ${s.color}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className="h-3 w-3" />
                <span className="text-[10px] font-medium opacity-80">{s.label}</span>
              </div>
              <div className="text-lg font-bold leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Tổng quan
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs text-muted-foreground">Tổng đơn</span>
            <span className="text-sm font-semibold text-foreground">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-xs text-muted-foreground">Ngày nghỉ đã duyệt</span>
            <span className="text-sm font-semibold text-emerald-600">{stats.tongNgayDaDuyet} ngày</span>
          </div>
        </div>
      </div>
    </div>
  )
}
