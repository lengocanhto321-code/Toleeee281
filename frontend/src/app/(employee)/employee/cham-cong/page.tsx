"use client"

import { useState } from "react"
import { BentoCard } from "@/components/employee/bento-card"
import { PageHeader } from "@/components/employee/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployeeChamCongThang } from "@/hooks/employee/use-employee-cham-cong"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

function getDaysInMonth(thang: number, nam: number) {
  return new Date(nam, thang, 0).getDate()
}

function getFirstDayOffset(thang: number, nam: number) {
  const day = new Date(nam, thang - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function EmployeeChamCongPage() {
  const [thang, setThang] = useState(new Date().getMonth() + 1)
  const [nam, setNam] = useState(new Date().getFullYear())

  const { data: chamCong, isLoading } = useEmployeeChamCongThang(thang, nam)

  const daysInMonth = getDaysInMonth(thang, nam)
  const firstDayOffset = getFirstDayOffset(thang, nam)
  const nc = chamCong?.ngay_cong

  const chiTietMap = new Map<number, string>()
  if (chamCong?.chi_tiet) {
    chamCong.chi_tiet.forEach((d) => chiTietMap.set(d.ngay, d.trang_thai))
  }

  const today = new Date()
  const isCurrentMonth = thang === today.getMonth() + 1 && nam === today.getFullYear()

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <PageHeader
        title="Chấm công"
        subtitle="Theo dõi ngày công của bạn"
        actions={
          <div className="flex gap-2">
            <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
              <SelectTrigger className="w-[100px] h-8 bg-white/15 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
              <SelectTrigger className="w-[90px] h-8 bg-white/15 border-white/20 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <BentoCard label="Có mặt" value={nc?.co_mat ?? "—"} variant="blue" />
        <BentoCard label="Vắng CP" value={nc?.vang_co_phep ?? "—"} variant="amber" />
        <BentoCard label="Vắng KP" value={nc?.vang_khong_phep ?? "—"} variant="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-slate-400">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-xs font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }, (_, i) => (
                <div key={`e-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const status = chiTietMap.get(day)
                const dayOfWeek = new Date(nam, thang - 1, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const isToday = isCurrentMonth && day === today.getDate()

                let cellClass = "bg-slate-50 text-slate-300"
                if (status === "co_mat") cellClass = "bg-blue-500 text-white"
                else if (status === "vang") cellClass = "bg-amber-400 text-white"
                else if (status === "nghi_le") cellClass = "bg-purple-100 text-purple-700"
                else if (!status && !isWeekend) cellClass = "bg-white border border-slate-200 text-slate-900"
                else if (isWeekend) cellClass = "bg-slate-50 text-slate-300"

                if (isToday && !status) {
                  cellClass = "border-2 border-blue-500 text-blue-700 bg-blue-50 font-bold"
                }

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${cellClass}`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 justify-center mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-[10px] text-slate-500">Có mặt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-[10px] text-slate-500">Nghỉ phép</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-[10px] text-slate-500">Nghỉ KK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-200" />
                <span className="text-[10px] text-slate-500">Nghỉ lễ</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
