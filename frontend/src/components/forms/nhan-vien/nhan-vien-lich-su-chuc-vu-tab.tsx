"use client"

import { Badge } from "@/components/ui/badge"
import { Briefcase, FileText } from "lucide-react"
import type { LichSuChucVu, ChucVuBrief } from "@/types/cong-tac.types"
import { formatDateVN } from "@/lib/date-utils"

interface NhanVienLichSuChucVuTabProps {
  lichSuChucVus: LichSuChucVu[]
  chucVuMap?: Record<string, ChucVuBrief>
}

export function NhanVienLichSuChucVuTab({
  lichSuChucVus,
  chucVuMap = {},
}: NhanVienLichSuChucVuTabProps) {
  if (!lichSuChucVus || lichSuChucVus.length === 0) {
    return (
      <div className="detail-section p-5">
        <div className="dot-grid-bg rounded-xl py-10 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
            <Briefcase className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">Chưa có lịch sử chức vụ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-section overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50">
            <Briefcase className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Lịch sử chức vụ</h3>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="absolute left-[37px] top-0 bottom-5 w-px bg-slate-200" />

        <div className="space-y-3">
          {lichSuChucVus.map((item, index) => {
            const chucVu = chucVuMap[item.chuc_vu_id]
            const isLatest = index === 0

            return (
              <div key={item.id} className="animate-detail-slide">
                <div className="flex gap-4">
                  <div className="relative z-10 mt-1 shrink-0">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isLatest ? "bg-violet-500 border-violet-500" : "bg-white border-slate-300"}`}>
                      {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className={`flex-1 rounded-xl p-4 border ${isLatest ? "bg-violet-50/30 border-violet-200/60" : "bg-white border-slate-200/80"}`}>
                    <p className="text-sm font-semibold text-slate-900">
                      {chucVu?.ten_chuc_vu || "Chức vụ đã xóa"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span>{formatDateVN(item.tu_ngay)}</span>
                      {item.den_ngay && (
                        <>
                          <span className="text-slate-300">→</span>
                          <span>{formatDateVN(item.den_ngay)}</span>
                        </>
                      )}
                    </div>
                    {item.so_quyet_dinh && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <FileText className="h-3 w-3" />
                        <span>Số QĐ: <span className="font-medium text-slate-700">{item.so_quyet_dinh}</span></span>
                      </div>
                    )}
                    {item.ly_do && (
                      <p className="mt-1.5 text-xs text-slate-400 italic">{item.ly_do}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
