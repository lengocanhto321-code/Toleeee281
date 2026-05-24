"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Banknote,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Pencil,
  ArrowUpRight,
} from "lucide-react"
import type { NhanVien } from "@/types/nhan-vien.types"
import type { Luong, TraLuong } from "@/types/luong.types"
import { formatDateVN } from "@/lib/date-utils"
import { ApiEndpoints } from "@/types/api.types"
import { apiGateway } from "@/lib/axios"
import { toastSuccess, toastError } from "@/lib/utils"

interface NhanVienSalaryProps {
  nhanVien: NhanVien
  luong?: Luong
  traLuongs?: TraLuong[]
  onLuongCreated?: () => void
}

function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return "—"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function SalaryField({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="detail-field-label">{label}</p>
      <p className={`detail-field-value ${highlight ? "text-emerald-600 font-bold" : ""}`}>{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function SalaryStatCard({
  icon: Icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  gradient: string
}) {
  return (
    <div className="detail-section flex items-center gap-3 p-3.5 animate-detail-fade">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${gradient}`}>
        <Icon className="h-[18px] w-[18px] text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500 leading-tight">{label}</p>
        <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
        {subValue && <p className="text-[10px] text-slate-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  )
}

export function NhanVienSalaryTab({ nhanVien, luong, traLuongs = [], onLuongCreated }: NhanVienSalaryProps) {
  const recentTraLuongs = traLuongs.slice(0, 6)
  const [luongDialogOpen, setLuongDialogOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isEditing = !!luong
  const [form, setForm] = useState({
    he_so_luong: String(luong?.he_so_luong ?? "2.34"),
    so_nam_tham_nien: String(luong?.so_nam_tham_nien ?? "0"),
    ty_le_pc_uu_dai: String(luong?.ty_le_pc_uu_dai ?? "30"),
    he_so_khu_vuc: String(luong?.he_so_khu_vuc ?? "0"),
    phu_cap_chuc_vu: String(luong?.phu_cap_chuc_vu ?? "0"),
    phu_cap_tham_nien_vuot_khung: String(luong?.phu_cap_tham_nien_vuot_khung ?? "0"),
    phu_cap_khac: String(luong?.phu_cap_khac ?? "0"),
    khau_tru_khac: String(luong?.khau_tru_khac ?? "0"),
    hieu_luc_tu: luong?.hieu_luc_tu ? String(luong.hieu_luc_tu).split("T")[0] : new Date().toISOString().split("T")[0],
  })

  const handleOpenDialog = () => {
    if (luong) {
      setForm({
        he_so_luong: String(luong.he_so_luong ?? "2.34"),
        so_nam_tham_nien: String(luong.so_nam_tham_nien ?? "0"),
        ty_le_pc_uu_dai: String(luong.ty_le_pc_uu_dai ?? "30"),
        he_so_khu_vuc: String(luong.he_so_khu_vuc ?? "0"),
        phu_cap_chuc_vu: String(luong.phu_cap_chuc_vu ?? "0"),
        phu_cap_tham_nien_vuot_khung: String(luong.phu_cap_tham_nien_vuot_khung ?? "0"),
        phu_cap_khac: String(luong.phu_cap_khac ?? "0"),
        khau_tru_khac: String(luong.khau_tru_khac ?? "0"),
        hieu_luc_tu: String(luong.hieu_luc_tu).split("T")[0],
      })
    }
    setLuongDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const payload = {
        he_so_luong: parseFloat(form.he_so_luong) || 0,
        so_nam_tham_nien: parseInt(form.so_nam_tham_nien) || 0,
        ty_le_pc_uu_dai: parseFloat(form.ty_le_pc_uu_dai) || 0,
        he_so_khu_vuc: parseFloat(form.he_so_khu_vuc) || 0,
        phu_cap_chuc_vu: parseInt(form.phu_cap_chuc_vu) || 0,
        phu_cap_tham_nien_vuot_khung: parseInt(form.phu_cap_tham_nien_vuot_khung) || 0,
        phu_cap_khac: parseInt(form.phu_cap_khac) || 0,
        khau_tru_khac: parseInt(form.khau_tru_khac) || 0,
        hieu_luc_tu: form.hieu_luc_tu,
      }
      if (isEditing && luong) {
        await apiGateway.put(ApiEndpoints.LUONG_UPDATE(luong.id), payload)
        toastSuccess("Đã cập nhật thông tin lương")
      } else {
        await apiGateway.post(ApiEndpoints.LUONG_CREATE, { nhan_vien_id: nhanVien.id, ...payload })
        toastSuccess("Đã thiết lập lương cho nhân viên")
      }
      setLuongDialogOpen(false)
      onLuongCreated?.()
    } catch {
      toastError("Lỗi", isEditing ? "Cập nhật lương thất bại" : "Thiết lập lương thất bại")
    } finally {
      setIsPending(false)
    }
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const luongDialog = (
    <Dialog open={luongDialogOpen} onOpenChange={setLuongDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật lương" : "Thiết lập lương"} - {nhanVien.ho_ten}</DialogTitle>
          <DialogDescription>Cấu hình hệ số lương và các khoản phụ cấp.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Hệ số lương</Label>
              <Input type="number" step="0.01" value={form.he_so_luong} onChange={(e) => update("he_so_luong", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Năm thâm niên</Label>
              <Input type="number" value={form.so_nam_tham_nien} onChange={(e) => update("so_nam_tham_nien", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>PC ưu đãi (%)</Label>
              <Input type="number" step="0.1" value={form.ty_le_pc_uu_dai} onChange={(e) => update("ty_le_pc_uu_dai", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hệ số khu vực</Label>
              <Input type="number" step="0.01" value={form.he_so_khu_vuc} onChange={(e) => update("he_so_khu_vuc", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>PC chức vụ (VNĐ)</Label>
              <Input type="number" value={form.phu_cap_chuc_vu} onChange={(e) => update("phu_cap_chuc_vu", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>PC thâm niên VK (VNĐ)</Label>
              <Input type="number" value={form.phu_cap_tham_nien_vuot_khung} onChange={(e) => update("phu_cap_tham_nien_vuot_khung", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>PC khác (VNĐ)</Label>
              <Input type="number" value={form.phu_cap_khac} onChange={(e) => update("phu_cap_khac", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Khấu trừ khác (VNĐ)</Label>
              <Input type="number" value={form.khau_tru_khac} onChange={(e) => update("khau_tru_khac", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Ngày hiệu lực</Label>
            <Input type="date" value={form.hieu_luc_tu} onChange={(e) => update("hieu_luc_tu", e.target.value)} disabled={isEditing} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLuongDialogOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  if (!luong) {
    return (
      <>
        <div className="detail-section">
          <div className="dot-grid-bg rounded-xl py-14 flex flex-col items-center animate-detail-fade">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 mb-4 shadow-sm">
              <Banknote className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">Chưa có thông tin lương</h3>
            <p className="text-xs text-slate-400 max-w-xs text-center mb-5">
              Nhân viên chưa được thiết lập bảng lương. Nhấn nút bên dưới để cấu hình.
            </p>
            <Button onClick={handleOpenDialog} className="gap-1.5 h-9">
              <Plus className="h-4 w-4" />
              Thiết lập lương
            </Button>
          </div>
        </div>
        {luongDialog}
      </>
    )
  }

  return (
    <div className="space-y-4 animate-detail-fade">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SalaryStatCard
          icon={Banknote}
          label="Lương cơ bản"
          value={formatCurrency(luong.luong_co_ban)}
          subValue={`Hệ số ${luong.he_so_luong}`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <SalaryStatCard
          icon={Award}
          label="Phụ cấp ưu đãi"
          value={formatCurrency(luong.phu_cap_uu_dai)}
          subValue={`Tỷ lệ ${luong.ty_le_pc_uu_dai}%`}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <SalaryStatCard
          icon={TrendingUp}
          label="Hệ số lương"
          value={`${luong.he_so_luong}`}
          subValue={`Bậc ${luong.bac || "N/A"} · ${luong.ma_ngach || "N/A"}`}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <SalaryStatCard
          icon={Clock}
          label="Thâm niên"
          value={`${luong.so_nam_tham_nien} năm`}
          subValue={`PC TV: ${formatCurrency(luong.phu_cap_tham_nien_vuot_khung)}`}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      <div className="detail-section p-5 accent-border-emerald">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
              <Banknote className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Thông tin lương hiện tại</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-[11px]" onClick={handleOpenDialog}>
              <Pencil className="h-3 w-3" />
              Cập nhật
            </Button>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              Hiệu lực từ {formatDateVN(luong.hieu_luc_tu)}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          <SalaryField label="Mã ngạch" value={luong.ma_ngach || "—"} />
          <SalaryField label="Bậc lương" value={luong.bac || "—"} />
          <SalaryField label="Hệ số lương" value={luong.he_so_luong} highlight />
          <SalaryField label="Số năm thâm niên" value={`${luong.so_nam_tham_nien} năm`} />
          <SalaryField label="Lương cơ bản" value={formatCurrency(luong.luong_co_ban)} highlight />
          <SalaryField label="Phụ cấp ưu đãi" value={formatCurrency(luong.phu_cap_uu_dai)} />
          <SalaryField label="Hệ số khu vực" value={luong.he_so_khu_vuc} />
          <SalaryField label="Phụ cấp chức vụ" value={formatCurrency(luong.phu_cap_chuc_vu)} />
          <SalaryField label="BHXH" value={formatCurrency(luong.bhxh)} />
          <SalaryField label="BHYT" value={formatCurrency(luong.bhyt)} />
          <SalaryField label="Thuế TNCN" value={formatCurrency(luong.thue_tncn)} />
          <SalaryField label="Khấu trừ khác" value={formatCurrency(luong.khau_tru_khac)} />
        </div>
      </div>

      <div className="detail-section p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50">
            <Award className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Các khoản phụ cấp</h3>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: Award, label: "Phụ cấp ưu đãi nghề nghiệp", desc: `Tỷ lệ ${luong.ty_le_pc_uu_dai}%`, value: formatCurrency(luong.phu_cap_uu_dai), color: "emerald" },
            { icon: TrendingUp, label: "Phụ cấp thâm niên vượt khung", desc: "Theo số năm công tác", value: formatCurrency(luong.phu_cap_tham_nien_vuot_khung), color: "violet" },
            { icon: DollarSign, label: "Phụ cấp chức vụ", desc: "Theo chức vụ đảm nhận", value: formatCurrency(luong.phu_cap_chuc_vu), color: "blue" },
            ...(luong.phu_cap_khac > 0 ? [{ icon: Plus, label: "Phụ cấp khác", desc: "Các khoản phụ cấp bổ sung", value: formatCurrency(luong.phu_cap_khac), color: "slate" }] : []),
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${item.color}-100`}>
                  <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Lịch sử trả lương ({traLuongs.length})</h3>
        </div>

        {recentTraLuongs.length === 0 ? (
          <div className="dot-grid-bg rounded-xl py-10 flex flex-col items-center">
            <Calendar className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Chưa có lịch sử lương</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dữ liệu sẽ hiển thị sau khi chạy lương tháng</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTraLuongs.map((traLuong, index) => (
              <div
                key={traLuong.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors animate-detail-slide"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${traLuong.trang_thai === "da_tra" ? "bg-emerald-50" : "bg-slate-50"}`}>
                    {traLuong.trang_thai === "da_tra" ? (
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        Tháng {traLuong.thang}/{traLuong.nam}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${traLuong.trang_thai === "da_tra" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {traLuong.trang_thai === "da_tra" ? "Đã trả" : "Chưa trả"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Công: {traLuong.so_ngay_cong_thuc_te}/{traLuong.so_ngay_cong_chuan} ngày
                      {traLuong.co_tam_dinh_chi && <span className="text-amber-600 ml-1.5">· Tạm đình chỉ</span>}
                      {traLuong.co_ky_luat && <span className="text-red-600 ml-1.5">· Bị kỷ luật</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(traLuong.luong_thuc_nhan)}</p>
                  <p className="text-[10px] text-slate-400">Thu nhập: {formatCurrency(traLuong.tong_thu_nhap)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {luongDialog}
    </div>
  )
}
