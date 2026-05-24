"use client"

import { useRouter } from "next/navigation"
import { UserPlus, Download, Users, Gift, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNhanVienMetadata } from "@/stores/nhan-vien-metadata"

interface NhanVienSidebarPanelProps {
  onAdd: () => void
  onExport?: () => void
}

export function NhanVienSidebarPanel({ onAdd, onExport }: NhanVienSidebarPanelProps) {
  const router = useRouter()
  const thongKe = useNhanVienMetadata((s) => s.thongKe)

  const tk = thongKe || { tong_dang_lam: 0, sinh_nhat_thang: 0, ky_niem_thang: 0, nv_moi_thang: 0 }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:nhan-vien:export"))
    }
  }

  const stats = [
    { label: "Đang làm", value: tk.tong_dang_lam, icon: Users, color: "text-primary bg-accent/50 border-primary/20" },
    { label: "Sinh nhật", value: tk.sinh_nhat_thang, icon: Gift, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { label: "Kỷ niệm", value: tk.ky_niem_thang, icon: Award, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "NV mới", value: tk.nv_moi_thang, icon: Sparkles, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Nhân viên</h2>
      </div>

      <div className="p-3 space-y-2">
        <Button onClick={onAdd} className="w-full gap-2 cursor-pointer justify-start">
          <UserPlus className="h-4 w-4" />
          Thêm nhân viên
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-1.5 cursor-pointer text-xs h-8" onClick={handleExport}>
          <Download className="h-3 w-3" />
          Xuất Excel
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-lg border p-2.5 ${s.color}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="h-3 w-3" />
                  <span className="text-[10px] font-medium opacity-80">{s.label}</span>
                </div>
                <div className="text-lg font-bold leading-none">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {tk.tong_dang_lam === 0 && (
          <div className="p-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu nhân viên</p>
          </div>
        )}
      </div>
    </div>
  )
}
