"use client"

import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Banknote,
  FileText,
  Award,
  ShieldAlert,
  Printer,
  Download,
  History,
  RotateCcw,
  ArrowRightLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNhanVienDetail } from "@/hooks/nhan-vien"
import { TRANG_THAI_LABELS, TRANG_THAI_COLORS, LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"
import type { TrangThaiNhanVien } from "@/types/nhan-vien.types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type SidebarAction =
  | "edit"
  | "viewSalary"
  | "createContract"
  | "addReward"
  | "addDiscipline"
  | "print"
  | "export"
  | "back"
  | "restore"
  | "transfer"

const ACTION_CONFIG: Record<SidebarAction, { label: string; icon: React.ElementType; className?: string }> = {
  back: { label: "Quay lại", icon: ArrowLeft, className: "text-slate-600" },
  edit: { label: "Sửa thông tin", icon: Pencil },
  viewSalary: { label: "Xem lương", icon: Banknote },
  createContract: { label: "Hợp đồng", icon: FileText },
  addReward: { label: "Khen thưởng", icon: Award, className: "text-amber-600 hover:text-amber-700" },
  addDiscipline: { label: "Kỷ luật", icon: ShieldAlert, className: "text-red-600 hover:text-red-700" },
  restore: { label: "Khôi phục", icon: RotateCcw, className: "text-emerald-600 hover:text-emerald-700" },
  transfer: { label: "Điều chuyển", icon: ArrowRightLeft },
  print: { label: "In hồ sơ", icon: Printer },
  export: { label: "Xuất PDF", icon: Download },
}

interface NhanVienDetailSidebarPanelProps {
  nhanVienId: string
}

export function NhanVienDetailSidebarPanel({ nhanVienId }: NhanVienDetailSidebarPanelProps) {
  const router = useRouter()
  const { data: nhanVien } = useNhanVienDetail(nhanVienId)

  const dispatch = (action: SidebarAction) => () => {
    switch (action) {
      case "back":
        router.push("/nhan-vien")
        break
      case "edit":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:edit"))
        break
      case "viewSalary":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:viewSalary"))
        break
      case "createContract":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:createContract"))
        break
      case "addReward":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:addReward"))
        break
      case "addDiscipline":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:addDiscipline"))
        break
      case "restore":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:restore"))
        break
      case "transfer":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:transfer"))
        break
      case "print":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:print"))
        break
      case "export":
        window.dispatchEvent(new CustomEvent("sidebar:nv-detail:export"))
        break
    }
  }

  const getVisibleActions = (): SidebarAction[] => {
    if (!nhanVien) return []
    const isActive = nhanVien.trang_thai === "dang_lam"
    const isGiaoVien = nhanVien.loai_nhan_vien === "giao_vien"
    const isDeleted = !!nhanVien.deleted_at

    const actions: SidebarAction[] = ["edit", "viewSalary"]

    if (isGiaoVien) {
      actions.push("createContract")
    }

    actions.push("addReward")

    if (isActive) {
      actions.push("addDiscipline")
    }

    if (isDeleted) {
      actions.push("restore")
    } else {
      actions.push("transfer")
    }

    return actions
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Chi tiết nhân viên</h2>
      </div>

      {nhanVien && (
        <>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                {getInitials(nhanVien.ho_ten)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{nhanVien.ho_ten}</p>
                <p className="text-xs text-muted-foreground font-mono">{nhanVien.ma_nhan_vien}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">
                {LOAI_NHAN_VIEN_LABELS[nhanVien.loai_nhan_vien] || nhanVien.loai_nhan_vien}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TRANG_THAI_COLORS[nhanVien.trang_thai as TrangThaiNhanVien]}`}>
                {TRANG_THAI_LABELS[nhanVien.trang_thai as TrangThaiNhanVien]}
              </span>
            </div>
          </div>

          <Separator />

          <div className="p-3 space-y-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 cursor-pointer justify-start text-slate-600"
              onClick={dispatch("back")}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <Separator />

          <div className="p-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
              Thao tác nhanh
            </p>
            {getVisibleActions().map((action) => {
              const config = ACTION_CONFIG[action]
              const Icon = config.icon
              return (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className={`w-full gap-2 cursor-pointer justify-start ${config.className || ""}`}
                  onClick={dispatch(action)}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </Button>
              )
            })}
          </div>

          <Separator />

          <div className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full gap-2 cursor-pointer justify-start">
                  <MoreHorizontal className="h-4 w-4" />
                  Thêm...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={dispatch("print")} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  In hồ sơ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={dispatch("export")} className="cursor-pointer">
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
        </>
      )}

      {!nhanVien && (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        </div>
      )}
    </div>
  )
}
