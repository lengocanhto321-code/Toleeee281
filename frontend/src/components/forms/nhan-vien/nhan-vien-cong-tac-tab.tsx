"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import type { CongTac } from "@/types/cong-tac.types"

interface NhanVienCongTacTabProps {
  congTacs: CongTac[]
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function NhanVienCongTacTab({ congTacs }: NhanVienCongTacTabProps) {
  if (!congTacs || congTacs.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-500 text-sm">Chưa có lịch sử phân công công tác</p>
      </Card>
    )
  }

  const trangThaiConfig: Record<string, { color: string; label: string; Icon: React.ElementType }> = {
    dang_cong_tac: { color: "bg-emerald-100 text-emerald-700", label: "Đang công tác", Icon: CheckCircle },
    da_nghi: { color: "bg-slate-100 text-slate-600", label: "Đã nghỉ", Icon: XCircle },
    da_chuyen: { color: "bg-amber-100 text-amber-700", label: "Đã chuyển", Icon: Clock },
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-400" />
        Lịch sử phân công công tác
      </h3>
      
      <div className="space-y-4">
        {congTacs.map((ct, index) => {
          const config = trangThaiConfig[ct.trang_thai] || trangThaiConfig.dang_cong_tac
          const Icon = config.Icon
          
          return (
            <div
              key={ct.id}
              className={`relative border rounded-lg p-4 ${
                ct.is_primary ? "border-primary bg-primary/5" : "border-slate-200"
              }`}
            >
              {ct.is_primary && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                  Hiện tại
                </Badge>
              )}
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">
                    {ct.phong_ban?.ten_phong_ban || "—"} — {ct.chuc_vu?.ten_chuc_vu || "—"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Từ: {formatDate(ct.ngay_bat_dau)}</span>
                    {ct.ngay_ket_thuc && (
                      <span>Đến: {formatDate(ct.ngay_ket_thuc)}</span>
                    )}
                  </div>
                  {ct.he_so_luong && (
                    <p className="text-sm text-slate-500">
                      Hệ số lương: {ct.he_so_luong}
                    </p>
                  )}
                  {ct.bac_luong && (
                    <p className="text-sm text-slate-500">
                      Bậc lương: {ct.bac_luong}
                    </p>
                  )}
                </div>
                
                <Badge className={`${config.color} border-0`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              
              {ct.ghi_chu && (
                <p className="mt-2 text-sm text-slate-500 italic">{ct.ghi_chu}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
