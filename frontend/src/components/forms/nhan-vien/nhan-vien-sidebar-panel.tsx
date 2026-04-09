"use client"

import { Plus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNhanVienList } from "@/hooks/nhan-vien"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
]

interface NhanVienSidebarPanelProps {
  onAdd: () => void
}

export function NhanVienSidebarPanel({ onAdd }: NhanVienSidebarPanelProps) {
  const { data: nhanViens = [] } = useNhanVienList()

  const recent = [...nhanViens]
    .filter((nv) => nv.trang_thai === "dang_lam")
    .slice(-5)
    .reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Nhân viên</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Quản lý cán bộ, giáo viên, nhân viên</p>
      </div>

      {/* Add button - full width, prominent */}
      <div className="p-3">
        <Button onClick={onAdd} className="w-full gap-2 cursor-pointer justify-center">
          <UserPlus className="h-4 w-4" />
          Thêm nhân viên mới
        </Button>
      </div>

      <Separator />

      {/* Recent employees */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mới tham gia gần đây</p>
        </div>

        {recent.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <div className="px-3 pb-3 space-y-1.5">
            {recent.map((nv, i) => (
              <div
                key={nv.id}
                className="group relative rounded-xl border border-sidebar-border bg-sidebar p-3 transition-all hover:border-sidebar-accent-foreground/10 hover:bg-sidebar-accent"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {getInitials(nv.ho_ten)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug">{nv.ho_ten}</p>
                    {nv.email && (
                      <p className="truncate text-[11px] text-muted-foreground mt-0.5">{nv.email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        {nv.ma_nhan_vien}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
