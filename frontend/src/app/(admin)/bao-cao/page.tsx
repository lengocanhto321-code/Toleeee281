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
import { Users, Clock, Wallet, Trophy, TrendingUp, ChevronDown, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns"
import { vi } from "date-fns/locale"

const TAB_ITEMS = [
  { id: "nhan-su", label: "Nhân sự", icon: Users, subs: ["tong-hop", "bien-dong", "demo", "trinh-do", "hop-dong"] },
  { id: "cham-cong", label: "Chấm công", icon: Clock, subs: ["tong-hop", "nghi-phep", "di-muon"] },
  { id: "luong", label: "Lương", icon: Wallet, subs: ["chi-phi", "thue-bhxh", "so-sanh"] },
  { id: "khen-thuong", label: "Khen thưởng", icon: Trophy },
  { id: "xu-huong", label: "Xu hướng", icon: TrendingUp },
]

const NHAN_SU_TABS = [
  { id: "tong-hop", component: NhanSuTongHopTab },
  { id: "bien-dong", component: NhanSuBienDongTab },
  { id: "demo", component: NhanSuDemoGraphicsTab },
  { id: "trinh-do", component: NhanSuTrinhDoTab },
  { id: "hop-dong", component: HopDongTab },
]

const CHAM_CONG_TABS = [
  { id: "tong-hop", component: ChamCongTongHopTab },
  { id: "nghi-phep", component: ChamCongNghiPhepTab },
  { id: "di-muon", component: DiMuonTab },
]

const LUONG_TABS = [
  { id: "chi-phi", component: LuongChiPhiTab },
  { id: "thue-bhxh", component: LuongThueBHXHTab },
  { id: "so-sanh", component: LuongSoSanhTab },
]

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
    switch (type) {
      case "nhan-su": {
        const tab = NHAN_SU_TABS.find(t => t.id === subType) || NHAN_SU_TABS[0]
        const Component = tab.component
        return <Component filters={filters} />
      }
      case "cham-cong": {
        const tab = CHAM_CONG_TABS.find(t => t.id === subType) || CHAM_CONG_TABS[0]
        const Component = tab.component
        return <Component filters={filters} />
      }
      case "luong": {
        const tab = LUONG_TABS.find(t => t.id === subType) || LUONG_TABS[0]
        const Component = tab.component
        return <Component filters={filters} />
      }
      case "khen-thuong":
        return <KhenThuongTab filters={filters} />
      case "xu-huong":
        return <XuHuongTab filters={filters} />
      default: {
        const tab = NHAN_SU_TABS[0]
        const Component = tab.component
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
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get("type") || "nhan-su"
  const subType = searchParams.get("sub") || ""

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

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-4 p-6">
        {/* Date Filter Bar */}
        <div className="flex items-center gap-3 bg-white rounded-xl border shadow-sm p-3">
          {QUICK_RANGES.map((qr) => (
            <Button
              key={qr.id}
              variant={quickRange === qr.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs",
                quickRange === qr.id && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={() => handleQuickRange(qr.id)}
            >
              {qr.label}
            </Button>
          ))}

          {quickRange !== "range" && (
            <span className="text-xs text-muted-foreground ml-2">
              {format(dateFrom, "dd/MM/yyyy")} — {format(dateTo, "dd/MM/yyyy")}
            </span>
          )}

          {quickRange === "range" && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 ml-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateFrom && dateTo
                    ? `${format(dateFrom, "dd/MM/yyyy")} — ${format(dateTo, "dd/MM/yyyy")}`
                    : "Chọn khoảng thời gian"}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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

        {/* Tabs Navigation */}
        <div className="border-b">
          <div className="flex gap-1">
            {TAB_ITEMS.map((tab) => (
              <div key={tab.id} className="relative">
                <button
                  onClick={() => {
                    handleTabChange(tab.id)
                    if (tab.subs) {
                      setExpandedTab(expandedTab === tab.id ? null : tab.id)
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                    type === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.subs && (
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform",
                      expandedTab === tab.id && "rotate-180"
                    )} />
                  )}
                </button>
                {expandedTab === tab.id && tab.subs && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 py-1 min-w-[150px]"
                  >
                    {tab.subs.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams)
                          params.set("type", tab.id)
                          params.set("sub", sub)
                          router.push(`/bao-cao?${params.toString()}`)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <ContentArea type={type} subType={subType} filters={filters} />
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
