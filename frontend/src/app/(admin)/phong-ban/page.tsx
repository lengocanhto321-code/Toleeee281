"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { DataTable } from "@/components/ui/data-table"
import { usePhongBanList, useCreatePhongBan, useUpdatePhongBan, useDeletePhongBan } from "@/hooks/phong-ban"
import type { PhongBan, PhongBanFormData } from "@/types/phong-ban.types"
import type { PhongBanFilterParams } from "@/hooks/phong-ban/use-phong-ban-query"
import {
  createPhongBanColumns,
  PhongBanFormDialog,
  PhongBanDeleteDialog,
  PhongBanToolbar,
  PhongBanCoCauDialog,
  PhongBanPhanBoDialog,
} from "@/components/forms/phong-ban"

function parseSortParams(sortValue: string): { sort_by: string; sort_desc: boolean } {
  const parts = sortValue.split("_")
  const dir = parts.pop()
  const field = parts.join("_")
  if (dir === "desc") return { sort_by: field, sort_desc: true }
  return { sort_by: field, sort_desc: false }
}

export default function PhongBanPage() {
  const [search, setSearch] = useState("")
  const [loaiFilter, setLoaiFilter] = useState<string>("all")
  const [trangThaiFilter, setTrangThaiFilter] = useState<string>("all")
  const [sortValue, setSortValue] = useState("ten_phong_ban_asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPhongBan, setEditingPhongBan] = useState<PhongBan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPhongBan, setSelectedPhongBan] = useState<PhongBan | null>(null)
  const [coCauDialogOpen, setCoCauDialogOpen] = useState(false)
  const [phanBoDialogOpen, setPhanBoDialogOpen] = useState(false)

  useEffect(() => {
    const handleCoCau = () => setCoCauDialogOpen(true)
    const handlePhanBo = () => setPhanBoDialogOpen(true)
    window.addEventListener("sidebar:phong-ban:co-cau", handleCoCau)
    window.addEventListener("sidebar:phong-ban:phan-bo", handlePhanBo)
    return () => {
      window.removeEventListener("sidebar:phong-ban:co-cau", handleCoCau)
      window.removeEventListener("sidebar:phong-ban:phan-bo", handlePhanBo)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, loaiFilter, trangThaiFilter, sortValue, pageSize])

  const { sort_by, sort_desc } = parseSortParams(sortValue)
  const filters: PhongBanFilterParams & { page: number; page_size: number } = {
    search: search || undefined,
    loai: loaiFilter !== "all" ? loaiFilter : undefined,
    trang_thai: trangThaiFilter !== "all" ? trangThaiFilter === "true" : undefined,
    sort_by,
    sort_desc,
    page,
    page_size: pageSize,
  }

  const { data: listResult, isLoading } = usePhongBanList(filters)
  const createMutation = useCreatePhongBan()
  const updateMutation = useUpdatePhongBan()
  const deleteMutation = useDeletePhongBan()

  const phongBans = listResult?.data || []
  const metadata = listResult?.metadata

  const total = metadata?.total || 0
  const currentPage = metadata?.page || 1
  const totalPages = metadata?.total_pages || 1

  const handleFiltersChange = useCallback((newLoai: string, newTrangThai: string) => {
    setLoaiFilter(newLoai)
    setTrangThaiFilter(newTrangThai)
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSortValue(value)
  }, [])

  const handleAdd = () => {
    setEditingPhongBan(null)
    setDialogOpen(true)
  }

  const handleEdit = (pb: PhongBan) => {
    setEditingPhongBan(pb)
    setDialogOpen(true)
  }

  const handleDelete = (pb: PhongBan) => {
    setSelectedPhongBan(pb)
    setDeleteDialogOpen(true)
  }

  const columns = useMemo(() => createPhongBanColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }), [])

  const handleDeleteConfirm = () => {
    if (!selectedPhongBan) return
    deleteMutation.mutate(selectedPhongBan.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedPhongBan(null)
      },
    })
  }

  const handleSubmit = (data: PhongBanFormData, editId?: string) => {
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

  const tableFooter = total > 0 ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Combobox
          options={[
            { value: "10", label: "10 / trang" },
            { value: "20", label: "20 / trang" },
            { value: "50", label: "50 / trang" },
            { value: "100", label: "100 / trang" },
          ]}
          value={String(pageSize)}
          onChange={(v) => { setPageSize(Number(v)); setPage(1) }}
          placeholder="20 / trang"
          searchPlaceholder="Chọn số lượng..."
          className="h-8 text-xs w-32"
        />
        <span className="text-xs text-slate-500">
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} / {total}
        </span>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(1)} disabled={page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 px-2">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-4">
        <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleAdd}>
          <Plus className="h-3.5 w-3.5" />
          Thêm phòng ban
        </Button>
        <p className="text-sm text-slate-500">
          {total} phòng ban
        </p>
      </div>

      <div className="mb-4">
        <PhongBanToolbar
          search={search}
          onSearchChange={setSearch}
          trangThaiFilter={trangThaiFilter}
          onTrangThaiFilterChange={setTrangThaiFilter}
          loaiFilter={loaiFilter}
          onLoaiFilterChange={setLoaiFilter}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          totalResults={total}
        />
      </div>

      <DataTable
        columns={columns}
        data={phongBans}
        loading={isLoading}
        emptyMessage="Không tìm thấy phòng ban nào"
        disablePagination
        footer={tableFooter}
      />

      <PhongBanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPhongBan={editingPhongBan}
        isPending={isMutating}
        onSubmit={handleSubmit}
      />

      <PhongBanDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        phongBan={selectedPhongBan}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <PhongBanCoCauDialog
        open={coCauDialogOpen}
        onOpenChange={setCoCauDialogOpen}
      />

      <PhongBanPhanBoDialog
        open={phanBoDialogOpen}
        onOpenChange={setPhanBoDialogOpen}
      />
    </AuthenticatedLayout>
  )
}
