"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  Building2,
  Award,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  GraduationCap,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const userResult = useUser();
  const user = "data" in userResult ? userResult.data : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats data
  const stats = [
    {
      label: "Nhân viên",
      value: "156",
      change: "+3",
      trend: "up",
      icon: Users,
      color: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-50",
      href: "/nhan-vien"
    },
    {
      label: "Phòng ban",
      value: "12",
      change: "+1",
      trend: "up",
      icon: Building2,
      color: "from-blue-400 to-indigo-500",
      bgLight: "bg-blue-50",
      href: "/phong-ban"
    },
    {
      label: "Chức vụ",
      value: "8",
      change: "0",
      trend: "neutral",
      icon: Award,
      color: "from-emerald-400 to-teal-500",
      bgLight: "bg-emerald-50",
      href: "/chuc-vu"
    },
    {
      label: "Báo cáo",
      value: "24",
      change: "+5",
      trend: "up",
      icon: FileText,
      color: "from-purple-400 to-pink-500",
      bgLight: "bg-purple-50",
      href: "/bao-cao"
    },
  ];

  // Quick actions
  const quickActions = [
    { label: "Thêm nhân viên", icon: Users, href: "/nhan-vien", color: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { label: "Tạo báo cáo", icon: FileText, href: "/bao-cao", color: "bg-gradient-to-br from-blue-500 to-indigo-600" },
    { label: "Chấm công", icon: Clock, href: "/cham-cong", color: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  ];

  // Recent activities
  const activities = [
    { id: 1, title: "Thêm nhân viên mới", desc: "Nguyễn Văn A - Toán học", time: "5ph", icon: Users, color: "text-amber-600" },
    { id: 2, title: "Duyệt đơn nghỉ phép", desc: "Trần Thị B - Nghỉ 2 ngày", time: "15ph", icon: Calendar, color: "text-blue-600" },
    { id: 3, title: "Chốt công tháng 3", desc: "154/156 nhân viên", time: "1g", icon: Clock, color: "text-emerald-600" },
    { id: 4, title: "Cập nhật phòng ban", desc: "Tổ Toán +3 nhân viên", time: "2g", icon: Building2, color: "text-purple-600" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10 border border-slate-700/50">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-6 h-6 text-amber-400" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">THPT Thăng Long</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Xin chào, {user?.username || "Admin"} 👋
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Quản lý nguồn nhân sự hiệu quả. Năm học 2024-2025.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/nhan-vien")}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
              >
                <Users className="w-4 h-4 mr-2" />
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(stat.href)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-5 text-left hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-md", stat.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-slate-400"
                    )}>
                      {stat.trend === "up" && <ArrowUp className="w-3 h-3" />}
                      {stat.trend === "down" && <ArrowDown className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => router.push(action.href)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                          "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", action.color)}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Employee Breakdown */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Phân loại nhân viên</h2>
                  <button
                    onClick={() => router.push("/nhan-vien")}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Giáo viên", count: 138, percent: 88.5, color: "bg-amber-500" },
                    { label: "Nhân viên", count: 14, percent: 9.0, color: "bg-blue-500" },
                    { label: "Cán bộ quản lý", count: 4, percent: 2.5, color: "bg-emerald-500" },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.count} ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                          style={{ width: mounted ? `${item.percent}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Hoạt động gần đây</h2>
                <div className="space-y-3">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
                          "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", activity.color, "bg-opacity-10")}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.desc}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Department Summary */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Phòng ban</h2>
                  <button
                    onClick={() => router.push("/phong-ban")}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Tổ Toán", count: 18 },
                    { name: "Tổ Văn", count: 15 },
                    { name: "Tổ Tiếng Anh", count: 12 },
                    { name: "Tổ KHTN", count: 10 },
                    { name: "Văn phòng", count: 8 },
                  ].map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push("/phong-ban")}
                    >
                      <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{dept.count}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/phong-ban")}
                  className="w-full mt-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Xem tất cả 12 phòng ban
                </button>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/50">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Liên kết nhanh</h2>
                <div className="space-y-2">
                  {[
                    { label: "Chấm công", desc: "Điểm danh & theo dõi", href: "/cham-cong", icon: Clock },
                    { label: "Nghỉ phép", desc: "Đơn nghỉ & duyệt", href: "/nghi-phep", icon: Calendar },
                    { label: "Báo cáo", desc: "Thống kê & phân tích", href: "/bao-cao", icon: FileText },
                  ].map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => router.push(link.href)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/80 transition-all duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                          <Icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-slate-900">{link.label}</p>
                          <p className="text-xs text-slate-500">{link.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card className="border border-slate-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Trạng thái hệ thống</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Server</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-sm text-slate-900">Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Database</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-sm text-slate-900">Connected</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last backup</span>
                    <span className="text-sm text-slate-900">Hôm nay 02:00</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    © 2024 THPT Thăng Long - v1.0.0
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
