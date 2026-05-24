"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Award,
  Medal,
  Star,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Banknote,
} from "lucide-react"
import { useDeleteKhenThuongKyLuat } from "@/hooks/nhan-vien/use-sub-modules"
import { KhenThuongKyLuatDialog } from "./sub-module"
import type { NhanVien, KhenThuong, KyLuat } from "@/types/nhan-vien.types"
import { formatDateVN } from "@/lib/date-utils"

interface NhanVienRewardTabProps {
  nhanVien: NhanVien
  khenThuongs?: KhenThuong[]
  kyLuats?: KyLuat[]
}

function RewardCard({ khenThuong, onDelete }: { khenThuong: KhenThuong; onDelete: () => void }) {
  const icons: Record<string, React.ElementType> = {
    "bằng khen": Trophy,
    "giấy khen": Award,
    "huy hiệu": Medal,
    "thành tích": Star,
  }
  const lowerHinhThuc = khenThuong.hinh_thuc.toLowerCase()
  const Icon = Object.entries(icons).find(([key]) => lowerHinhThuc.includes(key))?.[1] || Award

  return (
    <div className="detail-section p-4 accent-border-emerald group hover:shadow-md transition-shadow animate-detail-slide">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900">{khenThuong.hinh_thuc}</p>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
              Năm {khenThuong.nam}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{khenThuong.ly_do}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            {khenThuong.gia_tri_thuong != null && khenThuong.gia_tri_thuong > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                <Banknote className="h-3 w-3" />
                {khenThuong.gia_tri_thuong >= 1_000_000_000
                  ? `${(khenThuong.gia_tri_thuong / 1_000_000_000).toFixed(1)}B`
                  : khenThuong.gia_tri_thuong >= 1_000_000
                  ? `${(khenThuong.gia_tri_thuong / 1_000_000).toFixed(0)}M`
                  : khenThuong.gia_tri_thuong.toLocaleString()} đ
              </span>
            )}
            {khenThuong.so_quyet_dinh && <span>QĐ: {khenThuong.so_quyet_dinh}</span>}
            {khenThuong.co_quan_ban_hanh && <span>{khenThuong.co_quan_ban_hanh}</span>}
            {khenThuong.ngay_quyet_dinh && <span>{formatDateVN(khenThuong.ngay_quyet_dinh)}</span>}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function DisciplineCard({ kyLuat, onDelete }: { kyLuat: KyLuat; onDelete: () => void }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    da_xu_ly: { label: "Đã xử lý", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    dang_xu_ly: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    da_xoa: { label: "Đã xóa", className: "bg-slate-50 text-slate-600 border-slate-200", icon: Clock },
  }
  const status = statusConfig[kyLuat.trang_thai] || statusConfig.da_xu_ly
  const StatusIcon = status.icon

  const severityConfig: Record<string, string> = {
    it_nghiem_trong: "bg-blue-50 text-blue-700",
    nghiem_trong: "bg-amber-50 text-amber-700",
    rat_nghiem_trong: "bg-red-50 text-red-700",
    dac_biet_nghiem_trong: "bg-red-100 text-red-800",
  }

  return (
    <div className="detail-section p-4 accent-border-rose group hover:shadow-md transition-shadow animate-detail-slide">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-50">
          <ShieldAlert className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900">{kyLuat.hinh_thuc}</p>
            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
              Năm {kyLuat.nam}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${status.className}`}>
              <StatusIcon className="h-3 w-3 mr-0.5" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{kyLuat.ly_do}</p>
          <div className="flex items-center gap-3 mt-2">
            {kyLuat.muc_do && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${severityConfig[kyLuat.muc_do] || "bg-slate-50 text-slate-600"}`}>
                {kyLuat.muc_do.replace(/_/g, " ")}
              </span>
            )}
            {kyLuat.co_quan_ban_hanh && (
              <span className="text-[11px] text-slate-400">{kyLuat.co_quan_ban_hanh}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function NhanVienRewardTab({ nhanVien, khenThuongs = [], kyLuats = [] }: NhanVienRewardTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLoai, setDialogLoai] = useState<string>("khen_thuong")
  const deleteMutation = useDeleteKhenThuongKyLuat(nhanVien.id)

  const khenThuongCount = khenThuongs.length
  const kyLuatCount = kyLuats.length

  const handleAddKhenThuong = () => {
    setDialogLoai("khen_thuong")
    setDialogOpen(true)
  }

  const handleAddKyLuat = () => {
    setDialogLoai("ky_luat")
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <Trophy className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Khen thưởng</p>
            <p className="text-lg font-bold text-slate-900">{khenThuongCount}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-75">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
            <ShieldAlert className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Kỷ luật</p>
            <p className="text-lg font-bold text-slate-900">{kyLuatCount}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-150">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle2 className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Đã xử lý</p>
            <p className="text-lg font-bold text-slate-900">{kyLuats.filter(k => k.trang_thai === "da_xu_ly").length}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-225">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
            <Clock className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Đang xử lý</p>
            <p className="text-lg font-bold text-slate-900">{kyLuats.filter(k => k.trang_thai === "dang_xu_ly").length}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="w-full justify-start bg-white/60 border border-slate-200/60 p-1 rounded-xl shadow-sm">
          <TabsTrigger
            value="rewards"
            className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all gap-1.5"
          >
            <Trophy className="h-3.5 w-3.5" />
            Khen thưởng ({khenThuongCount})
          </TabsTrigger>
          <TabsTrigger
            value="discipline"
            className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Kỷ luật ({kyLuatCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Lịch sử khen thưởng</h3>
            </div>
            <Button size="sm" className="gap-1.5 cursor-pointer h-8 text-[11px]" onClick={handleAddKhenThuong}>
              <Plus className="h-3.5 w-3.5" />
              Thêm khen thưởng
            </Button>
          </div>

          {khenThuongs.length > 0 ? (
            <div className="space-y-2.5">
              {khenThuongs.map((kt, index) => (
                <RewardCard key={kt.id || index} khenThuong={kt} onDelete={() => handleDelete(kt.id)} />
              ))}
            </div>
          ) : (
            <div className="detail-section">
              <div className="dot-grid-bg rounded-xl py-12 flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 mb-3">
                  <Trophy className="h-6 w-6 text-amber-300" />
                </div>
                <h4 className="text-sm font-medium text-slate-600 mb-1">Chưa có khen thưởng</h4>
                <p className="text-[11px] text-slate-400 mb-4">Danh sách sẽ hiển thị tại đây</p>
                <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer h-8 text-[11px]" onClick={handleAddKhenThuong}>
                  <Plus className="h-3.5 w-3.5" />
                  Thêm khen thưởng
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discipline" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50">
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Lịch sử kỷ luật</h3>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-red-200 text-red-600 hover:bg-red-50 h-8 text-[11px]" onClick={handleAddKyLuat}>
              <Plus className="h-3.5 w-3.5" />
              Thêm kỷ luật
            </Button>
          </div>

          {kyLuats.length > 0 ? (
            <div className="space-y-2.5">
              {kyLuats.map((kl, index) => (
                <DisciplineCard key={kl.id || index} kyLuat={kl} onDelete={() => handleDelete(kl.id)} />
              ))}
            </div>
          ) : (
            <div className="detail-section">
              <div className="dot-grid-bg rounded-xl py-12 flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-medium text-emerald-700 mb-1">Không có kỷ luật</h4>
                <p className="text-[11px] text-slate-400">Nhân viên chưa có quyết định kỷ luật nào</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <KhenThuongKyLuatDialog
        nhanVienId={nhanVien.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultLoai={dialogLoai}
      />
    </div>
  )
}
