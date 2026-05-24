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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Info } from "lucide-react"
import { cauHinhLuongSchema } from "@/schemas/luong.schema"
import { format } from "date-fns"

interface CauHinhLuongDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onSubmit: (data: {
    ngay_ap_dung: string
    luong_co_so: number
    he_so_dac_thu: number
    ty_le_bhxh: number
    ty_le_bhyt: number
    ty_le_bhtn: number
    muc_giam_tru_ban_than: number
    muc_giam_tru_nguoi_phu_thuoc: number
    ghi_chu?: string
  }) => void
}

export function CauHinhLuongDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: CauHinhLuongDialogProps) {
  const today = format(new Date(), "yyyy-MM-dd")
  
  const [formData, setFormData] = useState({
    ghi_chu: "",
    ngay_ap_dung: today,
    luong_co_so: "1800000",
    he_so_dac_thu: "1.15",
    ty_le_bhxh: "8",
    ty_le_bhyt: "1.5",
    ty_le_bhtn: "1",
    muc_giam_tru_ban_than: "11000000",
    muc_giam_tru_nguoi_phu_thuoc: "4400000",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const numericData = {
      ghi_chu: formData.ghi_chu,
      ngay_ap_dung: formData.ngay_ap_dung,
      luong_co_so: parseFloat(formData.luong_co_so) || 0,
      he_so_dac_thu: parseFloat(formData.he_so_dac_thu) || 0,
      ty_le_bhxh: parseFloat(formData.ty_le_bhxh) || 0,
      ty_le_bhyt: parseFloat(formData.ty_le_bhyt) || 0,
      ty_le_bhtn: parseFloat(formData.ty_le_bhtn) || 0,
      muc_giam_tru_ban_than: parseFloat(formData.muc_giam_tru_ban_than) || 0,
      muc_giam_tru_nguoi_phu_thuoc: parseFloat(formData.muc_giam_tru_nguoi_phu_thuoc) || 0,
    }
    
    const result = cauHinhLuongSchema.safeParse(numericData)
    
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
    onSubmit(numericData)
  }

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Cấu hình hệ thống lương
          </DialogTitle>
          <DialogDescription>
            Thiết lập các thông số lương, bảo hiểm và khấu trừ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thông tin cơ bản */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thông tin cơ bản
            </legend>
            <Separator />
            
            <div className="space-y-1.5">
              <Label htmlFor="ghi_chu">Ghi chú</Label>
              <Input
                id="ghi_chu"
                value={formData.ghi_chu}
                onChange={(e) => update("ghi_chu", e.target.value)}
                placeholder="VD: Cấu hình 2026"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ngay_ap_dung">Ngày áp dụng</Label>
              <Input
                id="ngay_ap_dung"
                type="date"
                value={formData.ngay_ap_dung}
                onChange={(e) => update("ngay_ap_dung", e.target.value)}
                className={errors.ngay_ap_dung ? "border-red-500" : ""}
              />
              {errors.ngay_ap_dung && (
                <p className="text-xs text-red-500">{errors.ngay_ap_dung}</p>
              )}
            </div>
          </fieldset>

          {/* Lương */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lương
            </legend>
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="luong_co_so">Lương cơ sở (VNĐ)</Label>
                <Input
                  id="luong_co_so"
                  type="number"
                  value={formData.luong_co_so}
                  onChange={(e) => update("luong_co_so", e.target.value)}
                  className={errors.luong_co_so ? "border-red-500" : ""}
                />
                {errors.luong_co_so && (
                  <p className="text-xs text-red-500">{errors.luong_co_so}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="he_so_dac_thu">Hệ số đặc thù</Label>
                <Input
                  id="he_so_dac_thu"
                  type="number"
                  step="0.01"
                  value={formData.he_so_dac_thu}
                  onChange={(e) => update("he_so_dac_thu", e.target.value)}
                  className={errors.he_so_dac_thu ? "border-red-500" : ""}
                />
                {errors.he_so_dac_thu && (
                  <p className="text-xs text-red-500">{errors.he_so_dac_thu}</p>
                )}
              </div>
            </div>

            <Alert variant="info" className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                Từ 01/01/2026, giáo viên được áp dụng hệ số đặc thù 1.15 theo Luật Nhà giáo 2025.
              </AlertDescription>
            </Alert>
          </fieldset>

          {/* Bảo hiểm */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tỷ lệ bảo hiểm (%)
            </legend>
            <Separator />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ty_le_bhxh">BHXH</Label>
                <Input
                  id="ty_le_bhxh"
                  type="number"
                  step="0.1"
                  value={formData.ty_le_bhxh}
                  onChange={(e) => update("ty_le_bhxh", e.target.value)}
                  className={errors.ty_le_bhxh ? "border-red-500" : ""}
                />
                {errors.ty_le_bhxh && (
                  <p className="text-xs text-red-500">{errors.ty_le_bhxh}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ty_le_bhyt">BHYT</Label>
                <Input
                  id="ty_le_bhyt"
                  type="number"
                  step="0.1"
                  value={formData.ty_le_bhyt}
                  onChange={(e) => update("ty_le_bhyt", e.target.value)}
                  className={errors.ty_le_bhyt ? "border-red-500" : ""}
                />
                {errors.ty_le_bhyt && (
                  <p className="text-xs text-red-500">{errors.ty_le_bhyt}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ty_le_bhtn">BHTN</Label>
                <Input
                  id="ty_le_bhtn"
                  type="number"
                  step="0.1"
                  value={formData.ty_le_bhtn}
                  onChange={(e) => update("ty_le_bhtn", e.target.value)}
                  className={errors.ty_le_bhtn ? "border-red-500" : ""}
                />
                {errors.ty_le_bhtn && (
                  <p className="text-xs text-red-500">{errors.ty_le_bhtn}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Giảm trừ thuế */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Giảm trừ thuế TNCN (VNĐ)
            </legend>
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="muc_giam_tru_ban_than">Giảm trừ bản thân</Label>
                <Input
                  id="muc_giam_tru_ban_than"
                  type="number"
                  value={formData.muc_giam_tru_ban_than}
                  onChange={(e) => update("muc_giam_tru_ban_than", e.target.value)}
                  className={errors.muc_giam_tru_ban_than ? "border-red-500" : ""}
                />
                {errors.muc_giam_tru_ban_than && (
                  <p className="text-xs text-red-500">{errors.muc_giam_tru_ban_than}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="muc_giam_tru_nguoi_phu_thuoc">Người phụ thuộc</Label>
                <Input
                  id="muc_giam_tru_nguoi_phu_thuoc"
                  type="number"
                  value={formData.muc_giam_tru_nguoi_phu_thuoc}
                  onChange={(e) => update("muc_giam_tru_nguoi_phu_thuoc", e.target.value)}
                  className={errors.muc_giam_tru_nguoi_phu_thuoc ? "border-red-500" : ""}
                />
                {errors.muc_giam_tru_nguoi_phu_thuoc && (
                  <p className="text-xs text-red-500">{errors.muc_giam_tru_nguoi_phu_thuoc}</p>
                )}
              </div>
            </div>
          </fieldset>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
