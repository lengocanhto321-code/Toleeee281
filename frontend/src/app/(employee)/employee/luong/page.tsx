"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/employee/page-header"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeLuong } from "@/hooks/employee/use-employee-luong"
import { Banknote } from "lucide-react"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)

export default function EmployeeLuongPage() {
  const [nam, setNam] = useState(CURRENT_YEAR)
  const { data: luongData, isLoading } = useEmployeeLuong({ nam })

  const phieuLuongs = luongData ?? []
  const latestPhieu = phieuLuongs.length > 0 ? phieuLuongs[0] : null
  const ct = latestPhieu?.chi_tiet

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Lương"
        subtitle="Tra cứu thông tin lương"
        actions={
          <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
            <SelectTrigger className="w-[90px] h-8 bg-white/15 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
      ) : latestPhieu ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <BentoCard
              label="💰 Thực nhận"
              value={formatCurrency(latestPhieu.luong_thuc_nhan)}
              subtitle={`Tháng ${latestPhieu.thang}/${latestPhieu.nam}`}
              variant="blue"
            />
            <BentoCard
              label="Khấu trừ"
              value={formatCurrency(latestPhieu.tong_khau_tru)}
              variant="red"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Phiếu lương tháng {latestPhieu.thang}/{latestPhieu.nam}
              </h2>
              {latestPhieu.ngay_thanh_toan && (
                <Badge variant="outline" className="text-[10px]">
                  Thanh toán: {latestPhieu.ngay_thanh_toan}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lương cơ bản</p>
                <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(ct?.luong_co_ban || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Phụ cấp</p>
                <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(ct?.phu_cap || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Thưởng</p>
                <p className="text-base font-bold text-emerald-700 mt-1">{formatCurrency(ct?.thuong || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Bảo hiểm</p>
                <p className="text-base font-bold text-red-600 mt-1">-{formatCurrency(ct?.bao_hiem || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Thuế</p>
                <p className="text-base font-bold text-red-600 mt-1">-{formatCurrency(ct?.thue || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Khác</p>
                <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(ct?.khac || 0)}</p>
              </div>
            </div>
          </div>

          {phieuLuongs.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Lịch sử lương</h2>
              <div className="space-y-2">
                {phieuLuongs.slice(1).map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">Tháng {pl.thang}/{pl.nam}</p>
                      <p className="text-xs text-slate-500">
                        CB: {formatCurrency(pl.chi_tiet?.luong_co_ban || 0)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(pl.luong_thuc_nhan)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Banknote className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-500">Chưa có dữ liệu lương</h3>
          <p className="text-xs text-slate-400 mt-1">Dữ liệu sẽ hiển thị khi có phiếu lương</p>
        </div>
      )}
    </div>
  )
}
