"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang chuyển hướng...</p>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
