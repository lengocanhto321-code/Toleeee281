"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"
import { Pencil, MoreVertical, Eye, BookOpen, User, Shield, CheckCircle2, XCircle, Clock, Trash2, Banknote, Calendar, GraduationCap } from "lucide-react"
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
import { TRANG_THAI_LABELS, TRANG_THAI_COLORS, LOAI_NHAN_VIEN_LABELS, CAP_HOC_LABELS } from "@/types/nhan-vien.types"

function formatCurrency(amount: number): string {
  if (!amount) return "—"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

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
  if (!startDateStr) return null
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
  return `${years}n ${months}th`
}

function getTenureDays(startDateStr?: string): number {
  if (!startDateStr) return 0
  const start = new Date(startDateStr)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
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
    // Checkbox
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
    // Nhân viên (Họ tên + Mã NV)
    {
      id: "ho_ten",
      accessorKey: "ho_ten",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nhân viên" />,
      cell: ({ row }) => {
        const nv = row.original
        return (
          <Link href={`/nhan-vien/${nv.ma_nhan_vien}`} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {getInitials(nv.ho_ten)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                {nv.ho_ten}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {nv.ma_nhan_vien}
              </div>
              {nv.email && (
                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  {nv.email}
                </div>
              )}
            </div>
          </Link>
        )
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.ho_ten.localeCompare(rowB.original.ho_ten, "vi")
      },
    },
    // Loại (Phân loại)
    {
      accessorKey: "loai_nhan_vien",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
      cell: ({ row }) => {
        const loai = row.original.loai_nhan_vien
        const Icon = LOAI_ICON[loai] || User
        return (
          <Badge variant="outline" className={LOAI_BADGE[loai] || "bg-slate-50 text-slate-600"}>
            <Icon className="mr-1 h-3 w-3" />
            {LOAI_NHAN_VIEN_LABELS[loai] || loai}
          </Badge>
        )
      },
      size: 120,
    },
    // Cấp học
    {
      accessorKey: "cap_hoc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cấp học" />,
      cell: ({ row }) => {
        const capHoc = row.original.cap_hoc
        if (!capHoc) return <span className="text-sm text-slate-400 italic">—</span>
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <GraduationCap className="mr-1 h-3 w-3" />
            {CAP_HOC_LABELS[capHoc] || capHoc}
          </Badge>
        )
      },
      size: 110,
    },
    // Phòng ban
    {
      accessorKey: "phong_ban",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phòng ban" />,
      cell: ({ row }) => {
        const phongBan = row.original.phong_ban?.ten_phong_ban
        return (
          <div className="text-sm font-medium text-slate-700 max-w-[140px] truncate" title={phongBan}>
            {phongBan || <span className="text-slate-400 italic font-normal">Chưa phân bổ</span>}
          </div>
        )
      },
      size: 140,
    },
    // Chức vụ
    {
      accessorKey: "chuc_vu",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chức vụ" />,
      cell: ({ row }) => {
        const chucVu = row.original.chuc_vu?.ten_chuc_vu
        if (!chucVu) return <span className="text-sm text-slate-400 italic">—</span>
        return (
          <Badge variant="outline" className={getChucVuColor(chucVu)}>
            {chucVu}
          </Badge>
        )
      },
      size: 140,
    },
    // Ngày vào làm
    {
      id: "ngay_vao_lam",
      accessorKey: "ngay_vao_lam",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày vào" />,
      cell: ({ row }) => {
        const ngayVao = row.original.ngay_vao_lam
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-slate-600 whitespace-nowrap cursor-help">
                  {formatDate(ngayVao)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ngày vào làm việc</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.ngay_vao_lam ? new Date(rowA.original.ngay_vao_lam).getTime() : 0
        const dateB = rowB.original.ngay_vao_lam ? new Date(rowB.original.ngay_vao_lam).getTime() : 0
        return dateA - dateB
      },
      size: 100,
    },
    // Thâm niên
    {
      id: "thanh_nien",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Thâm niên" />,
      cell: ({ row }) => {
        const nv = row.original
        const tenure = getTenure(nv.ngay_vao_lam)
        if (!tenure) return <span className="text-slate-400">—</span>

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap cursor-help">
                  {tenure}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Từ {formatDate(nv.ngay_vao_lam)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      sortingFn: (rowA, rowB) => {
        const daysA = getTenureDays(rowA.original.ngay_vao_lam)
        const daysB = getTenureDays(rowB.original.ngay_vao_lam)
        return daysA - daysB
      },
      size: 100,
    },
    // Trạng thái
    {
      accessorKey: "trang_thai",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const tt = row.original.trang_thai as TrangThaiNhanVien
        const Icon = TRANG_THAI_ICON[tt] || CheckCircle2
        return (
          <Badge variant="outline" className={TRANG_THAI_COLORS[tt]}>
            <Icon className="mr-1 h-3 w-3" />
            {TRANG_THAI_LABELS[tt]}
          </Badge>
        )
      },
      size: 120,
    },
    // Lương (quick view)
    {
      id: "luong",
      header: "Lương",
      cell: ({ row }) => {
        const nv = row.original
        const luongCoBan = (nv as any).luong?.luong_co_ban
        const heSoLuong = (nv as any).luong?.he_so_luong

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-start gap-0.5 cursor-help">
                  {luongCoBan ? (
                    <>
                      <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        <Banknote className="h-3.5 w-3.5" />
                        {formatCurrency(luongCoBan)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Hệ số {heSoLuong}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa setup</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="w-48">
                <div className="space-y-1.5">
                  <p className="font-medium">Thông tin lương</p>
                  {luongCoBan ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Lương cơ bản:</span>
                        <span className="font-medium">{formatCurrency(luongCoBan)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Hệ số:</span>
                        <span className="font-medium">{heSoLuong}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">Nhân viên chưa được setup lương</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
      size: 130,
    },
    // Actions
    {
      id: "actions",
      header: () => <span className="sr-only">Thao tác</span>,
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
