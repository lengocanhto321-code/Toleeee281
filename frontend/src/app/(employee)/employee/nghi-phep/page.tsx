"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import { PageHeader } from "@/components/employee/page-header"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  useEmployeeNghiPhepList,
  useCreateEmployeeDonNghi,
  useHuyDonNghi,
} from "@/hooks/employee/use-employee-nghi-phep"
import { CreateEmployeeDonNghiDialog } from "./_components/create-don-nghi-dialog"
import { formatDateVN } from "@/lib/date-utils"
import type { LoaiNghi } from "@/types/nghi-phep.types"
import {
  LOAI_NGHI_LABELS,
  TRANG_THAI_DON_LABELS,
  TRANG_THAI_DON_COLORS,
} from "@/types/employee.types"

const TRANG_THAI_LABELS_MAP: Record<string, string> = {
  cho_duyet: "Chờ duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
  huy: "Đã hủy",
}

const TRANG_THAI_COLORS_MAP: Record<string, string> = {
  cho_duyet: "bg-amber-100 text-amber-700 border-amber-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-red-100 text-red-700 border-red-200",
  huy: "bg-slate-100 text-slate-500 border-slate-200",
}

const DON_ICONS: Record<string, string> = {
  phep_nam: "🏖️",
  nghi_om: "🤒",
  viec_rieng: "🏠",
  cong_tac: "✈️",
  ket_hon: "💍",
  mai_tang: "🕊️",
  thai_san: "👶",
}

export default function EmployeeNghiPhepPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: dashboard } = useEmployeeDashboard()
  const { data: nghiPhepList, isLoading } = useEmployeeNghiPhepList()
  const createMutation = useCreateEmployeeDonNghi()
  const huyMutation = useHuyDonNghi()

  const nghiPhep = dashboard?.nghi_phep
  const donList = nghiPhepList?.items ?? []
  const nhanVienId = dashboard?.nhan_vien?.id ?? ""
  const hoTen = dashboard?.nhan_vien?.ho_ten ?? ""

  const handleCreate = (data: {
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
    files?: string[]
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false)
      },
    })
  }

  const handleHuy = (donId: string) => {
    huyMutation.mutate(donId)
  }

  const getStatusLabel = (status: string) =>
    TRANG_THAI_LABELS_MAP[status] || TRANG_THAI_DON_LABELS[status] || status

  const getStatusColor = (status: string) =>
    TRANG_THAI_COLORS_MAP[status] || TRANG_THAI_DON_COLORS[status] || ""

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Nghỉ phép"
        subtitle="Quản lý đơn nghỉ phép"
        actions={
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-white/15 hover:bg-white/25 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Xin nghỉ
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <BentoCard
          label="🏖️ Còn lại"
          value={nghiPhep?.so_ngay_phep_con_lai ?? "—"}
          subtitle="ngày phép"
          variant="green"
        />
        <BentoCard
          label="⏳ Chờ duyệt"
          value={nghiPhep?.don_cho_duyet ?? 0}
          subtitle="đơn"
          variant="amber"
        />
        <BentoCard
          label="✅ Đã duyệt"
          value={nghiPhep?.da_duyet_thang_nay ?? 0}
          subtitle="tháng này"
          variant="blue"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Đơn nghỉ phép</h2>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-slate-400">Đang tải...</div>
        ) : donList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có đơn nghỉ phép nào</div>
        ) : (
          <div className="space-y-2">
            {donList.map((don) => (
              <div
                key={don.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-base shrink-0">
                  {DON_ICONS[don.loai_nghi] || "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {LOAI_NGHI_LABELS[don.loai_nghi] || don.ten_loai_nghi}
                    </p>
                    {don.files && don.files.length > 0 && (
                      <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDateVN(don.tu_ngay)} — {formatDateVN(don.den_ngay)} · {don.so_ngay} ngày
                  </p>
                  {don.ghi_chu_duyet && don.trang_thai === "tu_choi" && (
                    <p className="text-[10px] text-red-500 mt-0.5">Lý do: {don.ghi_chu_duyet}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className={`text-[10px] px-2 ${getStatusColor(don.trang_thai)}`}>
                    {getStatusLabel(don.trang_thai)}
                  </Badge>
                  {don.trang_thai === "cho_duyet" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs px-2"
                      onClick={() => handleHuy(don.id)}
                      disabled={huyMutation.isPending}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateEmployeeDonNghiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        nhanVienId={nhanVienId}
        hoTen={hoTen}
      />
    </div>
  )
}
