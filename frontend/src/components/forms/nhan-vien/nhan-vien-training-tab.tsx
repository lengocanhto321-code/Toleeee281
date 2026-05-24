"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Award,
  FileText,
  Laptop,
  Languages,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import { useDeleteBangCap } from "@/hooks/nhan-vien/use-sub-modules"
import { BangCapDialog } from "./sub-module"
import type { NhanVien, BangCap, ChungChi } from "@/types/nhan-vien.types"
import { LOAI_BANG_CAP_LABELS, LOAI_CHUNG_CHI_LABELS } from "@/types/nhan-vien.types"

interface NhanVienTrainingTabProps {
  nhanVien: NhanVien
  bangCaps?: BangCap[]
  chungChis?: ChungChi[]
}

function formatYear(year?: number) {
  if (!year) return "—"
  return year.toString()
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="detail-field-label">{label}</p>
      <p className="detail-field-value">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function DegreeBadge({ degree }: { degree: string }) {
  const config: Record<string, { label: string; className: string }> = {
    dai_hoc: { label: "Đại học", className: "bg-blue-50 text-blue-700 border-blue-200" },
    cao_dang: { label: "Cao đẳng", className: "bg-blue-50 text-blue-700 border-blue-200" },
    trung_cap: { label: "Trung cấp", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    chung_chi: { label: "Chứng chỉ", className: "bg-violet-50 text-violet-700 border-violet-200" },
    bang_khac: { label: "Bằng khác", className: "bg-slate-50 text-slate-600 border-slate-200" },
  }
  const cfg = config[degree] || { label: degree, className: "bg-slate-50 text-slate-600 border-slate-200" }
  return (
    <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
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
    <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
      <Icon className="h-3 w-3 mr-0.5" />
      {cfg.label}
    </Badge>
  )
}

export function NhanVienTrainingTab({ nhanVien, bangCaps = [], chungChis = [] }: NhanVienTrainingTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BangCap | null>(null)
  const [dialogDefaultLoai, setDialogDefaultLoai] = useState<string | undefined>(undefined)
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined)
  const deleteMutation = useDeleteBangCap(nhanVien.id)

  const trinhDoDaoTao = bangCaps.find(b => b.loai === "dai_hoc")
  const ngoaiNgus = chungChis.filter(c => c.loai === "ngoai_ngu")
  const tinHocs = chungChis.filter(c => c.loai === "tin_hoc")
  const nghiepVus = chungChis.filter(c => c.loai === "nghiep_vu")
  const khacs = chungChis.filter(c => c.loai === "khac")

  const handleAdd = () => {
    setEditingItem(null)
    setDialogDefaultLoai(undefined)
    setDialogTitle(undefined)
    setDialogOpen(true)
  }

  const handleAddChungChi = (loai: string, title: string) => {
    setEditingItem(null)
    setDialogDefaultLoai(loai)
    setDialogTitle(title)
    setDialogOpen(true)
  }

  const handleEdit = (item: BangCap) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bằng cấp này?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="detail-section p-5 accent-border-indigo">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Trình độ đào tạo</h3>
        </div>

        {trinhDoDaoTao ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <DetailField label="Trình độ" value={<DegreeBadge degree={trinhDoDaoTao.loai} />} />
            <DetailField label="Chuyên ngành" value={trinhDoDaoTao.chuyen_nganh || "—"} />
            <DetailField label="Trường" value={trinhDoDaoTao.truong || "—"} />
            <DetailField label="Năm tốt nghiệp" value={formatYear(trinhDoDaoTao.nam_tot_nghiep)} />
            {trinhDoDaoTao.xep_loai && <DetailField label="Xếp loại" value={trinhDoDaoTao.xep_loai} />}
          </div>
        ) : (
          <div className="dot-grid-bg rounded-xl py-8 flex flex-col items-center">
            <GraduationCap className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Chưa cập nhật trình độ đào tạo</p>
          </div>
        )}
      </div>

      <div className="detail-section overflow-hidden">
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
                <Award className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Bằng cấp, chứng chỉ</h3>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                {bangCaps.length}
              </Badge>
            </div>
            <Button size="sm" className="gap-1.5 cursor-pointer h-7 text-[11px]" onClick={handleAdd}>
              <Plus className="h-3 w-3" />
              Thêm
            </Button>
          </div>
        </div>

        {bangCaps.length > 0 ? (
          <div className="px-5 pb-5 space-y-2">
            {bangCaps.map((bangCap, index) => (
              <div
                key={bangCap.id || index}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group animate-detail-slide"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-900">{bangCap.ten}</span>
                      <DegreeBadge degree={bangCap.loai} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {[bangCap.chuyen_nganh, bangCap.truong, bangCap.nam_tot_nghiep].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {bangCap.xep_loai && (
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      {bangCap.xep_loai}
                    </Badge>
                  )}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => handleEdit(bangCap)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => handleDelete(bangCap.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 pb-5">
            <div className="dot-grid-bg rounded-xl py-10 flex flex-col items-center">
              <Award className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400 mb-3">Chưa có bằng cấp nào</p>
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer h-8 text-[11px]" onClick={handleAdd}>
                <Plus className="h-3 w-3" />
                Thêm bằng cấp
              </Button>
            </div>
          </div>
        )}
      </div>

      {(nghiepVus.length > 0 || khacs.length > 0) && (
        <div className="detail-section p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">
              <FileText className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Chứng chỉ khác</h3>
          </div>
          <div className="space-y-2">
            {[...nghiepVus, ...khacs].map((cc, index) => (
              <div key={cc.id || index} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <CertificateBadge type={cc.loai} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cc.ten}</p>
                    {cc.nam_cap && <p className="text-[11px] text-slate-400">Năm cấp: {cc.nam_cap}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BangCapDialog
        nhanVienId={nhanVien.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        defaultLoai={dialogDefaultLoai}
        title={dialogTitle}
      />
    </div>
  )
}
