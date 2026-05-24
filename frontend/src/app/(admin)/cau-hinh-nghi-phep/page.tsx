"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCauHinhNghiPhep, useCreateCauHinhNghiPhep, useUpdateCauHinhNghiPhep, useInitAnnualLeave } from "@/hooks/nghi-phep"
import { toastSuccess, toastError } from "@/lib/utils"
import { Plus, RefreshCw, Settings, Calendar, Trash2, Edit2 } from "lucide-react"

interface CauHinhNghiPhep {
  id: string
  loai_nghi: string
  ten_loai: string
  so_ngay_moi_nam: number
  so_ngay_toi_da_mot_lan?: number
  can_giay_to: boolean
  bat_buoc_ghi_ly_do: boolean
  trang_thai: boolean
  ghi_chu?: string
}

const LOAI_NGHI_OPTIONS = [
  { value: "phep_nam", label: "Phép năm" },
  { value: "nghi_om", label: "Nghỉ ốm" },
  { value: "viec_rieng", label: "Việc riêng" },
  { value: "ket_hon", label: "Kết hôn" },
  { value: "mai_tang", label: "Ma táng" },
  { value: "thai_san", label: "Thai sản" },
  { value: "cong_tac", label: "Công tác" },
]

const createColumns = (onEdit: (item: CauHinhNghiPhep) => void): ColumnDef<CauHinhNghiPhep>[] => [
  {
    accessorKey: "ten_loai",
    header: "Loại nghỉ",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.ten_loai}</p>
        <p className="text-xs text-muted-foreground">{row.original.loai_nghi}</p>
      </div>
    ),
  },
  {
    accessorKey: "so_ngay_moi_nam",
    header: "Ngày/năm",
    cell: ({ row }) => (
      <span className="font-semibold text-primary">{row.original.so_ngay_moi_nam}</span>
    ),
  },
  {
    accessorKey: "so_ngay_toi_da_mot_lan",
    header: "Tối đa/lần",
    cell: ({ row }) => (
      <span>{row.original.so_ngay_toi_da_mot_lan || "-"}</span>
    ),
  },
  {
    accessorKey: "can_giay_to",
    header: "Cần giấy tờ",
    cell: ({ row }) => (
      row.original.can_giay_to ? (
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Có</Badge>
      ) : (
        <Badge variant="outline" className="bg-muted text-muted-foreground">Không</Badge>
      )
    ),
  },
  {
    accessorKey: "bat_buoc_ghi_ly_do",
    header: "Bắt buộc lý do",
    cell: ({ row }) => (
      row.original.bat_buoc_ghi_ly_do ? (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Có</Badge>
      ) : (
        <Badge variant="outline" className="bg-muted text-muted-foreground">Không</Badge>
      )
    ),
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => (
      row.original.trang_thai ? (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Hoạt động</Badge>
      ) : (
        <Badge variant="outline" className="bg-muted text-muted-foreground">Tắt</Badge>
      )
    ),
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function CauHinhNghiPhepPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<CauHinhNghiPhep | null>(null)
  const [initYear, setInitYear] = useState(new Date().getFullYear())

  const { data, isLoading, refetch } = useCauHinhNghiPhep()
  const createMutation = useCreateCauHinhNghiPhep()
  const updateMutation = useUpdateCauHinhNghiPhep()
  const initMutation = useInitAnnualLeave()

  const [form, setForm] = useState({
    loai_nghi: "",
    ten_loai: "",
    so_ngay_moi_nam: 0,
    so_ngay_toi_da_mot_lan: undefined as number | undefined,
    can_giay_to: false,
    bat_buoc_ghi_ly_do: false,
    trang_thai: true,
  })

  const resetForm = () => {
    setForm({
      loai_nghi: "",
      ten_loai: "",
      so_ngay_moi_nam: 0,
      so_ngay_toi_da_mot_lan: undefined,
      can_giay_to: false,
      bat_buoc_ghi_ly_do: false,
      trang_thai: true,
    })
  }

  const handleCreate = () => {
    if (!form.loai_nghi || !form.ten_loai || form.so_ngay_moi_nam <= 0) {
      toastError("Lỗi", "Vui lòng điền đầy đủ thông tin")
      return
    }
    createMutation.mutate(form, {
      onSuccess: () => {
        toastSuccess("Thành công", "Đã tạo cấu hình")
        setCreateOpen(false)
        resetForm()
        refetch()
      },
      onError: (error: any) => {
        toastError("Lỗi", error.response?.data?.message || "Tạo thất bại")
      },
    })
  }

  const handleUpdate = () => {
    if (!editItem || !form.ten_loai || form.so_ngay_moi_nam <= 0) {
      toastError("Lỗi", "Vui lòng điền đầy đủ thông tin")
      return
    }
    updateMutation.mutate(
      { id: editItem.id, data: form },
      {
        onSuccess: () => {
          toastSuccess("Thành công", "Đã cập nhật cấu hình")
          setEditOpen(false)
          setEditItem(null)
          resetForm()
          refetch()
        },
        onError: (error: any) => {
          toastError("Lỗi", error.response?.data?.message || "Cập nhật thất bại")
        },
      }
    )
  }

  const handleInitAnnual = () => {
    initMutation.mutate(initYear, {
      onSuccess: () => {
        toastSuccess("Thành công", `Đã khởi tạo phép năm ${initYear}`)
      },
    })
  }

  const openEdit = (item: CauHinhNghiPhep) => {
    setEditItem(item)
    setForm({
      loai_nghi: item.loai_nghi,
      ten_loai: item.ten_loai,
      so_ngay_moi_nam: item.so_ngay_moi_nam,
      so_ngay_toi_da_mot_lan: item.so_ngay_toi_da_mot_lan,
      can_giay_to: item.can_giay_to,
      bat_buoc_ghi_ly_do: item.bat_buoc_ghi_ly_do,
      trang_thai: item.trang_thai,
    })
    setEditOpen(true)
  }

  const items = data || []

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cấu hình nghỉ phép</h1>
            <p className="text-muted-foreground">Quản lý số ngày phép theo loại nghỉ</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Làm mới
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" />
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Khởi tạo annual leave */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-800">Khởi tạo phép năm</p>
            <p className="text-sm text-amber-700">Tạo số ngày phép năm mới cho tất cả nhân viên</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={initYear}
              onChange={(e) => setInitYear(parseInt(e.target.value))}
              className="w-24"
            />
            <Button 
              onClick={handleInitAnnual} 
              disabled={initMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {initMutation.isPending ? "Đang..." : "Khởi tạo"}
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={createColumns((item) => {
            setForm({
              loai_nghi: item.loai_nghi,
              ten_loai: item.ten_loai,
              so_ngay_moi_nam: item.so_ngay_moi_nam,
              so_ngay_toi_da_mot_lan: item.so_ngay_toi_da_mot_lan,
              can_giay_to: item.can_giay_to,
              bat_buoc_ghi_ly_do: item.bat_buoc_ghi_ly_do,
              trang_thai: item.trang_thai,
            })
            setEditItem(item)
            setEditOpen(true)
          })}
          data={items}
          loading={isLoading}
          emptyMessage="Chưa có cấu hình nghỉ phép"
        />
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cấu hình nghỉ phép</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Loại nghỉ</FieldLabel>
                <Select
                  value={form.loai_nghi}
                  onValueChange={(v) => {
                    const opt = LOAI_NGHI_OPTIONS.find(o => o.value === v)
                    setForm({ ...form, loai_nghi: v, ten_loai: opt?.label || "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại nghỉ" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAI_NGHI_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tên hiển thị</FieldLabel>
                <Input
                  value={form.ten_loai}
                  onChange={(e) => setForm({ ...form, ten_loai: e.target.value })}
                  placeholder="Tên loại nghỉ"
                />
              </Field>
              <Field>
                <FieldLabel>Số ngày/năm</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.so_ngay_moi_nam}
                  onChange={(e) => setForm({ ...form, so_ngay_moi_nam: parseFloat(e.target.value) || 0 })}
                />
              </Field>
              <Field>
                <FieldLabel>Tối đa/lần (tùy chọn)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.so_ngay_toi_da_mot_lan || ""}
                  onChange={(e) => setForm({ ...form, so_ngay_toi_da_mot_lan: parseFloat(e.target.value) || undefined })}
                  placeholder="Để trống nếu không giới hạn"
                />
              </Field>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.can_giay_to}
                    onChange={(e) => setForm({ ...form, can_giay_to: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Cần giấy tờ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.bat_buoc_ghi_ly_do}
                    onChange={(e) => setForm({ ...form, bat_buoc_ghi_ly_do: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Bắt buộc lý do</span>
                </label>
              </div>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-primary">
              {createMutation.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật cấu hình nghỉ phép</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Loại nghỉ</FieldLabel>
                <Input value={form.loai_nghi} disabled className="bg-muted" />
              </Field>
              <Field>
                <FieldLabel>Tên hiển thị</FieldLabel>
                <Input
                  value={form.ten_loai}
                  onChange={(e) => setForm({ ...form, ten_loai: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Số ngày/năm</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.so_ngay_moi_nam}
                  onChange={(e) => setForm({ ...form, so_ngay_moi_nam: parseFloat(e.target.value) || 0 })}
                />
              </Field>
              <Field>
                <FieldLabel>Tối đa/lần (tùy chọn)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.so_ngay_toi_da_mot_lan || ""}
                  onChange={(e) => setForm({ ...form, so_ngay_toi_da_mot_lan: parseFloat(e.target.value) || undefined })}
                />
              </Field>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.can_giay_to}
                    onChange={(e) => setForm({ ...form, can_giay_to: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Cần giấy tờ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.bat_buoc_ghi_ly_do}
                    onChange={(e) => setForm({ ...form, bat_buoc_ghi_ly_do: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Bắt buộc lý do</span>
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trang_thai}
                  onChange={(e) => setForm({ ...form, trang_thai: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Hoạt động</span>
              </label>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-primary">
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}
