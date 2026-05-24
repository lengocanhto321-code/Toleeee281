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
  CAP_HOC_LABELS,
  HANG_CHUC_DANH_LABELS,
} from "@/types/nhan-vien.types"
import {
  Mail,
  Phone,
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
  Home,
  CalendarDays,
  MapPin,
  Cake,
  Heart,
  IdCard,
  Building2,
} from "lucide-react"
import type { ChangeEvent } from "react"
import type { Luong, TraLuong } from "@/types/luong.types"
import { formatDateVN } from "@/lib/date-utils"
import { NhanVienSalaryTab } from "./nhan-vien-salary-tab"
import { NhanVienHopDongTab } from "./nhan-vien-hop-dong-tab"
import { NhanVienTrainingTab } from "./nhan-vien-training-tab"
import { NhanVienRewardTab } from "./nhan-vien-reward-tab"
import { NhanVienFamilyTab } from "./nhan-vien-family-tab"
import { NhanVienCongTacTab } from "./nhan-vien-cong-tac-tab"
import { NhanVienLichSuChucVuTab } from "./nhan-vien-lich-su-chuc-vu-tab"
import { NhanVienTaiLieuTab } from "./nhan-vien-tai-lieu-tab"
import type { CongTac, LichSuChucVu, ChucVuBrief } from "@/types/cong-tac.types"
import { NhanVienNghiPhepTab } from "./nhan-vien-nghi-phep-tab"
import { NhanVienChamCongTab } from "./nhan-vien-cham-cong-tab"

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
  congTacs?: CongTac[]
  lichSuChucVus?: LichSuChucVu[]
  chucVuMap?: Record<string, ChucVuBrief>
  onEdit?: () => void
  onViewSalary?: () => void
  onLuongCreated?: () => void
  onAvatarChange?: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function DetailField({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="detail-field-label">{label}</p>
      <p className={`detail-field-value ${mono ? "font-mono tracking-tight" : ""}`}>
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  )
}

function HeroStatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${gradient}`}
      >
        <Icon className="h-[18px] w-[18px] text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500 leading-tight">{label}</p>
        <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
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
  congTacs = [],
  lichSuChucVus = [],
  chucVuMap = {},
  onEdit,
  onViewSalary,
  onLuongCreated,
  onAvatarChange,
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-detail-fade">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/[0.02] via-transparent to-blue-500/[0.02]" />
          <div className="relative p-6">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <div
                  className={`flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-bold text-white shadow-lg shadow-slate-900/20 ring-2 ring-white ${onAvatarChange ? "cursor-pointer hover:ring-blue-400 transition-all duration-200" : ""}`}
                  onClick={() => onAvatarChange && document.getElementById("avatar-input")?.click()}
                >
                  {nhanVien.anh_dai_dien ? (
                    <img src={nhanVien.anh_dai_dien} alt={nhanVien.ho_ten} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    getInitials(nhanVien.ho_ten)
                  )}
                </div>
                {onAvatarChange && (
                  <input id="avatar-input" type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full border-[2.5px] border-white shadow-sm ${tt === "dang_lam" ? "bg-emerald-400" : tt === "nghi_huu" ? "bg-sky-400" : "bg-amber-400"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">{nv.ho_ten}</h1>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-md tracking-tight">
                    {nv.ma_nhan_vien}
                  </span>
                  <Badge variant="outline" className={`text-[11px] px-2 py-px ${TRANG_THAI_COLORS[tt]}`}>
                    {TRANG_THAI_LABELS[tt]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50/80 px-2.5 py-1 text-[11px] text-blue-700 font-medium">
                    <Briefcase className="h-3 w-3" />
                    {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                  </span>
                  {nv.cap_hoc && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50/80 px-2.5 py-1 text-[11px] text-emerald-700 font-medium">
                      <GraduationCap className="h-3 w-3" />
                      {CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc}
                    </span>
                  )}
                  {nv.mon_day && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50/80 px-2.5 py-1 text-[11px] text-sky-700 font-medium">
                      <BookOpen className="h-3 w-3" />
                      {nv.mon_day}
                    </span>
                  )}
                  {nv.chuc_vu && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50/80 px-2.5 py-1 text-[11px] text-violet-700 font-medium">
                      <Star className="h-3 w-3" />
                      {nv.chuc_vu.ten_chuc_vu}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3.5 text-[12px] text-slate-500">
                  {nv.email && (
                    <span className="inline-flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                      {nv.email}
                    </span>
                  )}
                  {nv.so_dien_thoai && (
                    <span className="inline-flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                      {nv.so_dien_thoai}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <HeroStatCard
            icon={Clock}
            label="Thâm niên"
            value={workingYears !== null ? `${workingYears}n ${workingMonths || 0}m` : "—"}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <HeroStatCard
            icon={Banknote}
            label="Hệ số lương"
            value={luong?.he_so_luong?.toFixed(2) || nv.he_so_luong?.toString() || "—"}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <HeroStatCard
            icon={Calendar}
            label="Ngày vào làm"
            value={formatDateVN(nv.ngay_vao_lam)}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <HeroStatCard
            icon={Star}
            label="Hạng chức danh"
            value={nv.hang_chuc_danh ? HANG_CHUC_DANH_LABELS[nv.hang_chuc_danh] || nv.hang_chuc_danh : "—"}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-lg pb-3 -mx-1 px-1">
          <TabsList className="w-full justify-start bg-white/60 border border-slate-200/60 p-1 rounded-xl flex-wrap h-auto shadow-sm">
            <TabsTrigger
              value="personal"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Home className="h-3.5 w-3.5 mr-1.5" />
              Cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="work"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Briefcase className="h-3.5 w-3.5 mr-1.5" />
              Công tác
            </TabsTrigger>
            <TabsTrigger
              value="contract"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Hợp đồng
            </TabsTrigger>
            <TabsTrigger
              value="salary"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Banknote className="h-3.5 w-3.5 mr-1.5" />
              Lương
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Đào tạo
            </TabsTrigger>
            <TabsTrigger
              value="reward"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Award className="h-3.5 w-3.5 mr-1.5" />
              Khen thưởng
            </TabsTrigger>
            <TabsTrigger
              value="family"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Gia đình
            </TabsTrigger>
            <TabsTrigger
              value="nghi-phep"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Nghỉ phép
            </TabsTrigger>
            <TabsTrigger
              value="cham-cong"
              className="cursor-pointer rounded-lg text-[12px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 transition-all"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Chấm công
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal" className="mt-4 animate-detail-fade">
          <div className="space-y-4">
            <div className="detail-section p-5 accent-border-indigo">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50">
                  <Heart className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Thông tin cá nhân</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <DetailField label="Họ và tên" value={nv.ho_ten} />
                <DetailField label="Giới tính" value={nv.gioi_tinh} />
                <DetailField label="Ngày sinh" value={formatDateVN(nv.ngay_sinh)} />
                <DetailField label="Nơi sinh" value={nv.noi_sinh} />
                <DetailField label="Dân tộc" value={nv.dan_toc || "—"} />
                <DetailField label="Tôn giáo" value={nv.ton_giao || "—"} />
                <DetailField label="Số CCCD" value={nv.so_cccd} mono />
                <DetailField label="Ngày cấp CCCD" value={formatDateVN(nv.ngay_cap_cccd)} />
                <DetailField label="Nơi cấp CCCD" value={nv.noi_cap_cccd} />
              </div>
            </div>

            <div className="detail-section p-5 accent-border-sky">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50">
                  <Mail className="h-3.5 w-3.5 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Liên hệ</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <DetailField label="Email công việc" value={nv.email} />
                <DetailField label="Email cá nhân" value={nv.email_ca_nhan} />
                <DetailField label="Số điện thoại" value={nv.so_dien_thoai} />
              </div>
            </div>

            <div className="detail-section p-5 accent-border-emerald">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Địa chỉ</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <DetailField label="Địa chỉ thường trú" value={nv.dia_chi_thuong_tru} />
                <DetailField label="Địa chỉ tạm trú" value={nv.dia_chi_tam_tru} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="work" className="mt-4 animate-detail-fade">
          <div className="space-y-4">
            <div className="detail-section p-5 accent-border-indigo">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50">
                  <IdCard className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Thông tin biên chế</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                <DetailField label="Loại viên chức" value={LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien} />
                <DetailField label="Cấp học" value={nv.cap_hoc ? CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc : "—"} />
                <DetailField label="Ngạch lương" value={nv.ngach_luong || "—"} />
                <DetailField label="Bậc lương" value={nv.bac_luong || "—"} />
                <DetailField label="Hệ số lương" value={nv.he_so_luong?.toString() || "—"} />
                <DetailField label="Số năm thâm niên" value={nv.so_nam_tham_nien ? `${nv.so_nam_tham_nien} năm` : "—"} />
                <DetailField label="Hạng chức danh" value={nv.hang_chuc_danh ? HANG_CHUC_DANH_LABELS[nv.hang_chuc_danh] || nv.hang_chuc_danh : "—"} />
              </div>
            </div>

            {nv.loai_nhan_vien === "giao_vien" && (
              <div className="detail-section p-5 accent-border-violet">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50">
                    <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Thông tin giảng dạy</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  <DetailField label="Cấp học" value={nv.cap_hoc ? CAP_HOC_LABELS[nv.cap_hoc] || nv.cap_hoc : "—"} />
                  <DetailField label="Môn dạy" value={nv.mon_day || "—"} />
                  <DetailField label="Tổ chuyên môn" value={nv.phong_ban?.ten_phong_ban || "—"} />
                </div>
              </div>
            )}

            <div className="detail-section p-5 accent-border-amber">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Chức vụ hiện tại</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <DetailField label="Chức vụ" value={nv.chuc_vu?.ten_chuc_vu || "—"} />
                <DetailField label="Ngày bổ nhiệm" value={formatDateVN(nv.ngay_bo_nhiem_chuc_vu)} />
                <DetailField label="Phụ cấp chức vụ" value={nv.phu_cap_chuc_vu ? `${nv.phu_cap_chuc_vu.toLocaleString()} đ` : "—"} />
              </div>
            </div>

            <NhanVienCongTacTab congTacs={congTacs} />

            {lichSuChucVus.length > 0 && <NhanVienLichSuChucVuTab lichSuChucVus={lichSuChucVus} chucVuMap={chucVuMap} />}
          </div>
        </TabsContent>

        <TabsContent value="contract" className="mt-4 animate-detail-fade">
          <NhanVienHopDongTab nhanVienId={nhanVien.id} hopDongs={hopDongs} />
        </TabsContent>

        <TabsContent value="salary" className="mt-4 animate-detail-fade">
          <NhanVienSalaryTab
            nhanVien={nhanVien}
            luong={luong}
            traLuongs={traLuongs}
            onLuongCreated={onLuongCreated}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-4 animate-detail-fade">
          <NhanVienTrainingTab
            nhanVien={nhanVien}
            bangCaps={bangCaps}
            chungChis={chungChis}
          />
        </TabsContent>

        <TabsContent value="reward" className="mt-4 animate-detail-fade">
          <NhanVienRewardTab
            nhanVien={nhanVien}
            khenThuongs={khenThuongs}
            kyLuats={kyLuats}
          />
        </TabsContent>

        <TabsContent value="family" className="mt-4 animate-detail-fade">
          <NhanVienFamilyTab
            nhanVien={nhanVien}
            nguoiThans={nguoiThans}
          />
        </TabsContent>

        <TabsContent value="nghi-phep" className="mt-4 animate-detail-fade">
          <NhanVienNghiPhepTab nhanVienId={nhanVien.id} />
        </TabsContent>

        <TabsContent value="cham-cong" className="mt-4 animate-detail-fade">
          <NhanVienChamCongTab nhanVienId={nhanVien.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
