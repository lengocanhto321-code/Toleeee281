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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { HopDong, HopDongFormData, LoaiHopDong } from "@/types/hop-dong.types"
import { LOAI_HOP_DONG_LABELS } from "@/types/hop-dong.types"
import { apiGateway } from "@/lib/axios"

const HINH_THUC_TUYEN_DUNG_OPTIONS = [
  { value: "thi_tuyen", label: "Thi tuyển" },
  { value: "xet_tuyen", label: "Xét tuyển" },
  { value: "bo_nhiem", label: "Bổ nhiệm" },
  { value: "chuyen_cong_tac", label: "Chuyển công tác" },
  { value: "tuyen_dung_khac", label: "Khác" },
]

const hopDongSchema = z.object({
  so_hop_dong: z.string().min(1, "Vui lòng nhập số hợp đồng").max(50, "Số hợp đồng tối đa 50 ký tự"),
  loai_hop_dong: z.string().min(1, "Vui lòng chọn loại hợp đồng"),
  ngay_ky: z.string().optional(),
  ngay_bat_dau: z.string().optional(),
  ngay_ket_thuc: z.string().optional(),
  hinh_thuc_tuyen_dung: z.string().optional(),
  noi_ky_hop_dong: z.string().max(200, "Nơi ký tối đa 200 ký tự").optional(),
  luong_co_ban: z.string()
    .refine((v) => !v || /^\d+$/.test(v), "Lương cơ bản phải là số")
    .refine((v) => !v || parseInt(v) >= 0, "Lương cơ bản phải lớn hơn hoặc bằng 0")
    .optional(),
  ghi_chu: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
})

type HopDongFormValues = z.infer<typeof hopDongSchema>

interface HopDongFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingHopDong: HopDong | null
  isPending: boolean
  onSubmit: (data: HopDongFormData, editId?: string) => void
  hasActiveContract?: boolean
}

export function HopDongFormDialog({
  open,
  onOpenChange,
  editingHopDong,
  isPending,
  onSubmit,
  hasActiveContract = false,
}: HopDongFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<HopDongFormValues>({
    mode: "onChange",
    defaultValues: {
      so_hop_dong: "",
      loai_hop_dong: "vien_chuc",
      ngay_ky: "",
      ngay_bat_dau: "",
      ngay_ket_thuc: "",
      hinh_thuc_tuyen_dung: "",
      noi_ky_hop_dong: "",
      luong_co_ban: "",
      ghi_chu: "",
    },
  })

  const loaiHopDong = watch("loai_hop_dong")
  const hinhThucTuyenDung = watch("hinh_thuc_tuyen_dung")

  useEffect(() => {
    if (!open) return
    if (editingHopDong) {
      reset({
        so_hop_dong: editingHopDong.so_hop_dong,
        loai_hop_dong: editingHopDong.loai_hop_dong as LoaiHopDong,
        ngay_ky: editingHopDong.ngay_ky?.split("T")[0] || "",
        ngay_bat_dau: editingHopDong.ngay_bat_dau?.split("T")[0] || "",
        ngay_ket_thuc: editingHopDong.ngay_ket_thuc?.split("T")[0] || "",
        hinh_thuc_tuyen_dung: editingHopDong.hinh_thuc_tuyen_dung || "",
        noi_ky_hop_dong: editingHopDong.noi_ky_hop_dong || "",
        luong_co_ban: editingHopDong.luong_co_ban || "",
        ghi_chu: editingHopDong.ghi_chu || "",
      })
    } else {
      apiGateway.get<{ so_hop_dong: string }>("/api/v1/admin/nhan-vien/hop-dong/generate-so")
        .then((res) => {
          reset({
            so_hop_dong: res.so_hop_dong || "",
            loai_hop_dong: "vien_chuc",
            ngay_ky: "",
            ngay_bat_dau: "",
            ngay_ket_thuc: "",
            hinh_thuc_tuyen_dung: "",
            noi_ky_hop_dong: "",
            luong_co_ban: "",
            ghi_chu: "",
          })
        })
        .catch(() => {
          reset({
            so_hop_dong: "",
            loai_hop_dong: "vien_chuc",
            ngay_ky: "",
            ngay_bat_dau: "",
            ngay_ket_thuc: "",
            hinh_thuc_tuyen_dung: "",
            noi_ky_hop_dong: "",
            luong_co_ban: "",
            ghi_chu: "",
          })
        })
    }
  }, [editingHopDong, open, reset])

  const onSubmitForm = (data: HopDongFormValues) => {
    const payload: HopDongFormData = {
      so_hop_dong: data.so_hop_dong,
      loai_hop_dong: data.loai_hop_dong as LoaiHopDong,
      ngay_ky: data.ngay_ky || undefined,
      ngay_bat_dau: data.ngay_bat_dau || undefined,
      ngay_ket_thuc: data.ngay_ket_thuc || undefined,
      hinh_thuc_tuyen_dung: data.hinh_thuc_tuyen_dung || undefined,
      noi_ky_hop_dong: data.noi_ky_hop_dong || undefined,
      luong_co_ban: data.luong_co_ban || undefined,
      ghi_chu: data.ghi_chu || undefined,
    }
    onSubmit(payload, editingHopDong?.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHopDong ? "Cập nhật hợp đồng" : "Thêm hợp đồng mới"}
          </DialogTitle>
          <DialogDescription>
            {editingHopDong
              ? "Cập nhật thông tin hợp đồng"
              : hasActiveContract
              ? "Hợp đồng mới sẽ thay thế hợp đồng đang hiệu lực. Hợp đồng cũ sẽ tự động chuyển sang trạng thái \"Đã hết hạn\"."
              : "Nhập thông tin để thêm hợp đồng mới"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="so_hop_dong">
                Số hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="so_hop_dong"
                {...register("so_hop_dong")}
                placeholder="HC-2026-001"
              />
              {errors.so_hop_dong && <p className="text-xs text-red-500">{errors.so_hop_dong.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Loại hợp đồng <span className="text-red-500">*</span></Label>
              <Select
                value={loaiHopDong}
                onValueChange={(value) => setValue("loai_hop_dong", value, { shouldValidate: true })}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn loại hợp đồng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOAI_HOP_DONG_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="cursor-pointer">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loai_hop_dong && <p className="text-xs text-red-500">{errors.loai_hop_dong.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngay_ky">Ngày ký</Label>
                <Input id="ngay_ky" type="date" {...register("ngay_ky")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ngay_bat_dau">Ngày bắt đầu</Label>
                <Input id="ngay_bat_dau" type="date" {...register("ngay_bat_dau")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngay_ket_thuc">Ngày kết thúc</Label>
              <Input id="ngay_ket_thuc" type="date" {...register("ngay_ket_thuc")} />
            </div>
            <div className="space-y-2">
              <Label>Lương cơ bản</Label>
              <Input
                type="number"
                {...register("luong_co_ban")}
                placeholder="5000000"
              />
              {errors.luong_co_ban && <p className="text-xs text-red-500">{errors.luong_co_ban.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hình thức tuyển dụng</Label>
              <Select
                value={hinhThucTuyenDung || ""}
                onValueChange={(v) => setValue("hinh_thuc_tuyen_dung", v)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  {HINH_THUC_TUYEN_DUNG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="noi_ky_hop_dong">Nơi ký hợp đồng</Label>
              <Input
                id="noi_ky_hop_dong"
                {...register("noi_ky_hop_dong")}
                placeholder="Hà Nội"
              />
              {errors.noi_ky_hop_dong && <p className="text-xs text-red-500">{errors.noi_ky_hop_dong.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ghi_chu">Ghi chú</Label>
              <Input
                id="ghi_chu"
                {...register("ghi_chu")}
                placeholder="Ghi chú thêm..."
              />
              {errors.ghi_chu && <p className="text-xs text-red-500">{errors.ghi_chu.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !isValid} className="cursor-pointer">
              {editingHopDong ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
