"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LuongSidebarPanelProps {
  onAdd?: () => void
}

export function LuongSidebarPanel({ onAdd }: LuongSidebarPanelProps) {
  const handleAdd = () => {
    window.dispatchEvent(new CustomEvent("sidebar:luong:add"))
    onAdd?.()
  }

  return (
    <>
      <div className="border-b p-4">
        <div className="text-base font-medium">Lương</div>
        <p className="text-xs text-muted-foreground mt-1">
          Quản lý lương, kỳ lương và phiếu lương
        </p>
      </div>
      <div className="p-4">
        <Button onClick={handleAdd} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Tạo cấu hình lương
        </Button>
      </div>
      <div className="border-t p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Hướng dẫn
        </h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>1. Tạo cấu hình lương cho kỳ lương</p>
          <p>2. Cập nhật chấm công nhân viên</p>
          <p>3. Chạy lương hàng loạt</p>
          <p>4. Duyệt và chốt kỳ lương</p>
        </div>
      </div>
    </>
  )
}
