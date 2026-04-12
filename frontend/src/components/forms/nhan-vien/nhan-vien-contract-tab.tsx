"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, Building, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import type { NhanVien, HopDong } from "@/types/nhan-vien.types"
import { LOAI_HOP_DONG_LABELS } from "@/types/nhan-vien.types"

interface NhanVienContractTabProps {
  nhanVien: NhanVien
  hopDongs?: HopDong[]
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    hieu_luc: { label: "Hiệu lực", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    het_han: { label: "Hết hạn", className: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
    bi_huy: { label: "Bị hủy", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  }
  const cfg = config[status] || { label: status, className: "bg-slate-50 text-slate-600 border-slate-200", icon: Clock }
  const Icon = cfg.icon
  
  return (
    <Badge variant="outline" className={cfg.className}>
      <Icon className="h-3 w-3 mr-1" />
      {cfg.label}
    </Badge>
  )
}

export function NhanVienContractTab({ nhanVien, hopDongs = [] }: NhanVienContractTabProps) {
  const currentHopDong = hopDongs.find(h => h.trang_thai === "hieu_luc") || hopDongs[0]
  const historicalHopDongs = hopDongs.filter(h => h.id !== currentHopDong?.id)

  return (
    <div className="space-y-6">
      {/* Current Contract */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Hợp đồng hiện tại</h3>
              <p className="text-xs text-slate-500">Thông tin hợp đồng đang hiệu lực</p>
            </div>
          </div>
          {currentHopDong && <StatusBadge status={currentHopDong.trang_thai} />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Field 
            label="Loại hợp đồng" 
            value={
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {LOAI_HOP_DONG_LABELS[nhanVien.loai_hop_dong] || nhanVien.loai_hop_dong}
              </Badge>
            } 
          />
          <Field label="Số hợp đồng" value={currentHopDong?.so_hop_dong || nhanVien.so_hop_dong || "—"} />
          <Field label="Ngày ký" value={formatDate(currentHopDong?.ngay_ky)} />
          <Field label="Hình thức tuyển dụng" value={nhanVien.hinh_thuc_tuyen_dung || "—"} />
          
          <Field label="Ngày bắt đầu" value={formatDate(currentHopDong?.ngay_bat_dau || nhanVien.ngay_vao_lam)} />
          <Field label="Ngày kết thúc" value={formatDate(currentHopDong?.ngay_ket_thuc || nhanVien.ngay_het_hop_dong)} />
          <Field label="Nơi ký hợp đồng" value={nhanVien.noi_ky_hop_dong || "—"} />
        </div>

        {currentHopDong?.noi_dung && (
          <>
            <Separator className="my-6" />
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Nội dung hợp đồng</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4">
                {currentHopDong.noi_dung}
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Contract History */}
      {historicalHopDongs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Lịch sử hợp đồng</h3>
              <p className="text-xs text-slate-500">Các hợp đồng trước đó</p>
            </div>
          </div>

          <div className="space-y-4">
            {historicalHopDongs.map((hopDong, index) => (
              <div key={hopDong.id || index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">HĐ số {hopDong.so_hop_dong}</p>
                      <StatusBadge status={hopDong.trang_thai} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(hopDong.ngay_bat_dau)} 
                      {hopDong.ngay_ket_thuc && ` → ${formatDate(hopDong.ngay_ket_thuc)}`}
                      {!hopDong.ngay_ket_thuc && " → Hiện tại"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                    {LOAI_HOP_DONG_LABELS[hopDong.loai_hop_dong] || hopDong.loai_hop_dong}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contract Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Tổng số HĐ</p>
            <p className="text-xl font-bold text-slate-900">{hopDongs.length || 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">HĐ hiệu lực</p>
            <p className="text-xl font-bold text-emerald-600">{hopDongs.filter(h => h.trang_thai === "hieu_luc").length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Thời hạn</p>
            <p className="text-xl font-bold text-slate-900">
              {hopDongs.filter(h => h.trang_thai === "het_han").length} đã hết
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
