"use client"

import React from "react"
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PhongBan } from "@/types/phong-ban.types"

interface PhongBanDeleteDialogProps {
      open: boolean
      onOpenChange: (open: boolean) => void
      phongBan: PhongBan | null
      isPending: boolean
      onConfirm: () => void
}

export function PhongBanDeleteDialog({
      open,
      onOpenChange,
      phongBan,
      isPending,
      onConfirm,
}: PhongBanDeleteDialogProps) {
      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>Xác nhận xóa</DialogTitle>
                              <DialogDescription>
                                    Bạn có chắc chắn muốn xóa phòng ban <span className="font-semibold text-slate-900">{phongBan?.ten_phong_ban}</span>? Hành động này không thể hoàn tác.
                              </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Hủy</Button>
                              <Button variant="destructive" onClick={onConfirm} disabled={isPending}>Xóa</Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      )
}
