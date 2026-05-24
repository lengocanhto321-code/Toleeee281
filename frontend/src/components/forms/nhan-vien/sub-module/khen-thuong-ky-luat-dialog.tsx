"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateKhenThuongKyLuat } from "@/hooks/nhan-vien/use-sub-modules"

const HINH_THUC_KHEN_THUONG = [
  { value: "bằng khen", label: "Bằng khen" },
  { value: "giấy khen", label: "Giấy khen" },
  { value: "huy chương", label: "Huy chương" },
  { value: "danh hiệu", label: "Danh hiệu" },
  { value: "thưởng tiền", label: "Thưởng tiền" },
  { value: "khen khác", label: "Khác" },
]

const HINH_THUC_KY_LUAT = [
  { value: "khiển trách", label: "Khiển trách" },
  { value: "cảnh cáo", label: "Cảnh cáo" },
  { value: "giáng chức", label: "Giáng chức" },
  { value: "sa thải", label: "Sa thải" },
  { value: "kỷ luật khác", label: "Khác" },
]

const CAP_QUYET_DINH_OPTIONS = [
  { value: "hiệu trưởng", label: "Hiệu trưởng" },
  { value: "phòng giáo dục", label: "Phòng GD&ĐT" },
  { value: "sở giáo dục", label: "Sở GD&ĐT" },
  { value: "ubnd quận", label: "UBND Quận/Huyện" },
  { value: "ubnd tỉnh", label: "UBND Tỉnh/Thành" },
  { value: "khác", label: "Khác" },
]

const khenThuongKyLuatSchema = z.object({
  loai: z.enum(["khen_thuong", "ky_luat"]),
  hinh_thuc: z.string().min(1, "Vui lòng chọn hình thức"),
  ly_do: z.string().min(2, "Lý do phải có ít nhất 2 ký tự").max(500, "Lý do tối đa 500 ký tự"),
  ngay_quyet_dinh: z.string().min(1, "Vui lòng chọn ngày quyết định"),
  so_quyet_dinh: z.string().max(50, "Số quyết định tối đa 50 ký tự").optional(),
  cap_quyet_dinh: z.string().optional(),
  gia_tri_thuong: z.string()
    .refine((v) => !v || /^\d+$/.test(v), "Giá trị thưởng phải là số")
    .refine((v) => !v || parseInt(v) > 0, "Giá trị thưởng phải lớn hơn 0")
    .optional(),
  thoi_han_ky_luat: z.string().optional(),
  ghi_chu: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
})

type KhenThuongKyLuatFormData = z.infer<typeof khenThuongKyLuatSchema>

interface KhenThuongKyLuatDialogProps {
  nhanVienId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultLoai?: string
}

export function KhenThuongKyLuatDialog({ nhanVienId, open, onOpenChange, defaultLoai = "khen_thuong" }: KhenThuongKyLuatDialogProps) {
  const createMutation = useCreateKhenThuongKyLuat(nhanVienId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<KhenThuongKyLuatFormData>({
    mode: "onChange",
    defaultValues: {
      loai: defaultLoai as "khen_thuong" | "ky_luat",
      hinh_thuc: "",
      ly_do: "",
      ngay_quyet_dinh: "",
      so_quyet_dinh: "",
      cap_quyet_dinh: "",
      gia_tri_thuong: "",
      thoi_han_ky_luat: "",
      ghi_chu: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        loai: defaultLoai as "khen_thuong" | "ky_luat",
        hinh_thuc: "",
        ly_do: "",
        ngay_quyet_dinh: "",
        so_quyet_dinh: "",
        cap_quyet_dinh: "",
        gia_tri_thuong: "",
        thoi_han_ky_luat: "",
        ghi_chu: "",
      })
    }
  }, [open, defaultLoai, reset])

  const loai = watch("loai")
  const hinhThuc = watch("hinh_thuc")
  const capQuyetDinh = watch("cap_quyet_dinh")
  const isKhenThuong = loai === "khen_thuong"
  const hinhThucOptions = isKhenThuong ? HINH_THUC_KHEN_THUONG : HINH_THUC_KY_LUAT

  const onSubmit = (data: KhenThuongKyLuatFormData) => {
    const payload: Record<string, unknown> = {
      loai: data.loai,
      hinh_thuc: data.hinh_thuc,
      ly_do: data.ly_do,
      ngay_quyet_dinh: data.ngay_quyet_dinh,
      so_quyet_dinh: data.so_quyet_dinh || undefined,
      cap_quyet_dinh: data.cap_quyet_dinh || undefined,
      ghi_chu: data.ghi_chu || undefined,
    }

    if (isKhenThuong && data.gia_tri_thuong) {
      payload.gia_tri_thuong = parseInt(data.gia_tri_thuong)
    }
    if (!isKhenThuong && data.thoi_han_ky_luat) {
      payload.thoi_han_ky_luat = data.thoi_han_ky_luat
    }

    createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isKhenThuong ? "Thêm khen thưởng" : "Thêm kỷ luật"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại <span className="text-red-500">*</span></Label>
              <Select value={loai} onValueChange={(v) => {
                setValue("loai", v as "khen_thuong" | "ky_luat", { shouldValidate: true })
                setValue("hinh_thuc", "", { shouldValidate: true })
              }}>
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
              <Label htmlFor="ngay_quyet_dinh">Ngày quyết định <span className="text-red-500">*</span></Label>
              <Input id="ngay_quyet_dinh" type="date" {...register("ngay_quyet_dinh")} />
              {errors.ngay_quyet_dinh && <p className="text-xs text-red-500">{errors.ngay_quyet_dinh.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hình thức <span className="text-red-500">*</span></Label>
            <Select value={hinhThuc || ""} onValueChange={(v) => setValue("hinh_thuc", v, { shouldValidate: true })}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={isKhenThuong ? "Chọn hình thức khen thưởng" : "Chọn hình thức kỷ luật"} />
              </SelectTrigger>
              <SelectContent>
                {hinhThucOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hinh_thuc && <p className="text-xs text-red-500">{errors.hinh_thuc.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ly_do">Lý do <span className="text-red-500">*</span></Label>
            <Input id="ly_do" {...register("ly_do")} placeholder={isKhenThuong ? "Thành tích xuất sắc trong giảng dạy..." : "Vi phạm nội quy nhà trường..."} />
            {errors.ly_do && <p className="text-xs text-red-500">{errors.ly_do.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="so_quyet_dinh">Số quyết định</Label>
              <Input id="so_quyet_dinh" {...register("so_quyet_dinh")} placeholder="QĐ-001/2026" />
              {errors.so_quyet_dinh && <p className="text-xs text-red-500">{errors.so_quyet_dinh.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cấp quyết định</Label>
              <Select value={capQuyetDinh || ""} onValueChange={(v) => setValue("cap_quyet_dinh", v)}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn cấp" />
                </SelectTrigger>
                <SelectContent>
                  {CAP_QUYET_DINH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isKhenThuong ? (
            <div className="space-y-2">
              <Label htmlFor="gia_tri_thuong">Giá trị thưởng (VNĐ)</Label>
              <Input id="gia_tri_thuong" type="number" {...register("gia_tri_thuong")} placeholder="5000000" />
              {errors.gia_tri_thuong && <p className="text-xs text-red-500">{errors.gia_tri_thuong.message}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="thoi_han_ky_luat">Thời hạn kỷ luật</Label>
              <Input id="thoi_han_ky_luat" type="date" {...register("thoi_han_ky_luat")} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
            <Button type="submit" disabled={createMutation.isPending || !isValid} className="cursor-pointer">
              {createMutation.isPending ? "Đang lưu..." : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
