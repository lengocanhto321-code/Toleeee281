"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Banknote } from "lucide-react"

export default function EmployeeLuongPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lương</h1>
        <p className="text-slate-500 mt-1">Tra cứu thông tin lương của bạn</p>
      </div>

      {/* Current Month Salary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Lương tháng 3/2025</h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Tải phiếu lương
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Lương cơ bản</p>
            <p className="text-xl font-bold text-slate-900">6,500,000 đ</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Phụ cấp</p>
            <p className="text-xl font-bold text-emerald-600">2,100,000 đ</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Khấu trừ</p>
            <p className="text-xl font-bold text-red-600">-850,000 đ</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Thực nhận</p>
            <p className="text-2xl font-bold text-indigo-600">7,750,000 đ</p>
          </div>
        </div>
      </Card>

      {/* Salary History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lịch sử lương</h2>
        <div className="space-y-3">
          {[
            { month: "Tháng 3/2025", basic: "6,500,000", allowance: "2,100,000", deduction: "850,000", net: "7,750,000" },
            { month: "Tháng 2/2025", basic: "6,500,000", allowance: "2,100,000", deduction: "850,000", net: "7,750,000" },
            { month: "Tháng 1/2025", basic: "6,500,000", allowance: "2,100,000", deduction: "1,200,000", net: "7,400,000" },
          ].map((salary) => (
            <div key={salary.month} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{salary.month}</p>
                <p className="text-sm text-slate-500">
                  CB: {salary.basic} • PC: {salary.allowance} • Khấu trừ: {salary.deduction}
                </p>
              </div>
              <p className="text-lg font-bold text-indigo-600">{salary.net} đ</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
