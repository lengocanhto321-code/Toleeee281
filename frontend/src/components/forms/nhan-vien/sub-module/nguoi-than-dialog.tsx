"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateNguoiThan, useUpdateNguoiThan } from "@/hooks/nhan-vien/use-sub-modules"
import type { NguoiThan } from "@/types/nhan-vien.types"

const QUAN_HE_OPTIONS = [
  { value: "Vợ", label: "Vợ" },
  { value: "Chồng", label: "Chồng" },
  { value: "Con trai", label: "Con trai" },
  { value: "Con gái", label: "Con gái" },
  { value: "Cha", label: "Cha" },
  { value: "Mẹ", label: "Mẹ" },
  { value: "Anh", label: "Anh" },
  { value: "Chị", label: "Chị" },
  { value: "Em trai", label: "Em trai" },
  { value: "Em gái", label: "Em gái" },
  { value: "Cha vợ", label: "Cha vợ" },
  { value: "Mẹ vợ", label: "Mẹ vợ" },
  { value: "Cha chồng", label: "Cha chồng" },
  { value: "Mẹ chồng", label: "Mẹ chồng" },
  { value: "Khác", label: "Khác" },
]

const currentYear = new Date().getFullYear()

const nguoiThanSchema = z.object({
  ho_ten: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100, "Họ tên tối đa 100 ký tự"),
  quan_he: z.string().min(1, "Vui lòng chọn quan hệ"),
  nam_sinh: z.string()
    .min(1, "Vui lòng nhập năm sinh")
    .refine((v) => /^\d{4}$/.test(v), "Năm sinh phải là 4 chữ số")
    .refine((v) => {
      const y = parseInt(v)
      return y >= 1900 && y <= currentYear
    }, `Năm sinh phải từ 1900 đến ${currentYear}`),
  nghe_nghiep: z.string().max(100, "Nghề nghiệp tối đa 100 ký tự").optional(),
  dia_chi: z.string()
    .max(200, "Địa chỉ tối đa 200 ký tự")
    .refine((v) => !v || /^[a-zA-ZÀ-ỹà-ỹ0-9\s,./\-()]+$/.test(v), "Địa chỉ không được chứa ký tự đặc biệt")
    .optional(),
  so_dien_thoai: z.string()
    .refine((v) => !v || /^(0[3|5|7|8|9])[0-9]{8}$/.test(v), "Số điện thoại không hợp lệ (VD: 0912345678)")
    .optional(),
  nguoi_phu_thuoc: z.boolean(),
  ghi_chu: z.string().optional(),
})

type NguoiThanFormData = z.infer<typeof nguoiThanSchema>

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<NguoiThanFormData>({
    mode: "onChange",
    defaultValues: {
      ho_ten: "",
      quan_he: "",
      nam_sinh: "",
      nghe_nghiep: "",
      dia_chi: "",
      so_dien_thoai: "",
      nguoi_phu_thuoc: false,
      ghi_chu: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        ho_ten: editingItem?.ho_ten || "",
        quan_he: editingItem?.quan_he || "",
        nam_sinh: editingItem?.nam_sinh || "",
        nghe_nghiep: editingItem?.nghe_nghiep || "",
        dia_chi: editingItem?.dia_chi || "",
        so_dien_thoai: editingItem?.so_dien_thoai || "",
        nguoi_phu_thuoc: editingItem?.nguoi_phu_thuoc || false,
        ghi_chu: "",
      })
    }
  }, [open, editingItem, reset])

  const quanHe = watch("quan_he")
  const nguoiPhuThuoc = watch("nguoi_phu_thuoc")

  const onSubmit = (data: NguoiThanFormData) => {
    const payload = {
      ...data,
      so_dien_thoai: data.so_dien_thoai || undefined,
      nghe_nghiep: data.nghe_nghiep || undefined,
      dia_chi: data.dia_chi || undefined,
      ghi_chu: data.ghi_chu || undefined,
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa người thân" : "Thêm người thân"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ho_ten">Họ tên <span className="text-red-500">*</span></Label>
              <Input
                id="ho_ten"
                {...register("ho_ten")}
                placeholder="Nguyễn Văn A"
              />
              {errors.ho_ten && <p className="text-xs text-red-500">{errors.ho_ten.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Quan hệ <span className="text-red-500">*</span></Label>
              <Select value={quanHe} onValueChange={(v) => setValue("quan_he", v, { shouldValidate: true })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {QUAN_HE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.quan_he && <p className="text-xs text-red-500">{errors.quan_he.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nam_sinh">Năm sinh <span className="text-red-500">*</span></Label>
              <Input
                id="nam_sinh"
                type="number"
                {...register("nam_sinh")}
                placeholder="1990"
                min={1900}
                max={currentYear}
              />
              {errors.nam_sinh && <p className="text-xs text-red-500">{errors.nam_sinh.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nghe_nghiep">Nghề nghiệp</Label>
              <Input
                id="nghe_nghiep"
                {...register("nghe_nghiep")}
                placeholder="Giáo viên"
              />
              {errors.nghe_nghiep && <p className="text-xs text-red-500">{errors.nghe_nghiep.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
              <Input
                id="so_dien_thoai"
                {...register("so_dien_thoai")}
                placeholder="0912345678"
              />
              {errors.so_dien_thoai && <p className="text-xs text-red-500">{errors.so_dien_thoai.message}</p>}
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="nguoi_phu_thuoc"
                  checked={nguoiPhuThuoc}
                  onCheckedChange={(checked) => setValue("nguoi_phu_thuoc", !!checked)}
                />
                <Label htmlFor="nguoi_phu_thuoc" className="cursor-pointer">Người phụ thuộc thuế</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dia_chi">Địa chỉ</Label>
            <Input
              id="dia_chi"
              {...register("dia_chi")}
              placeholder="Số 1, đường A, quận B, TP. C"
            />
            {errors.dia_chi && <p className="text-xs text-red-500">{errors.dia_chi.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
            <Button type="submit" disabled={isPending || !isValid} className="cursor-pointer">
              {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
