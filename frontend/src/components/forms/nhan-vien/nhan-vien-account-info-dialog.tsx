"use client"

import { useState } from "react"
import { Key, User, Copy, Check, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TaiKhoanInfo {
  ten_dang_nhap: string
  mat_khau_goc: string
}

interface AccountInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hoTen: string
  taiKhoan: TaiKhoanInfo | null
}

export function AccountInfoDialog({ open, onOpenChange, hoTen, taiKhoan }: AccountInfoDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (!taiKhoan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Key className="h-4 w-4" />
            </div>
            Tài khoản đã được tạo
          </DialogTitle>
          <DialogDescription>
            Thông tin đăng nhập cho nhân viên <span className="font-medium text-foreground">{hoTen}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Vui lòng lưu lại thông tin đăng nhập. Mật khẩu sẽ không hiển thị lại sau khi đóng dialog này.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Tên đăng nhập
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={taiKhoan.ten_dang_nhap}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9"
                  onClick={() => copyToClipboard(taiKhoan.ten_dang_nhap, "username")}
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                Mật khẩu
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={taiKhoan.mat_khau_goc}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9"
                  onClick={() => copyToClipboard(taiKhoan.mat_khau_goc, "password")}
                >
                  {copiedField === "password" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="cursor-pointer">
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
