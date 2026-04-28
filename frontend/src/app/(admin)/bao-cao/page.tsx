"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { NhanSuTongHopTab } from "./_components/nhan-su/tong-hop-tab"
import { NhanSuBienDongTab } from "./_components/nhan-su/bien-dong-tab"
import { NhanSuDemoGraphicsTab } from "./_components/nhan-su/demo-graphics-tab"
import { NhanSuTrinhDoTab } from "./_components/nhan-su/trinh-do-tab"
import { HopDongTab } from "./_components/nhan-su/hop-dong-tab"
import { ChamCongTongHopTab } from "./_components/cham-cong/tong-hop-tab"
import { ChamCongNghiPhepTab } from "./_components/cham-cong/nghi-phep-tab"
import { DiMuonTab } from "./_components/cham-cong/di-muon-tab"
import { LuongChiPhiTab } from "./_components/luong/chi-phi-tab"
import { LuongThueBHXHTab } from "./_components/luong/thue-bhxh-tab"
import { LuongSoSanhTab } from "./_components/luong/so-sanh-tab"
import { KhenThuongTab } from "./_components/khen-thuong"
import { XuHuongTab } from "./_components/xu-huong"
import type { BaoCaoFilters } from "@/types/bao-cao.types"
import {
  Users, Clock, Wallet, Trophy, TrendingUp, CalendarIcon, ChevronDown,
  PieChart, Activity, BarChart3, GraduationCap, FileText,
  CalendarCheck, CalendarOff, Timer, Receipt, ShieldCheck, GitCompareArrows,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns"
import { vi } from "date-fns/locale"

const TAB_ITEMS = [
  {
    id: "nhan-su",
    label: "Nhân sự",
    icon: Users,
    subs: [
      { id: "tong-hop", label: "Tổng hợp", icon: PieChart },
      { id: "bien-dong", label: "Biến động", icon: Activity },
      { id: "demo", label: "Demographics", icon: BarChart3 },
      { id: "trinh-do", label: "Trình độ", icon: GraduationCap },
      { id: "hop-dong", label: "Hợp đồng", icon: FileText },
    ],
  },
  {
    id: "cham-cong",
    label: "Chấm công",
    icon: Clock,
    subs: [
      { id: "tong-hop", label: "Tổng hợp", icon: CalendarCheck },
      { id: "nghi-phep", label: "Nghỉ phép", icon: CalendarOff },
      { id: "di-muon", label: "Đi muộn", icon: Timer },
    ],
  },
  {
    id: "luong",
    label: "Lương",
    icon: Wallet,
    subs: [
      { id: "chi-phi", label: "Chi phí", icon: Receipt },
      { id: "thue-bhxh", label: "Thuế & BHXH", icon: ShieldCheck },
      { id: "so-sanh", label: "So sánh", icon: GitCompareArrows },
    ],
  },
  { id: "khen-thuong", label: "Khen thưởng", icon: Trophy },
  { id: "xu-huong", label: "Xu hướng", icon: TrendingUp },
]

const SUB_COMPONENTS: Record<string, { id: string; component: React.ComponentType<{ filters: BaoCaoFilters }> }[]> = {
  "nhan-su": [
    { id: "tong-hop", component: NhanSuTongHopTab },
    { id: "bien-dong", component: NhanSuBienDongTab },
    { id: "demo", component: NhanSuDemoGraphicsTab },
    { id: "trinh-do", component: NhanSuTrinhDoTab },
    { id: "hop-dong", component: HopDongTab },
  ],
  "cham-cong": [
    { id: "tong-hop", component: ChamCongTongHopTab },
    { id: "nghi-phep", component: ChamCongNghiPhepTab },
    { id: "di-muon", component: DiMuonTab },
  ],
  "luong": [
    { id: "chi-phi", component: LuongChiPhiTab },
    { id: "thue-bhxh", component: LuongThueBHXHTab },
    { id: "so-sanh", component: LuongSoSanhTab },
  ],
}

type QuickRange = "today" | "week" | "month" | "year" | "range"

const QUICK_RANGES: { id: QuickRange; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "1 Tuần" },
  { id: "month", label: "1 Tháng" },
  { id: "year", label: "1 Năm" },
  { id: "range", label: "Tùy chỉnh" },
]

function ContentArea({ type, subType, filters }: { type: string; subType: string; filters: BaoCaoFilters }) {
  const renderContent = () => {
    const tabs = SUB_COMPONENTS[type]
    if (tabs) {
      const tab = tabs.find(t => t.id === subType) || tabs[0]
      const Component = tab.component
      return <Component filters={filters} />
    }
    switch (type) {
      case "khen-thuong":
        return <KhenThuongTab filters={filters} />
      case "xu-huong":
        return <XuHuongTab filters={filters} />
      default: {
        const Component = NhanSuTongHopTab
        return <Component filters={filters} />
      }
    }
  }

  return (
    <motion.div
      key={`${type}-${subType}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {renderContent()}
    </motion.div>
  )
}

function BaoCaoContent() {
  const now = new Date()
  const [filters, setFilters] = useState<BaoCaoFilters>({
    thang: now.getMonth() + 1,
    nam: now.getFullYear(),
  })

  const [quickRange, setQuickRange] = useState<QuickRange>("month")
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(now, 1))
  const [dateTo, setDateTo] = useState<Date>(now)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get("type") || "nhan-su"
  const subType = searchParams.get("sub") || ""

  const activeTab = TAB_ITEMS.find(t => t.id === type) || TAB_ITEMS[0]
  const activeSubs = activeTab.subs
  const defaultSub = activeSubs?.[0]?.id || ""
  const currentSub = subType || defaultSub

  const handleQuickRange = (range: QuickRange) => {
    setQuickRange(range)
    const today = new Date()
    let from: Date
    switch (range) {
      case "today":
        from = startOfDay(today)
        break
      case "week":
        from = startOfDay(subDays(today, 7))
        break
      case "month":
        from = startOfDay(subMonths(today, 1))
        break
      case "year":
        from = startOfDay(subYears(today, 1))
        break
      case "range":
        return
    }
    setDateFrom(from)
    setDateTo(endOfDay(today))
    setFilters({ thang: from.getMonth() + 1, nam: from.getFullYear() })
  }

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setDateFrom(range.from)
      if (range.to) {
        setDateTo(range.to)
        setFilters({ thang: range.from.getMonth() + 1, nam: range.from.getFullYear() })
        setCalendarOpen(false)
      }
    }
  }

  const handleTabChange = (newType: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", newType)
    params.delete("sub")
    router.push(`/bao-cao?${params.toString()}`)
  }

  const handleSubChange = (subId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", type)
    params.set("sub", subId)
    router.push(`/bao-cao?${params.toString()}`)
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-4 p-6">
        {/* Date Filter Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl border shadow-sm px-4 py-2.5">
          <div className="flex items-center gap-2">
            {QUICK_RANGES.map((qr) => (
              <Button
                key={qr.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs rounded-md transition-all",
                  quickRange === qr.id
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => handleQuickRange(qr.id)}
              >
                {qr.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {quickRange !== "range" && (
              <span className="bg-muted/50 px-3 py-1 rounded-md font-medium">
                {format(dateFrom, "dd/MM/yyyy")} — {format(dateTo, "dd/MM/yyyy")}
              </span>
            )}

            {quickRange === "range" && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {dateFrom && dateTo
                      ? `${format(dateFrom, "dd/MM/yyyy")} — ${format(dateTo, "dd/MM/yyyy")}`
                      : "Chọn khoảng thời gian"}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateFrom, to: dateTo }}
                    onSelect={handleRangeSelect}
                    numberOfMonths={2}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <div className="border-b">
          <div className="flex gap-0.5">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                  type === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs (only show when active tab has subs) */}
        {activeSubs && activeSubs.length > 0 && (
          <div className="flex items-center gap-1 -mt-2">
            {activeSubs.map((sub) => {
              const SubIcon = sub.icon
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubChange(sub.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                    currentSub === sub.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  {sub.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Content */}
        <ContentArea type={type} subType={currentSub} filters={filters} />
      </div>
    </AuthenticatedLayout>
  )
}

export default function BaoCaoPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-6">Đang tải...</div>}>
      <BaoCaoContent />
    </Suspense>
  )
}
