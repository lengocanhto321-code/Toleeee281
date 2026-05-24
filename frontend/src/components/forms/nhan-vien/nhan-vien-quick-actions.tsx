"use client"

import { Button } from "@/components/ui/button"
import {
  Pencil,
  Banknote,
  FileText,
  UserPlus,
  ShieldAlert,
  Printer,
  Download,
  MoreHorizontal,
  UserCog,
  Award,
  History
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NhanVien } from "@/types/nhan-vien.types"
import { TrangThaiNhanVien } from "@/types/nhan-vien.types"

interface QuickActionsBarProps {
  nhanVien: NhanVien
  onEdit?: () => void
  onViewSalary?: () => void
  onCreateContract?: () => void
  onAddReward?: () => void
  onAddDiscipline?: () => void
  onPrint?: () => void
  onExport?: () => void
}

export function QuickActionsBar({
  nhanVien,
  onEdit,
  onViewSalary,
  onCreateContract,
  onAddReward,
  onAddDiscipline,
  onPrint,
  onExport,
}: QuickActionsBarProps) {
  const isActive = nhanVien.trang_thai === "dang_lam"
  const isGiaoVien = nhanVien.loai_nhan_vien === "giao_vien"

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/50 border border-slate-200">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 cursor-pointer"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5" />
        Sửa thông tin
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 cursor-pointer"
        onClick={onViewSalary}
      >
        <Banknote className="h-3.5 w-3.5" />
        Xem lương
      </Button>

      {isGiaoVien && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 cursor-pointer"
          onClick={onCreateContract}
        >
          <FileText className="h-3.5 w-3.5" />
          Hợp đồng
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 cursor-pointer text-amber-600 hover:text-amber-700"
        onClick={onAddReward}
      >
        <Award className="h-3.5 w-3.5" />
        Khen thưởng
      </Button>

      {isActive && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 cursor-pointer text-red-600 hover:text-red-700"
          onClick={onAddDiscipline}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Kỷ luật
        </Button>
      )}

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
            <Printer className="mr-2 h-4 w-4" />
            In hồ sơ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            Lịch sử thay đổi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
