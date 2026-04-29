"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateKhenThuongKyLuat } from "@/hooks/nhan-vien/use-sub-modules"

interface KhenThuongKyLuatDialogProps {
  nhanVienId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultLoai?: string
}

export function KhenThuongKyLuatDialog({ nhanVienId, open, onOpenChange, defaultLoai = "khen_thuong" }: KhenThuongKyLuatDialogProps) {
  const createMutation = useCreateKhenThuongKyLuat(nhanVienId)

  const [form, setForm] = useState({
    loai: defaultLoai,
    hinh_thuc: "",
    ly_do: "",
    ngay_quyet_dinh: "",
    so_quyet_dinh: "",
    cap_quyet_dinh: "",
    gia_tri_thuong: undefined as number | undefined,
    thoi_han_ky_luat: "",
    ghi_chu: "",
  })

  const handleSubmit = () => {
    if (!form.hinh_thuc || !form.ly_do || !form.ngay_quyet_dinh) return

    const payload: Record<string, unknown> = {
      loai: form.loai,
      hinh_thuc: form.hinh_thuc,
      ly_do: form.ly_do,
      ngay_quyet_dinh: form.ngay_quyet_dinh,
      so_quyet_dinh: form.so_quyet_dinh || undefined,
      cap_quyet_dinh: form.cap_quyet_dinh || undefined,
      ghi_chu: form.ghi_chu || undefined,
    }

    if (form.loai === "khen_thuong" && form.gia_tri_thuong) {
      payload.gia_tri_thuong = form.gia_tri_thuong
    }
    if (form.loai === "ky_luat" && form.thoi_han_ky_luat) {
      payload.thoi_han_ky_luat = form.thoi_han_ky_luat
    }

    createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  const isKhenThuong = form.loai === "khen_thuong"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isKhenThuong ? "Thêm khen thưởng" : "Thêm kỷ luật"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại *</Label>
              <Select value={form.loai} onValueChange={(v) => setForm({ ...form, loai: v })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khen_thuong" className="cursor-pointer">Khen thưởng</SelectItem>
                  <SelectItem value="ky_luat" className="cursor-pointer">Kỷ luật</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngay_quyet_dinh">Ngày quyết định *</Label>
              <Input id="ngay_quyet_dinh" type="date" value={form.ngay_quyet_dinh} onChange={(e) => setForm({ ...form, ngay_quyet_dinh: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hinh_thuc">Hình thức *</Label>
            <Input id="hinh_thuc" value={form.hinh_thuc} onChange={(e) => setForm({ ...form, hinh_thuc: e.target.value })} placeholder={isKhenThuong ? "Bằng khen, Giấy khen..." : "Khiển trách, Cảnh cáo..."} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ly_do">Lý do *</Label>
            <Input id="ly_do" value={form.ly_do} onChange={(e) => setForm({ ...form, ly_do: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="so_quyet_dinh">Số quyết định</Label>
              <Input id="so_quyet_dinh" value={form.so_quyet_dinh} onChange={(e) => setForm({ ...form, so_quyet_dinh: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap_quyet_dinh">Cấp quyết định</Label>
              <Input id="cap_quyet_dinh" value={form.cap_quyet_dinh} onChange={(e) => setForm({ ...form, cap_quyet_dinh: e.target.value })} />
            </div>
          </div>
          {isKhenThuong ? (
            <div className="space-y-2">
              <Label htmlFor="gia_tri_thuong">Giá trị thưởng (VNĐ)</Label>
              <Input id="gia_tri_thuong" type="number" value={form.gia_tri_thuong || ""} onChange={(e) => setForm({ ...form, gia_tri_thuong: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="thoi_han_ky_luat">Thời hạn kỷ luật</Label>
              <Input id="thoi_han_ky_luat" type="date" value={form.thoi_han_ky_luat} onChange={(e) => setForm({ ...form, thoi_han_ky_luat: e.target.value })} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || !form.hinh_thuc || !form.ly_do || !form.ngay_quyet_dinh} className="cursor-pointer">
            {createMutation.isPending ? "Đang lưu..." : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
