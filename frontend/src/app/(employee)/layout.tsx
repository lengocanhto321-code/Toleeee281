"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Banknote,
  User,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/employee", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/luong", icon: Banknote, label: "Lương" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">THPT Thăng Long</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
