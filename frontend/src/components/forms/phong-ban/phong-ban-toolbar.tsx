"use client"

import { Search, X, LayoutGrid, List, SlidersHorizontal, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const LOAI_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "chuyen_mon", label: "Tổ chuyên môn", dot: "bg-amber-500" },
  { value: "hanh_chinh", label: "Phòng hành chính", dot: "bg-indigo-500" },
]

const TRANG_THAI_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động", dot: "bg-emerald-500" },
  { value: "inactive", label: "Không hoạt động", dot: "bg-slate-400" },
]

const SORT_OPTIONS = [
  { value: "ten_phong_ban", label: "Tên (A-Z)" },
  { value: "ten_phong_ban_desc", label: "Tên (Z-A)" },
  { value: "ma_phong_ban", label: "Mã (A-Z)" },
  { value: "ma_phong_ban_desc", label: "Mã (Z-A)" },
]

interface PhongBanToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  trangThaiFilter: string
  onTrangThaiFilterChange: (value: string) => void
  loaiFilter: string
  onLoaiFilterChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
}

export function PhongBanToolbar({
  search,
  onSearchChange,
  trangThaiFilter,
  onTrangThaiFilterChange,
  loaiFilter,
  onLoaiFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: PhongBanToolbarProps) {
  const hasAnyFilters = trangThaiFilter !== "all" || loaiFilter !== "all" || search.length > 0

  const handleClearAll = () => {
    onSearchChange("")
    onTrangThaiFilterChange("all")
    onLoaiFilterChange("all")
  }

  return (
    <div className="space-y-3">
      {/* Main Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
        {/* Left: Search + Quick Status */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm tên, mã phòng ban..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Quick Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100/80 border border-slate-200">
            {TRANG_THAI_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 cursor-pointer text-slate-500 font-medium",
                  trangThaiFilter === opt.value && "bg-white text-slate-900 shadow-sm hover:bg-white"
                )}
                onClick={() => onTrangThaiFilterChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Right: Sort + View Mode */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 w-44 border-dashed">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filter Button */}
          <Select value={loaiFilter} onValueChange={onLoaiFilterChange}>
            <SelectTrigger className={cn("h-9 gap-1.5 border-dashed", loaiFilter !== "all" && "border-solid border-slate-400 bg-slate-50")}>
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Loại phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {LOAI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.dot && <span className={cn("h-2 w-2 rounded-full", opt.dot)} />}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center p-1 rounded-md bg-slate-100/80 border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 cursor-pointer text-slate-500 font-medium",
                viewMode === "table" && "bg-white text-slate-900 shadow-sm hover:bg-white"
              )}
              onClick={() => onViewModeChange("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 cursor-pointer text-slate-500 font-medium",
                viewMode === "grid" && "bg-white text-slate-900 shadow-sm hover:bg-white"
              )}
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Tags */}
      {hasAnyFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Đang lọc:</span>
          {trangThaiFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {TRANG_THAI_OPTIONS.find((o) => o.value === trangThaiFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onTrangThaiFilterChange("all")} />
            </Badge>
          )}
          {loaiFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {LOAI_OPTIONS.find((o) => o.value === loaiFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onLoaiFilterChange("all")} />
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Tìm: &quot;{search}&quot;
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 cursor-pointer text-xs text-slate-500 hover:text-red-600"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
}
