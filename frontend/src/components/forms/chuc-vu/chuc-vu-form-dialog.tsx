"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select"
import { ChucVu, ChucVuFormData } from "@/types/chuc-vu.types"

const LOAI_CHUC_VU_OPTIONS = [
  { value: "quan_ly", label: "Quản lý" },
  { value: "giao_vien", label: "Giáo viên" },
  { value: "nhan_vien", label: "Nhân viên" },
]

const chucVuSchema = z.object({
  ten_chuc_vu: z.string().min(2, "Tên chức vụ phải có ít nhất 2 ký tự").max(100, "Tên chức vụ tối đa 100 ký tự"),
  loai: z.enum(["quan_ly", "giao_vien", "nhan_vien"], { message: "Vui lòng chọn loại chức vụ" }),
  cap_bac: z.string()
    .refine((v) => /^\d+$/.test(v), "Cấp bậc phải là số nguyên")
    .refine((v) => parseInt(v) >= 1 && parseInt(v) <= 10, "Cấp bậc phải từ 1 đến 10"),
  he_so_phu_cap: z.string()
    .refine((v) => /^\d+(\.\d+)?$/.test(v), "Hệ số phụ cấp phải là số")
    .refine((v) => parseFloat(v) >= 0 && parseFloat(v) <= 10, "Hệ số phụ cấp phải từ 0 đến 10"),
  mo_ta: z.string().max(500, "Mô tả tối đa 500 ký tự"),
  tieu_chuan: z.string().max(1000, "Tiêu chuẩn tối đa 1000 ký tự"),
  trang_thai: z.boolean(),
})

type ChucVuFormValues = z.infer<typeof chucVuSchema>

interface ChucVuFormDialogProps {
      open: boolean
      onOpenChange: (open: boolean) => void
      editingChucVu: ChucVu | null
      isPending: boolean
      onSubmit: (data: ChucVuFormData, editId?: string) => void
}

export function ChucVuFormDialog({
      open,
      onOpenChange,
      editingChucVu,
      isPending,
      onSubmit,
}: ChucVuFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ChucVuFormValues>({
    mode: "onChange",
    defaultValues: {
      ten_chuc_vu: "",
      loai: "nhan_vien",
      cap_bac: "1",
      he_so_phu_cap: "0",
      mo_ta: "",
      tieu_chuan: "",
      trang_thai: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (editingChucVu) {
        reset({
          ten_chuc_vu: editingChucVu.ten_chuc_vu,
          loai: editingChucVu.loai,
          cap_bac: editingChucVu.cap_bac.toString(),
          he_so_phu_cap: editingChucVu.he_so_phu_cap.toString(),
          mo_ta: editingChucVu.mo_ta || "",
          tieu_chuan: editingChucVu.tieu_chuan || "",
          trang_thai: editingChucVu.trang_thai,
        })
      } else {
        reset({
          ten_chuc_vu: "",
          loai: "nhan_vien",
          cap_bac: "1",
          he_so_phu_cap: "0",
          mo_ta: "",
          tieu_chuan: "",
          trang_thai: true,
        })
      }
    }
  }, [editingChucVu, open, reset])

  const loai = watch("loai")
  const capBac = watch("cap_bac")
  const trangThai = watch("trang_thai")

  const onSubmitForm = (data: ChucVuFormValues) => {
    const payload: ChucVuFormData = {
      ma_chuc_vu: editingChucVu?.ma_chuc_vu,
      ten_chuc_vu: data.ten_chuc_vu,
      loai: data.loai,
      cap_bac: parseInt(data.cap_bac),
      he_so_phu_cap: parseFloat(data.he_so_phu_cap),
      mo_ta: data.mo_ta,
      tieu_chuan: data.tieu_chuan,
      trang_thai: data.trang_thai,
    }
    onSubmit(payload, editingChucVu?.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingChucVu ? "Cập nhật chức vụ" : "Thêm chức vụ mới"}</DialogTitle>
          <DialogDescription>
            {editingChucVu ? "Cập nhật thông tin chức vụ" : "Nhập thông tin để thêm chức vụ mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-4 py-4">
            {editingChucVu && (
              <div className="space-y-2">
                <Label htmlFor="ma_chuc_vu">Mã chức vụ</Label>
                <Input
                  id="ma_chuc_vu"
                  value={editingChucVu.ma_chuc_vu}
                  className="bg-muted"
                  readOnly
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="ten_chuc_vu">Tên chức vụ <span className="text-red-500">*</span></Label>
              <Input
                id="ten_chuc_vu"
                {...register("ten_chuc_vu")}
                placeholder="Hiệu trưởng"
              />
              {errors.ten_chuc_vu && <p className="text-xs text-red-500">{errors.ten_chuc_vu.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Loại chức vụ <span className="text-red-500">*</span></Label>
              <Select value={loai} onValueChange={(v) => setValue("loai", v as "quan_ly" | "giao_vien" | "nhan_vien", { shouldValidate: true })}>
                <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  {LOAI_CHUC_VU_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loai && <p className="text-xs text-red-500">{errors.loai.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cấp bậc <span className="text-red-500">*</span></Label>
                <Select value={capBac} onValueChange={(v) => setValue("cap_bac", v, { shouldValidate: true })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <SelectItem key={level} value={level.toString()} className="cursor-pointer">
                        Cấp {level}{level === 1 ? " (Thấp nhất)" : level === 10 ? " (Cao nhất)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cap_bac && <p className="text-xs text-red-500">{errors.cap_bac.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="he_so_phu_cap">Hệ số phụ cấp <span className="text-red-500">*</span></Label>
                <Input
                  id="he_so_phu_cap"
                  type="number"
                  step="0.01"
                  {...register("he_so_phu_cap")}
                />
                {errors.he_so_phu_cap && <p className="text-xs text-red-500">{errors.he_so_phu_cap.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mo_ta">Mô tả</Label>
              <Textarea
                id="mo_ta"
                {...register("mo_ta")}
                placeholder="Mô tả chức vụ..."
                rows={3}
              />
              {errors.mo_ta && <p className="text-xs text-red-500">{errors.mo_ta.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tieu_chuan">Tiêu chuẩn</Label>
              <Textarea
                id="tieu_chuan"
                {...register("tieu_chuan")}
                placeholder="Tiêu chuẩn bổ nhiệm..."
                rows={3}
              />
              {errors.tieu_chuan && <p className="text-xs text-red-500">{errors.tieu_chuan.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trang_thai"
                checked={trangThai}
                onCheckedChange={(checked) => setValue("trang_thai", checked === true)}
              />
              <Label htmlFor="trang_thai" className="cursor-pointer">Đang hoạt động</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
            <Button type="submit" disabled={isPending || !isValid} className="cursor-pointer">
              {editingChucVu ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
