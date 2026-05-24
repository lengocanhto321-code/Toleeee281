"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Heart,
  Phone,
  MapPin,
  Briefcase,
  Baby,
  Crown,
  Plus,
  Pencil,
  Trash2,
  Info,
} from "lucide-react"
import { useDeleteNguoiThan } from "@/hooks/nhan-vien/use-sub-modules"
import { NguoiThanDialog } from "./sub-module"
import type { NhanVien, NguoiThan } from "@/types/nhan-vien.types"

interface NhanVienFamilyTabProps {
  nhanVien: NhanVien
  nguoiThans?: NguoiThan[]
  tinhTrangHonNhan?: string
}

function RelationshipIcon({ relationship }: { relationship: string }) {
  const lower = relationship.toLowerCase()
  if (lower.includes("vợ") || lower.includes("chồng")) return Crown
  if (lower.includes("con")) return Baby
  return Users
}

function FamilyCard({ nguoiThan, onEdit, onDelete }: { nguoiThan: NguoiThan; onEdit: () => void; onDelete: () => void }) {
  const Icon = RelationshipIcon({ relationship: nguoiThan.quan_he })
  const isSpouse = nguoiThan.quan_he.toLowerCase().includes("vợ") || nguoiThan.quan_he.toLowerCase().includes("chồng")
  const isChild = nguoiThan.quan_he.toLowerCase().includes("con")

  return (
    <div className={`detail-section p-4 group hover:shadow-md transition-shadow animate-detail-slide ${isSpouse ? "accent-border-amber" : isChild ? "accent-border-sky" : ""}`}>
      <div className="flex items-start gap-3.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSpouse ? "bg-gradient-to-br from-amber-100 to-amber-50" : isChild ? "bg-gradient-to-br from-sky-100 to-sky-50" : "bg-gradient-to-br from-violet-100 to-violet-50"}`}>
          <Icon className={`h-5 w-5 ${isSpouse ? "text-amber-600" : isChild ? "text-sky-600" : "text-violet-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-semibold text-slate-900">{nguoiThan.ho_ten}</p>
            <Badge variant="outline" className={`text-[10px] ${isSpouse ? "bg-amber-50 text-amber-700 border-amber-200" : isChild ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-violet-50 text-violet-700 border-violet-200"}`}>
              {nguoiThan.quan_he}
            </Badge>
            {nguoiThan.nguoi_phu_thuoc && (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                Giảm trừ thuế
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            {nguoiThan.nam_sinh && <span>Năm sinh: {nguoiThan.nam_sinh}</span>}
            {nguoiThan.nghe_nghiep && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {nguoiThan.nghe_nghiep}
              </span>
            )}
            {nguoiThan.so_dien_thoai && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {nguoiThan.so_dien_thoai}
              </span>
            )}
          </div>
          {nguoiThan.dia_chi && (
            <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <MapPin className="h-3 w-3" />
              {nguoiThan.dia_chi}
            </p>
          )}
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 cursor-pointer" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function NhanVienFamilyTab({ nhanVien, nguoiThans = [], tinhTrangHonNhan }: NhanVienFamilyTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NguoiThan | null>(null)
  const deleteMutation = useDeleteNguoiThan(nhanVien.id)

  const nguoiPhuThuoc = nguoiThans.filter(n => n.nguoi_phu_thuoc)
  const voChong = nguoiThans.filter(n =>
    n.quan_he.toLowerCase().includes("vợ") ||
    n.quan_he.toLowerCase().includes("chồng")
  )
  const conCai = nguoiThans.filter(n =>
    n.quan_he.toLowerCase().includes("con")
  )

  const handleAdd = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: NguoiThan) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa người thân này?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
            <Heart className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Hôn nhân</p>
            <p className="text-sm font-bold text-slate-900">{tinhTrangHonNhan || "—"}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-75">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600">
            <Users className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Người thân</p>
            <p className="text-lg font-bold text-slate-900">{nguoiThans.length}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-150">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <Crown className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Vợ/Chồng</p>
            <p className="text-lg font-bold text-slate-900">{voChong.length}</p>
          </div>
        </div>
        <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade delay-225">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
            <Baby className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Con cái</p>
            <p className="text-lg font-bold text-slate-900">{conCai.length}</p>
          </div>
        </div>
      </div>

      {nguoiPhuThuoc.length > 0 && (
        <div className="detail-section p-5 accent-border-emerald">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Người phụ thuộc giảm trừ thuế</h3>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              {nguoiPhuThuoc.length} người
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {nguoiPhuThuoc.map((nt, index) => (
              <div key={nt.id || index} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{nt.ho_ten}</p>
                  <p className="text-[11px] text-slate-400">{nt.quan_he} {nt.nam_sinh ? `· ${nt.nam_sinh}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50">
              <Users className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Thông tin gia đình</h3>
          </div>
          <Button size="sm" className="gap-1.5 cursor-pointer h-7 text-[11px]" onClick={handleAdd}>
            <Plus className="h-3 w-3" />
            Thêm
          </Button>
        </div>

        {nguoiThans.length > 0 ? (
          <div className="space-y-2.5">
            {nguoiThans.map((nt, index) => (
              <FamilyCard
                key={nt.id || index}
                nguoiThan={nt}
                onEdit={() => handleEdit(nt)}
                onDelete={() => handleDelete(nt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="detail-section">
            <div className="dot-grid-bg rounded-xl py-12 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                <Users className="h-6 w-6 text-slate-300" />
              </div>
              <h4 className="text-sm font-medium text-slate-600 mb-1">Chưa có thông tin</h4>
              <p className="text-[11px] text-slate-400 mb-4">Thông tin người thân sẽ hiển thị tại đây</p>
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer h-8 text-[11px]" onClick={handleAdd}>
                <Plus className="h-3.5 w-3.5" />
                Thêm người thân
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 animate-detail-fade">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <Info className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-amber-800">Lưu ý về giảm trừ thuế</h4>
          <p className="text-[11px] text-amber-700/80 mt-0.5">
            Người phụ thuộc được đăng ký giảm trừ thuế TNCN theo quy định. Mức giảm trừ: 4.400.000 VNĐ/người/tháng.
          </p>
        </div>
      </div>

      <NguoiThanDialog
        nhanVienId={nhanVien.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
      />
    </div>
  )
}
