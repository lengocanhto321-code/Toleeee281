"use client"

import React, { useState } from "react"
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

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nhanVien: NhanVien
  onTransfer: (data: TransferData) => void
  isPending?: boolean
}

interface TransferData {
  phong_ban_id: string
  chuc_vu_id: string
  ngay_chuyen: string
  ly_do: string
}

export function NhanVienTransferDialog({
  open,
  onOpenChange,
  nhanVien,
  onTransfer,
  isPending,
}: TransferDialogProps) {
  const [phongBanId, setPhongBanId] = useState(nhanVien.phong_ban_id || "")
  const [chucVuId, setChucVuId] = useState(nhanVien.chuc_vu_id || "")
  const [ngayChuyen, setNgayChuyen] = useState(new Date().toISOString().split("T")[0])
  const [lyDo, setLyDo] = useState("")

  const { data: allPhongBans } = usePhongBanAll()
  const { data: allChucVus } = useChucVuList()

  const filteredChucVus = allChucVus?.filter((cv) => {
    const allowedLoai = LOAI_MAPPING[nhanVien.loai_nhan_vien as keyof typeof LOAI_MAPPING]
    return allowedLoai?.includes(cv.loai)
  }) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onTransfer({
      phong_ban_id: phongBanId,
      chuc_vu_id: chucVuId,
      ngay_chuyen: ngayChuyen,
      ly_do: lyDo,
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phong_ban_id">Phòng ban mới <span className="text-red-500">*</span></Label>
              <Select value={phongBanId} onValueChange={setPhongBanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {allPhongBans
                    ?.filter((pb) => pb.trang_thai)
                    .map((pb) => (
                      <SelectItem key={pb.id} value={pb.id}>
                        {pb.ten_phong_ban}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chuc_vu_id">Chức vụ mới <span className="text-red-500">*</span></Label>
              <Select value={chucVuId} onValueChange={setChucVuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {filteredChucVus
                    ?.filter((cv) => cv.trang_thai)
                    .map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.ten_chuc_vu}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ngay_chuyen">Ngày điều chuyển <span className="text-red-500">*</span></Label>
              <Input
                id="ngay_chuyen"
                type="date"
                required
                value={ngayChuyen}
                onChange={(e) => setNgayChuyen(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ly_do">Lý do điều chuyển</Label>
              <Input
                id="ly_do"
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                placeholder="VD: Theo nhu cầu công tác"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !phongBanId || !chucVuId}>
              {isPending ? "Đang xử lý..." : "Điều chuyển"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
