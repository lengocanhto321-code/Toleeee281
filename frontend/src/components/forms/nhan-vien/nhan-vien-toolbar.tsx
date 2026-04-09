"use client"

import { useState } from "react"
import { Search, X, ChevronsUpDown, Check, ListFilter, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface FilterOption {
  value: string
  label: string
  dot?: string
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

function FilterPopover({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const isFiltered = value !== "all"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 w-44 justify-start gap-1.5 cursor-pointer border-dashed",
            isFiltered && "border-solid border-slate-400 bg-slate-50"
          )}
        >
          <ListFilter className="h-3.5 w-3.5 text-slate-400" />
          {isFiltered && selected ? selected.label : label}
          <ChevronsUpDown className="ml-auto h-3 w-3 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  data-checked={value === option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  {option.dot && (
                    <span className={cn("h-2 w-2 rounded-full shrink-0", option.dot)} />
                  )}
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface NhanVienToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  trangThaiFilter: string
  onTrangThaiFilterChange: (value: string) => void
  loaiFilter: string
  onLoaiFilterChange: (value: string) => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
}

export function NhanVienToolbar({
  search,
  onSearchChange,
  trangThaiFilter,
  onTrangThaiFilterChange,
  loaiFilter,
  onLoaiFilterChange,
  viewMode,
  onViewModeChange,
}: NhanVienToolbarProps) {
  const hasActiveFilters = trangThaiFilter !== "all" || loaiFilter !== "all" || search.length > 0

  const handleClearFilters = () => {
    onSearchChange("")
    onTrangThaiFilterChange("all")
    onLoaiFilterChange("all")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, mã NV, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <FilterPopover
            label="Phân loại"
            options={LOAI_OPTIONS}
            value={loaiFilter}
            onChange={onLoaiFilterChange}
          />
          <FilterPopover
            label="Trạng thái"
            options={TRANG_THAI_OPTIONS}
            value={trangThaiFilter}
            onChange={onTrangThaiFilterChange}
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={handleClearFilters} className="h-9 w-9 cursor-pointer text-slate-500">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center p-1 rounded-md bg-slate-100/80 border border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 px-3 cursor-pointer text-slate-500 font-medium", viewMode === "table" && "bg-white text-slate-900 shadow-sm hover:bg-white")}
          onClick={() => onViewModeChange("table")}
        >
          <List className="h-4 w-4 mr-1.5" />
          Danh sách
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 px-3 cursor-pointer text-slate-500 font-medium", viewMode === "grid" && "bg-white text-slate-900 shadow-sm hover:bg-white")}
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="h-4 w-4 mr-1.5" />
          Lưới
        </Button>
      </div>
    </div>
  )
}
