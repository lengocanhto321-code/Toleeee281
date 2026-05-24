"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, AlertTriangle, RefreshCw } from "lucide-react"
import { chayLuongSchema } from "@/schemas/luong.schema"
import { useKyLuongExists } from "@/hooks/luong/use-luong-query"

interface ChayLuongDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onSubmit: (data: { thang: number; nam: number }) => void
}

export function ChayLuongDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: ChayLuongDialogProps) {
  const currentDate = new Date()
  const [thang, setThang] = useState(currentDate.getMonth() + 1)
  const [nam, setNam] = useState(currentDate.getFullYear())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmRecalculate, setConfirmRecalculate] = useState(false)

  const { data: existingKyLuong } = useKyLuongExists(thang, nam, open)
  const isRecalculate = !!existingKyLuong && existingKyLuong.trang_thai !== "da_chot"
  const isLocked = !!existingKyLuong && existingKyLuong.trang_thai === "da_chot"

  useEffect(() => {
    setConfirmRecalculate(false)
  }, [thang, nam])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isRecalculate && !confirmRecalculate) {
      setConfirmRecalculate(true)
      return
    }

    const result = chayLuongSchema.safeParse({ thang, nam })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onSubmit({ thang, nam })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRecalculate ? (
              <RefreshCw className="h-5 w-5 text-amber-600" />
            ) : (
              <Play className="h-5 w-5 text-blue-600" />
            )}
            {isRecalculate ? "Tính lại lương" : "Chạy lương tháng"}
          </DialogTitle>
          <DialogDescription>
            {isRecalculate
              ? "Kỳ lương này đã được chạy. Dữ liệu cũ sẽ bị ghi đè."
              : "Tính toán và tạo phiếu lương cho tất cả nhân viên trong tháng."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLocked && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Kỳ lương tháng {thang}/{nam} đã chốt. Không thể tính lại.
              </AlertDescription>
            </Alert>
          )}

          {isRecalculate && !isLocked && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Kỳ lương tháng {thang}/{nam} đã chạy lúc{" "}
                {existingKyLuong?.ngay_chay
                  ? new Date(existingKyLuong.ngay_chay).toLocaleString("vi-VN")
                  : "trước đó"}
                . Tính lại sẽ ghi đè toàn bộ dữ liệu cũ.
              </AlertDescription>
            </Alert>
          )}

          {!isLocked && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800 text-sm">
                Đảm bảo đã cập nhật chấm công và cấu hình lương trước khi chạy.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="thang">Tháng</Label>
              <Select
                value={String(thang)}
                onValueChange={(v) => {
                  setThang(parseInt(v))
                  setErrors((prev) => ({ ...prev, thang: "" }))
                }}
              >
                <SelectTrigger id="thang" className={errors.thang ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.thang && (
                <p className="text-xs text-red-500">{errors.thang}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nam">Năm</Label>
              <Select
                value={String(nam)}
                onValueChange={(v) => {
                  setNam(parseInt(v))
                  setErrors((prev) => ({ ...prev, nam: "" }))
                }}
              >
                <SelectTrigger id="nam" className={errors.nam ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nam && (
                <p className="text-xs text-red-500">{errors.nam}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-600">
              Kỳ lương: <span className="font-semibold text-slate-900">Tháng {thang}/{nam}</span>
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            {isLocked ? (
              <Button type="button" disabled className="opacity-50 cursor-not-allowed">
                Đã chốt
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className={
                  isRecalculate
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              >
                {isPending ? (
                  "Đang chạy..."
                ) : confirmRecalculate ? (
                  "Xác nhận tính lại"
                ) : isRecalculate ? (
                  "Tính lại"
                ) : (
                  "Chạy lương"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
