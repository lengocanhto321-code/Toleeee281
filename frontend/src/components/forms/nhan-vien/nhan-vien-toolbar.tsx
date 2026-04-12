"use client"

import { useState } from "react"
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

interface FilterOption {
  value: string
  label: string
  dot?: string
}

interface SortOption {
  value: string
  label: string
}

const LOAI_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả loại" },
  { value: "giao_vien", label: "Giáo viên", dot: "bg-indigo-500" },
  { value: "nhan_vien", label: "Nhân viên", dot: "bg-slate-400" },
  { value: "can_bo", label: "Cán bộ", dot: "bg-amber-500" },
]

const TRANG_THAI_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "dang_lam", label: "Đang làm", dot: "bg-emerald-500" },
  { value: "nghi_viec", label: "Nghỉ việc", dot: "bg-amber-500" },
  { value: "nghi_huu", label: "Nghỉ hưu", dot: "bg-sky-500" },
]

const CAP_HOC_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả cấp" },
  { value: "mam_non", label: "Mầm non", dot: "bg-pink-500" },
  { value: "tieu_hoc", label: "Tiểu học", dot: "bg-emerald-500" },
  { value: "thcs", label: "THCS", dot: "bg-blue-500" },
  { value: "thpt", label: "THPT", dot: "bg-purple-500" },
]

const SORT_OPTIONS: SortOption[] = [
  { value: "ho_ten", label: "Họ tên (A-Z)" },
  { value: "ho_ten_desc", label: "Họ tên (Z-A)" },
  { value: "ngay_vao_lam", label: "Ngày vào (Mới → Cũ)" },
  { value: "ngay_vao_lam_desc", label: "Ngày vào (Cũ → Mới)" },
  { value: "thanh_nien", label: "Thâm niên (Cao → Thấp)" },
  { value: "thanh_nien_desc", label: "Thâm niên (Thấp → Cao)" },
]

interface NhanVienToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  trangThaiFilter: string
  onTrangThaiFilterChange: (value: string) => void
  loaiFilter: string
  onLoaiFilterChange: (value: string) => void
  capHocFilter: string
  onCapHocFilterChange: (value: string) => void
  phongBanFilter: string
  onPhongBanFilterChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
  onExport?: () => void
  onPrint?: () => void
  phongBanOptions?: { value: string; label: string }[]
}

export function NhanVienToolbar({
  search,
  onSearchChange,
  trangThaiFilter,
  onTrangThaiFilterChange,
  loaiFilter,
  onLoaiFilterChange,
  capHocFilter,
  onCapHocFilterChange,
  phongBanFilter,
  onPhongBanFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onExport,
  onPrint,
  phongBanOptions = [],
}: NhanVienToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const hasAdvancedFilters =
    loaiFilter !== "all" ||
    capHocFilter !== "all" ||
    phongBanFilter !== "all"

  const hasAnyFilters =
    trangThaiFilter !== "all" || hasAdvancedFilters || search.length > 0

  const handleClearAll = () => {
    onSearchChange("")
    onTrangThaiFilterChange("all")
    onLoaiFilterChange("all")
    onCapHocFilterChange("all")
    onPhongBanFilterChange("all")
  }

  const handleApplyAdvanced = () => {
    setAdvancedOpen(false)
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
              placeholder="Tìm tên, mã NV, email, CCCD..."
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

        {/* Right: Sort, Advanced Filter, View Mode */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdvancedOpen(true)}
            className={cn(
              "h-9 gap-1.5 border-dashed cursor-pointer",
              hasAdvancedFilters && "border-solid border-slate-400 bg-slate-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Lọc nâng cao
            {hasAdvancedFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center text-[10px]">
                {[loaiFilter, capHocFilter, phongBanFilter].filter(f => f !== "all").length}
              </Badge>
            )}
          </Button>

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
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTrangThaiFilterChange("all")}
              />
            </Badge>
          )}
          {loaiFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {LOAI_OPTIONS.find((o) => o.value === loaiFilter)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onLoaiFilterChange("all")}
              />
            </Badge>
          )}
          {capHocFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {CAP_HOC_OPTIONS.find((o) => o.value === capHocFilter)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onCapHocFilterChange("all")}
              />
            </Badge>
          )}
          {phongBanFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {phongBanOptions.find((o) => o.value === phongBanFilter)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onPhongBanFilterChange("all")}
              />
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

      {/* Advanced Filter Dialog */}
      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lọc nâng cao</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Phân loại */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phân loại</label>
              <Select value={loaiFilter} onValueChange={onLoaiFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nhân viên" />
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
            </div>

            {/* Cấp học */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cấp học</label>
              <Select value={capHocFilter} onValueChange={onCapHocFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp học" />
                </SelectTrigger>
                <SelectContent>
                  {CAP_HOC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.dot && <span className={cn("h-2 w-2 rounded-full", opt.dot)} />}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phòng ban */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phòng ban</label>
              <Select value={phongBanFilter} onValueChange={onPhongBanFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {phongBanOptions.map((pb) => (
                    <SelectItem key={pb.value} value={pb.value}>
                      {pb.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearAll} className="cursor-pointer">
              Xóa lọc
            </Button>
            <Button onClick={handleApplyAdvanced} className="cursor-pointer">
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
