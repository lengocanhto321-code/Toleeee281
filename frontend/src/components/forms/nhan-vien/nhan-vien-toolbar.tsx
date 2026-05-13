"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Search, X, SlidersHorizontal, Filter,
  CalendarIcon, DollarSign, Flag, Users, FileText, ShieldCheck,
  Building, Clock, RotateCcw, Sparkles, Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Combobox } from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { NhanVienFilterParams } from "@/hooks/nhan-vien/use-nhan-vien-query"

interface FilterOption {
  value: string
  label: string
  dot?: string
}

const LOAI_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
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
  { value: "all", label: "Tất cả" },
  { value: "mam_non", label: "Mầm non", dot: "bg-pink-500" },
  { value: "tieu_hoc", label: "Tiểu học", dot: "bg-emerald-500" },
  { value: "thcs", label: "THCS", dot: "bg-blue-500" },
  { value: "thpt", label: "THPT", dot: "bg-purple-500" },
]

const GIOI_TINH_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
]

const LOAI_HOP_DONG_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "vien_chuc", label: "Viên chức" },
  { value: "hop_dong", label: "Hợp đồng" },
  { value: "thu_viec", label: "Thử việc" },
]

const HANG_CHUC_DANH_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "A1", label: "Hạng I" },
  { value: "A2", label: "Hạng II" },
  { value: "B", label: "Hạng III" },
  { value: "C", label: "Hạng IV" },
]

const DAN_TOC_OPTIONS = [
  "Kinh", "Tày", "Thái", "Mường", "Khmer", "Hoa", "Nùng", "H'Mông", "Dao", "Gia Rai", "Ê Đê", "Ba Na", "Chăm", "Khác",
]

const TON_GIAO_OPTIONS = [
  "Không", "Phật giáo", "Công giáo", "Tin lành", "Cao Đài", "Hòa Hảo", "Hồi giáo", "Khác",
]

const TINH_TRANG_HON_NHAN_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "doc_than", label: "Độc thân" },
  { value: "da_ket_hon", label: "Đã kết hôn" },
  { value: "ly_hon", label: "Ly hôn" },
  { value: "goa_ba", label: "Góa" },
]

const NGACH_LUONG_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "A0", label: "Ngạch A0" },
  { value: "A1", label: "Ngạch A1" },
  { value: "A2", label: "Ngạch A2" },
  { value: "B", label: "Ngạch B" },
  { value: "C", label: "Ngạch C" },
]

const SORT_OPTIONS = [
  { value: "ho_ten_asc", label: "Họ tên (A→Z)" },
  { value: "ho_ten_desc", label: "Họ tên (Z→A)" },
  { value: "ngay_vao_lam_asc", label: "Ngày vào (Cũ→Mới)" },
  { value: "ngay_vao_lam_desc", label: "Ngày vào (Mới→Cũ)" },
  { value: "created_at_desc", label: "Mới tạo nhất" },
  { value: "created_at_asc", label: "Cũ nhất" },
]

interface PresetFilter {
  label: string
  icon: React.ElementType
  filters: NhanVienFilterParams
}

const PRESET_FILTERS: PresetFilter[] = [
  { label: "Giáo viên đang làm", icon: Users, filters: { trang_thai: "dang_lam", loai_nhan_vien: "giao_vien" } },
  { label: "Hợp đồng", icon: FileText, filters: { trang_thai: "dang_lam", loai_hop_dong: "hop_dong" } },
  { label: "Đảng viên", icon: Flag, filters: { la_dang_vien: true } },
  { label: "Viên chức", icon: Building, filters: { loai_hop_dong: "vien_chuc" } },
  { label: "Thử việc", icon: Clock, filters: { loai_hop_dong: "thu_viec" } },
]

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (v: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value) : undefined

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-slate-500">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal h-8 text-xs",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1.5 h-3 w-3" />
            {date ? format(date, "dd/MM/yyyy") : "Chọn ngày..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange(d ? d.toISOString().split("T")[0] : undefined)
              setOpen(false)
            }}
            locale={vi}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export interface NhanVienToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filters: NhanVienFilterParams
  onFiltersChange: (filters: NhanVienFilterParams) => void
  sortValue: string
  onSortChange: (value: string) => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
  onExport?: () => void
  onPrint?: () => void
  phongBanOptions?: { value: string; label: string }[]
  totalResults?: number
  totalCount?: number
}

export function NhanVienToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  sortValue,
  onSortChange,
  viewMode,
  onViewModeChange,
  phongBanOptions = [],
  totalResults = 0,
  totalCount = 0,
}: NhanVienToolbarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<NhanVienFilterParams>(filters)

  useEffect(() => {
    if (advancedOpen) {
      setDraftFilters({ ...filters })
    }
  }, [advancedOpen])

  const updateFilter = (key: string, value: string | boolean | number | undefined) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value } as NhanVienFilterParams
    onFiltersChange(newFilters)
  }

  const updateDraft = (key: string, value: string | boolean | number | undefined) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value === "all" ? undefined : value }) as NhanVienFilterParams)
  }

  const applyDraft = () => {
    onFiltersChange(draftFilters)
    setAdvancedOpen(false)
  }

  const clearDraft = () => {
    setDraftFilters({})
  }

  const trangThaiFilter = filters.trang_thai || "all"
  const loaiFilter = filters.loai_nhan_vien || "all"
  const capHocFilter = filters.cap_hoc || "all"
  const phongBanFilter = filters.phong_ban_id || "all"
  const gioiTinhFilter = filters.gioi_tinh || "all"
  const loaiHopDongFilter = filters.loai_hop_dong || "all"
  const hangChucDanhFilter = filters.hang_chuc_danh || "all"

  const hasAdvancedFilters =
    loaiFilter !== "all" || capHocFilter !== "all" || phongBanFilter !== "all" ||
    gioiTinhFilter !== "all" || loaiHopDongFilter !== "all" || hangChucDanhFilter !== "all" ||
    filters.ngay_vao_lam_tu || filters.ngay_vao_lam_den || filters.ngay_sinh_tu || filters.ngay_sinh_den ||
    filters.he_so_luong_tu !== undefined || filters.he_so_luong_den !== undefined ||
    filters.la_dang_vien || filters.la_doan_vien || filters.co_bhxh || filters.co_ngan_hang

  const hasAnyFilters = trangThaiFilter !== "all" || hasAdvancedFilters || search.length > 0

  const handleClearAll = () => {
    onSearchChange("")
    onFiltersChange({})
    onSortChange("ho_ten_asc")
  }

  const activeFilterCount = [
    loaiFilter, capHocFilter, phongBanFilter, gioiTinhFilter,
    loaiHopDongFilter, hangChucDanhFilter,
    filters.ngay_vao_lam_tu, filters.ngay_vao_lam_den,
    filters.ngay_sinh_tu, filters.ngay_sinh_den,
    filters.he_so_luong_tu, filters.he_so_luong_den,
    filters.la_dang_vien, filters.la_doan_vien,
    filters.co_bhxh, filters.co_ngan_hang,
  ].filter((f) => f !== undefined && f !== null && f !== "all" && f !== "").length

  return (
    <div className="space-y-3">
      {/* Main Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm tên, mã NV, email, CCCD, SĐT..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
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
                onClick={() => updateFilter("trang_thai", opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 w-44 border-dashed">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasAnyFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Đang lọc:</span>
          {trangThaiFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {TRANG_THAI_OPTIONS.find((o) => o.value === trangThaiFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("trang_thai", "all")} />
            </Badge>
          )}
          {loaiFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {LOAI_OPTIONS.find((o) => o.value === loaiFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("loai_nhan_vien", "all")} />
            </Badge>
          )}
          {capHocFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {CAP_HOC_OPTIONS.find((o) => o.value === capHocFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("cap_hoc", "all")} />
            </Badge>
          )}
          {phongBanFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {phongBanOptions.find((o) => o.value === phongBanFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("phong_ban_id", "all")} />
            </Badge>
          )}
          {gioiTinhFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {GIOI_TINH_OPTIONS.find((o) => o.value === gioiTinhFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("gioi_tinh", "all")} />
            </Badge>
          )}
          {loaiHopDongFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              {LOAI_HOP_DONG_OPTIONS.find((o) => o.value === loaiHopDongFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("loai_hop_dong", "all")} />
            </Badge>
          )}
          {filters.ngay_vao_lam_tu && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Vào làm từ: {filters.ngay_vao_lam_tu}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("ngay_vao_lam_tu", undefined)} />
            </Badge>
          )}
          {filters.ngay_vao_lam_den && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Vào làm đến: {filters.ngay_vao_lam_den}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("ngay_vao_lam_den", undefined)} />
            </Badge>
          )}
          {filters.la_dang_vien && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Đảng viên <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("la_dang_vien", undefined)} />
            </Badge>
          )}
          {filters.la_doan_vien && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Đoàn viên <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("la_doan_vien", undefined)} />
            </Badge>
          )}
          {filters.co_bhxh && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Có BHXH <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("co_bhxh", undefined)} />
            </Badge>
          )}
          {filters.co_ngan_hang && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Có NH <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("co_ngan_hang", undefined)} />
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              Tìm: &quot;{search}&quot;
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          <Button
            variant="ghost" size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 cursor-pointer text-xs text-slate-500 hover:text-red-600"
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* ===== ADVANCED FILTER DIALOG ===== */}
      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="text-base">Lọc nâng cao</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kết hợp nhiều tiêu chí để tìm kiếm chính xác
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearDraft} className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Đặt lại
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 divide-x">
              {/* ===== LEFT COLUMN ===== */}
              <div className="p-6 space-y-6">
                {/* Presets */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Bộ lọc nhanh
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FILTERS.map((preset) => {
                      const Icon = preset.icon
                      const isActive = Object.entries(preset.filters).every(
                        ([k, v]) => (draftFilters as any)[k] === v
                      )
                      return (
                        <Button
                          key={preset.label}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className="gap-1.5 cursor-pointer text-xs h-7 px-2.5"
                          onClick={() => {
                            if (isActive) {
                              const cleared = { ...draftFilters } as any
                              Object.keys(preset.filters).forEach((k) => delete cleared[k])
                              setDraftFilters(cleared)
                            } else {
                              setDraftFilters({ ...draftFilters, ...preset.filters })
                            }
                          }}
                        >
                          <Icon className="h-3 w-3" />
                          {preset.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Phân loại */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Filter className="h-3 w-3" />
                    Phân loại nhân sự
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Loại nhân viên</Label>
                      <Combobox
                        options={LOAI_OPTIONS}
                        value={draftFilters.loai_nhan_vien || "all"}
                        onChange={(v) => updateDraft("loai_nhan_vien", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm loại NV..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Cấp học</Label>
                      <Combobox
                        options={CAP_HOC_OPTIONS}
                        value={draftFilters.cap_hoc || "all"}
                        onChange={(v) => updateDraft("cap_hoc", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm cấp học..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Giới tính</Label>
                      <Combobox
                        options={GIOI_TINH_OPTIONS}
                        value={draftFilters.gioi_tinh || "all"}
                        onChange={(v) => updateDraft("gioi_tinh", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm giới tính..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Phòng ban</Label>
                      <Combobox
                        options={[{ value: "all", label: "Tất cả" }, ...phongBanOptions]}
                        value={draftFilters.phong_ban_id || "all"}
                        onChange={(v) => updateDraft("phong_ban_id", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm phòng ban..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Dân tộc</Label>
                      <Combobox
                        options={[{ value: "all", label: "Tất cả" }, ...DAN_TOC_OPTIONS.map((dt) => ({ value: dt, label: dt }))]}
                        value={(draftFilters as any).dan_toc || "all"}
                        onChange={(v) => updateDraft("dan_toc", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm dân tộc..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Tôn giáo</Label>
                      <Combobox
                        options={[{ value: "all", label: "Tất cả" }, ...TON_GIAO_OPTIONS.map((tg) => ({ value: tg, label: tg }))]}
                        value={(draftFilters as any).ton_giao || "all"}
                        onChange={(v) => updateDraft("ton_giao", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm tôn giáo..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Hôn nhân</Label>
                      <Combobox
                        options={TINH_TRANG_HON_NHAN_OPTIONS}
                        value={(draftFilters as any).tinh_trang_hon_nhan || "all"}
                        onChange={(v) => updateDraft("tinh_trang_hon_nhan", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm tình trạng..."
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Flags */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Flag className="h-3 w-3" />
                    Cờ đánh dấu
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      ["la_dang_vien", "Đảng viên", draftFilters.la_dang_vien],
                      ["la_doan_vien", "Đoàn viên", draftFilters.la_doan_vien],
                      ["co_bhxh", "Có BHXH", draftFilters.co_bhxh],
                      ["co_ngan_hang", "Có tài khoản NH", draftFilters.co_ngan_hang],
                    ] as const).map(([key, label, checked]) => (
                      <label key={key} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer">
                        <Checkbox
                          checked={!!checked}
                          onCheckedChange={(c) => updateDraft(key, c ? true : undefined)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN ===== */}
              <div className="p-6 space-y-6">
                {/* Date ranges */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Khoảng thời gian
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-slate-500">Ngày vào làm</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <DatePickerField
                          label="Từ"
                          value={draftFilters.ngay_vao_lam_tu}
                          onChange={(v) => updateDraft("ngay_vao_lam_tu", v)}
                        />
                        <DatePickerField
                          label="Đến"
                          value={draftFilters.ngay_vao_lam_den}
                          onChange={(v) => updateDraft("ngay_vao_lam_den", v)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-slate-500">Ngày sinh</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <DatePickerField
                          label="Từ"
                          value={draftFilters.ngay_sinh_tu}
                          onChange={(v) => updateDraft("ngay_sinh_tu", v)}
                        />
                        <DatePickerField
                          label="Đến"
                          value={draftFilters.ngay_sinh_den}
                          onChange={(v) => updateDraft("ngay_sinh_den", v)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Hợp đồng & Lương */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3" />
                    Hợp đồng & Lương
                  </h4>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Loại hợp đồng</Label>
                      <Combobox
                        options={LOAI_HOP_DONG_OPTIONS}
                        value={draftFilters.loai_hop_dong || "all"}
                        onChange={(v) => updateDraft("loai_hop_dong", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm loại HĐ..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Hạng chức danh</Label>
                      <Combobox
                        options={HANG_CHUC_DANH_OPTIONS}
                        value={draftFilters.hang_chuc_danh || "all"}
                        onChange={(v) => updateDraft("hang_chuc_danh", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm hạng..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium text-slate-500">Ngạch lương</Label>
                      <Combobox
                        options={NGACH_LUONG_OPTIONS}
                        value={(draftFilters as any).ngach_luong || "all"}
                        onChange={(v) => updateDraft("ngach_luong", v)}
                        placeholder="Tất cả"
                        searchPlaceholder="Tìm ngạch lương..."
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* He so luong slider */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-medium text-slate-500">Hệ số lương</Label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {(draftFilters.he_so_luong_tu ?? 1.0).toFixed(1)} — {(draftFilters.he_so_luong_den ?? 12.0).toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      min={1.0}
                      max={12.0}
                      step={0.1}
                      value={[draftFilters.he_so_luong_tu ?? 1.0, draftFilters.he_so_luong_den ?? 12.0]}
                      onValueChange={(val: number[]) => {
                        setDraftFilters((prev) => ({
                          ...prev,
                          he_so_luong_tu: val[0],
                          he_so_luong_den: val[1],
                        }))
                      }}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[10px] text-slate-300">
                      <span>1.0</span>
                      <span>6.0</span>
                      <span>12.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t bg-slate-50/80 shrink-0">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                {activeFilterCount > 0
                  ? `${activeFilterCount} bộ lọc đang áp dụng`
                  : "Chưa áp dụng bộ lọc nào"}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearDraft} className="cursor-pointer h-8 text-xs">
                  Xóa tất cả
                </Button>
                <Button onClick={applyDraft} className="cursor-pointer h-8 text-xs">
                  Áp dụng
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
