"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateBangCap, useUpdateBangCap } from "@/hooks/nhan-vien/use-sub-modules"
import type { BangCap } from "@/types/nhan-vien.types"

const LOAI_BANG_CAP_OPTIONS = [
  { value: "dai_hoc", label: "Đại học" },
  { value: "cao_dang", label: "Cao đẳng" },
  { value: "trung_cap", label: "Trung cấp" },
  { value: "chung_chi", label: "Chứng chỉ" },
  { value: "thac_si", label: "Thạc sĩ" },
  { value: "tien_si", label: "Tiến sĩ" },
  { value: "bang_khac", label: "Bằng khác" },
]

const XEP_LOAI_OPTIONS = [
  { value: "xuat_sac", label: "Xuất sắc" },
  { value: "gioi", label: "Giỏi" },
  { value: "kha", label: "Khá" },
  { value: "trung_binh", label: "Trung bình" },
  { value: "dat", label: "Đạt" },
]

const currentYear = new Date().getFullYear()

const bangCapSchema = z.object({
  loai: z.string().min(1, "Vui lòng chọn loại bằng cấp"),
  ten_bang: z.string().min(2, "Tên bằng cấp phải có ít nhất 2 ký tự").max(200, "Tên bằng cấp tối đa 200 ký tự"),
  chuyen_nganh: z.string().max(100, "Chuyên ngành tối đa 100 ký tự").optional(),
  truong_cap: z.string().max(200, "Trường cấp tối đa 200 ký tự").optional(),
  nam_cap: z.string()
    .refine((v) => !v || /^\d{4}$/.test(v), "Năm cấp phải là 4 chữ số")
    .refine((v) => !v || (parseInt(v) >= 1950 && parseInt(v) <= currentYear), `Năm cấp phải từ 1950 đến ${currentYear}`)
    .optional(),
  xep_loai: z.string().optional(),
  ghi_chu: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
})

type BangCapFormData = z.infer<typeof bangCapSchema>

interface BangCapDialogProps {
  nhanVienId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem?: BangCap | null
  defaultLoai?: string
  title?: string
}

export function BangCapDialog({ nhanVienId, open, onOpenChange, editingItem, defaultLoai, title }: BangCapDialogProps) {
  const isEdit = !!editingItem
  const createMutation = useCreateBangCap(nhanVienId)
  const updateMutation = useUpdateBangCap(nhanVienId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<BangCapFormData>({
    mode: "onChange",
    defaultValues: {
      loai: "",
      ten_bang: "",
      chuyen_nganh: "",
      truong_cap: "",
      nam_cap: "",
      xep_loai: "",
      ghi_chu: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        loai: editingItem?.loai || defaultLoai || "",
        ten_bang: editingItem?.ten || "",
        chuyen_nganh: editingItem?.chuyen_nganh || "",
        truong_cap: editingItem?.truong || "",
        nam_cap: editingItem?.nam_tot_nghiep?.toString() || "",
        xep_loai: editingItem?.xep_loai || "",
        ghi_chu: "",
      })
    }
  }, [open, editingItem, defaultLoai, reset])

  const loai = watch("loai")
  const xepLoai = watch("xep_loai")

  const onSubmit = (data: BangCapFormData) => {
    const payload = {
      loai: data.loai,
      ten_bang: data.ten_bang,
      chuyen_nganh: data.chuyen_nganh || undefined,
      truong_cap: data.truong_cap || undefined,
      nam_cap: data.nam_cap ? parseInt(data.nam_cap) : undefined,
      xep_loai: data.xep_loai || undefined,
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

  const isPresetLoai = !!defaultLoai && !editingItem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title || (isEdit ? "Sửa bằng cấp" : "Thêm bằng cấp")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại bằng <span className="text-red-500">*</span></Label>
              <Select value={loai} onValueChange={(v) => setValue("loai", v, { shouldValidate: true })} disabled={isPresetLoai}>
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
              {errors.loai && <p className="text-xs text-red-500">{errors.loai.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nam_cap">Năm cấp</Label>
              <Input id="nam_cap" type="number" {...register("nam_cap")} placeholder="2020" min={1950} max={currentYear} />
              {errors.nam_cap && <p className="text-xs text-red-500">{errors.nam_cap.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ten_bang">Tên bằng / chứng chỉ <span className="text-red-500">*</span></Label>
            <Input id="ten_bang" {...register("ten_bang")} placeholder="Cử nhân Khoa học máy tính..." />
            {errors.ten_bang && <p className="text-xs text-red-500">{errors.ten_bang.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chuyen_nganh">Chuyên ngành</Label>
              <Input id="chuyen_nganh" {...register("chuyen_nganh")} placeholder="Toán học" />
              {errors.chuyen_nganh && <p className="text-xs text-red-500">{errors.chuyen_nganh.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="truong_cap">Trường cấp</Label>
              <Input id="truong_cap" {...register("truong_cap")} placeholder="ĐH Sư phạm Hà Nội" />
              {errors.truong_cap && <p className="text-xs text-red-500">{errors.truong_cap.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Xếp loại</Label>
            <Select value={xepLoai || ""} onValueChange={(v) => setValue("xep_loai", v)}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn xếp loại" />
              </SelectTrigger>
              <SelectContent>
                {XEP_LOAI_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
