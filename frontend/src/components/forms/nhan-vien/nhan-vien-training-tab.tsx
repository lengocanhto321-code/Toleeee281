"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  GraduationCap, 
  Award, 
  FileText, 
  Laptop, 
  Languages, 
  BookOpen,
  Plus,
  Calendar,
  CheckCircle2,
  ExternalLink
} from "lucide-react"
import type { NhanVien, BangCap, ChungChi } from "@/types/nhan-vien.types"
import { LOAI_BANG_CAP_LABELS, LOAI_CHUNG_CHI_LABELS } from "@/types/nhan-vien.types"

interface NhanVienTrainingTabProps {
  nhanVien: NhanVien
  bangCaps?: BangCap[]
  chungChis?: ChungChi[]
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatYear(year?: number) {
  if (!year) return "—"
  return year.toString()
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function DegreeBadge({ degree }: { degree: string }) {
  const config: Record<string, { label: string; className: string }> = {
    dai_hoc: { label: "Đại học", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    cao_dang: { label: "Cao đẳng", className: "bg-blue-50 text-blue-700 border-blue-200" },
    trung_cap: { label: "Trung cấp", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    chung_chi: { label: "Chứng chỉ", className: "bg-violet-50 text-violet-700 border-violet-200" },
    bang_khac: { label: "Bằng khác", className: "bg-slate-50 text-slate-600 border-slate-200" },
  }
  const cfg = config[degree] || { label: degree, className: "bg-slate-50 text-slate-600 border-slate-200" }
  
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

function CertificateBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    ngoai_ngu: { label: "Ngoại ngữ", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Languages },
    tin_hoc: { label: "Tin học", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Laptop },
    nghiep_vu: { label: "Nghiệp vụ", className: "bg-violet-50 text-violet-700 border-violet-200", icon: Award },
    khac: { label: "Khác", className: "bg-slate-50 text-slate-600 border-slate-200", icon: FileText },
  }
  const cfg = config[type] || { label: type, className: "bg-slate-50 text-slate-600 border-slate-200", icon: FileText }
  const Icon = cfg.icon
  
  return (
    <Badge variant="outline" className={cfg.className}>
      <Icon className="h-3 w-3 mr-1" />
      {cfg.label}
    </Badge>
  )
}

export function NhanVienTrainingTab({ nhanVien, bangCaps = [], chungChis = [] }: NhanVienTrainingTabProps) {
  const trinhDoDaoTao = bangCaps.find(b => b.loai === "dai_hoc")
  const otherDegrees = bangCaps.filter(b => b.loai !== "dai_hoc")
  const ngoaiNgus = chungChis.filter(c => c.loai === "ngoai_ngu")
  const tinHocs = chungChis.filter(c => c.loai === "tin_hoc")
  const nghiepVus = chungChis.filter(c => c.loai === "nghiep_vu")
  const khacs = chungChis.filter(c => c.loai === "khac")

  return (
    <div className="space-y-6">
      {/* Trình độ đào tạo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Trình độ đào tạo</h3>
            <p className="text-xs text-slate-500">Quá trình học tập và đào tạo</p>
          </div>
        </div>

        {trinhDoDaoTao ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field label="Trình độ" value={<DegreeBadge degree={trinhDoDaoTao.loai} />} />
            <Field label="Chuyên ngành" value={trinhDoDaoTao.chuyen_nganh || "—"} />
            <Field label="Trường" value={trinhDoDaoTao.truong || "—"} />
            <Field label="Năm tốt nghiệp" value={formatYear(trinhDoDaoTao.nam_tot_nghiep)} />
            {trinhDoDaoTao.xep_loai && (
              <Field label="Xếp loại" value={trinhDoDaoTao.xep_loai} />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Chưa cập nhật trình độ đào tạo</p>
            </div>
          </div>
        )}
      </Card>

      {/* Bằng cấp, chứng chỉ */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Bằng cấp, chứng chỉ</h3>
              <p className="text-xs text-slate-500">Các văn bằng đã có</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-slate-100">
            {bangCaps.length} văn bằng
          </Badge>
        </div>

        {bangCaps.length > 0 ? (
          <div className="space-y-3">
            {bangCaps.map((bangCap, index) => (
              <div key={bangCap.id || index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{bangCap.ten}</p>
                      <DegreeBadge degree={bangCap.loai} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {bangCap.chuyen_nganh && `Chuyên ngành: ${bangCap.chuyen_nganh}`}
                      {bangCap.truong && ` • ${bangCap.truong}`}
                      {bangCap.nam_tot_nghiep && ` • ${bangCap.nam_tot_nghiep}`}
                    </p>
                  </div>
                </div>
                {bangCap.xep_loai && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {bangCap.xep_loai}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có bằng cấp nào được cập nhật</p>
            </div>
          </div>
        )}
      </Card>

      {/* Ngoại ngữ - Tin học */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ngoại ngữ */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Languages className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Ngoại ngữ</h3>
              <p className="text-xs text-slate-500">Chứng chỉ ngoại ngữ</p>
            </div>
          </div>

          {ngoaiNgus.length > 0 ? (
            <div className="space-y-3">
              {ngoaiNgus.map((nn, index) => (
                <div key={nn.id || index} className="flex items-center justify-between p-3 rounded-lg bg-violet-50/50 border border-violet-100">
                  <div>
                    <p className="font-medium text-slate-900">{nn.ten}</p>
                    {nn.hang_cap && <p className="text-xs text-slate-500">Hạng: {nn.hang_cap}</p>}
                  </div>
                  <div className="text-right">
                    {nn.nam_cap && <p className="text-xs font-medium text-violet-600">{nn.nam_cap}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Chưa cập nhật</p>
          )}
        </Card>

        {/* Tin học */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Laptop className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Tin học</h3>
              <p className="text-xs text-slate-500">Chứng chỉ tin học</p>
            </div>
          </div>

          {tinHocs.length > 0 ? (
            <div className="space-y-3">
              {tinHocs.map((th, index) => (
                <div key={th.id || index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div>
                    <p className="font-medium text-slate-900">{th.ten}</p>
                    {th.hang_cap && <p className="text-xs text-slate-500">Hạng: {th.hang_cap}</p>}
                  </div>
                  <div className="text-right">
                    {th.nam_cap && <p className="text-xs font-medium text-blue-600">{th.nam_cap}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Chưa cập nhật</p>
          )}
        </Card>
      </div>

      {/* Chứng chỉ nghiệp vụ & Khác */}
      {(nghiepVus.length > 0 || khacs.length > 0) && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Chứng chỉ khác</h3>
              <p className="text-xs text-slate-500">Chứng chỉ nghiệp vụ và các chứng chỉ khác</p>
            </div>
          </div>

          <div className="space-y-3">
            {[...nghiepVus, ...khacs].map((cc, index) => (
              <div key={cc.id || index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CertificateBadge type={cc.loai} />
                  <div>
                    <p className="font-medium text-slate-900">{cc.ten}</p>
                    {cc.nam_cap && <p className="text-xs text-slate-500">Năm cấp: {cc.nam_cap}</p>}
                  </div>
                </div>
                {cc.ngay_het_han && (
                  <p className="text-xs text-slate-500">
                    Hết hạn: {formatDate(cc.ngay_het_han)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
