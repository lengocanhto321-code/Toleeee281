"use client"

import React from "react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Building2,
  Award,
  Shield,
  Clock,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  School,
} from "lucide-react"

export default function GioiThieuPage() {
  const features = [
    {
      icon: Users,
      title: "Quản lý Nhân sự",
      description: "Theo dõi thông tin toàn bộ giáo viên và nhân viên với hệ thống phân loại chi tiết",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: Building2,
      title: "Cơ cấu Tổ chức",
      description: "Quản lý phòng ban, tổ chuyên môn theo mô hình phân cấp phù hợp trường THPT",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Clock,
      title: "Chấm Công Thông minh",
      description: "3 luồng xử lý: điểm danh hàng ngày, đơn nghỉ phép, chốt công tháng tự động",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: Award,
      title: "Quản lý Chức vụ",
      description: "Phân cấp ngạch bậc từ 1-10 với hệ số phụ cấp linh hoạt theo quy định",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Shield,
      title: "Phân quyền Chi tiết",
      description: "5 vai trò từ Admin đến Giáo viên với quyền hạn được tinh chỉnh theo nghiệp vụ",
      color: "from-rose-500 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Báo cáo & Thống kê",
      description: "Xem báo cáo nhân sự, công lương, thống kê theo nhiều tiêu chí khác nhau",
      color: "from-violet-500 to-purple-600",
    },
  ]

  const benefits = [
    "Tiết kiệm 80% thời gian xử lý paperwork so với Excel",
    "Đối chiếu chấm công 3 lớp: Tổ trưởng → Văn phòng → Tài vụ",
    "Lịch sử đơn nghỉ phép được lưu trữ và tra cứu dễ dàng",
    "Cảnh báo deadline chốt công và nghỉ hè tự động",
    "Tương thích với quy trình hiện hành của trường THPT",
    "Bảo mật dữ liệu với phân quyền theo vai trò",
  ]

  const workflow = [
    {
      step: "01",
      title: "Điểm danh hàng ngày",
      description: "Tổ trưởng chuyên môn điểm danh sổ tay mỗi sáng",
      icon: GraduationCap,
    },
    {
      step: "02",
      title: "Xử lý đơn nghỉ",
      description: "Giáo viên nộp đơn, Hiệu phó duyệt trực tuyến",
      icon: CheckCircle2,
    },
    {
      step: "03",
      title: "Tổng hợp tháng",
      description: "Văn phòng tổng hợp, đối chiếu và chốt công",
      icon: BarChart3,
    },
    {
      step: "04",
      title: "Tính lương",
      description: "Phòng Tài vụ tính lương dựa trên công đã chốt",
      icon: Award,
    },
  ]

  return (
    <AuthenticatedLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl">
                <School className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Hệ Thống Quản Lý Nhân Sự
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-200 mb-4 font-medium">
              Trường THPT Thăng Long
            </p>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10">
              Giải pháp toàn diện quản lý nguồn nhân lực trường THPT, được thiết kế đặc biệt cho mô hình giáo dục Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-6 text-lg font-semibold shadow-xl"
                onClick={() => (window.location.href = "/nhan-vien")}
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Xem Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Why This System Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tại Sao Cần Hệ Thống Này?
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Khác với doanh nghiệp, trường THPT có đặc thù riêng trong quản lý nhân sự. Hệ thống được thiết kế để giải quyết các bài toán thực tế của trường THPT Thăng Long.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Vấn đề hiện tại
                    </h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        Chấm công theo tiết dạy và buổi trực
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        Tổ trưởng điểm danh sổ tay thủ công
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        Excel từ Văn phòng → Tài vụ hàng tháng
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        Khó tra cứu lịch sử đơn nghỉ phép
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Giải pháp của chúng tôi
                    </h3>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">✓</span>
                        3 luồng chấm công tự động
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">✓</span>
                        Điểm danh và duyệt đơn online
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">✓</span>
                        Chốt công tháng một-click
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">✓</span>
                        Lưu trữ và tra cứu lịch sử đầy đủ
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Hệ thống cung cấp đầy đủ các tính năng quản lý nhân sự cho trường THPT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Quy Trình Chấm Công
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              3 luồng xử lý chấm công theo mô hình thực tế của trường THPT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 hover:border-indigo-200 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-indigo-100 mb-4">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Lợi Ích Khi Sử Dụng
            </h2>
            <p className="text-lg text-indigo-200 max-w-3xl mx-auto">
              Hệ thống mang lại giá trị thực tế cho trường THPT Thăng Long
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg text-white leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Sẵn Sàng Nâng Cao Quản Lý Nhân Sự?
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Bắt đầu sử dụng hệ thống ngay hôm nay để trải nghiệm quy trình quản lý nhân sự hiệu quả và chuyên nghiệp hơn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-xl"
              onClick={() => (window.location.href = "/nhan-vien")}
            >
              Khám phá ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-200 px-8 py-6 text-lg font-semibold hover:bg-slate-50"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Về Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Về Hệ Thống</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hệ thống quản lý nhân sự chuyên nghiệp dành riêng cho trường THPT Thăng Long, giúp tối ưu hóa quy trình quản lý nguồn nhân lực giáo dục.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Tính Năng</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>• Quản lý Nhân viên</li>
                <li>• Quản lý Phòng ban</li>
                <li>• Quản lý Chức vụ</li>
                <li>• Chấm công & Tính lương</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>📍 THPT Thăng Long</li>
                <li>📧 admin@thptthanglong.edu.vn</li>
                <li>📞 (024) XXXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 THPT Thăng Long - Hệ thống quản lý nhân sự. Phiên bản 1.0.0</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
