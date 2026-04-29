"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"

export default function EmployeeDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xin chào, Giáo viên!</h1>
          <p className="text-slate-500 mt-1">Cập nhật thông tin và hoạt động gần đây</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Năm học 2024-2025
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ngày phép còn lại</p>
              <p className="text-2xl font-bold text-slate-900">8/12</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Công tháng này</p>
              <p className="text-2xl font-bold text-slate-900">22/22</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Lương tháng 3</p>
              <p className="text-2xl font-bold text-slate-900">15.2M</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start">
            <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
            <div className="text-left">
              <p className="font-medium">Xin nghỉ phép</p>
              <p className="text-xs text-slate-500">Gửi đơn nghỉ phép mới</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <Clock className="w-5 h-5 mr-3 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium">Xem chấm công</p>
              <p className="text-xs text-slate-500">Theo dõi ngày công</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start">
            <Users className="w-5 h-5 mr-3 text-amber-600" />
            <div className="text-left">
              <p className="font-medium">Hồ sơ cá nhân</p>
              <p className="text-xs text-slate-500">Cập nhật thông tin</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Leave Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Đơn nghỉ phép gần đây</h2>
          <Button variant="ghost" size="sm" className="text-indigo-600">
            Xem tất cả <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {[
            { date: "15/03/2025", type: "Nghỉ phép năm", days: "2 ngày", status: "Đã duyệt" },
            { date: "01/03/2025", type: "Nghỉ ốm", days: "1 ngày", status: "Đã duyệt" },
            { date: "20/02/2025", type: "Nghỉ phép năm", days: "3 ngày", status: "Từ chối" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
              <div>
                <p className="font-medium text-slate-900">{item.type}</p>
                <p className="text-sm text-slate-500">{item.date} • {item.days}</p>
              </div>
              <Badge
                variant={item.status === "Đã duyệt" ? "default" : "destructive"}
                className={item.status === "Đã duyệt" ? "bg-emerald-500" : ""}
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
