"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, MoreVertical, Eye, BookOpen, User, Shield, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import type { NhanVien, TrangThaiNhanVien } from "@/types/nhan-vien.types"
import { TRANG_THAI_LABELS, TRANG_THAI_COLORS, LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

interface ColumnActions {
  onEdit: (nv: NhanVien) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function getTenure(startDateStr?: string) {
  if (!startDateStr) return "-"
  const start = new Date(startDateStr)
  const now = new Date()

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0 && months === 0) return "Mới vào"
  if (years === 0) return `${months} tháng`
  if (months === 0) return `${years} năm`
  return `${years} năm ${months} tháng`
}

const LOAI_BADGE: Record<string, string> = {
  giao_vien: "bg-indigo-50 text-indigo-700 border-indigo-200",
  nhan_vien: "bg-slate-100 text-slate-600 border-slate-200",
  can_bo: "bg-amber-50 text-amber-700 border-amber-200",
}

const LOAI_ICON: Record<string, React.ElementType> = {
  giao_vien: BookOpen,
  nhan_vien: User,
  can_bo: Shield,
}

const TRANG_THAI_ICON: Record<string, React.ElementType> = {
  dang_lam: CheckCircle2,
  nghi_viec: XCircle,
  nghi_huu: Clock,
  da_xoa: Trash2,
}

function getChucVuColor(chucVu: string) {
  if (!chucVu) return "bg-slate-50 text-slate-500 border-slate-200"
  const cv = chucVu.toLowerCase()
  if (cv.includes("hiệu trưởng")) return "bg-purple-50 text-purple-700 border-purple-200"
  if (cv.includes("tổ trưởng") || cv.includes("trưởng phòng")) return "bg-blue-50 text-blue-700 border-blue-200"
  if (cv.includes("tổ phó") || cv.includes("phó phòng")) return "bg-sky-50 text-sky-700 border-sky-200"
  return "bg-slate-50 text-slate-700 border-slate-200"
}

export function createNhanVienColumns({ onEdit }: ColumnActions): ColumnDef<NhanVien>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex w-full items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "ho_ten",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhân viên" />,
      cell: ({ row }) => {
        const nv = row.original
        return (
          <Link href={`/nhan-vien/${nv.ma_nhan_vien}`} className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
              {getInitials(nv.ho_ten)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{nv.ho_ten}</div>
              {nv.email && (
                <div className="truncate text-xs text-slate-400">{nv.email}</div>
              )}
              <div className="font-mono text-[10px] tracking-wide text-slate-400">{nv.ma_nhan_vien}</div>
            </div>
          </Link>
        )
      },
    },
    {
      id: "tham_nien",
      header: "Thâm niên",
      cell: ({ row }) => {
        const nv = row.original
        const tenure = getTenure(nv.ngay_vao_lam)
        const startDate = formatDate(nv.ngay_vao_lam)

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help whitespace-nowrap text-sm text-slate-700 decoration-slate-400 decoration-dashed underline-offset-4 hover:underline">
                  {tenure}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ngày vào làm: <span className="font-medium">{startDate}</span></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      size: 110,
    },
    {
      accessorKey: "ngay_het_hop_dong",
      header: "Hạn HĐ",
      cell: ({ row }) => {
        const endDate = row.getValue("ngay_het_hop_dong") as string
        return (
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {formatDate(endDate)}
          </span>
        )
      },
      size: 100,
    },
    {
      accessorKey: "loai_nhan_vien",
      header: "Phân loại",
      cell: ({ row }) => {
        const loai = row.getValue("loai_nhan_vien") as string
        const Icon = LOAI_ICON[loai] || User
        return (
          <Badge variant="outline" className={LOAI_BADGE[loai] || "bg-slate-50 text-slate-600"}>
            <Icon className="mr-1.5 h-3 w-3" />
            {LOAI_NHAN_VIEN_LABELS[loai] || loai}
          </Badge>
        )
      },
      size: 130,
    },
    {
      accessorKey: "phong_ban",
      header: "Phòng ban",
      cell: ({ row }) => {
        const phongBan = row.getValue("phong_ban") as string
        return (
          <div className="text-sm font-medium text-slate-700 max-w-[150px] truncate" title={phongBan}>
            {phongBan || <span className="text-slate-400 italic font-normal">Chưa phân bổ</span>}
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "chuc_vu",
      header: "Chức vụ",
      cell: ({ row }) => {
        const chucVu = row.getValue("chuc_vu") as string
        if (!chucVu) return <span className="text-sm text-slate-400 italic">-</span>
        return (
          <Badge variant="outline" className={getChucVuColor(chucVu)}>
            {chucVu}
          </Badge>
        )
      },
      size: 140,
    },
    {
      accessorKey: "trang_thai",
      header: "Trạng thái",
      cell: ({ row }) => {
        const tt = row.getValue("trang_thai") as TrangThaiNhanVien
        const Icon = TRANG_THAI_ICON[tt] || CheckCircle2
        return (
          <Badge variant="outline" className={TRANG_THAI_COLORS[tt]}>
            <Icon className="mr-1.5 h-3 w-3" />
            {TRANG_THAI_LABELS[tt]}
          </Badge>
        )
      },
      size: 130,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Thao tac</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/nhan-vien/${row.original.ma_nhan_vien}`}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Chỉnh sửa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50,
    },
  ]
}
