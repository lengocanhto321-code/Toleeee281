"use client"

import { useState } from "react"
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
import { Play } from "lucide-react"
import { chayLuongSchema } from "@/schemas/luong.schema"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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
            <Play className="h-5 w-5 text-indigo-600" />
            Chạy lương tháng
          </DialogTitle>
          <DialogDescription>
            Tính toán và tạo phiếu lương cho tất cả nhân viên trong tháng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-sm">
              Đảm bảo đã cập nhật chấm công và cấu hình lương trước khi chạy.
            </AlertDescription>
          </Alert>

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
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? "Đang chạy..." : "Chạy lương"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
