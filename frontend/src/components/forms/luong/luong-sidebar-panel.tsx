"use client"

import { Wallet, Calendar, CheckCircle2, Clock, Play, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useKyLuongList, useCauHinhLuongList } from "@/hooks/luong"

interface LuongSidebarPanelProps {
  onAdd?: () => void
  onChayLuong?: () => void
  onCauHinh?: () => void
  onXemKyLuong?: () => void
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M`
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function LuongSidebarPanel({ onAdd, onChayLuong, onCauHinh, onXemKyLuong }: LuongSidebarPanelProps) {
  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:luong:add"))
    }
  }

  const handleChayLuong = () => {
    if (onChayLuong) {
      onChayLuong()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:luong:chay"))
    }
  }

  const handleCauHinh = () => {
    if (onCauHinh) {
      onCauHinh()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:luong:cau-hinh"))
    }
  }

  const handleXemKyLuong = () => {
    if (onXemKyLuong) {
      onXemKyLuong()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:luong:xem-ky"))
    }
  }

  const currentDate = new Date()
  const { data: kyLuongData } = useKyLuongList({
    thang: currentDate.getMonth() + 1,
    nam: currentDate.getFullYear(),
  })
  const { data: cauHinhData } = useCauHinhLuongList()

  const kyLuongs = kyLuongData?.data || []
  const cauHinhs = cauHinhData?.data || []
  const activeCauHinh = cauHinhs.find((c) => c.trang_thai === "dang_ap_dung")

  const recentKyLuongs = [...kyLuongs].slice(-3).reverse()
  const pendingKyLuongs = kyLuongs.filter((k) => k.trang_thai === "chua_duyet")
  const approvedKyLuongs = kyLuongs.filter((k) => k.trang_thai === "da_duyet" || k.trang_thai === "da_chot")

  const totalThucNhan = kyLuongs.reduce((sum, k) => sum + (k.tong_thuc_nhan || 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Lương</h2>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handleChayLuong}>
            <Play className="h-3 w-3" />
            Chạy lương
          </Button>
          <Button onClick={handleCauHinh} variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8">
            <Settings className="h-3 w-3" />
            Cấu hình
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-1.5 cursor-pointer text-xs h-8" onClick={handleXemKyLuong}>
          <Calendar className="h-3 w-3" />
          Xem kỳ lương
        </Button>
      </div>

      <Separator />

      {/* Stats */}
      <div className="px-4 py-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-amber-50 p-2.5 text-center">
            <div className="text-lg font-bold text-amber-700">{pendingKyLuongs.length}</div>
            <div className="text-[10px] text-amber-600 font-medium flex items-center justify-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Chờ duyệt
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2.5 text-center">
            <div className="text-lg font-bold text-emerald-700">{approvedKyLuongs.length}</div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Đã duyệt
            </div>
          </div>
        </div>
        {activeCauHinh && (
          <div className="rounded-lg bg-blue-50 p-2.5">
            <div className="text-[10px] text-blue-600 font-medium mb-1">Lương cơ sở</div>
            <div className="text-sm font-bold text-blue-700">
              {formatCurrency(activeCauHinh.luong_co_so)}
            </div>
          </div>
        )}
        {totalThucNhan > 0 && (
          <div className="rounded-lg bg-violet-50 p-2.5">
            <div className="text-[10px] text-violet-600 font-medium mb-1">Tổng thực nhận (tháng)</div>
            <div className="text-sm font-bold text-violet-700">
              {formatCurrency(totalThucNhan)}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Recent Kỳ lương */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Kỳ lương gần đây
          </p>
        </div>

        {recentKyLuongs.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-muted-foreground">Chưa có kỳ lương</p>
        ) : (
          <div className="px-3 pb-3 space-y-1.5">
            {recentKyLuongs.map((ky) => (
              <div
                key={ky.id}
                className="group rounded-lg border border-transparent bg-sidebar p-2.5 transition-all hover:border-sidebar-accent-foreground/10 hover:bg-sidebar-accent cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      ky.trang_thai === "da_chot" ? "bg-emerald-100 text-emerald-600" :
                      ky.trang_thai === "da_duyet" ? "bg-blue-100 text-blue-600" :
                      "bg-amber-100 text-amber-600"
                    }`}>
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tháng {ky.thang}/{ky.nam}</p>
                      <p className="text-[11px] text-muted-foreground">{ky.tong_nhan_vien || 0} nhân viên</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 h-5 ${
                      ky.trang_thai === "da_chot" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      ky.trang_thai === "da_duyet" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {ky.trang_thai === "da_chot" ? "Đã chốt" :
                     ky.trang_thai === "da_duyet" ? "Đã duyệt" :
                     "Chờ duyệt"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            Mẹo nhanh
          </p>
        </div>
        <div className="px-3 pb-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">1</span>
            <span>Tạo cấu hình trước khi chạy lương</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">2</span>
            <span>Cập nhật chấm công đầy đủ</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">3</span>
            <span>Duyệt và chốt kỳ lương</span>
          </div>
        </div>
      </div>
    </div>
  )
}
