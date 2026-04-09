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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select"
import { PhongBan, PhongBanFormData } from "@/types/phong-ban.types"

const INITIAL_FORM: PhongBanFormData = {
      ma_phong_ban: "",
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

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{editingPhongBan ? "Cập nhật phòng ban" : "Thêm phòng ban mới"}</DialogTitle>
                              <DialogDescription>
                                    {editingPhongBan ? "Cập nhật thông tin phòng ban" : "Nhập thông tin để thêm phòng ban mới vào hệ thống"}
                              </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="ma_phong_ban">Mã phòng ban <span className="text-red-500">*</span></Label>
                                          <Input
                                                id="ma_phong_ban"
                                                required
                                                value={formData.ma_phong_ban}
                                                onChange={(e) => setFormData({ ...formData, ma_phong_ban: e.target.value.toUpperCase() })}
                                                placeholder="PB001"
                                                className="uppercase"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="ten_phong_ban">Tên phòng ban <span className="text-red-500">*</span></Label>
                                          <Input
                                                id="ten_phong_ban"
                                                required
                                                value={formData.ten_phong_ban}
                                                onChange={(e) => setFormData({ ...formData, ten_phong_ban: e.target.value })}
                                                placeholder="Tổ Toán"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="loai">Loại phòng ban <span className="text-red-500">*</span></Label>
                                          <Select value={formData.loai} onValueChange={(value) => setFormData({ ...formData, loai: value as "chuyen_mon" | "hanh_chinh" })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="chuyen_mon">Tổ chuyên môn</SelectItem>
                                                      <SelectItem value="hanh_chinh">Phòng hành chính</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                          <Checkbox
                                                id="trang_thai"
                                                checked={formData.trang_thai}
                                                onCheckedChange={(checked) => setFormData({ ...formData, trang_thai: checked === true })}
                                          />
                                          <Label htmlFor="trang_thai" className="cursor-pointer">Đang hoạt động</Label>
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                                    <Button type="submit" disabled={isPending}>{editingPhongBan ? "Cập nhật" : "Thêm mới"}</Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      )
}
