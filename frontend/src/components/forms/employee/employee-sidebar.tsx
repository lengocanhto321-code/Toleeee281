"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Wallet,
  User,
  LogOut,
  GraduationCap,
  QrCode,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthActions } from "@/stores/auth.store"

const navItems = [
  { href: "/employee", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/my-qr", icon: QrCode, label: "QR Cá nhân" },
  { href: "/employee/luong", icon: Wallet, label: "Lương" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]

export function EmployeeSidebar() {
  const pathname = usePathname()
  const { logout } = useAuthActions()

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-60 bg-white border-r border-blue-100 flex-col hidden lg:flex">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-blue-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <GraduationCap className="size-4" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-semibold text-slate-900">THPT Thăng Long</span>
          <span className="block text-[11px] text-slate-500">Cổng nhân viên</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/employee"
              ? pathname === "/employee"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-blue-100">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
