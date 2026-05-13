"use client"

import { Plus, Award, Crown, BookOpen, UserCog, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useChucVuList } from "@/hooks/chuc-vu"
import { useNhanVienList } from "@/hooks/nhan-vien"

const LOAI_LABELS = {
  quan_ly: "Quản lý",
  giao_vien: "Giáo viên",
  nhan_vien: "Nhân viên",
}

interface ChucVuSidebarPanelProps {
  onAdd: () => void
}

export function ChucVuSidebarPanel({ onAdd }: ChucVuSidebarPanelProps) {
  const { data: chucVus = [] } = useChucVuList()
  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViensRaw = nhanViensResult?.data || []
  const nhanViens = nhanViensRaw as any[]

  const quanLy = (chucVus as any[]).filter((cv) => cv.loai === "quan_ly" && cv.trang_thai !== false)
  const giaoVien = (chucVus as any[]).filter((cv) => cv.loai === "giao_vien" && cv.trang_thai !== false)
  const nhanVien = (chucVus as any[]).filter((cv) => cv.loai === "nhan_vien" && cv.trang_thai !== false)
  const activeCount = (chucVus as any[]).filter((cv) => cv.trang_thai !== false).length

  const getNhanVienCountByChucVu = (cvId: string) => {
    return nhanViens.filter((nv) => nv.chuc_vu_id === cvId).length
  }

  const topChucVu = [...chucVus]
    .map((cv) => ({
      ...cv,
      count: getNhanVienCountByChucVu(cv.id),
    }))
    .filter((cv) => cv.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const getHighestPaidChucVu = () => {
    return [...chucVus].sort((a, b) => b.he_so_phu_cap - a.he_so_phu_cap)[0]
  }

  const highestPaid = getHighestPaidChucVu()

  const handlePhanBo = () => {
    window.dispatchEvent(new CustomEvent("sidebar:chuc-vu:phan-bo"))
  }

  const handleBoNhiem = () => {
    window.dispatchEvent(new CustomEvent("sidebar:chuc-vu:bo-nhiem"))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Chức vụ</h2>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <Button onClick={onAdd} className="w-full gap-2 cursor-pointer justify-start">
          <Plus className="h-4 w-4" />
          Thêm chức vụ
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handlePhanBo}>
            <Users className="h-3 w-3" />
            Phân bổ
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handleBoNhiem}>
            <Award className="h-3 w-3" />
            Bổ nhiệm
          </Button>
        </div>
      </div>

      <Separator />

      {/* Highlight: Highest paid */}
      {highestPaid && highestPaid.he_so_phu_cap > 0 && (
        <>
          <div className="px-4 py-3">
            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-3 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Phụ cấp cao nhất</span>
              </div>
              <div className="font-semibold text-slate-900">{highestPaid.ten_chuc_vu}</div>
              <div className="text-xs text-muted-foreground">Hệ số: {highestPaid.he_so_phu_cap} • {LOAI_LABELS[highestPaid.loai]}</div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Top Chức vụ by staff */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Nhiều nhân viên nhất
          </p>
        </div>

        {topChucVu.length === 0 ? (
          <p className="px-4 py-4 text-center text-xs text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <div className="px-3 pb-3 space-y-1.5">
            {topChucVu.map((cv) => (
              <div
                key={cv.id}
                className="group rounded-lg border border-transparent bg-sidebar p-2.5 transition-all hover:border-sidebar-accent-foreground/10 hover:bg-sidebar-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                      cv.loai === "quan_ly" ? "bg-amber-100 text-amber-700" :
                      cv.loai === "giao_vien" ? "bg-emerald-100 text-emerald-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cv.ten_chuc_vu}</p>
                      <p className="text-[10px] text-muted-foreground">Cấp {cv.cap_bac}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    {cv.count} NV
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick list */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Danh sách nhanh
          </p>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {[...quanLy, ...giaoVien, ...nhanVien].slice(0, 6).map((cv) => (
            <div
              key={cv.id}
              className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-sidebar-accent cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  cv.loai === "quan_ly" ? "bg-amber-500" :
                  cv.loai === "giao_vien" ? "bg-emerald-500" :
                  "bg-blue-500"
                }`} />
                <span className="truncate">{cv.ten_chuc_vu}</span>
              </div>
              <span className="text-muted-foreground">{getNhanVienCountByChucVu(cv.id)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
