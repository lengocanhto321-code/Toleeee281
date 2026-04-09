"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, UserCheck, UserX } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import {
  createNhanVienColumns,
  NhanVienToolbar,
  NhanVienFormDialog,
  NhanVienGridView,
} from "@/components/forms/nhan-vien"
import { useNhanVienList, useCreateNhanVien, useUpdateNhanVien } from "@/hooks/nhan-vien"
import type { NhanVien, NhanVienFormData } from "@/types/nhan-vien.types"

export default function NhanVienPage() {
  // Filters
  const [search, setSearch] = useState("")
  const [trangThaiFilter, setTrangThaiFilter] = useState("all")
  const [loaiFilter, setLoaiFilter] = useState("all")
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

  // Filtered data
  const filtered = useMemo(() => {
    return nhanViens.filter((nv) => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        nv.ho_ten.toLowerCase().includes(q) ||
        nv.ma_nhan_vien.toLowerCase().includes(q) ||
        nv.email?.toLowerCase().includes(q)
      const matchTrangThai = trangThaiFilter === "all" || nv.trang_thai === trangThaiFilter
      const matchLoai = loaiFilter === "all" || nv.loai_nhan_vien === loaiFilter
      return matchSearch && matchTrangThai && matchLoai
    })
  }, [nhanViens, search, trangThaiFilter, loaiFilter])

  // Stats
  const total = nhanViens.length
  const dangLam = nhanViens.filter((nv) => nv.trang_thai === "dang_lam").length
  const nghiViec = nhanViens.filter((nv) => nv.trang_thai !== "dang_lam").length

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

  return (
    <AuthenticatedLayout>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500">Tổng nhân viên</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <UserCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{dangLam}</p>
            <p className="text-xs text-emerald-600">Đang làm việc</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <UserX className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{nghiViec}</p>
            <p className="text-xs text-amber-600">Nghỉ việc / Nghỉ hưu</p>
          </div>
        </div>
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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
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
