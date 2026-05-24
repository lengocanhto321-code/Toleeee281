"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { UserRole } from "@/types/auth.types"

const ADMIN_ROLES: UserRole[] = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]
const EMPLOYEE_ROLES: UserRole[] = ["GIAO_VIEN", "NHAN_VIEN"]

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    if (ADMIN_ROLES.includes(user.role)) {
      router.push("/dashboard")
    } else if (EMPLOYEE_ROLES.includes(user.role)) {
      router.push("/dashboard")
    } else {
      router.push("/dashboard")
    }
  }, [mounted, isAuthenticated, user, router])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
