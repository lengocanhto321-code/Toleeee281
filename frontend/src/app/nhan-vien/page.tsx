"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, UserCheck, UserX, UserMinus, Download, Printer } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  createNhanVienColumns,
  NhanVienToolbar,
  NhanVienFormDialog,
  NhanVienGridView,
} from "@/components/forms/nhan-vien"
import { useNhanVienList, useCreateNhanVien, useUpdateNhanVien } from "@/hooks/nhan-vien"
import type { NhanVien, NhanVienFormData } from "@/types/nhan-vien.types"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  subLabel?: string
  accent: string
  active?: boolean
}

function StatCard({ icon: Icon, label, value, subLabel, accent, active }: StatCardProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border bg-white p-4 transition-all ${active ? `${accent} border-current` : "border-slate-200 hover:border-slate-300"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {subLabel && <p className="text-[10px] text-slate-400">{subLabel}</p>}
      </div>
    </div>
  )
}

export default function NhanVienPage() {
  // Filters
  const [search, setSearch] = useState("")
  const [trangThaiFilter, setTrangThaiFilter] = useState("all")
  const [loaiFilter, setLoaiFilter] = useState("all")
  const [capHocFilter, setCapHocFilter] = useState("all")
  const [phongBanFilter, setPhongBanFilter] = useState("all")
  const [sortBy, setSortBy] = useState("ho_ten")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editingNhanVien, setEditingNhanVien] = useState<NhanVien | null>(null)

  // Data & mutations
  const { data: nhanViens = [], isLoading } = useNhanVienList()
  const createMutation = useCreateNhanVien()
  const updateMutation = useUpdateNhanVien()

  // Listen for sidebar "add" event
  useEffect(() => {
    const handler = () => { setEditingNhanVien(null); setFormOpen(true) }
    window.addEventListener("sidebar:nhan-vien:add", handler)
    return () => window.removeEventListener("sidebar:nhan-vien:add", handler)
  }, [])

  // Extract unique phong bans for filter
  const phongBanOptions = useMemo(() => {
    const uniquePB = new Map<string, string>()
    nhanViens.forEach((nv) => {
      if (nv.phong_ban?.ten_phong_ban && !uniquePB.has(nv.phong_ban.id)) {
        uniquePB.set(nv.phong_ban.id, nv.phong_ban.ten_phong_ban)
      }
    })
    return Array.from(uniquePB.entries()).map(([value, label]) => ({ value, label }))
  }, [nhanViens])

  const stats = useMemo(() => {
    const total = nhanViens.length
    const dangLam = nhanViens.filter((nv) => nv.trang_thai === "dang_lam").length
    const nghiViec = nhanViens.filter((nv) => nv.trang_thai === "nghi_viec").length
    const nghiHuu = nhanViens.filter((nv) => nv.trang_thai === "nghi_huu").length
    return { total, dangLam, nghiViec, nghiHuu }
  }, [nhanViens])

  // Filtered & Sorted data
  const filtered = useMemo(() => {
    let result = [...nhanViens]

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((nv) =>
        nv.ho_ten.toLowerCase().includes(q) ||
        nv.ma_nhan_vien.toLowerCase().includes(q) ||
        nv.email?.toLowerCase().includes(q) ||
        nv.so_cccd?.toLowerCase().includes(q) ||
        nv.so_dien_thoai?.toLowerCase().includes(q) ||
        nv.mon_day?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (trangThaiFilter !== "all") {
      result = result.filter((nv) => nv.trang_thai === trangThaiFilter)
    }

    // Type filter
    if (loaiFilter !== "all") {
      result = result.filter((nv) => nv.loai_nhan_vien === loaiFilter)
    }

    // Cap hoc filter
    if (capHocFilter !== "all") {
      result = result.filter((nv) => nv.cap_hoc === capHocFilter)
    }

    // Phong ban filter
    if (phongBanFilter !== "all") {
      result = result.filter((nv) => nv.phong_ban?.id === phongBanFilter)
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "ho_ten":
          return a.ho_ten.localeCompare(b.ho_ten, "vi")
        case "ho_ten_desc":
          return b.ho_ten.localeCompare(a.ho_ten, "vi")
        case "ngay_vao_lam": {
          const dateA = a.ngay_vao_lam ? new Date(a.ngay_vao_lam).getTime() : 0
          const dateB = b.ngay_vao_lam ? new Date(b.ngay_vao_lam).getTime() : 0
          return dateA - dateB
        }
        case "ngay_vao_lam_desc": {
          const dateA = a.ngay_vao_lam ? new Date(a.ngay_vao_lam).getTime() : Infinity
          const dateB = b.ngay_vao_lam ? new Date(b.ngay_vao_lam).getTime() : Infinity
          return dateA - dateB
        }
        case "thanh_nien": {
          const daysA = a.ngay_vao_lam ? Math.floor((Date.now() - new Date(a.ngay_vao_lam).getTime()) / (1000 * 60 * 60 * 24)) : 0
          const daysB = b.ngay_vao_lam ? Math.floor((Date.now() - new Date(b.ngay_vao_lam).getTime()) / (1000 * 60 * 60 * 24)) : 0
          return daysA - daysB
        }
        case "thanh_nien_desc": {
          const daysA = a.ngay_vao_lam ? Math.floor((Date.now() - new Date(a.ngay_vao_lam).getTime()) / (1000 * 60 * 60 * 24)) : Infinity
          const daysB = b.ngay_vao_lam ? Math.floor((Date.now() - new Date(b.ngay_vao_lam).getTime()) / (1000 * 60 * 60 * 24)) : Infinity
          return daysA - daysB
        }
        default:
          return 0
      }
    })

    return result
  }, [nhanViens, search, trangThaiFilter, loaiFilter, capHocFilter, phongBanFilter, sortBy])

  // Column definitions
  const columns = useMemo(() => createNhanVienColumns({
    onEdit: (nv) => { setEditingNhanVien(nv); setFormOpen(true) },
  }), [])

  // Handlers
  const handleFormSubmit = (data: NhanVienFormData, editId?: string) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  const handleExport = () => {
    // TODO: Implement export to Excel
    console.log("Export to Excel")
  }

  const handlePrint = () => {
    // TODO: Implement print
    console.log("Print list")
  }

  return (
    <AuthenticatedLayout>
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Tổng cộng"
          value={stats.total}
          accent="bg-slate-100 text-slate-600"
        />
        <StatCard
          icon={UserCheck}
          label="Đang làm việc"
          value={stats.dangLam}
          accent="bg-emerald-100 text-emerald-600"
          active={trangThaiFilter === "dang_lam"}
        />
        <StatCard
          icon={UserX}
          label="Nghỉ việc"
          value={stats.nghiViec}
          accent="bg-amber-100 text-amber-600"
          active={trangThaiFilter === "nghi_viec"}
        />
        <StatCard
          icon={UserMinus}
          label="Nghỉ hưu"
          value={stats.nghiHuu}
          accent="bg-sky-100 text-sky-600"
          active={trangThaiFilter === "nghi_huu"}
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <NhanVienToolbar
          search={search}
          onSearchChange={setSearch}
          trangThaiFilter={trangThaiFilter}
          onTrangThaiFilterChange={setTrangThaiFilter}
          loaiFilter={loaiFilter}
          onLoaiFilterChange={setLoaiFilter}
          capHocFilter={capHocFilter}
          onCapHocFilterChange={setCapHocFilter}
          phongBanFilter={phongBanFilter}
          onPhongBanFilterChange={setPhongBanFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExport={handleExport}
          onPrint={handlePrint}
          phongBanOptions={phongBanOptions}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-900">{filtered.length}</span> / {nhanViens.length} nhân viên
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handlePrint}
          >
            <Printer className="h-3.5 w-3.5" />
            In danh sách
          </Button>
        </div>
      </div>

      {/* Content View */}
      {viewMode === "table" ? (
        <DataTable columns={columns} data={filtered} loading={isLoading} emptyMessage="Không tìm thấy nhân viên nào" />
      ) : (
        <NhanVienGridView data={filtered} onEdit={(nv) => { setEditingNhanVien(nv); setFormOpen(true) }} />
      )}

      {/* Dialogs */}
      <NhanVienFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNhanVien={editingNhanVien}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />
    </AuthenticatedLayout>
  )
}
