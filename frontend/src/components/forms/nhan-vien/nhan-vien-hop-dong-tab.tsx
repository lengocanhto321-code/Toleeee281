"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock, Plus, Pencil, Trash2 } from "lucide-react"
import type { HopDong, HopDongFormData, LoaiHopDong, TrangThaiHopDong } from "@/types/hop-dong.types"
import { LOAI_HOP_DONG_LABELS, TRANG_THAI_HOP_DONG_LABELS } from "@/types/hop-dong.types"
import { HopDongFormDialog } from "./hop-dong-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCreateHopDong, useUpdateHopDong, useDeleteHopDong } from "@/hooks/hop-dong/use-hop-dong-query"
import { toastSuccess, toastError } from "@/lib/utils"

interface NhanVienHopDongTabProps {
  nhanVienId: string
  hopDongs: HopDong[]
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function getTrangThaiColor(trangThai: TrangThaiHopDong) {
  switch (trangThai) {
    case "dang_hieu_luc":
      return "bg-emerald-100 text-emerald-700 border-0"
    case "da_het_han":
      return "bg-slate-100 text-slate-600 border-0"
    case "bi_huy":
      return "bg-red-100 text-red-700 border-0"
    default:
      return "bg-slate-100 text-slate-600 border-0"
  }
}

export function NhanVienHopDongTab({ nhanVienId, hopDongs }: NhanVienHopDongTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingHopDong, setEditingHopDong] = useState<HopDong | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const createMutation = useCreateHopDong(nhanVienId)
  const updateMutation = useUpdateHopDong(nhanVienId, editingHopDong?.id || "")
  const deleteMutation = useDeleteHopDong(nhanVienId)

  const handleAdd = () => {
    setEditingHopDong(null)
    setFormOpen(true)
  }

  const handleEdit = (hopDong: HopDong) => {
    setEditingHopDong(hopDong)
    setFormOpen(true)
  }

  const handleSubmit = (data: HopDongFormData, editId?: string) => {
    if (editId) {
      updateMutation.mutate(data, {
        onSuccess: () => {
          toastSuccess("Thành công", "Cập nhật hợp đồng thành công")
          setFormOpen(false)
        },
        onError: () => {
          toastError("Lỗi", "Cập nhật hợp đồng thất bại")
        },
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toastSuccess("Thành công", "Thêm hợp đồng mới thành công")
          setFormOpen(false)
        },
        onError: () => {
          toastError("Lỗi", "Thêm hợp đồng thất bại")
        },
      })
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          toastSuccess("Thành công", "Xóa hợp đồng thành công")
          setDeleteId(null)
        },
        onError: () => {
          toastError("Lỗi", "Xóa hợp đồng thất bại")
        },
      })
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Lịch sử hợp đồng lao động
          </h3>
          <Button size="sm" onClick={handleAdd} className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            Thêm hợp đồng
          </Button>
        </div>
        
        {!hopDongs || hopDongs.length === 0 ? (
          <p className="text-slate-500 text-sm">Chưa có hợp đồng nào</p>
        ) : (
          <div className="space-y-4">
            {hopDongs.map((hd) => (
              <div
                key={hd.id}
                className="relative border rounded-lg p-4 border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {hd.so_hop_dong}
                    </p>
                    <p className="text-sm text-slate-500">
                      {LOAI_HOP_DONG_LABELS[hd.loai_hop_dong as LoaiHopDong] || hd.loai_hop_dong}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ký: {formatDate(hd.ngay_ky)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(hd.ngay_bat_dau)} - {formatDate(hd.ngay_ket_thuc) || "..."}
                      </span>
                    </div>
                    {hd.luong_co_ban && (
                      <p className="text-sm text-slate-500">
                        Lương cơ bản: {Number(hd.luong_co_ban).toLocaleString("vi-VN")} đ
                      </p>
                    )}
                    {hd.hinh_thuc_tuyen_dung && (
                      <p className="text-sm text-slate-500">
                        Hình thức tuyển dụng: {hd.hinh_thuc_tuyen_dung}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTrangThaiColor(hd.trang_thai as TrangThaiHopDong)}>
                      {TRANG_THAI_HOP_DONG_LABELS[hd.trang_thai as TrangThaiHopDong] || hd.trang_thai}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(hd)}
                      className="cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDeleteId(hd.id)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {hd.ghi_chu && (
                  <p className="mt-2 text-sm text-slate-500 italic">{hd.ghi_chu}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <HopDongFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingHopDong={editingHopDong}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
