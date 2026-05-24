"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { EmployeeSidebar } from "@/components/forms/employee/employee-sidebar"
import { EmployeeBottomTabBar } from "@/components/employee/bottom-tab-bar"
import { useAuthStore } from "@/stores/auth.store"
import type { UserRole } from "@/types/auth.types"

const EMPLOYEE_ROLES: UserRole[] = ["GIAO_VIEN", "NHAN_VIEN"]
const ADMIN_ROLES: UserRole[] = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user && !EMPLOYEE_ROLES.includes(user.role)) {
      router.push("/dashboard")
    }
  }, [mounted, isAuthenticated, user, router])

  const isUnauthorized = mounted && isAuthenticated && user && !EMPLOYEE_ROLES.includes(user.role)

  if (!mounted || !isAuthenticated || isUnauthorized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-blue-50/30">
        <div className="text-sm text-slate-400">
          {isUnauthorized ? "Không có quyền truy cập" : "Đang tải..."}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EmployeeSidebar />
      <div className="lg:pl-60">
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
      <EmployeeBottomTabBar />
    </div>
  )
}
