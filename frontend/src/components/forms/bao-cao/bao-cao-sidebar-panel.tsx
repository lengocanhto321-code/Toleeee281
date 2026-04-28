"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, FileSpreadsheet, Download, TrendingUp, Users, Clock, Wallet, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface BaoCaoSidebarPanelProps {}

export function BaoCaoSidebarPanel({}: BaoCaoSidebarPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("nhan-su")

  const quickStats = [
    { label: "Nhân sự", icon: Users, count: 45, color: "text-blue-600 bg-blue-50" },
    { label: "Chấm công", icon: Clock, count: "98%", color: "text-emerald-600 bg-emerald-50" },
    { label: "Lương", icon: Wallet, count: "12.5M", color: "text-amber-600 bg-amber-50" },
  ]

  const reportLinks = [
    {
      id: "nhan-su",
      label: "Nhân sự",
      icon: Users,
      sub: ["Tổng hợp", "Biến động", "Demographics", "Trình độ", "Hợp đồng"],
      href: "/bao-cao?type=nhan-su",
    },
    {
      id: "cham-cong",
      label: "Chấm công",
      icon: Clock,
      sub: ["Tổng hợp", "Nghỉ phép", "Đi muộn"],
      href: "/bao-cao?type=cham-cong",
    },
    {
      id: "luong",
      label: "Lương",
      icon: Wallet,
      sub: ["Chi phí", "Thuế & BHXH", "So sánh"],
      href: "/bao-cao?type=luong",
    },
  ]

  const recentReports = [
    { name: "Báo cáo tháng 4/2026", date: "20/04/2026", type: "Nhân sự" },
    { name: "Báo cáo Q1/2026", date: "15/04/2026", type: "Lương" },
  ]

  return (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div className="text-base font-medium text-foreground">Báo cáo</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <div className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="text-center p-2 rounded-xl border bg-white/60 backdrop-blur-xl">
                    <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color.split(" ")[0])} />
                    <div className="text-sm font-semibold text-foreground">{stat.count}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Thao tác nhanh</p>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 border-border/50">
                  <FileSpreadsheet className="w-4 h-4" />
                  Tạo báo cáo mới
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 border-border/50">
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </Button>
              </div>

              {/* Report Categories */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Danh mục báo cáo</p>
                {reportLinks.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab(cat.id)
                      router.push(cat.href)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === cat.id
                        ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                        : "hover:bg-muted text-muted-foreground border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 ml-6">{cat.sub.join(" • ")}</div>
                  </button>
                ))}
              </div>

              {/* Recent Reports */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gần đây</p>
                <div className="space-y-2">
                  {recentReports.map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                      <div>
                        <div className="text-sm font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">{report.type} • {report.date}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  )
}
