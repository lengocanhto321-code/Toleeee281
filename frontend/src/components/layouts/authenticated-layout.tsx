"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks";
import type { UserRole } from "@/types/auth.types";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"];

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  breadcrumbLabel?: string;
  allowedRoles?: UserRole[];
}

export function AuthenticatedLayout({
  children,
  breadcrumbLabel,
  allowedRoles = ADMIN_ROLES,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const userResult = useUser();
  const user = "data" in userResult ? userResult.data : null;

  const ROUTE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    "nhan-vien": "Nhân viên",
    "phong-ban": "Phòng ban",
    "chuc-vu": "Chức vụ",
    luong: "Lương",
  };

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const isIdSegment = !ROUTE_LABELS[seg] && segments[i - 1] in ROUTE_LABELS;
    let label = ROUTE_LABELS[seg] || (isIdSegment ? "Chi tiết" : seg);
    if (isLast && isIdSegment && breadcrumbLabel) {
      label = breadcrumbLabel;
    }
    return {
      label,
      href: "/" + segments.slice(0, i + 1).join("/"),
      isLast,
    };
  });

  // Live clock
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((d: Date) => {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const day = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${day}, ${dd}/${mm}/${yyyy} — ${hh}:${min}:${ss}`;
  }, []);

  const { useIsAuthenticated, useIsLoading } = require("@/stores/auth.store");
  const isAuthenticated = useIsAuthenticated();
  const isAuthLoading = useIsLoading();

  // Client-side only auth check
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated && !isAuthLoading) {
      router.push("/login");
    }
    if (isClient && isAuthenticated && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push("/employee");
    }
  }, [isClient, isAuthenticated, isAuthLoading, user, allowedRoles, router]);

  // Loading state (wait for client + auth resolution)
  if (!isClient || (isClient && !isAuthenticated)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm text-slate-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-0">
        <header className="sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b border-border bg-card p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, i) => (
                <span key={item.href} className="hidden md:contents">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {now && (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {formatTime(now)}
            </span>
          )}
        </header>
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{
            backgroundImage: "linear-gradient(oklch(0.75 0 0 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0 0 / 0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundAttachment: "fixed",
            scrollbarGutter: "stable both-edges",
          }}
        >
          <div className="p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
