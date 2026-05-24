"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { useAdminDashboard } from "@/hooks/dashboard/use-admin-dashboard";
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
  MoreHorizontal,
  UserCheck,
  UserX,
  Briefcase,
  ShieldAlert,
  UserPlus
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

const HANH_DONG_LABELS: Record<string, string> = {
  CREATE: "Thêm mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  RESTORE: "Khôi phục",
};

const BANG_LABELS: Record<string, string> = {
  nhan_vien: "nhân viên",
  phong_ban: "phòng ban",
  chuc_vu: "chức vụ",
  nguoi_than: "người thân",
  bang_cap: "bằng cấp",
  khen_thuong_ky_luat: "khen thưởng/kỷ luật",
  cong_tac: "phân công",
};

const HANH_DONG_COLORS: Record<string, string> = {
  CREATE: "text-chart-2",
  UPDATE: "text-primary",
  DELETE: "text-destructive",
  RESTORE: "text-chart-3",
};

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return "";
  const now = new Date();
  const t = new Date(isoStr);
  const diffMs = now.getTime() - t.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "vừa xong";
  if (diffMin < 60) return `${diffMin}ph`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}g`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} ngày`;
}

export default function DashboardPage() {
  const router = useRouter();
  const userResult = useUser();
  const user = "data" in userResult ? userResult.data : null;
  const { data: dashboard } = useAdminDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalNV = dashboard?.tong_nhan_vien || 0;

  const quickActions = [
    { label: "Thêm nhân viên", icon: Users, href: "/nhan-vien", color: "bg-primary" },
    { label: "Tạo báo cáo", icon: FileText, href: "/bao-cao", color: "bg-primary" },
    { label: "Chấm công", icon: Clock, href: "/cham-cong", color: "bg-chart-2" },
  ];

  const empBreakdown = [
    { label: "Giáo viên", count: dashboard?.giao_vien || 0, color: "bg-primary" },
    { label: "Cán bộ", count: dashboard?.can_bo || 0, color: "bg-primary/70" },
    { label: "Nhân viên", count: dashboard?.nhan_vien_loai || 0, color: "bg-chart-2" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-10">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-6 h-6 text-primary-foreground/70" />
                <span className="text-xs font-medium text-primary-foreground/50 uppercase tracking-wider">THPT Thăng Long</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                Xin chào, {user?.username || "Admin"} 👋
              </h1>
              <p className="text-primary-foreground/60 text-sm md:text-base">
                Quản lý nguồn nhân sự hiệu quả. Năm học 2024-2025.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/nhan-vien")}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border border-primary-foreground/20"
              >
                <Users className="w-4 h-4 mr-2" />
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Nhân viên"
            value={dashboard?.tong_nhan_vien ?? "—"}
            accent="primary"
            trend={dashboard?.nhan_vien_moi_thang_nay ? { value: `+${dashboard.nhan_vien_moi_thang_nay} tháng này`, direction: "up" } : undefined}
            onClick={() => router.push("/nhan-vien")}
          />
          <StatCard
            icon={Building2}
            label="Phòng ban"
            value={dashboard?.so_phong_ban ?? "—"}
            accent="info"
            onClick={() => router.push("/phong-ban")}
          />
          <StatCard
            icon={Award}
            label="Chức vụ"
            value={dashboard?.so_chuc_vu ?? "—"}
            accent="info"
            onClick={() => router.push("/chuc-vu")}
          />
          <StatCard
            icon={FileText}
            label="Đơn nghỉ chờ duyệt"
            value={dashboard?.don_nghi_phep_cho_duyet ?? "—"}
            accent={dashboard?.don_nghi_phep_cho_duyet ? "warning" : "neutral"}
            onClick={() => router.push("/nghi-phep")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => router.push(action.href)}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", action.color)}>
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="border-border shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Phân loại nhân viên</h2>
                  <button
                    onClick={() => router.push("/nhan-vien")}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    Xem tất cả
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {empBreakdown.map((item, index) => {
                    const percent = totalNV > 0 ? ((item.count / totalNV) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="text-muted-foreground">{item.count} ({percent}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                            style={{ width: mounted ? `${percent}%` : "0%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="border-border shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Hoạt động gần đây</h2>
                {(!dashboard?.hoat_dong_gan_day || dashboard.hoat_dong_gan_day.length === 0) ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Chưa có hoạt động nào</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.hoat_dong_gan_day.map((activity) => {
                      const actionLabel = HANH_DONG_LABELS[activity.hanh_dong] || activity.hanh_dong;
                      const tableLabel = BANG_LABELS[activity.bang_du_lieu] || activity.bang_du_lieu;
                      const colorClass = HANH_DONG_COLORS[activity.hanh_dong] || "text-muted-foreground";
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-200"
                        >
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colorClass, "bg-opacity-10")}>
                            {activity.hanh_dong === "CREATE" && <UserPlus className="w-5 h-5" />}
                            {activity.hanh_dong === "UPDATE" && <Briefcase className="w-5 h-5" />}
                            {activity.hanh_dong === "DELETE" && <ShieldAlert className="w-5 h-5" />}
                            {activity.hanh_dong === "RESTORE" && <UserCheck className="w-5 h-5" />}
                            {!["CREATE", "UPDATE", "DELETE", "RESTORE"].includes(activity.hanh_dong) && <Clock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {actionLabel} {tableLabel}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.ghi_chu || `Bởi ${activity.ten_dang_nhap || "hệ thống"}`}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(activity.thoi_gian)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Phòng ban</h2>
                  <button
                    onClick={() => router.push("/phong-ban")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {(!dashboard?.phong_ban_summary || dashboard.phong_ban_summary.length === 0) ? (
                    <p className="text-sm text-muted-foreground py-2 text-center">Chưa có phòng ban</p>
                  ) : (
                    dashboard.phong_ban_summary.map((dept, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/phong-ban")}
                      >
                        <span className="text-sm font-medium text-foreground">{dept.ten_phong_ban}</span>
                        <span className="text-sm font-semibold text-foreground">{dept.so_nhan_vien}</span>
                      </div>
                    ))
                  )}
                </div>
                {dashboard?.so_phong_ban ? (
                  <button
                    onClick={() => router.push("/phong-ban")}
                    className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Xem tất cả {dashboard.so_phong_ban} phòng ban
                  </button>
                ) : null}
              </div>
            </Card>

            <Card className="border-border shadow-sm bg-muted/30">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Liên kết nhanh</h2>
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
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card transition-all duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-card shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">{link.label}</p>
                          <p className="text-xs text-muted-foreground">{link.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="border-border shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Trạng thái hệ thống</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Server</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-chart-2"></span>
                      <span className="text-sm text-foreground">Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-chart-2"></span>
                      <span className="text-sm text-foreground">Connected</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last backup</span>
                    <span className="text-sm text-foreground">Hôm nay 02:00</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
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
