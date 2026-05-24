"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react"
import { useChamCongThangList } from "@/hooks/nghi-phep"

const TRANG_THAI_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  nhap: { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: "Nháp", icon: AlertCircle },
  da_xac_nhan: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Đã xác nhận", icon: CheckCircle },
  da_duyet: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Đã duyệt", icon: CheckCircle },
  tu_choi: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Từ chối", icon: XCircle },
}

const THANG_LABELS = [
  "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
]

interface NhanVienChamCongTabProps {
  nhanVienId: string
}

export function NhanVienChamCongTab({ nhanVienId }: NhanVienChamCongTabProps) {
  const { data, isLoading } = useChamCongThangList({
    page: 1,
    page_size: 100,
    nhan_vien_id: nhanVienId,
  })

  const items = data?.data || []

  if (isLoading) {
    return (
      <div className="detail-section p-8">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
          <span className="text-sm">Đang tải...</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="detail-section">
        <div className="dot-grid-bg rounded-xl py-14 flex flex-col items-center animate-detail-fade">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Chưa có dữ liệu chấm công</h3>
          <p className="text-[11px] text-slate-400">Dữ liệu sẽ hiển thị sau khi chấm công</p>
        </div>
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => {
    if (a.nam !== b.nam) return b.nam - a.nam
    return b.thang - a.thang
  })

  const tongNgayLam = sorted.reduce((s, c) => s + (c.so_ngay_co_mat || 0), 0)
  const tongNgayVang = sorted.reduce((s, c) => s + (c.so_ngay_vang_co_phep || 0) + (c.so_ngay_vang_khong_phep || 0), 0)
  const tongHeSo = sorted.reduce((s, c) => s + (c.he_so_ngay_cong || 0), 0)

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Calendar className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Tháng ghi nhận</p>
            <p className="text-lg font-bold text-slate-900">{sorted.length}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-75">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Ngày có mặt</p>
            <p className="text-lg font-bold text-emerald-600">{tongNgayLam}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-150">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
            <AlertCircle className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Ngày vắng</p>
            <p className="text-lg font-bold text-amber-600">{tongNgayVang}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-225">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
            <TrendingUp className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Hệ số công</p>
            <p className="text-lg font-bold text-violet-600">{tongHeSo.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {sorted.map((cc, index) => {
          const config = TRANG_THAI_CONFIG[cc.trang_thai] || { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: cc.trang_thai, icon: AlertCircle }
          const StatusIcon = config.icon
          const tyLe = cc.so_ngay_lam_chuan > 0
            ? Math.round((cc.so_ngay_co_mat / cc.so_ngay_lam_chuan) * 100)
            : 0
          const isGood = tyLe >= 90
          const isWarning = tyLe >= 70 && tyLe < 90

          return (
            <div
              key={cc.id}
              className="detail-section p-4 animate-detail-slide"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {THANG_LABELS[cc.thang] || `Tháng ${cc.thang}`}/{cc.nam}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${config.bg} ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(tyLe, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-semibold w-8 text-right ${isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600"}`}>
                        {tyLe}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 rounded-lg bg-slate-50/60">
                      <p className="text-[11px] text-slate-400">Chuẩn</p>
                      <p className="text-sm font-bold text-slate-700">{cc.so_ngay_lam_chuan}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-50/50">
                      <p className="text-[11px] text-slate-400">Có mặt</p>
                      <p className="text-sm font-bold text-emerald-600">{cc.so_ngay_co_mat}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50/50">
                      <p className="text-[11px] text-slate-400">Vắng CP</p>
                      <p className="text-sm font-bold text-amber-600">{cc.so_ngay_vang_co_phep}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-50/50">
                      <p className="text-[11px] text-slate-400">Vắng KP</p>
                      <p className="text-sm font-bold text-red-600">{cc.so_ngay_vang_khong_phep}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
