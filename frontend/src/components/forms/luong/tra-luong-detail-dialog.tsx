"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, Clock, TrendingUp, Minus } from "lucide-react"
import type { TraLuong } from "@/types/luong.types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface TraLuongDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  traLuong: TraLuong | null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function LuongRow({ label, value, isPositive = false, isNegative = false, isBold = false }: {
  label: string
  value: number
  isPositive?: boolean
  isNegative?: boolean
  isBold?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-slate-600 ${isBold ? "font-semibold text-slate-900" : ""}`}>
        {label}
      </span>
      <span className={`font-mono ${isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-slate-900"} ${isBold ? "font-bold text-lg" : "text-sm"}`}>
        {isPositive ? "+" : isNegative ? "-" : ""}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  )
}

export function TraLuongDetailDialog({
  open,
  onOpenChange,
  traLuong,
}: TraLuongDetailDialogProps) {
  if (!traLuong) return null

  const hasTamDinhChi = traLuong.co_tam_dinh_chi
  const hasKyLuat = traLuong.co_ky_luat

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết phiếu lương</span>
            <Badge variant={traLuong.trang_thai === "da_chot" ? "outline" : "secondary"}>
              {traLuong.trang_thai === "chua_tra" ? "Chưa trả" : 
               traLuong.trang_thai === "da_tra" ? "Đã trả" : "Đã chốt"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {traLuong.nhan_vien_ho_ten} - Tháng {traLuong.thang}/{traLuong.nam}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alerts */}
          {(hasTamDinhChi || hasKyLuat) && (
            <div className="space-y-2">
              {hasTamDinhChi && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium text-amber-800">Tạm đình chỉ công tác</span>
                    <p className="text-amber-700">Lương được tính theo tỷ lệ tạm ứng quy định.</p>
                  </div>
                </div>
              )}
              {hasKyLuat && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium text-red-800">Có kỷ luật: {traLuong.hinh_thuc_ky_luat}</span>
                    <p className="text-red-700">Kiểm tra kỷ luật trước khi duyệt lương.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ngày công */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Ngày công
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{traLuong.so_ngay_cong_chuan}</p>
                <p className="text-xs text-slate-500">Ngày chuẩn</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">{traLuong.so_ngay_cong_thuc_te}</p>
                <p className="text-xs text-slate-500">Ngày thực tế</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">{traLuong.loai_cong_thuc === "moi" ? "1.15x" : "1x"}</p>
                <p className="text-xs text-slate-500">Hệ số đặc thù</p>
              </div>
            </div>
          </div>

          {/* Lương và phụ cấp */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Thu nhập
            </h4>
            <LuongRow label="Lương cơ bản" value={traLuong.luong_co_ban} />
            <Separator />
            <LuongRow label="Phụ cấp chức vụ" value={traLuong.phu_cap_chuc_vu} isPositive />
            <LuongRow label="Phụ cấp thâm niên" value={traLuong.phu_cap_tham_nien} isPositive />
            <LuongRow label="Phụ cấp ưu đãi nghề" value={traLuong.phu_cap_uu_dai} isPositive />
            <LuongRow label="Phụ cấp khu vực" value={traLuong.phu_cap_khu_vuc} isPositive />
            <LuongRow label="Phụ cấp thâm niên vượt khung" value={traLuong.phu_cap_tham_nien_vuot_khung} isPositive />
            <LuongRow label="Phụ cấp khác" value={traLuong.phu_cap_khac} isPositive />
            <Separator />
            <LuongRow label="Tổng phụ cấp" value={traLuong.tong_phu_cap} isPositive />
            <Separator />
            <LuongRow label="TỔNG THU NHẬP" value={traLuong.tong_thu_nhap} isBold />
          </div>

          {/* Khấu trừ */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Khấu trừ
            </h4>
            <LuongRow label="BHXH (8%)" value={traLuong.bhxh} isNegative />
            <LuongRow label="BHYT (1.5%)" value={traLuong.bhyt} isNegative />
            <LuongRow label="BHTN (1%)" value={traLuong.bhtn} isNegative />
            <LuongRow label="Thuế TNCN" value={traLuong.thue_tncn} isNegative />
            {traLuong.khau_tru_khac > 0 && (
              <LuongRow label="Khấu trừ khác" value={traLuong.khau_tru_khac} isNegative />
            )}
            <Separator />
            <LuongRow label="Tổng khấu trừ" value={traLuong.tong_khau_tru} isNegative />
          </div>

          {/* Thực nhận */}
          <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-900">LƯƠNG THỰC NHẬN</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(traLuong.luong_thuc_nhan)}
              </span>
            </div>
          </div>

          {/* Footer info */}
          <div className="text-xs text-slate-400 text-center">
            Ngày chạy: {format(new Date(traLuong.ngay_chay), "dd/MM/yyyy HH:mm", { locale: vi })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
