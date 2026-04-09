"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { NhanVien } from "@/types/nhan-vien.types"

interface NhanVienDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nhanVien: NhanVien | null
  isPending: boolean
  onConfirm: () => void
}

export function NhanVienDeleteDialog({
  open,
  onOpenChange,
  nhanVien,
  isPending,
  onConfirm,
}: NhanVienDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <span className="font-semibold text-slate-900">{nhanVien?.ho_ten}</span>
            {nhanVien?.ma_nhan_vien && (
              <span className="text-slate-500"> ({nhanVien.ma_nhan_vien})</span>
            )}
            ? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
