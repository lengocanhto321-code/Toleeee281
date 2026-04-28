"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { HopDongTab } from "./_components/nhan-su/hop-dong-tab"
import { DiMuonTab } from "./_components/cham-cong/di-muon-tab"
import { LuongSoSanhTab } from "./_components/luong/so-sanh-tab"
import { KhenThuongTab } from "./_components/khen-thuong"
import { XuHuongTab } from "./_components/xu-huong"
import type { BaoCaoFilters } from "@/types/bao-cao.types"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns"
import { vi } from "date-fns/locale"

const SUB_COMPONENTS: Record<string, { id: string; component: React.ComponentType<{ filters: BaoCaoFilters }> }[]> = {
  "nhan-su": [
    { id: "hop-dong", component: HopDongTab },
  ],
  "cham-cong": [
    { id: "di-muon", component: DiMuonTab },
  ],
  "luong": [
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
  const tabs = SUB_COMPONENTS[type]
  if (tabs) {
    const tab = tabs.find(t => t.id === subType) || tabs[0]
    const Component = tab.component
    return (
      <motion.div key={`${type}-${subType}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        <Component filters={filters} />
      </motion.div>
    )
  }
  switch (type) {
    case "khen-thuong":
      return <KhenThuongTab filters={filters} />
    case "xu-huong":
      return <XuHuongTab filters={filters} />
    default:
      return <HopDongTab filters={filters} />
  }
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
  const type = searchParams.get("type") || "nhan-su"
  const subType = searchParams.get("sub") || ""

  const handleQuickRange = (range: QuickRange) => {
    setQuickRange(range)
    const today = new Date()
    let from: Date
    switch (range) {
      case "today": from = startOfDay(today); break
      case "week": from = startOfDay(subDays(today, 7)); break
      case "month": from = startOfDay(subMonths(today, 1)); break
      case "year": from = startOfDay(subYears(today, 1)); break
      case "range": return
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

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-4 p-6">
        {/* Date Filter */}
        <div className="flex items-center justify-between bg-white rounded-xl border shadow-sm px-4 py-2.5">
          <div className="flex items-center gap-1.5">
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
