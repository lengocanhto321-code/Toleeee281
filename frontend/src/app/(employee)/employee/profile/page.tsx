"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Briefcase,
} from "lucide-react"

export default function EmployeeProfilePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Thông tin cá nhân của bạn</p>
        </div>
        <Button variant="outline">Chỉnh sửa</Button>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500">
            NV
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">Nguyễn Văn A</h2>
              <Badge variant="secondary">Giáo viên</Badge>
              <Badge variant="outline">Đang làm việc</Badge>
            </div>
            <p className="text-slate-500">GV001 • Tổ Toán học</p>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Giới tính</p>
              <p className="font-medium text-slate-900">Nam</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Ngày sinh</p>
              <p className="font-medium text-slate-900">15/03/1985</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Số CCCD</p>
              <p className="font-medium text-slate-900">012345678901</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Địa chỉ</p>
              <p className="font-medium text-slate-900">Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Email công việc</p>
              <p className="font-medium text-slate-900">nvana@thanglong.edu.vn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Số điện thoại</p>
              <p className="font-medium text-slate-900">0912 345 678</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Work Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin công tác</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Phòng ban</p>
              <p className="font-medium text-slate-900">Tổ Toán học</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Ngày vào làm</p>
              <p className="font-medium text-slate-900">01/09/2010</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
