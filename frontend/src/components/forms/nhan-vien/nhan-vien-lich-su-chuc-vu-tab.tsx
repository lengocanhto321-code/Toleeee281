"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase, FileText } from "lucide-react"
import type { LichSuChucVu, ChucVuBrief } from "@/types/cong-tac.types"

interface NhanVienLichSuChucVuTabProps {
  lichSuChucVus: LichSuChucVu[]
  chucVuMap?: Record<string, ChucVuBrief>
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function NhanVienLichSuChucVuTab({ 
  lichSuChucVus, 
  chucVuMap = {} 
}: NhanVienLichSuChucVuTabProps) {
  if (!lichSuChucVus || lichSuChucVus.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-500 text-sm">Chưa có lịch sử chức vụ</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-slate-400" />
        Lịch sử chức vụ
      </h3>
      
      <div className="space-y-4">
        {lichSuChucVus.map((item) => {
          const chucVu = chucVuMap[item.chuc_vu_id]
          
          return (
            <div
              key={item.id}
              className="relative border rounded-lg p-4 border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">
                    {chucVu?.ten_chuc_vu || "Chức vụ đã xóa"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Từ: {formatDate(item.tu_ngay)}
                    </span>
                    {item.den_ngay && (
                      <span>Đến: {formatDate(item.den_ngay)}</span>
                    )}
                  </div>
                  {item.so_quyet_dinh && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Số quyết định: {item.so_quyet_dinh}
                    </p>
                  )}
                  {item.ly_do && (
                    <p className="text-sm text-slate-500">
                      Lý do: {item.ly_do}
                    </p>
                  )}
                </div>
              </div>
              
              {item.ghi_chu && (
                <p className="mt-2 text-sm text-slate-500 italic">{item.ghi_chu}</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
