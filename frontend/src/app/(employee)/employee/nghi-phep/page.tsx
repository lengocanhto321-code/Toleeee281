"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Hourglass, FileText } from "lucide-react"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  useEmployeeNghiPhepList,
  useCreateEmployeeDonNghi,
  useHuyDonNghi,
} from "@/hooks/employee/use-employee-nghi-phep"
import { CreateEmployeeDonNghiDialog } from "./_components/create-don-nghi-dialog"
import { toastError, toastSuccess } from "@/lib/utils"
import { format } from "date-fns"
import type { LoaiNghi } from "@/types/nghi-phep.types"
import {
  LOAI_NGHI_LABELS,
  TRANG_THAI_DON_LABELS,
  TRANG_THAI_DON_COLORS,
} from "@/types/employee.types"

const TRANG_THAI_2LEVEL_LABELS: Record<string, string> = {
  cho_duyet_cap_1: "Chờ duyệt",
  cho_duyet_cap_2: "Chờ duyệt cấp 2",
  da_duyet_cap_2: "Đã duyệt",
  da_duyet: "Đã duyệt",
  tu_choi: "Từ chối",
  huy: "Đã hủy",
}

const TRANG_THAI_2LEVEL_COLORS: Record<string, string> = {
  cho_duyet_cap_1: "bg-amber-100 text-amber-700 border-amber-200",
  cho_duyet_cap_2: "bg-blue-100 text-blue-700 border-blue-200",
  da_duyet_cap_2: "bg-emerald-100 text-emerald-700 border-emerald-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-red-100 text-red-700 border-red-200",
  huy: "bg-slate-100 text-slate-700 border-slate-200",
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
    TRANG_THAI_2LEVEL_LABELS[status] || TRANG_THAI_DON_LABELS[status] || status

  const getStatusColor = (status: string) =>
    TRANG_THAI_2LEVEL_COLORS[status] || TRANG_THAI_DON_COLORS[status] || ""

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đơn nghỉ phép</h1>
          <p className="text-slate-500 mt-1">Quản lý đơn nghỉ phép của bạn</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo đơn nghỉ phép
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Phép còn lại</p>
              <p className="text-2xl font-bold text-slate-900">
                {nghiPhep?.so_ngay_phep_con_lai ?? "—"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tổng phép năm</p>
              <p className="text-2xl font-bold text-slate-900">
                {nghiPhep?.tong_ngay_phep_nam ?? "—"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Hourglass className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Chờ duyệt</p>
               <p className="text-2xl font-bold text-slate-900">
                 {nghiPhep?.don_cho_duyet ?? 0}
               </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Đã duyệt tháng này</p>
              <p className="text-2xl font-bold text-slate-900">
                {nghiPhep?.da_duyet_thang_nay ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lịch sử đơn nghỉ phép</h2>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Đang tải...</div>
        ) : donList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Bạn chưa có đơn nghỉ phép nào
          </div>
        ) : (
          <div className="space-y-3">
            {donList.map((don) => (
              <div
                key={don.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {LOAI_NGHI_LABELS[don.loai_nghi] || don.ten_loai_nghi}
                    </p>
                    {don.files && don.files.length > 0 && (
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {format(new Date(don.tu_ngay), "dd/MM/yyyy")} — {format(new Date(don.den_ngay), "dd/MM/yyyy")}{" "}
                    &bull; {don.so_ngay} ngày
                  </p>
                  {don.ly_do && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{don.ly_do}</p>
                  )}
                  {don.ghi_chu_duyet && don.trang_thai === "tu_choi" && (
                    <p className="text-xs text-red-500 mt-1">
                      Lý do từ chối: {don.ghi_chu_duyet}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className={getStatusColor(don.trang_thai)}>
                    {getStatusLabel(don.trang_thai)}
                  </Badge>
                  {(don.trang_thai === "cho_duyet_cap_1" || don.trang_thai === "cho_duyet_cap_2") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleHuy(don.id)}
                      disabled={huyMutation.isPending}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
