"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Plus, Award, Crown, BookOpen, UserCog } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useChucVuList, useCreateChucVu, useUpdateChucVu, useDeleteChucVu } from "@/hooks/chuc-vu"
import type { ChucVu, ChucVuFormData } from "@/types/chuc-vu.types"
import {
  createChucVuColumns,
  ChucVuFormDialog,
  ChucVuDeleteDialog,
  ChucVuGridView,
  ChucVuToolbar,
  ChucVuPhanBoDialog,
} from "@/components/forms/chuc-vu"

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value: number
  accent: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-5 text-left transition-all ${active ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"} bg-white shadow-sm ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`flex items-center gap-2 text-sm mb-1 ${accent.split(" ")[1]}`}>
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className={`text-3xl font-bold ${accent.split(" ")[1].replace("text-", "text-")}`}>
        {value}
      </div>
    </button>
  )
}

export default function ChucVuPage() {
  const [search, setSearch] = useState("")
  const [loaiFilter, setLoaiFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("ten_chuc_vu")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChucVu, setEditingChucVu] = useState<ChucVu | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedChucVu, setSelectedChucVu] = useState<ChucVu | null>(null)
  const [phanBoDialogOpen, setPhanBoDialogOpen] = useState(false)

  // Hooks
  const { data: chucVus = [], isLoading } = useChucVuList()
  const createMutation = useCreateChucVu()
  const updateMutation = useUpdateChucVu()
  const deleteMutation = useDeleteChucVu()

  // Listen for sidebar events
  useEffect(() => {
    const handleAdd = () => { setEditingChucVu(null); setDialogOpen(true) }
    const handlePhanBo = () => setPhanBoDialogOpen(true)
    window.addEventListener("sidebar:chuc-vu:add", handleAdd)
    window.addEventListener("sidebar:chuc-vu:phan-bo", handlePhanBo)
    return () => {
      window.removeEventListener("sidebar:chuc-vu:add", handleAdd)
      window.removeEventListener("sidebar:chuc-vu:phan-bo", handlePhanBo)
    }
  }, [])

  // Stats
  const totalCount = chucVus.length
  const quanLyCount = chucVus.filter((cv) => cv.loai === "quan_ly" && cv.trang_thai !== false).length
  const giaoVienCount = chucVus.filter((cv) => cv.loai === "giao_vien" && cv.trang_thai !== false).length
  const nhanVienCount = chucVus.filter((cv) => cv.loai === "nhan_vien" && cv.trang_thai !== false).length

  // Filtered & Sorted data
  const filtered = useMemo(() => {
    let result = [...chucVus]

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (cv) =>
          cv.ten_chuc_vu.toLowerCase().includes(q) ||
          cv.ma_chuc_vu.toLowerCase().includes(q)
      )
    }

    // Type filter
    if (loaiFilter !== "all") {
      result = result.filter((cv) => cv.loai === loaiFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "ten_chuc_vu":
          return a.ten_chuc_vu.localeCompare(b.ten_chuc_vu)
        case "ten_chuc_vu_desc":
          return b.ten_chuc_vu.localeCompare(a.ten_chuc_vu)
        case "cap_bac":
          return b.cap_bac - a.cap_bac
        case "cap_bac_desc":
          return a.cap_bac - b.cap_bac
        default:
          return 0
      }
    })

    return result
  }, [chucVus, search, loaiFilter, sortBy])

  const handleAdd = () => {
    setEditingChucVu(null)
    setDialogOpen(true)
  }

  const handleEdit = (cv: ChucVu) => {
    setEditingChucVu(cv)
    setDialogOpen(true)
  }

  const handleDelete = (cv: ChucVu) => {
    setSelectedChucVu(cv)
    setDeleteDialogOpen(true)
  }

  const columns = useMemo(() => createChucVuColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }), [handleEdit, handleDelete])

  const handleDeleteConfirm = () => {
    if (!selectedChucVu) return
    deleteMutation.mutate(selectedChucVu.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedChucVu(null)
      },
    })
  }

  const handleSubmit = (data: ChucVuFormData, editId?: string) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data }, {
        onSuccess: () => setDialogOpen(false),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <AuthenticatedLayout>
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Award}
          label="Tổng số"
          value={totalCount}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={Crown}
          label="Quản lý"
          value={quanLyCount}
          accent="bg-amber-100 text-amber-700"
          active={loaiFilter === "quan_ly"}
          onClick={() => setLoaiFilter(loaiFilter === "quan_ly" ? "all" : "quan_ly")}
        />
        <StatCard
          icon={BookOpen}
          label="Giáo viên"
          value={giaoVienCount}
          accent="bg-amber-100 text-amber-700"
          active={loaiFilter === "giao_vien"}
          onClick={() => setLoaiFilter(loaiFilter === "giao_vien" ? "all" : "giao_vien")}
        />
        <StatCard
          icon={UserCog}
          label="Nhân viên"
          value={nhanVienCount}
          accent="bg-amber-100 text-amber-700"
          active={loaiFilter === "nhan_vien"}
          onClick={() => setLoaiFilter(loaiFilter === "nhan_vien" ? "all" : "nhan_vien")}
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <ChucVuToolbar
          search={search}
          onSearchChange={setSearch}
          loaiFilter={loaiFilter}
          onLoaiFilterChange={setLoaiFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-900">{filtered.length}</span> / {chucVus.length} chức vụ
        </p>
      </div>

      {/* Content View */}
      {viewMode === "table" ? (
        <DataTable columns={columns} data={filtered} loading={isLoading} emptyMessage="Không tìm thấy chức vụ nào" />
      ) : (
        <ChucVuGridView data={filtered} onEdit={handleEdit} />
      )}

      {/* Dialogs */}
      <ChucVuFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingChucVu={editingChucVu}
        isPending={isMutating}
        onSubmit={handleSubmit}
      />

      <ChucVuDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        chucVu={selectedChucVu}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <ChucVuPhanBoDialog
        open={phanBoDialogOpen}
        onOpenChange={setPhanBoDialogOpen}
      />
    </AuthenticatedLayout>
  )
}
