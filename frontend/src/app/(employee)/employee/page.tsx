"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { BentoCard } from "@/components/employee/bento-card"
import { useEmployeeDashboard } from "@/hooks/employee/use-employee-dashboard"
import {
  GraduationCap,
} from "lucide-react"

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const { data: dashboard, isLoading } = useEmployeeDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    )
  }

  const nv = dashboard?.nhan_vien
  const np = dashboard?.nghi_phep
  const cc = dashboard?.cham_cong?.thang_hien_tai

  const initials = nv?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-blue-200" />
              <span className="text-xs text-blue-200">THPT Thăng Long</span>
            </div>
            <h1 className="text-xl font-bold">Xin chào, {nv?.ho_ten || "Nhân viên"} 👋</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {nv?.chuc_vu?.ten_chuc_vu || "Nhân viên"}
              {nv?.phong_ban?.ten_phong_ban ? ` · ${nv.phong_ban.ten_phong_ban}` : ""}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold shrink-0">
            {initials}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BentoCard
          label="🏖️ Phép còn lại"
          value={np ? `${np.so_ngay_phep_con_lai}` : "—"}
          subtitle={np ? `/ ${np.tong_ngay_phep_nam} ngày` : undefined}
          variant="blue"
          onClick={() => router.push("/employee/nghi-phep")}
        />
        <BentoCard
          label="📋 Công tháng này"
          value={cc?.so_ngay_cong ?? "—"}
          subtitle="ngày làm việc"
          variant="green"
          onClick={() => router.push("/employee/cham-cong")}
        />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3">
          <BentoCard
            label="⏳ Đơn chờ duyệt"
            value={np?.don_cho_duyet ?? 0}
            subtitle="đơn nghỉ phép"
            variant={np?.don_cho_duyet ? "amber" : "slate"}
            onClick={() => router.push("/employee/nghi-phep")}
          />
        </div>
        <div className="col-span-2">
          <BentoCard
            label="Hệ số CC"
            value={cc?.he_so ?? "—"}
            variant="outline"
            onClick={() => router.push("/employee/cham-cong")}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/employee/nghi-phep")}
          className="bg-blue-600 rounded-2xl p-3 text-center hover:bg-blue-700 transition-colors"
        >
          <div className="text-lg mb-0.5">✏️</div>
          <div className="text-[11px] text-white font-semibold">Xin nghỉ</div>
        </button>
        <button
          onClick={() => router.push("/employee/my-qr")}
          className="bg-blue-900 rounded-2xl p-3 text-center hover:bg-blue-950 transition-colors"
        >
          <div className="text-lg mb-0.5">🔢</div>
          <div className="text-[11px] text-white font-semibold">Mã chấm công</div>
        </button>
        <button
          onClick={() => router.push("/employee/luong")}
          className="bg-white border-2 border-blue-600 rounded-2xl p-3 text-center hover:bg-blue-50 transition-colors"
        >
          <div className="text-lg mb-0.5">💰</div>
          <div className="text-[11px] text-blue-600 font-semibold">Xem lương</div>
        </button>
      </div>
    </div>
  )
}
