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
import { ChucVu } from "@/types/chuc-vu.types"

interface ChucVuDeleteDialogProps {
      open: boolean
      onOpenChange: (open: boolean) => void
      chucVu: ChucVu | null
      isPending: boolean
      onConfirm: () => void
}

export function ChucVuDeleteDialog({
      open,
      onOpenChange,
      chucVu,
      isPending,
      onConfirm,
}: ChucVuDeleteDialogProps) {
      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>Xác nhận xóa</DialogTitle>
                              <DialogDescription>
                                    Bạn có chắc chắn muốn xóa chức vụ <span className="font-semibold text-slate-900">{chucVu?.ten_chuc_vu}</span>? Hành động này không thể hoàn tác.
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
