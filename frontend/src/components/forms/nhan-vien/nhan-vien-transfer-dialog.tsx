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
import { usePhongBanAll } from "@/hooks/phong-ban/use-phong-ban-query"
import { useChucVuList, LOAI_MAPPING } from "@/hooks/chuc-vu/use-chuc-vu-query"
import type { NhanVien } from "@/types/nhan-vien.types"

const transferSchema = z.object({
  phong_ban_id: z.string().min(1, "Vui lòng chọn phòng ban"),
  chuc_vu_id: z.string().min(1, "Vui lòng chọn chức vụ"),
  ngay_chuyen: z.string().min(1, "Vui lòng chọn ngày điều chuyển"),
  ly_do: z.string().max(500, "Lý do tối đa 500 ký tự").optional(),
})

type TransferFormData = z.infer<typeof transferSchema>

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nhanVien: NhanVien
  onTransfer: (data: { phong_ban_id: string; chuc_vu_id: string; ngay_chuyen: string; ly_do: string }) => void
  isPending?: boolean
}

export function NhanVienTransferDialog({
  open,
  onOpenChange,
  nhanVien,
  onTransfer,
  isPending,
}: TransferDialogProps) {
  const { data: allPhongBans } = usePhongBanAll()
  const { data: allChucVus } = useChucVuList()

  const filteredChucVus = allChucVus?.filter((cv) => {
    const allowedLoai = LOAI_MAPPING[nhanVien.loai_nhan_vien as keyof typeof LOAI_MAPPING]
    return allowedLoai?.includes(cv.loai)
  }) || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransferFormData>({
    mode: "onChange",
    defaultValues: {
      phong_ban_id: nhanVien.phong_ban_id || "",
      chuc_vu_id: nhanVien.chuc_vu_id || "",
      ngay_chuyen: new Date().toISOString().split("T")[0],
      ly_do: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        phong_ban_id: nhanVien.phong_ban_id || "",
        chuc_vu_id: nhanVien.chuc_vu_id || "",
        ngay_chuyen: new Date().toISOString().split("T")[0],
        ly_do: "",
      })
    }
  }, [open, nhanVien, reset])

  const phongBanId = watch("phong_ban_id")
  const chucVuId = watch("chuc_vu_id")

  const onSubmitForm = (data: TransferFormData) => {
    onTransfer({
      phong_ban_id: data.phong_ban_id,
      chuc_vu_id: data.chuc_vu_id,
      ngay_chuyen: data.ngay_chuyen,
      ly_do: data.ly_do || "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chuyển nhân viên</DialogTitle>
          <DialogDescription>
            Điều chuyển {nhanVien.ho_ten} ({nhanVien.ma_nhan_vien}) sang phòng ban/chức vụ mới
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phòng ban mới <span className="text-red-500">*</span></Label>
              <Select value={phongBanId} onValueChange={(v) => setValue("phong_ban_id", v, { shouldValidate: true })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {allPhongBans
                    ?.filter((pb) => pb.trang_thai)
                    .map((pb) => (
                      <SelectItem key={pb.id} value={pb.id} className="cursor-pointer">
                        {pb.ten_phong_ban}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.phong_ban_id && <p className="text-xs text-red-500">{errors.phong_ban_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Chức vụ mới <span className="text-red-500">*</span></Label>
              <Select value={chucVuId} onValueChange={(v) => setValue("chuc_vu_id", v, { shouldValidate: true })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {filteredChucVus
                    ?.filter((cv) => cv.trang_thai)
                    .map((cv) => (
                      <SelectItem key={cv.id} value={cv.id} className="cursor-pointer">
                        {cv.ten_chuc_vu}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.chuc_vu_id && <p className="text-xs text-red-500">{errors.chuc_vu_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngay_chuyen">Ngày điều chuyển <span className="text-red-500">*</span></Label>
              <Input
                id="ngay_chuyen"
                type="date"
                {...register("ngay_chuyen")}
              />
              {errors.ngay_chuyen && <p className="text-xs text-red-500">{errors.ngay_chuyen.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ly_do">Lý do điều chuyển</Label>
              <Input
                id="ly_do"
                {...register("ly_do")}
                placeholder="VD: Theo nhu cầu công tác"
              />
              {errors.ly_do && <p className="text-xs text-red-500">{errors.ly_do.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !isValid} className="cursor-pointer">
              {isPending ? "Đang xử lý..." : "Điều chuyển"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
