"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import {
  BarChart3, Users, Clock, Wallet, ChevronRight,
  PieChart, Activity, BarChart3Icon, GraduationCap, FileText,
  CalendarCheck, CalendarOff, Timer, Receipt, ShieldCheck, GitCompareArrows,
  Trophy, TrendingUp, Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { ExportAllDialog } from "@/app/(admin)/bao-cao/_components/export-all-dialog"

const REPORT_CATEGORIES = [
  {
    id: "nhan-su",
    label: "Nhân sự",
    icon: Users,
    subs: [
      { id: "tong-hop", label: "Tổng hợp", icon: PieChart },
      { id: "bien-dong", label: "Biến động", icon: Activity },
      { id: "demo", label: "Demographics", icon: BarChart3Icon },
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
  { id: "khen-thuong", label: "Khen thưởng", icon: Trophy, subs: [] },
  { id: "xu-huong", label: "Xu hướng", icon: TrendingUp, subs: [] },
]

export function BaoCaoSidebarPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [exportAllOpen, setExportAllOpen] = useState(false)

  const currentType = searchParams.get("type") || "nhan-su"
  const currentSub = searchParams.get("sub") || ""
  const [expandedCat, setExpandedCat] = useState<string | null>(currentType)

  const handleCategoryClick = (catId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", catId)
    params.delete("sub")
    router.push(`/bao-cao?${params.toString()}`)
    setExpandedCat(expandedCat === catId ? null : catId)
  }

  const handleSubClick = (catId: string, subId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", catId)
    params.set("sub", subId)
    router.push(`/bao-cao?${params.toString()}`)
  }

  const isSubActive = (catId: string, subId: string) => {
    if (catId !== currentType) return false
    if (!currentSub) {
      const cat = REPORT_CATEGORIES.find(c => c.id === catId)
      return cat?.subs?.[0]?.id === subId
    }
    return currentSub === subId
  }

  return (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-base font-medium text-foreground">Báo cáo</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <div className="p-3 space-y-0.5">
              {REPORT_CATEGORIES.map((cat) => {
                const isActive = currentType === cat.id
                const isExpanded = expandedCat === cat.id
                const hasSubs = cat.subs && cat.subs.length > 0

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-accent text-primary font-medium"
                          : "hover:bg-muted/70 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <cat.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                        <span className="flex-1">{cat.label}</span>
                        {hasSubs && (
                          <ChevronRight className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isExpanded && "rotate-90"
                          )} />
                        )}
                      </div>
                    </button>

                    {isExpanded && hasSubs && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border/50 pl-2.5 py-0.5">
                          {cat.subs.map((sub) => {
                            const subActive = isSubActive(cat.id, sub.id)
                            const SubIcon = sub.icon
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubClick(cat.id, sub.id)}
                                className={cn(
                                  "w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 flex items-center gap-2",
                                  subActive
                                    ? "bg-accent/70 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                              >
                                <SubIcon className="w-3.5 h-3.5" />
                                {sub.label}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <button
          onClick={() => setExportAllOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Xuất toàn bộ báo cáo
        </button>
      </SidebarFooter>
      <ExportAllDialog open={exportAllOpen} onOpenChange={setExportAllOpen} />
    </>
  )
}
