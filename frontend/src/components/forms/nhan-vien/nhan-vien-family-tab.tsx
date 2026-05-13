"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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
  Trash2
} from "lucide-react"
import { useDeleteNguoiThan } from "@/hooks/nhan-vien/use-sub-modules"
import { NguoiThanDialog } from "./sub-module"
import type { NhanVien, NguoiThan } from "@/types/nhan-vien.types"

interface NhanVienFamilyTabProps {
  nhanVien: NhanVien
  nguoiThans?: NguoiThan[]
  tinhTrangHonNhan?: string
}

function formatYear(year?: string) {
  if (!year) return "—"
  return year
}

function RelationshipIcon({ relationship }: { relationship: string }) {
  const lower = relationship.toLowerCase()
  
  if (lower.includes("vợ") || lower.includes("chồng")) {
    return Crown
  }
  if (lower.includes("con")) {
    return Baby
  }
  return Users
}

function FamilyCard({ nguoiThan, onEdit, onDelete }: { nguoiThan: NguoiThan; onEdit: () => void; onDelete: () => void }) {
  const Icon = RelationshipIcon({ relationship: nguoiThan.quan_he })

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
        <Icon className="h-6 w-6 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900">{nguoiThan.ho_ten}</p>
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
            {nguoiThan.quan_he}
          </Badge>
          {nguoiThan.nguoi_phu_thuoc && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Người phụ thuộc
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {nguoiThan.nam_sinh && (
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Năm sinh:</span> {nguoiThan.nam_sinh}
            </p>
          )}
          {nguoiThan.nghe_nghiep && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span className="text-slate-400">Nghề:</span> {nguoiThan.nghe_nghiep}
            </p>
          )}
          {nguoiThan.so_dien_thoai && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="text-slate-400">ĐT:</span> {nguoiThan.so_dien_thoai}
            </p>
          )}
        </div>
        {nguoiThan.dia_chi && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
            <MapPin className="h-3 w-3" />
            {nguoiThan.dia_chi}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Tình trạng hôn nhân" value={tinhTrangHonNhan || "—"} accent="bg-pink-100 text-pink-600" />
        <StatCard icon={Users} label="Người thân" value={nguoiThans.length} accent="bg-violet-100 text-violet-600" />
        <StatCard icon={Crown} label="Vợ/Chồng" value={voChong.length} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Baby} label="Con cái" value={conCai.length} accent="bg-blue-100 text-blue-600" />
      </div>

      {nguoiPhuThuoc.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Người phụ thuộc giảm trừ thuế</h3>
              <p className="text-xs text-slate-500">
                Được đăng ký giảm trừ thuế TNCN ({nguoiPhuThuoc.length} người)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nguoiPhuThuoc.map((nt, index) => (
              <div key={nt.id || index} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="font-medium text-slate-900">{nt.ho_ten}</p>
                <p className="text-xs text-slate-500">{nt.quan_he}</p>
                {nt.nam_sinh && <p className="text-xs text-slate-400 mt-1">Năm sinh: {nt.nam_sinh}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Thông tin gia đình</h3>
              <p className="text-xs text-slate-500">Người thân được đăng ký</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100">
              {nguoiThans.length} người
            </Badge>
            <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleAdd}>
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </Button>
          </div>
        </div>

        {nguoiThans.length > 0 ? (
          <div className="space-y-4">
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="font-medium text-slate-700 mb-1">Chưa có thông tin</h4>
            <p className="text-sm text-slate-500 mb-4">Thông tin người thân sẽ hiển thị tại đây</p>
            <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer" onClick={handleAdd}>
              <Plus className="h-3.5 w-3.5" />
              Thêm người thân
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <span className="text-amber-600 font-bold text-sm">!</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-800">Lưu ý về giảm trừ thuế</h4>
            <p className="text-xs text-amber-700 mt-1">
              Người phụ thuộc được đăng ký giảm trừ thuế TNCN theo quy định hiện hành. 
              Mức giảm trừ hiện tại: 4.400.000 VNĐ/người/tháng.
            </p>
          </div>
        </div>
      </Card>

      <NguoiThanDialog
        nhanVienId={nhanVien.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
      />
    </div>
  )
}
