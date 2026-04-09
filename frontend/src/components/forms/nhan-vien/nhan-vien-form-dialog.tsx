"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { NhanVien, NhanVienFormData } from "@/types/nhan-vien.types"

const INITIAL_FORM: NhanVienFormData = {
  ho_ten: "",
  gioi_tinh: "Nam",
  ngay_sinh: "",
  email: "",
  so_dien_thoai: "",
  loai_nhan_vien: "giao_vien",
  trang_thai: "dang_lam",
}

interface NhanVienFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingNhanVien: NhanVien | null
  isPending: boolean
  onSubmit: (data: NhanVienFormData, editId?: string) => void
}

export function NhanVienFormDialog({
  open,
  onOpenChange,
  editingNhanVien,
  isPending,
  onSubmit,
}: NhanVienFormDialogProps) {
  const [formData, setFormData] = useState<NhanVienFormData>(INITIAL_FORM)
  const isEditing = !!editingNhanVien

  useEffect(() => {
    if (editingNhanVien) {
      setFormData({
        ho_ten: editingNhanVien.ho_ten,
        gioi_tinh: editingNhanVien.gioi_tinh,
        ngay_sinh: editingNhanVien.ngay_sinh,
        email: editingNhanVien.email || "",
        so_dien_thoai: editingNhanVien.so_dien_thoai || "",
        loai_nhan_vien: editingNhanVien.loai_nhan_vien,
        trang_thai: editingNhanVien.trang_thai,
      })
    } else {
      setFormData(INITIAL_FORM)
    }
  }, [editingNhanVien, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, editingNhanVien?.id)
  }

  const update = (field: keyof NhanVienFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Cập nhật thông tin cho ${editingNhanVien.ho_ten}`
              : "Mã nhân viên sẽ được tạo tự động theo loại nhân viên"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isEditing && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Mã NV</span>
              <span className="font-mono text-sm font-semibold text-slate-900">{editingNhanVien.ma_nhan_vien}</span>
            </div>
          )}

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thông tin cá nhân</legend>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ho_ten">Họ và tên <span className="text-red-500">*</span></Label>
                <Input id="ho_ten" required value={formData.ho_ten} onChange={(e) => update("ho_ten", e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gioi_tinh">Giới tính <span className="text-red-500">*</span></Label>
                <Select value={formData.gioi_tinh} onValueChange={(v) => update("gioi_tinh", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="ngay_sinh" className="mb-1">Ngày sinh <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.ngay_sinh && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.ngay_sinh ? format(new Date(formData.ngay_sinh), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.ngay_sinh ? new Date(formData.ngay_sinh) : undefined}
                      onSelect={(date) => update("ngay_sinh", date ? format(date, "yyyy-MM-dd") : "")}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
                <Input id="so_dien_thoai" value={formData.so_dien_thoai} onChange={(e) => update("so_dien_thoai", e.target.value)} placeholder="0912 345 678" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="ten@thanglong.edu.vn" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">Công tác</legend>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="loai_nhan_vien">Loại nhân viên <span className="text-red-500">*</span></Label>
                <Select value={formData.loai_nhan_vien} onValueChange={(v) => update("loai_nhan_vien", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="giao_vien">Giáo viên</SelectItem>
                    <SelectItem value="nhan_vien">Nhân viên</SelectItem>
                    <SelectItem value="can_bo">Cán bộ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trang_thai">Trạng thái <span className="text-red-500">*</span></Label>
                <Select value={formData.trang_thai} onValueChange={(v) => update("trang_thai", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dang_lam">Đang làm</SelectItem>
                    <SelectItem value="nghi_viec">Nghỉ việc</SelectItem>
                    <SelectItem value="nghi_huu">Nghỉ hưu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
