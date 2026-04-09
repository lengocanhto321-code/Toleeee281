"use client"

import React, { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { useChucVuList, useCreateChucVu, useUpdateChucVu, useDeleteChucVu } from "@/hooks/chuc-vu"
import type { ChucVu, ChucVuFormData } from "@/types/chuc-vu.types"
import {
  createChucVuColumns,
  ChucVuFormDialog,
  ChucVuDeleteDialog,
} from "@/components/forms/chuc-vu"

export default function ChucVuPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChucVu, setEditingChucVu] = useState<ChucVu | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedChucVu, setSelectedChucVu] = useState<ChucVu | null>(null)

  // Hooks
  const { data: chucVus = [], isLoading } = useChucVuList()
  const createMutation = useCreateChucVu()
  const updateMutation = useUpdateChucVu()
  const deleteMutation = useDeleteChucVu()

  const filteredChucVus = chucVus.filter((cv) =>
    cv.ten_chuc_vu.toLowerCase().includes(search.toLowerCase()) ||
    cv.ma_chuc_vu.toLowerCase().includes(search.toLowerCase())
  )

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Quản lý Chức vụ</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách chức vụ và cấp bậc trong trường</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Thêm chức vụ
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Tìm kiếm theo tên, mã chức vụ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <DataTable columns={columns} data={filteredChucVus} loading={isLoading} emptyMessage="Không tìm thấy chức vụ nào" />

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
    </AuthenticatedLayout>
  )
}
