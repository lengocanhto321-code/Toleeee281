"use client"

import React, { useState, useEffect } from "react"
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

interface HopDongFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingHopDong: HopDong | null
  isPending: boolean
  onSubmit: (data: HopDongFormData, editId?: string) => void
}

const INITIAL_FORM: HopDongFormData = {
  so_hop_dong: "",
  loai_hop_dong: "vien_chuc",
  ngay_ky: "",
  ngay_bat_dau: "",
  ngay_ket_thuc: "",
  hinh_thuc_tuyen_dung: "",
  noi_ky_hop_dong: "",
  luong_co_ban: "",
  ghi_chu: "",
}

export function HopDongFormDialog({
  open,
  onOpenChange,
  editingHopDong,
  isPending,
  onSubmit,
}: HopDongFormDialogProps) {
  const [formData, setFormData] = useState<HopDongFormData>(INITIAL_FORM)

  useEffect(() => {
    if (editingHopDong) {
      setFormData({
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
      setFormData(INITIAL_FORM)
    }
  }, [editingHopDong, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, editingHopDong?.id)
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
              : "Nhập thông tin để thêm hợp đồng mới"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="so_hop_dong">
                Số hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="so_hop_dong"
                required
                value={formData.so_hop_dong}
                onChange={(e) =>
                  setFormData({ ...formData, so_hop_dong: e.target.value })
                }
                placeholder="HC-2026-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loai_hop_dong">
                Loại hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.loai_hop_dong}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    loai_hop_dong: value as LoaiHopDong,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOAI_HOP_DONG_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngay_ky">Ngày ký</Label>
                <Input
                  id="ngay_ky"
                  type="date"
                  value={formData.ngay_ky}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_ky: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ngay_bat_dau">Ngày bắt đầu</Label>
                <Input
                  id="ngay_bat_dau"
                  type="date"
                  value={formData.ngay_bat_dau}
                  onChange={(e) =>
                    setFormData({ ...formData, ngay_bat_dau: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngay_ket_thuc">Ngày kết thúc</Label>
              <Input
                id="ngay_ket_thuc"
                type="date"
                value={formData.ngay_ket_thuc}
                onChange={(e) =>
                  setFormData({ ...formData, ngay_ket_thuc: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="luong_co_ban">Lương cơ bản</Label>
              <Input
                id="luong_co_ban"
                type="number"
                value={formData.luong_co_ban}
                onChange={(e) =>
                  setFormData({ ...formData, luong_co_ban: e.target.value })
                }
                placeholder="5,000,000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hinh_thuc_tuyen_dung">Hình thức tuyển dụng</Label>
              <Input
                id="hinh_thuc_tuyen_dung"
                value={formData.hinh_thuc_tuyen_dung}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hinh_thuc_tuyen_dung: e.target.value,
                  })
                }
                placeholder="Thi tuyển, xét tuyển..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noi_ky_hop_dong">Nơi ký hợp đồng</Label>
              <Input
                id="noi_ky_hop_dong"
                value={formData.noi_ky_hop_dong}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    noi_ky_hop_dong: e.target.value,
                  })
                }
                placeholder="Hà Nội"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ghi_chu">Ghi chú</Label>
              <Input
                id="ghi_chu"
                value={formData.ghi_chu}
                onChange={(e) =>
                  setFormData({ ...formData, ghi_chu: e.target.value })
                }
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingHopDong ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
