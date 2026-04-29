"use client"

import { useState } from "react"
import { Plus, Building2, Landmark, Users, TrendingUp, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePhongBanAll } from "@/hooks/phong-ban"
import { useNhanVienList } from "@/hooks/nhan-vien"

interface PhongBanSidebarPanelProps {
  onAdd: () => void
}

export function PhongBanSidebarPanel({ onAdd }: PhongBanSidebarPanelProps) {
  const { data: phongBans = [] } = usePhongBanAll()
  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViens = nhanViensResult?.data || []
  const [viewMode, setViewMode] = useState<"stats" | "tree">("stats")

  const hanhChinh = phongBans.filter((pb) => pb.loai === "hanh_chinh" && pb.trang_thai !== false)
  const chuyenMon = phongBans.filter((pb) => pb.loai === "chuyen_mon" && pb.trang_thai !== false)
  const activeCount = phongBans.filter((pb) => pb.trang_thai !== false).length

  const getNhanVienCountByPhongBan = (pbId: string) => {
    return nhanViens.filter((nv: any) => nv.phong_ban_id === pbId).length
  }

  const topPhongBan = [...phongBans]
    .map((pb) => ({
      ...pb,
      count: getNhanVienCountByPhongBan(pb.id),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const handleCoCau = () => {
    window.dispatchEvent(new CustomEvent("sidebar:phong-ban:co-cau"))
  }

  const handlePhanBo = () => {
    window.dispatchEvent(new CustomEvent("sidebar:phong-ban:phan-bo"))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Phòng ban</h2>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <Button onClick={onAdd} className="w-full gap-2 cursor-pointer justify-start">
          <Plus className="h-4 w-4" />
          Thêm phòng ban
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handleCoCau}>
            <Network className="h-3 w-3" />
            Cơ cấu
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handlePhanBo}>
            <Users className="h-3 w-3" />
            Phân bổ
          </Button>
        </div>
      </div>

      <Separator />

      {/* Top PB by staff */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            Đông nhân viên nhất
          </p>
        </div>

        {topPhongBan.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <div className="px-3 pb-3 space-y-1.5">
            {topPhongBan.map((pb, idx) => (
              <div
                key={pb.id}
                className="group rounded-lg border border-transparent bg-sidebar p-2.5 transition-all hover:border-sidebar-accent-foreground/10 hover:bg-sidebar-accent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-snug">{pb.ten_phong_ban}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{pb.ma_phong_ban}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    {pb.count} NV
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick list by type */}
        {hanhChinh.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Landmark className="h-3 w-3" />
                Hành chính
              </p>
            </div>
            <div className="px-3 pb-2 space-y-1">
              {hanhChinh.slice(0, 3).map((pb) => (
                <div
                  key={pb.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-sidebar-accent cursor-pointer"
                >
                  <span className="truncate">{pb.ten_phong_ban}</span>
                  <span className="text-muted-foreground">{getNhanVienCountByPhongBan(pb.id)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {chuyenMon.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3 w-3" />
                Chuyên môn
              </p>
            </div>
            <div className="px-3 pb-3 space-y-1">
              {chuyenMon.slice(0, 5).map((pb) => (
                <div
                  key={pb.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-sidebar-accent cursor-pointer"
                >
                  <span className="truncate">{pb.ten_phong_ban}</span>
                  <span className="text-muted-foreground">{getNhanVienCountByPhongBan(pb.id)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
