"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useEmployeeProfile, useUpdateEmployeeProfile } from "@/hooks/employee/use-employee-profile"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
  Building2,
  Award,
  Pencil,
  Check,
  X,
} from "lucide-react"

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
      </div>
    </div>
  )
}

function EditableRow({
  icon: Icon,
  label,
  value,
  field,
  editData,
  setEditData,
  isEditing,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  field: string
  editData: Record<string, string>
  setEditData: (d: Record<string, string>) => void
  isEditing: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
      <div className="flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {isEditing ? (
          <Input
            value={editData[field] ?? value ?? ""}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            className="h-7 text-sm"
          />
        ) : (
          <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
        )}
      </div>
    </div>
  )
}

export default function EmployeeProfilePage() {
  const { data: profile, isLoading } = useEmployeeProfile()
  const updateMutation = useUpdateEmployeeProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, string>>({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    )
  }

  const startEdit = () => {
    setEditData({
      email_ca_nhan: profile?.email_ca_nhan || "",
      so_dien_thoai: profile?.so_dien_thoai || "",
      dia_chi: profile?.dia_chi || "",
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const saveEdit = () => {
    updateMutation.mutate(
      {
        email: editData.email_ca_nhan || undefined,
        so_dien_thoai: editData.so_dien_thoai || undefined,
        dia_chi: editData.dia_chi || undefined,
      },
      { onSuccess: () => { setIsEditing(false); setEditData({}) } }
    )
  }

  const loaiLabel = (loai: string) => {
    const map: Record<string, string> = {
      giao_vien: "Giáo viên",
      nhan_vien: "Nhân viên",
      can_bo: "Cán bộ",
    }
    return map[loai] || loai
  }

  const trangThaiLabel = (tt: string) => {
    const map: Record<string, string> = {
      dang_lam: "Đang làm việc",
      nghi_viec: "Nghỉ việc",
      nghi_huu: "Nghỉ hưu",
    }
    return map[tt] || tt
  }

  const initials = profile?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
          {initials}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{profile?.ho_ten}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">{loaiLabel(profile?.loai_nhan_vien || "")}</Badge>
          <Badge variant="outline" className="text-xs">{trangThaiLabel(profile?.trang_thai || "")}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {profile?.ma_nhan_vien} · {profile?.phong_ban?.ten_phong_ban || "—"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={User} label="Giới tính" value={profile?.gioi_tinh} />
          <InfoRow icon={Calendar} label="Ngày sinh" value={profile?.ngay_sinh} />
          <InfoRow icon={CreditCard} label="Số CCCD" value={profile?.so_cccd} />
          <InfoRow icon={MapPin} label="Quê quán" value={profile?.que_quan} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Liên hệ</h3>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={startEdit} className="text-blue-600 h-7 text-xs">
              <Pencil className="w-3 h-3 mr-1" />
              Sửa
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 text-xs">
                <X className="w-3 h-3 mr-1" />Hủy
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
                <Check className="w-3 h-3 mr-1" />
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={Mail} label="Email công việc" value={profile?.email} />
          <EditableRow icon={Phone} label="Số điện thoại" value={profile?.so_dien_thoai} field="so_dien_thoai" editData={editData} setEditData={setEditData} isEditing={isEditing} />
          <EditableRow icon={Mail} label="Email cá nhân" value={profile?.email_ca_nhan} field="email_ca_nhan" editData={editData} setEditData={setEditData} isEditing={isEditing} />
          <EditableRow icon={MapPin} label="Địa chỉ" value={profile?.dia_chi} field="dia_chi" editData={editData} setEditData={setEditData} isEditing={isEditing} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Thông tin công tác</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InfoRow icon={Building2} label="Phòng ban" value={profile?.phong_ban?.ten_phong_ban} />
          <InfoRow icon={Award} label="Chức vụ" value={profile?.chuc_vu?.ten_chuc_vu} />
          <InfoRow icon={Calendar} label="Ngày vào làm" value={profile?.ngay_vao_lam} />
          <InfoRow icon={Briefcase} label="Loại nhân viên" value={loaiLabel(profile?.loai_nhan_vien || "")} />
        </div>
      </div>
    </div>
  )
}
