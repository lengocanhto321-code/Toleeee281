"use client"

import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useDonXinNghiList } from "@/hooks/nghi-phep"
import { formatDateVN } from "@/lib/date-utils"

const LOAI_NGHI_LABELS: Record<string, string> = {
  phep_nam: "Phép năm",
  nghi_om: "Nghỉ ốm",
  viec_rieng: "Việc riêng",
  cong_tac: "Công tác",
  ket_hon: "Kết hôn",
  mai_tang: "Ma táng",
  thai_san: "Thai sản",
  nghi_khac: "Nghỉ khác",
}

const TRANG_THAI_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  cho_duyet: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Chờ duyệt", icon: Clock },
  da_duyet: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Đã duyệt", icon: CheckCircle },
  tu_choi: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Từ chối", icon: XCircle },
  huy: { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: "Đã hủy", icon: AlertCircle },
}

interface NhanVienNghiPhepTabProps {
  nhanVienId: string
}

export function NhanVienNghiPhepTab({ nhanVienId }: NhanVienNghiPhepTabProps) {
  const { data, isLoading } = useDonXinNghiList({
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
            <CalendarDays className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Chưa có đơn nghỉ phép nào</h3>
          <p className="text-[11px] text-slate-400">Lịch sử nghỉ phép sẽ hiển thị tại đây</p>
        </div>
      </div>
    )
  }

  const tongDon = items.length
  const daDuyet = items.filter(d => d.trang_thai === "da_duyet").length
  const choDuyet = items.filter(d => d.trang_thai === "cho_duyet").length
  const tongNgay = items.filter(d => d.trang_thai === "da_duyet").reduce((s, d) => s + (d.so_ngay || 0), 0)

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <CalendarDays className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Tổng đơn</p>
            <p className="text-lg font-bold text-slate-900">{tongDon}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-75">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Đã duyệt</p>
            <p className="text-lg font-bold text-emerald-600">{daDuyet}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-150">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
            <Clock className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Chờ duyệt</p>
            <p className="text-lg font-bold text-amber-600">{choDuyet}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-225">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
            <CalendarDays className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Ngày nghỉ đã duyệt</p>
            <p className="text-lg font-bold text-violet-600">{tongNgay}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((don, index) => {
          const config = TRANG_THAI_CONFIG[don.trang_thai] || { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: don.trang_thai, icon: AlertCircle }
          const StatusIcon = config.icon
          return (
            <div
              key={don.id}
              className="detail-section p-4 animate-detail-slide"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {LOAI_NGHI_LABELS[don.loai_nghi] || don.loai_nghi}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${config.bg} ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatDateVN(don.tu_ngay)} → {formatDateVN(don.den_ngay)}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-medium">
                        {don.so_ngay} ngày
                      </span>
                    </div>
                    {don.ly_do && <p className="text-[11px] text-slate-400 italic mt-0.5">{don.ly_do}</p>}
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 shrink-0">{formatDateVN(don.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
