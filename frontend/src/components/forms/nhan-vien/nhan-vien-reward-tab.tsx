"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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
  XCircle,
  Plus,
  Trash2
} from "lucide-react"
import { useDeleteKhenThuongKyLuat } from "@/hooks/nhan-vien/use-sub-modules"
import { KhenThuongKyLuatDialog } from "./sub-module"
import type { NhanVien, KhenThuong, KyLuat } from "@/types/nhan-vien.types"

interface NhanVienRewardTabProps {
  nhanVien: NhanVien
  khenThuongs?: KhenThuong[]
  kyLuats?: KyLuat[]
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
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
    <div className="flex items-start gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
        <Icon className="h-6 w-6 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900">{khenThuong.hinh_thuc}</p>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Năm {khenThuong.nam}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{khenThuong.ly_do}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          {khenThuong.co_quan_ban_hanh && (
            <span>Cơ quan: {khenThuong.co_quan_ban_hanh}</span>
          )}
          {khenThuong.ngay_quyet_dinh && (
            <span>Ngày: {formatDate(khenThuong.ngay_quyet_dinh)}</span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function DisciplineCard({ kyLuat, onDelete }: { kyLuat: KyLuat; onDelete: () => void }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    da_xu_ly: { label: "Đã xử lý", className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    dang_xu_ly: { label: "Đang xử lý", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    da_xoa: { label: "Đã xóa", className: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
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
    <div className="flex items-start gap-4 p-4 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <ShieldAlert className="h-6 w-6 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900">{kyLuat.hinh_thuc}</p>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Năm {kyLuat.nam}
          </Badge>
          <Badge variant="outline" className={status.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{kyLuat.ly_do}</p>
        <div className="flex items-center gap-4 mt-2">
          {kyLuat.muc_do && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityConfig[kyLuat.muc_do] || "bg-slate-100 text-slate-600"}`}>
              {kyLuat.muc_do.replace(/_/g, " ")}
            </span>
          )}
          {kyLuat.co_quan_ban_hanh && (
            <span className="text-xs text-slate-500">Cơ quan: {kyLuat.co_quan_ban_hanh}</span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  accent 
}: { 
  icon: React.ElementType
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
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
  const xuLyKyLuat = kyLuats.filter(k => k.trang_thai === "dang_xu_ly").length

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Khen thưởng" value={khenThuongCount} accent="bg-emerald-100 text-emerald-600" />
        <StatCard icon={ShieldAlert} label="Kỷ luật" value={kyLuatCount} accent="bg-red-100 text-red-600" />
        <StatCard icon={CheckCircle2} label="Đã xử lý" value={kyLuats.filter(k => k.trang_thai === "da_xu_ly").length} accent="bg-blue-100 text-blue-600" />
        <StatCard icon={Clock} label="Đang xử lý" value={xuLyKyLuat} accent="bg-amber-100 text-amber-600" />
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="w-full justify-start bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger 
            value="rewards" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
          >
            <Trophy className="h-4 w-4" />
            Khen thưởng ({khenThuongCount})
          </TabsTrigger>
          <TabsTrigger 
            value="discipline" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
          >
            <ShieldAlert className="h-4 w-4" />
            Kỷ luật ({kyLuatCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Lịch sử khen thưởng</h3>
                  <p className="text-xs text-slate-500">Các danh hiệu, khen thưởng đã nhận được</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleAddKhenThuong}>
                <Plus className="h-3.5 w-3.5" />
                Thêm khen thưởng
              </Button>
            </div>

            {khenThuongs.length > 0 ? (
              <div className="space-y-4">
                {khenThuongs.map((kt, index) => (
                  <RewardCard key={kt.id || index} khenThuong={kt} onDelete={() => handleDelete(kt.id)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
                  <Trophy className="h-8 w-8 text-emerald-300" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">Chưa có khen thưởng</h4>
                <p className="text-sm text-slate-500 mb-4">Danh sách khen thưởng sẽ hiển thị tại đây</p>
                <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer" onClick={handleAddKhenThuong}>
                  <Plus className="h-3.5 w-3.5" />
                  Thêm khen thưởng
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="discipline" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Lịch sử kỷ luật</h3>
                  <p className="text-xs text-slate-500">Các quyết định kỷ luật (nếu có)</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-red-200 text-red-600 hover:bg-red-50" onClick={handleAddKyLuat}>
                <Plus className="h-3.5 w-3.5" />
                Thêm kỷ luật
              </Button>
            </div>

            {kyLuats.length > 0 ? (
              <div className="space-y-4">
                {kyLuats.map((kl, index) => (
                  <DisciplineCard key={kl.id || index} kyLuat={kl} onDelete={() => handleDelete(kl.id)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h4 className="font-medium text-emerald-700 mb-1">Không có kỷ luật</h4>
                <p className="text-sm text-slate-500">Nhân viên chưa có quyết định kỷ luật nào</p>
              </div>
            )}
          </Card>
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
