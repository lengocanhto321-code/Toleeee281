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
import { BarChart3, Users, Clock, Wallet, Trophy, TrendingUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const TAB_ITEMS = [
  { 
    id: "nhan-su", 
    label: "Nhân sự", 
    icon: Users,
    subs: ["tong-hop", "bien-dong", "demo", "trinh-do", "hop-dong"]
  },
  { 
    id: "cham-cong", 
    label: "Chấm công", 
    icon: Clock,
    subs: ["tong-hop", "nghi-phep", "di-muon"]
  },
  { 
    id: "luong", 
    label: "Lương", 
    icon: Wallet,
    subs: ["chi-phi", "thue-bhxh", "so-sanh"]
  },
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
  const [filters, setFilters] = useState<BaoCaoFilters>(() => {
    const now = new Date()
    return { thang: now.getMonth() + 1, nam: now.getFullYear() }
  })
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get("type") || "nhan-su"
  const subType = searchParams.get("sub") || ""

  const handleTabChange = (newType: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("type", newType)
    params.delete("sub")
    router.push(`/bao-cao?${params.toString()}`)
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-blue-900 p-8 border border-blue-800/50">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-700 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-300" />
              <h1 className="text-2xl font-bold text-white">Báo cáo & Thống kê</h1>
            </div>
          </div>
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
                {/* Expandable subcategories */}
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
