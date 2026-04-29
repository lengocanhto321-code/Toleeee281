"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateNguoiThan, useUpdateNguoiThan } from "@/hooks/nhan-vien/use-sub-modules"
import type { NguoiThan } from "@/types/nhan-vien.types"

interface NguoiThanDialogProps {
  nhanVienId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem?: NguoiThan | null
}

export function NguoiThanDialog({ nhanVienId, open, onOpenChange, editingItem }: NguoiThanDialogProps) {
  const isEdit = !!editingItem
  const createMutation = useCreateNguoiThan(nhanVienId)
  const updateMutation = useUpdateNguoiThan(nhanVienId)

  const [form, setForm] = useState({
    ho_ten: editingItem?.ho_ten || "",
    quan_he: editingItem?.quan_he || "",
    nam_sinh: editingItem?.nam_sinh || "",
    nghe_nghiep: editingItem?.nghe_nghiep || "",
    dia_chi: editingItem?.dia_chi || "",
    so_dien_thoai: editingItem?.so_dien_thoai || "",
    nguoi_phu_thuoc: editingItem?.nguoi_phu_thuoc || false,
    ghi_chu: "",
  })

  const handleSubmit = () => {
    if (!form.ho_ten || !form.quan_he || !form.nam_sinh) return

    if (isEdit && editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: form },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createMutation.mutate(form, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa người thân" : "Thêm người thân"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ho_ten">Họ tên *</Label>
              <Input id="ho_ten" value={form.ho_ten} onChange={(e) => setForm({ ...form, ho_ten: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quan_he">Quan hệ *</Label>
              <Input id="quan_he" value={form.quan_he} onChange={(e) => setForm({ ...form, quan_he: e.target.value })} placeholder="Vợ/Chồng/Con/Cha/Mẹ..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nam_sinh">Năm sinh *</Label>
              <Input id="nam_sinh" value={form.nam_sinh} onChange={(e) => setForm({ ...form, nam_sinh: e.target.value })} placeholder="1990" maxLength={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nghe_nghiep">Nghề nghiệp</Label>
              <Input id="nghe_nghiep" value={form.nghe_nghiep || ""} onChange={(e) => setForm({ ...form, nghe_nghiep: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
              <Input id="so_dien_thoai" value={form.so_dien_thoai || ""} onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })} />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="nguoi_phu_thuoc"
                  checked={form.nguoi_phu_thuoc}
                  onCheckedChange={(checked) => setForm({ ...form, nguoi_phu_thuoc: !!checked })}
                />
                <Label htmlFor="nguoi_phu_thuoc" className="cursor-pointer">Người phụ thuộc thuế</Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dia_chi">Địa chỉ</Label>
            <Input id="dia_chi" value={form.dia_chi || ""} onChange={(e) => setForm({ ...form, dia_chi: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.ho_ten || !form.quan_he || !form.nam_sinh} className="cursor-pointer">
            {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
