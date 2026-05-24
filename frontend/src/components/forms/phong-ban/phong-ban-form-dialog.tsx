"use client"

import React, { useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Building2, Landmark, Hash, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { PhongBan, PhongBanFormData } from "@/types/phong-ban.types"
import { usePhongBanAll } from "@/hooks/phong-ban/use-phong-ban-query"
import { Combobox } from "@/components/ui/combobox"

const INITIAL_FORM: PhongBanFormData = {
  ten_phong_ban: "",
  loai: "chuyen_mon",
  trang_thai: true,
  cha_id: "",
}

interface PhongBanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPhongBan: PhongBan | null
  isPending: boolean
  onSubmit: (data: PhongBanFormData, editId?: string) => void
}

export function PhongBanFormDialog({
  open,
  onOpenChange,
  editingPhongBan,
  isPending,
  onSubmit,
}: PhongBanFormDialogProps) {
  const [formData, setFormData] = useState<PhongBanFormData>(INITIAL_FORM)
  const { data: allPhongBans } = usePhongBanAll()

  useEffect(() => {
    if (editingPhongBan) {
      setFormData({
        ma_phong_ban: editingPhongBan.ma_phong_ban,
        ten_phong_ban: editingPhongBan.ten_phong_ban,
        loai: editingPhongBan.loai,
        trang_thai: editingPhongBan.trang_thai,
        cha_id: editingPhongBan.cha_id || "",
      })
    } else {
      setFormData(INITIAL_FORM)
    }
  }, [editingPhongBan, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, editingPhongBan?.id)
  }

  const isChuyenMon = formData.loai === "chuyen_mon"

  const parentOptions = allPhongBans
    ?.filter(pb => pb.id !== editingPhongBan?.id)
    .map((pb) => ({
      value: pb.id,
      label: pb.ten_phong_ban,
      description: pb.loai === "chuyen_mon" ? "Tổ chuyên môn" : "Phòng hành chính",
    })) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              editingPhongBan ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
            )}>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base">
                {editingPhongBan ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingPhongBan
                  ? `${editingPhongBan.ten_phong_ban} • ${editingPhongBan.ma_phong_ban}`
                  : "Nhập thông tin để thêm phòng ban mới vào hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              {isChuyenMon ? <Landmark className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              Loại phòng ban
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, loai: "chuyen_mon" })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                  isChuyenMon
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">Tổ chuyên môn</div>
                  <div className="text-xs text-muted-foreground">Bộ môn giảng dạy</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, loai: "hanh_chinh" })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                  !isChuyenMon
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">Phòng hành chính</div>
                  <div className="text-xs text-muted-foreground">Hỗ trợ quản lý</div>
                </div>
              </button>
            </div>
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              Thông tin cơ bản
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {editingPhongBan && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mã phòng ban
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.ma_phong_ban}
                      className="pl-9 uppercase bg-muted"
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Tên phòng ban <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.ten_phong_ban}
                  onChange={(e) => setFormData({ ...formData, ten_phong_ban: e.target.value })}
                  placeholder="Tổ Toán"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phòng ban cha</label>
              <Combobox
                options={parentOptions}
                value={formData.cha_id || ""}
                onChange={(value) => setFormData({ ...formData, cha_id: value })}
                placeholder="Chọn phòng ban cha..."
                emptyMessage="Không có phòng ban phù hợp"
                searchPlaceholder="Tìm phòng ban..."
              />
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-slate-700">Trạng thái hoạt động</label>
              <p className="text-xs text-muted-foreground">
                {formData.trang_thai ? "Phòng ban đang hoạt động" : "Phòng ban không hoạt động"}
              </p>
            </div>
            <Switch
              checked={formData.trang_thai}
              onCheckedChange={(checked) => setFormData({ ...formData, trang_thai: checked })}
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending || !formData.ten_phong_ban} className="cursor-pointer">
              {editingPhongBan ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
