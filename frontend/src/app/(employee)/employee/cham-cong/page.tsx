"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function EmployeeChamCongPage() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chấm công</h1>
        <p className="text-slate-500 mt-1">Theo dõi ngày công của bạn</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ngày công thực tế</p>
          <p className="text-3xl font-bold text-emerald-600">22</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ngày nghỉ có phép</p>
          <p className="text-3xl font-bold text-amber-600">2</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ngày nghỉ không phép</p>
          <p className="text-3xl font-bold text-red-600">0</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Tỷ lệ đi làm</p>
          <p className="text-3xl font-bold text-indigo-600">100%</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Tháng {currentMonth + 1} / {currentYear}</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Đi làm</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">Nghỉ có phép</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">Nghỉ không phép</Badge>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {days.slice(0, 28).map((day) => (
            <div
              key={day}
              className="h-10 w-full flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium"
            >
              {day}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
