"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Download, Upload, Users, Gift, Award, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNhanVienList } from "@/hooks/nhan-vien"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface NhanVienSidebarPanelProps {
  onAdd: () => void
  onExport?: () => void
}

export function NhanVienSidebarPanel({ onAdd, onExport }: NhanVienSidebarPanelProps) {
  const router = useRouter()
  const { data: listResult } = useNhanVienList({ page: 1, page_size: 200, trang_thai: "dang_lam", sort_by: "created_at", sort_desc: true })
  const nhanViens = listResult?.data || []

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const { sinhNhatThangNay, kyNiemThangNay, nvMoiThangNay, tongDangLam } = useMemo(() => {
    const sinhNhat: typeof nhanViens = []
    const kyNiem: { nv: typeof nhanViens[number]; years: number }[] = []
    const nvMoi: typeof nhanViens = []

    for (const nv of nhanViens) {
      if (nv.ngay_sinh) {
        const bd = new Date(nv.ngay_sinh)
        if (bd.getMonth() === currentMonth) {
          sinhNhat.push(nv)
        }
      }

      if (nv.ngay_vao_lam) {
        const start = new Date(nv.ngay_vao_lam)
        if (start.getMonth() === currentMonth && start.getFullYear() !== currentYear) {
          const years = currentYear - start.getFullYear()
          if (years >= 1) {
            kyNiem.push({ nv, years })
          }
        }
      }

      if (nv.created_at) {
        const created = new Date(nv.created_at)
        if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
          nvMoi.push(nv)
        }
      }
    }

    sinhNhat.sort((a, b) => {
      const dA = new Date(a.ngay_sinh!).getDate()
      const dB = new Date(b.ngay_sinh!).getDate()
      const todayDate = today.getDate()
      return Math.abs(dA - todayDate) - Math.abs(dB - todayDate)
    })

    kyNiem.sort((a, b) => b.years - a.years)

    return {
      sinhNhatThangNay: sinhNhat,
      kyNiemThangNay: kyNiem,
      nvMoiThangNay: nvMoi,
      tongDangLam: nhanViens.length,
    }
  }, [nhanViens, currentMonth, currentYear, today])

  const isBirthdayToday = (nv: typeof nhanViens[number]) => {
    if (!nv.ngay_sinh) return false
    const bd = new Date(nv.ngay_sinh)
    return bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate()
  }

  const getBirthdayDay = (nv: typeof nhanViens[number]) => {
    if (!nv.ngay_sinh) return ""
    return new Date(nv.ngay_sinh).getDate()
  }

  const getYearsLabel = (years: number) => {
    const milestones: Record<number, string> = {
      1: "1 năm",
      5: "5 năm",
      10: "10 năm",
      15: "15 năm",
      20: "20 năm",
      25: "25 năm",
      30: "30 năm",
    }
    return milestones[years] || `${years} năm`
  }

  const isMilestone = (years: number) => [1, 5, 10, 15, 20, 25, 30].includes(years)

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      window.dispatchEvent(new CustomEvent("sidebar:nhan-vien:export"))
    }
  }

  const stats = [
    { label: "Đang làm", value: tongDangLam, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Sinh nhật", value: sinhNhatThangNay.length, icon: Gift, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { label: "Kỷ niệm", value: kyNiemThangNay.length, icon: Award, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "NV mới", value: nvMoiThangNay.length, icon: Sparkles, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Nhân viên</h2>
      </div>

      <div className="p-3 space-y-2">
        <Button onClick={onAdd} className="w-full gap-2 cursor-pointer justify-start">
          <UserPlus className="h-4 w-4" />
          Thêm nhân viên
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={() => window.dispatchEvent(new CustomEvent("sidebar:nhan-vien:import"))}>
            <Upload className="h-3 w-3" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 cursor-pointer text-xs h-8" onClick={handleExport}>
            <Download className="h-3 w-3" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-lg border p-2.5 ${s.color}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="h-3 w-3" />
                  <span className="text-[10px] font-medium opacity-80">{s.label}</span>
                </div>
                <div className="text-lg font-bold leading-none">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {sinhNhatThangNay.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Gift className="h-3 w-3 text-rose-500" />
                Sinh nhật tháng này
              </p>
              <div className="space-y-1.5">
                {sinhNhatThangNay.slice(0, 6).map((nv) => {
                  const isToday = isBirthdayToday(nv)
                  return (
                    <div
                      key={nv.id}
                      className={`group rounded-lg p-2 transition-all cursor-pointer ${
                        isToday
                          ? "bg-rose-50 border border-rose-200"
                          : "border border-transparent hover:bg-sidebar-accent"
                      }`}
                      onClick={() => router.push(`/nhan-vien/${nv.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${
                          isToday ? "bg-rose-200 text-rose-800" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {getInitials(nv.ho_ten)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium leading-snug">{nv.ho_ten}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Ngày {getBirthdayDay(nv)}
                            {isToday && <span className="text-rose-600 font-semibold ml-1">• Hôm nay!</span>}
                          </p>
                        </div>
                        {isToday && <Gift className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {kyNiemThangNay.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Award className="h-3 w-3 text-amber-500" />
                Kỷ niệm làm việc
              </p>
              <div className="space-y-1.5">
                {kyNiemThangNay.slice(0, 6).map(({ nv, years }) => {
                  const milestone = isMilestone(years)
                  return (
                    <div
                      key={nv.id}
                      className={`group rounded-lg p-2 transition-all cursor-pointer ${
                        milestone
                          ? "bg-amber-50 border border-amber-200"
                          : "border border-transparent hover:bg-sidebar-accent"
                      }`}
                      onClick={() => router.push(`/nhan-vien/${nv.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${
                          milestone ? "bg-amber-200 text-amber-800" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {getInitials(nv.ho_ten)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium leading-snug">{nv.ho_ten}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {getYearsLabel(years)} cống hiến
                          </p>
                        </div>
                        {milestone && <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {nvMoiThangNay.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                Nhân viên mới tháng này
              </p>
              <div className="space-y-1.5">
                {nvMoiThangNay.slice(0, 6).map((nv) => (
                  <div
                    key={nv.id}
                    className="group rounded-lg p-2 border border-transparent hover:bg-sidebar-accent transition-all cursor-pointer"
                    onClick={() => router.push(`/nhan-vien/${nv.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-[9px] font-bold text-emerald-700">
                        {getInitials(nv.ho_ten)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-snug">{nv.ho_ten}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                          {nv.phong_ban?.ten_phong_ban && ` • ${nv.phong_ban.ten_phong_ban}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {nhanViens.length === 0 && (
          <div className="p-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu nhân viên</p>
          </div>
        )}
      </div>
    </div>
  )
}
