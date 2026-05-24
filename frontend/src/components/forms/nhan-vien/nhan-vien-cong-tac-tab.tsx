"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import type { CongTac } from "@/types/cong-tac.types"
import { formatDateVN } from "@/lib/date-utils"

interface NhanVienCongTacTabProps {
  congTacs: CongTac[]
}

export function NhanVienCongTacTab({ congTacs }: NhanVienCongTacTabProps) {
  if (!congTacs || congTacs.length === 0) {
    return (
      <div className="detail-section p-5">
        <div className="dot-grid-bg rounded-xl py-10 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">Chưa có lịch sử phân công công tác</p>
        </div>
      </div>
    )
  }

  const trangThaiConfig: Record<string, { color: string; bg: string; label: string; Icon: React.ElementType }> = {
    dang_cong_tac: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Đang công tác", Icon: CheckCircle },
    da_nghi: { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", label: "Đã nghỉ", Icon: XCircle },
    da_chuyen: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Đã chuyển", Icon: Clock },
  }

  return (
    <div className="detail-section overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Lịch sử phân công công tác</h3>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="absolute left-[37px] top-0 bottom-5 w-px bg-slate-200" />

        <div className="space-y-3">
          {congTacs.map((ct, index) => {
            const config = trangThaiConfig[ct.trang_thai] || trangThaiConfig.dang_cong_tac
            const Icon = config.Icon
            const isCurrent = ct.is_primary

            return (
              <div key={ct.id} className={`animate-detail-slide ${index > 0 ? `delay-${index * 75}` : ""}`}>
                <div className="flex gap-4">
                  <div className="relative z-10 mt-1 shrink-0">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isCurrent ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"}`}>
                      {isCurrent && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className={`flex-1 rounded-xl p-4 border ${isCurrent ? "bg-blue-50/40 border-blue-200/60" : "bg-white border-slate-200/80"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {ct.phong_ban?.ten_phong_ban || "—"}
                          </p>
                          {ct.chuc_vu?.ten_chuc_vu && (
                            <>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-600">{ct.chuc_vu.ten_chuc_vu}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDateVN(ct.ngay_bat_dau)}</span>
                          {ct.ngay_ket_thuc && (
                            <>
                              <span className="text-slate-300">→</span>
                              <span>{formatDateVN(ct.ngay_ket_thuc)}</span>
                            </>
                          )}
                          {ct.he_so_luong && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              HSL: {ct.he_so_luong}
                            </span>
                          )}
                          {ct.bac_luong && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              Bậc: {ct.bac_luong}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant="outline" className={`shrink-0 text-[10px] ${config.bg} ${config.color}`}>
                        <Icon className="h-3 w-3 mr-0.5" />
                        {config.label}
                      </Badge>
                    </div>

                    {ct.ghi_chu && (
                      <p className="mt-2 text-xs text-slate-400 italic border-t border-slate-100 pt-2">{ct.ghi_chu}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
