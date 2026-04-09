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
} from "@/types/nhan-vien.types"
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  BookOpen,
  Clock,
  Shield,
  Star,
} from "lucide-react"

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

interface NhanVienDetailInfoProps {
  nhanVien: NhanVien
}

export function NhanVienDetailInfo({ nhanVien }: NhanVienDetailInfoProps) {
  const nv = nhanVien
  const tt = nv.trang_thai as TrangThaiNhanVien

  // Calculate working duration
  const workingYears = nv.ngay_vao_lam
    ? Math.floor((Date.now() - new Date(nv.ngay_vao_lam).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="space-y-6">
      {/* ===== PROFILE HERO ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative px-8 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white ring-2 ring-slate-200">
                {getInitials(nv.ho_ten)}
              </div>
              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${tt === "dang_lam" ? "bg-emerald-400" : tt === "nghi_huu" ? "bg-sky-400" : "bg-amber-400"}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{nv.ho_ten}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{nv.ma_nhan_vien}</span>
                    <Badge variant="outline" className={TRANG_THAI_COLORS[tt]}>
                      {TRANG_THAI_LABELS[tt]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick info chips */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  <Briefcase className="h-3 w-3" />
                  {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                </span>
                {nv.mon_day && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <BookOpen className="h-3 w-3" />
                    {nv.mon_day}
                  </span>
                )}
                {nv.email && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <Mail className="h-3 w-3" />
                    {nv.email}
                  </span>
                )}
                {nv.so_dien_thoai && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <Phone className="h-3 w-3" />
                    {nv.so_dien_thoai}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Briefcase}
          label="Loại hợp đồng"
          value={LOAI_HOP_DONG_LABELS[nv.loai_hop_dong] || nv.loai_hop_dong}
          accent="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={Calendar}
          label="Ngày vào làm"
          value={formatDate(nv.ngay_vao_lam)}
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="Thâm niên"
          value={workingYears !== null ? `${workingYears} năm` : "—"}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon={Star}
          label="Giới tính"
          value={nv.gioi_tinh}
          accent="bg-violet-100 text-violet-600"
        />
      </div>

      {/* ===== TABBED CONTENT ===== */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full justify-start bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="personal" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Cá nhân
          </TabsTrigger>
          <TabsTrigger value="contract" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Hợp đồng
          </TabsTrigger>
          <TabsTrigger value="other" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Bổ sung
          </TabsTrigger>
        </TabsList>

        {/* === Tab: Cá nhân === */}
        <TabsContent value="personal" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              <Field label="Họ và tên" value={nv.ho_ten} />
              <Field label="Giới tính" value={nv.gioi_tinh} />
              <Field label="Ngày sinh" value={formatDate(nv.ngay_sinh)} />
              <Field label="Email" value={nv.email} />
              <Field label="Số điện thoại" value={nv.so_dien_thoai} />
              <Field label="Số CCCD" value={nv.so_cccd} mono />
              <Field label="Quê quán" value={nv.que_quan} />
              <Field label="Địa chỉ thường trú" value={nv.dia_chi_thuong_tru} />
            </div>
          </Card>
        </TabsContent>

        {/* === Tab: Hợp đồng === */}
        <TabsContent value="contract" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              <Field
                label="Loại nhân viên"
                value={
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                  </Badge>
                }
              />
              {nv.mon_day && <Field label="Môn dạy" value={nv.mon_day} />}
              {nv.hang_chuc_danh && <Field label="Hạng chức danh" value={nv.hang_chuc_danh} />}
              <Field
                label="Loại hợp đồng"
                value={LOAI_HOP_DONG_LABELS[nv.loai_hop_dong] || nv.loai_hop_dong}
              />
              <Field label="Số hợp đồng" value={nv.so_hop_dong} mono />
              <Field label="Ngày vào làm" value={formatDate(nv.ngay_vao_lam)} />
              <Field label="Ngày hết hạn HĐ" value={formatDate(nv.ngay_het_hop_dong)} />
            </div>
          </Card>
        </TabsContent>

        {/* === Tab: Bổ sung === */}
        <TabsContent value="other" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              <Field
                label="Đảng viên"
                value={
                  nv.la_dang_vien
                    ? <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Đảng viên</Badge>
                    : "Không"
                }
              />
              <Field
                label="Đoàn viên"
                value={
                  nv.la_doan_vien
                    ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đoàn viên</Badge>
                    : "Không"
                }
              />
              <Field
                label="Trạng thái"
                value={<Badge variant="outline" className={TRANG_THAI_COLORS[tt]}>{TRANG_THAI_LABELS[tt]}</Badge>}
              />
            </div>
            {nv.ghi_chu && (
              <>
                <Separator className="my-5" />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Ghi chú</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4">{nv.ghi_chu}</p>
                </div>
              </>
            )}

            <Separator className="my-5" />
            <div className="flex items-center gap-6 text-[11px] text-slate-400">
              <span>Tạo lúc: <span className="font-mono">{formatDate(nv.created_at)}</span></span>
              <span>Cập nhật: <span className="font-mono">{formatDate(nv.updated_at)}</span></span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
