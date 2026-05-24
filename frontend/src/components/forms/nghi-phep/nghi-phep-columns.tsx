"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Check, X } from "lucide-react"
import { formatDateVN, formatDateTimeVN } from "@/lib/date-utils"
import type { DonXinNghi, LoaiNghi, TrangThaiDon } from "@/types/nghi-phep.types"

const LOAI_NGHI_CONFIG: Record<LoaiNghi, { label: string; color: string }> = {
  phep_nam: { label: "Phép năm", color: "bg-blue-100 text-blue-700 border-blue-200" },
  nghi_om: { label: "Nghỉ ốm", color: "bg-red-100 text-red-700 border-red-200" },
  viec_rieng: { label: "Việc riêng", color: "bg-amber-100 text-amber-700 border-amber-200" },
  cong_tac: { label: "Công tác", color: "bg-purple-100 text-purple-700 border-purple-200" },
  ket_hon: { label: "Kết hôn", color: "bg-pink-100 text-pink-700 border-pink-200" },
  mai_tang: { label: "Ma táng", color: "bg-slate-100 text-slate-700 border-slate-200" },
  thai_san: { label: "Thai sản", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
}

const TRANG_THAI_CONFIG: Record<TrangThaiDon, { label: string; color: string; icon: React.ReactNode }> = {
  cho_duyet: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: null },
  da_duyet: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: null },
  tu_choi: { label: "Từ chối", color: "bg-red-100 text-red-700 border-red-200", icon: null },
  huy: { label: "Đã hủy", color: "bg-slate-100 text-slate-700 border-slate-200", icon: null },
}

export const createDonNghiColumns = (options: {
  onViewDetail: (don: DonXinNghi) => void
  onDuyet: (don: DonXinNghi) => void
  onTuChoi: (don: DonXinNghi) => void
}): ColumnDef<DonXinNghi>[] => [
  {
    accessorKey: "nhan_vien_ho_ten",
    header: "Nhân viên",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nhan_vien_ho_ten || "N/A"}</p>
        <p className="text-xs text-slate-500">{row.original.nhan_vien_id}</p>
      </div>
    ),
  },
  {
    accessorKey: "loai_nghi",
    header: "Loại nghỉ",
    cell: ({ row }) => {
      const config = LOAI_NGHI_CONFIG[row.original.loai_nghi as LoaiNghi]
      return (
        <Badge variant="outline" className={config?.color || "bg-slate-100"}>
          {config?.label || row.original.loai_nghi}
        </Badge>
      )
    },
  },
  {
    id: "thoi_gian",
    header: "Thời gian",
    cell: ({ row }) => (
      <div className="text-sm">
        <p>{formatDateVN(row.original.tu_ngay)}</p>
        <p className="text-slate-500">→ {formatDateVN(row.original.den_ngay)}</p>
      </div>
    ),
  },
  {
    accessorKey: "so_ngay",
    header: "Số ngày",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.so_ngay}</span>
    ),
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => {
      const config = TRANG_THAI_CONFIG[row.original.trang_thai as TrangThaiDon]
      return (
        <Badge variant="outline" className={config?.color || "bg-slate-100"}>
          {config?.label || row.original.trang_thai}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">
        {formatDateTimeVN(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const don = row.original
      const canAction = don.trang_thai === "cho_duyet"
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => options.onViewDetail(don)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canAction && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => options.onDuyet(don)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => options.onTuChoi(don)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    },
  },
]
