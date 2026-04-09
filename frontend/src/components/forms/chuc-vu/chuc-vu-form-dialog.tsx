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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select"
import { ChucVu, ChucVuFormData } from "@/types/chuc-vu.types"

const INITIAL_FORM: ChucVuFormData = {
      ma_chuc_vu: "",
      ten_chuc_vu: "",
      cap_bac: 1,
      he_so_phu_cap: 0,
      mo_ta: "",
      tieu_chuan: "",
      trang_thai: true,
}

interface ChucVuFormDialogProps {
      open: boolean
      onOpenChange: (open: boolean) => void
      editingChucVu: ChucVu | null
      isPending: boolean
      onSubmit: (data: ChucVuFormData, editId?: string) => void
}

export function ChucVuFormDialog({
      open,
      onOpenChange,
      editingChucVu,
      isPending,
      onSubmit,
}: ChucVuFormDialogProps) {
      const [formData, setFormData] = useState<ChucVuFormData>(INITIAL_FORM)

      useEffect(() => {
            if (editingChucVu) {
                  setFormData({
                        ma_chuc_vu: editingChucVu.ma_chuc_vu,
                        ten_chuc_vu: editingChucVu.ten_chuc_vu,
                        cap_bac: editingChucVu.cap_bac,
                        he_so_phu_cap: editingChucVu.he_so_phu_cap,
                        mo_ta: editingChucVu.mo_ta || "",
                        tieu_chuan: editingChucVu.tieu_chuan || "",
                        trang_thai: editingChucVu.trang_thai,
                  })
            } else {
                  setFormData(INITIAL_FORM)
            }
      }, [editingChucVu, open])

      const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            onSubmit(formData, editingChucVu?.id)
      }

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle>{editingChucVu ? "Cập nhật chức vụ" : "Thêm chức vụ mới"}</DialogTitle>
                              <DialogDescription>
                                    {editingChucVu ? "Cập nhật thông tin chức vụ" : "Nhập thông tin để thêm chức vụ mới vào hệ thống"}
                              </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="ma_chuc_vu">Mã chức vụ <span className="text-red-500">*</span></Label>
                                          <Input
                                                id="ma_chuc_vu"
                                                required
                                                value={formData.ma_chuc_vu}
                                                onChange={(e) => setFormData({ ...formData, ma_chuc_vu: e.target.value.toUpperCase() })}
                                                placeholder="CV001"
                                                className="uppercase"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="ten_chuc_vu">Tên chức vụ <span className="text-red-500">*</span></Label>
                                          <Input
                                                id="ten_chuc_vu"
                                                required
                                                value={formData.ten_chuc_vu}
                                                onChange={(e) => setFormData({ ...formData, ten_chuc_vu: e.target.value })}
                                                placeholder="Hiệu trưởng"
                                          />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <Label htmlFor="cap_bac">Cấp bậc <span className="text-red-500">*</span></Label>
                                                <Select value={formData.cap_bac.toString()} onValueChange={(value) => setFormData({ ...formData, cap_bac: parseInt(value) })}>
                                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                                      <SelectContent>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                                                  <SelectItem key={level} value={level.toString()}>Cấp {level}{level === 1 ? " (Thấp nhất)" : level === 10 ? " (Cao nhất)" : ""}</SelectItem>
                                                            ))}
                                                      </SelectContent>
                                                </Select>
                                          </div>
                                          <div className="space-y-2">
                                                <Label htmlFor="he_so_phu_cap">Hệ số phụ cấp <span className="text-red-500">*</span></Label>
                                                <Input
                                                      id="he_so_phu_cap"
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      max="10"
                                                      required
                                                      value={formData.he_so_phu_cap}
                                                      onChange={(e) => setFormData({ ...formData, he_so_phu_cap: parseFloat(e.target.value) })}
                                                />
                                          </div>
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="mo_ta">Mô tả</Label>
                                          <Textarea
                                                id="mo_ta"
                                                value={formData.mo_ta}
                                                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                                                placeholder="Mô tả chức vụ..."
                                                rows={3}
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="tieu_chuan">Tiêu chuẩn</Label>
                                          <Textarea
                                                id="tieu_chuan"
                                                value={formData.tieu_chuan}
                                                onChange={(e) => setFormData({ ...formData, tieu_chuan: e.target.value })}
                                                placeholder="Tiêu chuẩn bổ nhiệm..."
                                                rows={3}
                                          />
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
                                    <Button type="submit" disabled={isPending}>{editingChucVu ? "Cập nhật" : "Thêm mới"}</Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      )
}
