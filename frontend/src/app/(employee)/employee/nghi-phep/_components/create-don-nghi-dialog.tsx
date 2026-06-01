"use client"

import { useState, useMemo, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { LoaiNghi } from "@/types/nghi-phep.types"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const loaiNghiValues = ["phep_nam", "nghi_om", "viec_rieng", "cong_tac", "ket_hon", "mai_tang", "thai_san"] as const

const donNghiSchema = z.object({
  loai_nghi: z.enum(loaiNghiValues, { message: "Vui lòng chọn loại nghỉ phép" }),
  tu_ngay: z.date({ message: "Vui lòng chọn ngày bắt đầu" }),
  den_ngay: z.date({ message: "Vui lòng chọn ngày kết thúc" }),
  ly_do: z.string().max(500, "Lý do không quá 500 ký tự"),
}).refine((data) => data.den_ngay >= data.tu_ngay, {
  message: "Ngày kết thúc phải từ ngày bắt đầu trở đi",
  path: ["den_ngay"],
})

type DonNghiFormValues = z.infer<typeof donNghiSchema>

const LOAI_NGHI_OPTIONS: { value: LoaiNghi; label: string }[] = [
  { value: "phep_nam", label: "Phép năm" },
  { value: "nghi_om", label: "Nghỉ ốm" },
  { value: "viec_rieng", label: "Việc riêng" },
  { value: "cong_tac", label: "Công tác" },
  { value: "ket_hon", label: "Kết hôn" },
  { value: "mai_tang", label: "Ma táng" },
  { value: "thai_san", label: "Thai sản" },
]

interface CreateEmployeeDonNghiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
  }) => void
  isPending?: boolean
  nhanVienId: string
  hoTen: string
}

export function CreateEmployeeDonNghiDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  nhanVienId,
  hoTen,
}: CreateEmployeeDonNghiDialogProps) {
  const [tuNgayOpen, setTuNgayOpen] = useState(false)
  const [denNgayOpen, setDenNgayOpen] = useState(false)

  const { register, handleSubmit: rhfSubmit, reset, setValue, watch, formState: { errors } } = useForm<DonNghiFormValues>({
    resolver: zodResolver(donNghiSchema),
    mode: "onChange",
    defaultValues: {
      loai_nghi: "phep_nam" as LoaiNghi,
      tu_ngay: undefined as unknown as Date,
      den_ngay: undefined as unknown as Date,
      ly_do: "",
    },
  })

  const loaiNghi = watch("loai_nghi")
  const tuNgay = watch("tu_ngay")
  const denNgay = watch("den_ngay")

  useEffect(() => {
    if (open) {
      reset({
        loai_nghi: "phep_nam" as LoaiNghi,
        tu_ngay: undefined as unknown as Date,
        den_ngay: undefined as unknown as Date,
        ly_do: "",
      })
    }
  }, [open, reset])

  const soNgay = useMemo(() => {
    if (tuNgay && denNgay) {
      return differenceInDays(denNgay, tuNgay) + 1
    }
    return 0
  }, [tuNgay, denNgay])

  const onFormSubmit = () => {
    onSubmit({
      loai_nghi: loaiNghi,
      tu_ngay: tuNgay ? format(tuNgay, "yyyy-MM-dd") : "",
      den_ngay: denNgay ? format(denNgay, "yyyy-MM-dd") : "",
      ly_do: watch("ly_do") || undefined,
    })
    reset({
      loai_nghi: "phep_nam" as LoaiNghi,
      tu_ngay: undefined as unknown as Date,
      den_ngay: undefined as unknown as Date,
      ly_do: "",
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset({
        loai_nghi: "phep_nam" as LoaiNghi,
        tu_ngay: undefined as unknown as Date,
        den_ngay: undefined as unknown as Date,
        ly_do: "",
      })
    }
    onOpenChange(open)
  }

  const canSubmit = loaiNghi && tuNgay && denNgay && !isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
          <DialogDescription>Điền thông tin xin nghỉ phép của bạn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Loại nghỉ phép</FieldLabel>
              <Select
                value={loaiNghi}
                onValueChange={(v) => {
                  setValue("loai_nghi", v as LoaiNghi, { shouldValidate: true })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  {LOAI_NGHI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Từ ngày</FieldLabel>
                <Popover open={tuNgayOpen} onOpenChange={setTuNgayOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tuNgay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tuNgay ? format(tuNgay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tuNgay}
                      onSelect={(d) => {
                        if (d && denNgay && d > denNgay) {
                          setValue("den_ngay", d as Date, { shouldValidate: true })
                        }
                        setValue("tu_ngay", d as Date, { shouldValidate: true })
                        setTuNgayOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.tu_ngay && (
                  <p className="text-xs text-destructive mt-1">{errors.tu_ngay.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel>Đến ngày</FieldLabel>
                <Popover open={denNgayOpen} onOpenChange={setDenNgayOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !denNgay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {denNgay ? format(denNgay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={denNgay}
                      onSelect={(d) => {
                        setValue("den_ngay", d as Date, { shouldValidate: true })
                        setDenNgayOpen(false)
                      }}
                      disabled={(date) => !tuNgay || date < tuNgay}
                      fromDate={tuNgay}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.den_ngay && (
                  <p className="text-xs text-destructive mt-1">{errors.den_ngay.message}</p>
                )}
              </Field>
            </div>

            {soNgay > 0 && (
              <div className="flex items-center justify-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-sm text-blue-700">
                  Số ngày nghỉ: <strong className="text-lg">{soNgay}</strong> ngày
                </span>
              </div>
            )}

            <Field>
              <FieldLabel>Lý do (tùy chọn)</FieldLabel>
              <Textarea
                {...register("ly_do")}
                placeholder="Nhập lý do nghỉ phép..."
                rows={3}
              />
              {errors.ly_do && (
                <p className="text-xs text-destructive mt-1">{errors.ly_do.message}</p>
              )}
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={rhfSubmit(onFormSubmit)}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Đang gửi..." : "Gửi đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
