"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, Lock } from "lucide-react"
import type { TraLuong } from "@/types/luong.types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const createTraLuongColumns = (options: {
  onViewDetail: (traLuong: TraLuong) => void
}): ColumnDef<TraLuong>[] => [
  {
    accessorKey: "nhan_vien_ho_ten",
    header: "Nhân viên",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.nhan_vien_ho_ten || "N/A"}</div>
    ),
  },
  {
    accessorKey: "thang",
    header: "Tháng",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.thang}/{row.original.nam}
      </span>
    ),
  },
  {
    accessorKey: "luong_co_ban",
    header: "Lương cơ bản",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatCurrency(row.original.luong_co_ban)}
      </span>
    ),
  },
  {
    accessorKey: "tong_phu_cap",
    header: "Phụ cấp",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-emerald-600">
        +{formatCurrency(row.original.tong_phu_cap)}
      </span>
    ),
  },
  {
    accessorKey: "tong_thu_nhap",
    header: "Tổng thu nhập",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {formatCurrency(row.original.tong_thu_nhap)}
      </span>
    ),
  },
  {
    accessorKey: "tong_khau_tru",
    header: "Khấu trừ",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-red-500">
        -{formatCurrency(row.original.tong_khau_tru)}
      </span>
    ),
  },
  {
    accessorKey: "luong_thuc_nhan",
    header: "Thực nhận",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-bold text-indigo-600">
        {formatCurrency(row.original.luong_thuc_nhan)}
      </span>
    ),
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.trang_thai
      const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
        chua_tra: "secondary",
        da_tra: "default",
        da_chot: "outline",
      }
      const labels: Record<string, string> = {
        chua_tra: "Chưa trả",
        da_tra: "Đã trả",
        da_chot: "Đã chốt",
      }
      return (
        <Badge variant={variants[status] || "secondary"}>
          {labels[status] || status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => options.onViewDetail(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

interface KyLuongRow {
  id: string
  thang: number
  nam: number
  trang_thai: string
  tong_nhan_vien?: number
  tong_thu_nhap?: number
  tong_thuc_nhan?: number
  created_at: string
}

export const createKyLuongColumns = (options: {
  onDuyet: (kyLuong: { id: string }) => void
  onChot: (kyLuong: { id: string }) => void
  onViewDetail: (kyLuong: { id: string }) => void
}): ColumnDef<KyLuongRow>[] => [
  {
    accessorKey: "thang",
    header: "Kỳ lương",
    cell: ({ row }) => (
      <div>
        <span className="font-semibold">Tháng {row.original.thang}</span>
        <span className="text-slate-400">/{row.original.nam}</span>
      </div>
    ),
  },
  {
    accessorKey: "tong_nhan_vien",
    header: "Số NV",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.tong_nhan_vien || 0}</span>
    ),
  },
  {
    accessorKey: "tong_thu_nhap",
    header: "Tổng thu nhập",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatCurrency(row.original.tong_thu_nhap || 0)}
      </span>
    ),
  },
  {
    accessorKey: "tong_thuc_nhan",
    header: "Tổng thực nhận",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold text-indigo-600">
        {formatCurrency(row.original.tong_thuc_nhan || 0)}
      </span>
    ),
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.trang_thai
      const config: Record<string, { variant: "secondary" | "default" | "outline"; label: string; icon?: React.ReactNode }> = {
        chua_duyet: { variant: "secondary", label: "Chưa duyệt" },
        da_duyet: { variant: "default", label: "Đã duyệt", icon: <CheckCircle className="h-3 w-3" /> },
        da_chot: { variant: "outline", label: "Đã chốt", icon: <Lock className="h-3 w-3" /> },
      }
      const cfg = config[status] || { variant: "secondary" as const, label: status }
      return (
        <Badge variant={cfg.variant} className="gap-1">
          {cfg.icon}
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Ngày tạo",
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">
        {format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.original.trang_thai
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => options.onViewDetail({ id: row.original.id })}
          >
            Chi tiết
          </Button>
          {status === "chua_duyet" && (
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => options.onDuyet({ id: row.original.id })}
            >
              Duyệt
            </Button>
          )}
          {status === "da_duyet" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => options.onChot({ id: row.original.id })}
            >
              Chốt
            </Button>
          )}
        </div>
      )
    },
  },
]
