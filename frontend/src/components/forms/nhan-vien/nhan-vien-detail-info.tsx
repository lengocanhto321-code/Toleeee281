"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NhanVien, TrangThaiNhanVien } from "@/types/nhan-vien.types"
import {
  TRANG_THAI_LABELS,
  TRANG_THAI_COLORS,
  LOAI_NHAN_VIEN_LABELS,
  LOAI_HOP_DONG_LABELS,
  CAP_HOC_LABELS,
  HANG_CHUC_DANH_LABELS,
} from "@/types/nhan-vien.types"
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
  GraduationCap,
  BookOpen,
  Clock,
  Star,
  Banknote,
  Users,
  Award,
  FileText,
  Heart,
  Home,
  Baby,
  Scale,
  UsersRound,
} from "lucide-react"
import type { ChangeEvent } from "react"
import type { Luong, TraLuong } from "@/types/luong.types"
import { NhanVienSalaryTab } from "./nhan-vien-salary-tab"
import { NhanVienContractTab } from "./nhan-vien-contract-tab"
import { NhanVienTrainingTab } from "./nhan-vien-training-tab"
import { NhanVienRewardTab } from "./nhan-vien-reward-tab"
import { NhanVienFamilyTab } from "./nhan-vien-family-tab"

interface NhanVienDetailInfoProps {
  nhanVien: NhanVien
  luong?: Luong
  traLuongs?: TraLuong[]
  hopDongs?: any[]
  bangCaps?: any[]
  chungChis?: any[]
  khenThuongs?: any[]
  kyLuats?: any[]
  nguoiThans?: any[]
  onEdit?: () => void
  onViewSalary?: () => void
  onAvatarChange?: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm text-slate-900 ${mono ? "font-mono" : ""}`}>{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export function NhanVienDetailInfo({ 
  nhanVien, 
  luong, 
  traLuongs,
  hopDongs = [],
  bangCaps = [],
  chungChis = [],
  khenThuongs = [],
  kyLuats = [],
  nguoiThans = [],
  onEdit,
  onViewSalary,
}: NhanVienDetailInfoProps) {
  const nv = nhanVien
  const tt = nv.trang_thai as TrangThaiNhanVien

  const workingYears = nv.ngay_vao_lam
    ? Math.floor((Date.now() - new Date(nv.ngay_vao_lam).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const workingMonths = nv.ngay_vao_lam
    ? Math.floor(((Date.now() - new Date(nv.ngay_vao_lam).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12)
    : null

  return (
    <div className="space-y-6">
      {/* ===== PROFILE HERO + STATS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Hero */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-900 text-3xl font-bold text-white ring-4 ring-slate-100">
                  {getInitials(nv.ho_ten)}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${tt === "dang_lam" ? "bg-emerald-400" : tt === "nghi_huu" ? "bg-sky-400" : "bg-amber-400"}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{nv.ho_ten}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                    {nv.ma_nhan_vien}
                  </span>
                  <Badge variant="outline" className={TRANG_THAI_COLORS[tt]}>
                    {TRANG_THAI_LABELS[tt]}
                  </Badge>
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700 font-medium">
                    <Briefcase className="h-3 w-3" />
                    {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                  </span>
                  {nv.cap_hoc && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-medium">
                      <GraduationCap className="h-3 w-3" />
                      {CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc}
                    </span>
                  )}
                  {nv.mon_day && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 font-medium">
                      <BookOpen className="h-3 w-3" />
                      {nv.mon_day}
                    </span>
                  )}
                  {nv.chuc_vu && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700 font-medium">
                      <Star className="h-3 w-3" />
                      {nv.chuc_vu.ten_chuc_vu}
                    </span>
                  )}
                </div>

                {/* Contact */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
                  {nv.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {nv.email}
                    </span>
                  )}
                  {nv.so_dien_thoai && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {nv.so_dien_thoai}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Clock}
            label="Thâm niên"
            value={workingYears !== null ? `${workingYears}n ${workingMonths || 0}m` : "—"}
            accent="bg-amber-100 text-amber-600"
          />
          <StatCard
            icon={Banknote}
            label="Hệ số lương"
            value={luong?.he_so_luong?.toFixed(2) || nv.he_so_luong?.toString() || "—"}
            accent="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            icon={Calendar}
            label="Ngày vào làm"
            value={formatDate(nv.ngay_vao_lam)}
            accent="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Star}
            label="Hạng chức danh"
            value={nv.hang_chuc_danh ? HANG_CHUC_DANH_LABELS[nv.hang_chuc_danh] || nv.hang_chuc_danh : "—"}
            accent="bg-violet-100 text-violet-600"
          />
        </div>
      </div>

      {/* ===== TABBED CONTENT ===== */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full justify-start bg-slate-100/50 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger 
            value="personal" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Home className="h-4 w-4 mr-1.5" />
            Cá nhân
          </TabsTrigger>
          <TabsTrigger 
            value="work" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Briefcase className="h-4 w-4 mr-1.5" />
            Công tác
          </TabsTrigger>
          <TabsTrigger 
            value="contract" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Hợp đồng
          </TabsTrigger>
          <TabsTrigger 
            value="salary" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Banknote className="h-4 w-4 mr-1.5" />
            Lương
          </TabsTrigger>
          <TabsTrigger 
            value="training" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <GraduationCap className="h-4 w-4 mr-1.5" />
            Đào tạo
          </TabsTrigger>
          <TabsTrigger 
            value="reward" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Award className="h-4 w-4 mr-1.5" />
            Khen thưởng
          </TabsTrigger>
          <TabsTrigger 
            value="family" 
            className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-1.5" />
            Gia đình
          </TabsTrigger>
        </TabsList>

        {/* === Tab: Cá nhân === */}
        <TabsContent value="personal" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Home className="h-4 w-4 text-slate-400" />
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Field label="Họ và tên" value={nv.ho_ten} />
              <Field label="Giới tính" value={nv.gioi_tinh} />
              <Field label="Ngày sinh" value={formatDate(nv.ngay_sinh)} />
              <Field label="Nơi sinh" value={nv.noi_sinh} />
              <Field label="Dân tộc" value={nv.dan_toc || "—"} />
              <Field label="Tôn giáo" value={nv.ton_giao || "—"} />
              <Field label="Số CCCD" value={nv.so_cccd} mono />
              <Field label="Ngày cấp CCCD" value={formatDate(nv.ngay_cap_cccd)} />
              <Field label="Nơi cấp CCCD" value={nv.noi_cap_cccd} />
            </div>

            <Separator className="my-6" />
            
            <h4 className="font-medium text-slate-700 mb-4">Liên hệ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Field label="Email công việc" value={nv.email} />
              <Field label="Email cá nhân" value={nv.email_ca_nhan} />
              <Field label="Số điện thoại" value={nv.so_dien_thoai} />
            </div>

            <Separator className="my-6" />

            <h4 className="font-medium text-slate-700 mb-4">Địa chỉ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Địa chỉ thường trú" value={nv.dia_chi_thuong_tru} />
              <Field label="Địa chỉ tạm trú" value={nv.dia_chi_tam_tru} />
            </div>
          </Card>
        </TabsContent>

        {/* === Tab: Công tác === */}
        <TabsContent value="work" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              Thông tin công tác
            </h3>
            
            {/* Thông tin biên chế */}
            <div className="mb-6">
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-4">Thông tin biên chế</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Loại viên chức" value={LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien} />
                <Field label="Cấp học" value={nv.cap_hoc ? CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc : "—"} />
                <Field label="Ngạch lương" value={nv.ngach_luong || "—"} />
                <Field label="Bậc lương" value={nv.bac_luong || "—"} />
                <Field label="Hệ số lương" value={nv.he_so_luong?.toString() || "—"} />
                <Field label="Số năm thâm niên" value={nv.so_nam_tham_nien ? `${nv.so_nam_tham_nien} năm` : "—"} />
                <Field label="Hạng chức danh" value={nv.hang_chuc_danh ? HANG_CHUC_DANH_LABELS[nv.hang_chuc_danh] || nv.hang_chuc_danh : "—"} />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Thông tin giảng dạy */}
            {nv.loai_nhan_vien === "giao_vien" && (
              <>
                <div className="mb-6">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-4">Thông tin giảng dạy</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Field label="Cấp học" value={nv.cap_hoc ? CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc : "—"} />
                    <Field label="Môn dạy" value={nv.mon_day || "—"} />
                    <Field label="Tổ chuyên môn" value={nv.phong_ban?.ten_phong_ban || "—"} />
                  </div>
                </div>
                <Separator className="my-6" />
              </>
            )}

            {/* Thông tin chức vụ */}
            <div className="mb-6">
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-4">Chức vụ</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Field label="Chức vụ" value={nv.chuc_vu?.ten_chuc_vu || "—"} />
                <Field label="Ngày bổ nhiệm" value={formatDate(nv.ngay_bo_nhiem_chuc_vu)} />
                <Field label="Phụ cấp chức vụ" value={nv.phu_cap_chuc_vu ? `${nv.phu_cap_chuc_vu.toLocaleString()} đ` : "—"} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* === Tab: Hợp đồng === */}
        <TabsContent value="contract" className="mt-4">
          <NhanVienContractTab nhanVien={nhanVien} hopDongs={hopDongs} />
        </TabsContent>

        {/* === Tab: Lương === */}
        <TabsContent value="salary" className="mt-4">
          <NhanVienSalaryTab 
            nhanVien={nhanVien} 
            luong={luong} 
            traLuongs={traLuongs} 
          />
        </TabsContent>

        {/* === Tab: Đào tạo === */}
        <TabsContent value="training" className="mt-4">
          <NhanVienTrainingTab 
            nhanVien={nhanVien} 
            bangCaps={bangCaps} 
            chungChis={chungChis} 
          />
        </TabsContent>

        {/* === Tab: Khen thưởng === */}
        <TabsContent value="reward" className="mt-4">
          <NhanVienRewardTab 
            nhanVien={nhanVien} 
            khenThuongs={khenThuongs} 
            kyLuats={kyLuats} 
          />
        </TabsContent>

        {/* === Tab: Gia đình === */}
        <TabsContent value="family" className="mt-4">
          <NhanVienFamilyTab 
            nhanVien={nhanVien} 
            nguoiThans={nguoiThans} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
