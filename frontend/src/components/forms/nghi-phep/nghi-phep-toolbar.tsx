"use client"

import { Search, Plus, Filter, FileText, Calendar, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LoaiNghi, TrangThaiDon } from "@/types/nghi-phep.types"

const LOAI_NGHI_OPTIONS: { value: LoaiNghi | "all"; label: string }[] = [
  { value: "all", label: "Tất cả loại" },
  { value: "phep_nam", label: "Phép năm" },
  { value: "nghi_om", label: "Nghỉ ốm" },
  { value: "viec_rieng", label: "Việc riêng" },
  { value: "cong_tac", label: "Công tác" },
  { value: "ket_hon", label: "Kết hôn" },
  { value: "mai_tang", label: "Ma táng" },
  { value: "thai_san", label: "Thai sản" },
]

const TRANG_THAI_OPTIONS: { value: TrangThaiDon | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "cho_duyet_cap_1", label: "Chờ cấp 1" },
  { value: "cho_duyet_cap_2", label: "Chờ cấp 2" },
  { value: "da_duyet_cap_2", label: "Đã duyệt" },
  { value: "tu_choi", label: "Từ chối" },
]

interface NghiPhepToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  loaiNghi: LoaiNghi | "all"
  onLoaiNghiChange: (value: LoaiNghi | "all") => void
  trangThai: TrangThaiDon | "all"
  onTrangThaiChange: (value: TrangThaiDon | "all") => void
  onCreate: () => void
  activeTab?: "don-nghi" | "cham-cong"
  onTabChange?: (tab: "don-nghi" | "cham-cong") => void
}

export function NghiPhepToolbar({
  search,
  onSearchChange,
  loaiNghi,
  onLoaiNghiChange,
  trangThai,
  onTrangThaiChange,
  onCreate,
  activeTab,
  onTabChange,
}: NghiPhepToolbarProps) {
  return (
    <div className="space-y-4">
      {onTabChange && (
        <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
          <button
            onClick={() => onTabChange("don-nghi")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
              activeTab === "don-nghi"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 border-b-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="inline-block h-4 w-4 mr-1.5" />
            Đơn nghỉ phép
          </button>
          <button
            onClick={() => onTabChange("cham-cong")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
              activeTab === "cham-cong"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 border-b-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calendar className="inline-block h-4 w-4 mr-1.5" />
            Chấm công
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value={loaiNghi} onValueChange={(v) => onLoaiNghiChange(v as LoaiNghi | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Loại nghỉ" />
            </SelectTrigger>
            <SelectContent>
              {LOAI_NGHI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={trangThai} onValueChange={(v) => onTrangThaiChange(v as TrangThaiDon | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {TRANG_THAI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <Button onClick={onCreate} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Tạo đơn nghỉ
          </Button>
        </div>
      </div>
    </div>
  )
}
