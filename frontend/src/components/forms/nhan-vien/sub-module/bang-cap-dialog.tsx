"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateBangCap, useUpdateBangCap } from "@/hooks/nhan-vien/use-sub-modules"
import type { BangCap } from "@/types/nhan-vien.types"

interface BangCapDialogProps {
  nhanVienId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem?: BangCap | null
}

const LOAI_BANG_CAP_OPTIONS = [
  { value: "dai_hoc", label: "Đại học" },
  { value: "cao_dang", label: "Cao đẳng" },
  { value: "trung_cap", label: "Trung cấp" },
  { value: "chung_chi", label: "Chứng chỉ" },
  { value: "bang_khac", label: "Bằng khác" },
]

const XEP_LOAI_OPTIONS = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Đạt"]

export function BangCapDialog({ nhanVienId, open, onOpenChange, editingItem }: BangCapDialogProps) {
  const isEdit = !!editingItem
  const createMutation = useCreateBangCap(nhanVienId)
  const updateMutation = useUpdateBangCap(nhanVienId)

  const [form, setForm] = useState({
    loai: editingItem?.loai || "",
    ten_bang: editingItem?.ten || "",
    chuyen_nganh: editingItem?.chuyen_nganh || "",
    truong_cap: editingItem?.truong || "",
    nam_cap: editingItem?.nam_tot_nghiep || undefined as number | undefined,
    xep_loai: editingItem?.xep_loai || "",
    ghi_chu: "",
  })

  const handleSubmit = () => {
    if (!form.loai || !form.ten_bang) return

    const payload = {
      loai: form.loai,
      ten_bang: form.ten_bang,
      chuyen_nganh: form.chuyen_nganh || undefined,
      truong_cap: form.truong_cap || undefined,
      nam_cap: form.nam_cap || undefined,
      xep_loai: form.xep_loai || undefined,
      ghi_chu: form.ghi_chu || undefined,
    }

    if (isEdit && editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa bằng cấp" : "Thêm bằng cấp"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại bằng *</Label>
              <Select value={form.loai} onValueChange={(v) => setForm({ ...form, loai: v })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {LOAI_BANG_CAP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nam_cap">Năm cấp</Label>
              <Input id="nam_cap" type="number" value={form.nam_cap || ""} onChange={(e) => setForm({ ...form, nam_cap: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ten_bang">Tên bằng/c chứng chỉ *</Label>
            <Input id="ten_bang" value={form.ten_bang} onChange={(e) => setForm({ ...form, ten_bang: e.target.value })} placeholder="Cử nhân Khoa học máy tính..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chuyen_nganh">Chuyên ngành</Label>
              <Input id="chuyen_nganh" value={form.chuyen_nganh || ""} onChange={(e) => setForm({ ...form, chuyen_nganh: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="truong_cap">Trường cấp</Label>
              <Input id="truong_cap" value={form.truong_cap || ""} onChange={(e) => setForm({ ...form, truong_cap: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Xếp loại</Label>
            <Select value={form.xep_loai} onValueChange={(v) => setForm({ ...form, xep_loai: v })}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn xếp loại" />
              </SelectTrigger>
              <SelectContent>
                {XEP_LOAI_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.loai || !form.ten_bang} className="cursor-pointer">
            {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
