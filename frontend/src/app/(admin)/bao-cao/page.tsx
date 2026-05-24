"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { TongHopTab } from "./_components/nhan-su/tong-hop-tab"
import { BienDongTab } from "./_components/nhan-su/bien-dong-tab"
import { DemoGraphicsTab } from "./_components/nhan-su/demo-graphics-tab"
import { TrinhDoTab } from "./_components/nhan-su/trinh-do-tab"
import { HopDongTab } from "./_components/nhan-su/hop-dong-tab"
import { ChamCongTongHopTab } from "./_components/cham-cong/tong-hop-tab"
import { NghiPhepTab } from "./_components/cham-cong/nghi-phep-tab"
import { DiMuonTab } from "./_components/cham-cong/di-muon-tab"
import { ChiPhiTab } from "./_components/luong/chi-phi-tab"
import { ThueBHXHTab } from "./_components/luong/thue-bhxh-tab"
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
    { id: "tong-hop", component: TongHopTab },
    { id: "bien-dong", component: BienDongTab },
    { id: "demo", component: DemoGraphicsTab },
    { id: "trinh-do", component: TrinhDoTab },
    { id: "hop-dong", component: HopDongTab },
  ],
  "cham-cong": [
    { id: "tong-hop", component: ChamCongTongHopTab },
    { id: "nghi-phep", component: NghiPhepTab },
    { id: "di-muon", component: DiMuonTab },
  ],
  "luong": [
    { id: "chi-phi", component: ChiPhiTab },
    { id: "thue-bhxh", component: ThueBHXHTab },
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
      return <TongHopTab filters={filters} />
  }
}

function BaoCaoContent() {
  const now = new Date()
  const [quickRange, setQuickRange] = useState<QuickRange>("month")
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(now, 1))
  const [dateTo, setDateTo] = useState<Date>(now)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const filters: BaoCaoFilters = {
    start_date: format(dateFrom, "yyyy-MM-dd"),
    end_date: format(dateTo, "yyyy-MM-dd"),
  }

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
  }

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setDateFrom(range.from)
      if (range.to) {
        setDateTo(range.to)
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
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm"
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
        <div data-slot="bao-cao-content">
          <ContentArea type={type} subType={subType} filters={filters} />
        </div>
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
