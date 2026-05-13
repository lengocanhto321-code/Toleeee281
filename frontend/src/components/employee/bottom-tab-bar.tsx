"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Clock, Wallet, User } from "lucide-react"

const tabs = [
  { href: "/employee", icon: LayoutDashboard, label: "Trang chủ" },
  { href: "/employee/cham-cong", icon: Clock, label: "Chấm công" },
  { href: "/employee/nghi-phep", icon: Calendar, label: "Nghỉ phép" },
  { href: "/employee/luong", icon: Wallet, label: "Lương" },
  { href: "/employee/profile", icon: User, label: "Hồ sơ" },
]

function isTabActive(pathname: string, href: string) {
  if (href === "/employee") return pathname === "/employee"
  return pathname.startsWith(href)
}

export function EmployeeBottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors",
                active ? "text-blue-600" : "text-slate-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                  active ? "bg-blue-600 text-white" : ""
                )}
              >
                <tab.icon className="w-[18px] h-[18px]" />
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
