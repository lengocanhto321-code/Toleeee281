"use client"

import React, { useMemo, useState } from "react"
import { Plus, Search, Building2, Landmark } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { usePhongBanList, useCreatePhongBan, useUpdatePhongBan, useDeletePhongBan } from "@/hooks/phong-ban"
import type { PhongBan, PhongBanFormData } from "@/types/phong-ban.types"
import {
  createPhongBanColumns,
  PhongBanFormDialog,
  PhongBanDeleteDialog,
} from "@/components/forms/phong-ban"

export default function PhongBanPage() {
  const [search, setSearch] = useState("")
  const [loaiFilter, setLoaiFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPhongBan, setEditingPhongBan] = useState<PhongBan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPhongBan, setSelectedPhongBan] = useState<PhongBan | null>(null)

  // Hooks
  const { data: phongBans = [], isLoading } = usePhongBanList()
  const createMutation = useCreatePhongBan()
  const updateMutation = useUpdatePhongBan()
  const deleteMutation = useDeletePhongBan()

  const filteredPhongBans = phongBans.filter((pb) => {
    const matchSearch =
      pb.ten_phong_ban.toLowerCase().includes(search.toLowerCase()) ||
      pb.ma_phong_ban.toLowerCase().includes(search.toLowerCase())
    const matchLoai = loaiFilter === "all" || pb.loai === loaiFilter
    return matchSearch && matchLoai
  })

  const hanhChinhCount = phongBans.filter((pb) => pb.loai === "hanh_chinh").length
  const chuyenMonCount = phongBans.filter((pb) => pb.loai === "chuyen_mon").length

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
  }), [handleEdit, handleDelete])

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

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Quản lý Phòng ban</h1>
          <p className="text-sm text-slate-500 mt-1">Cơ cấu tổ các phòng ban và tổ chuyên môn trong trường</p>
        </div>
        <Button onClick={handleAdd} className="gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Thêm phòng ban
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Tổng số phòng ban</div>
          <div className="text-3xl font-bold text-slate-900">{phongBans.length}</div>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-indigo-600 mb-1">
            <Landmark className="w-4 h-4" />
            Phòng hành chính
          </div>
          <div className="text-3xl font-bold text-indigo-700">{hanhChinhCount}</div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-amber-600 mb-1">
            <Building2 className="w-4 h-4" />
            Tổ chuyên môn
          </div>
          <div className="text-3xl font-bold text-amber-700">{chuyenMonCount}</div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Tìm kiếm theo tên, mã phòng ban..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={loaiFilter} onValueChange={setLoaiFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Loại phòng ban" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="hanh_chinh">Hành chính</SelectItem>
            <SelectItem value="chuyen_mon">Chuyên môn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredPhongBans} loading={isLoading} emptyMessage="Chưa có phòng ban nào" />

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
    </AuthenticatedLayout>
  )
}
