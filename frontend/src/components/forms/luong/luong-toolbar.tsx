"use client"

import { Search, Play, Settings, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LuongToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  thang: number
  onThangChange: (value: number) => void
  nam: number
  onNamChange: (value: number) => void
  activeTab: "ky-luong" | "tra-luong" | "cau-hinh"
  onTabChange: (tab: "ky-luong" | "tra-luong" | "cau-hinh") => void
  onChayLuong: () => void
  onCauHinh: () => void
  isChayLuongPending?: boolean
}

export function LuongToolbar({
  search,
  onSearchChange,
  thang,
  onThangChange,
  nam,
  onNamChange,
  activeTab,
  onTabChange,
  onChayLuong,
  onCauHinh,
  isChayLuongPending = false,
}: LuongToolbarProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
        <button
          onClick={() => onTabChange("ky-luong")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "ky-luong"
              ? "bg-blue-50 text-blue-700 border border-blue-200 border-b-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Kỳ lương
        </button>
        <button
          onClick={() => onTabChange("tra-luong")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "tra-luong"
              ? "bg-blue-50 text-blue-700 border border-blue-200 border-b-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Phiếu lương
        </button>
        <button
          onClick={() => onTabChange("cau-hinh")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "cau-hinh"
              ? "bg-blue-50 text-blue-700 border border-blue-200 border-b-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Cấu hình
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Month/Year Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" />
            <Select
              value={String(thang)}
              onValueChange={(v) => onThangChange(parseInt(v))}
            >
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    Tháng {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select
            value={String(nam)}
            onValueChange={(v) => onNamChange(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onCauHinh}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            Cấu hình
          </Button>
          <Button
            size="sm"
            onClick={onChayLuong}
            disabled={isChayLuongPending}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4" data-icon="inline-start" />
            {isChayLuongPending ? "Đang chạy..." : "Chạy lương"}
          </Button>
        </div>
      </div>
    </div>
  )
}
