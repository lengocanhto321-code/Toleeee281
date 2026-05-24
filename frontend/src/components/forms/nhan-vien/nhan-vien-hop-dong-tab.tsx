"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock, Plus, Pencil, Ban, AlertTriangle } from "lucide-react"
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
import { formatDateVN } from "@/lib/date-utils"

interface NhanVienHopDongTabProps {
  nhanVienId: string
  hopDongs: HopDong[]
}

function getTrangThaiStyle(trangThai: TrangThaiHopDong) {
  switch (trangThai) {
    case "dang_hieu_luc":
      return { accent: "accent-border-emerald bg-emerald-50/20", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    case "da_het_han":
      return { accent: "", badge: "bg-slate-50 text-slate-600 border-slate-200" }
    case "bi_huy":
      return { accent: "opacity-60", badge: "bg-red-50 text-red-700 border-red-200" }
    default:
      return { accent: "", badge: "bg-slate-50 text-slate-600 border-slate-200" }
  }
}

export function NhanVienHopDongTab({ nhanVienId, hopDongs }: NhanVienHopDongTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingHopDong, setEditingHopDong] = useState<HopDong | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const createMutation = useCreateHopDong(nhanVienId)
  const updateMutation = useUpdateHopDong(nhanVienId, editingHopDong?.id || "")
  const cancelMutation = useDeleteHopDong(nhanVienId)

  const activeCount = hopDongs?.filter(hd => hd.trang_thai === "dang_hieu_luc").length || 0

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

  const handleCancel = () => {
    if (cancelId) {
      cancelMutation.mutate(cancelId, {
        onSuccess: () => {
          toastSuccess("Thành công", "Hủy hợp đồng thành công")
          setCancelId(null)
        },
        onError: () => {
          toastError("Lỗi", "Hủy hợp đồng thất bại")
        },
      })
    }
  }

  const cancelTarget = hopDongs?.find(hd => hd.id === cancelId)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Hợp đồng lao động</h3>
          </div>
          <Button size="sm" onClick={handleAdd} className="gap-1.5 cursor-pointer h-8 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Ký hợp đồng mới
          </Button>
        </div>

        {activeCount > 0 && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800 animate-detail-fade">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              Đang có <strong>{activeCount}</strong> hợp đồng hiệu lực. Ký hợp đồng mới sẽ tự động đóng hợp đồng hiện tại.
            </span>
          </div>
        )}

        {!hopDongs || hopDongs.length === 0 ? (
          <div className="detail-section">
            <div className="dot-grid-bg rounded-xl py-12 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Chưa có hợp đồng nào</p>
              <p className="text-xs text-slate-400">Hợp đồng sẽ hiển thị tại đây khi được tạo</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {hopDongs.map((hd, index) => {
              const style = getTrangThaiStyle(hd.trang_thai as TrangThaiHopDong)
              const isActive = hd.trang_thai === "dang_hieu_luc"

              return (
                <div
                  key={hd.id}
                  className={`detail-section p-4 ${style.accent} animate-detail-fade`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-emerald-100" : "bg-slate-100"}`}>
                          <FileText className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{hd.so_hop_dong}</p>
                          <p className="text-[11px] text-slate-500">
                            {LOAI_HOP_DONG_LABELS[hd.loai_hop_dong as LoaiHopDong] || hd.loai_hop_dong}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pl-10">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ký: {formatDateVN(hd.ngay_ky)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateVN(hd.ngay_bat_dau)} — {formatDateVN(hd.ngay_ket_thuc) || "Không thời hạn"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pl-10">
                        {hd.luong_co_ban && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-medium">
                            Lương: {Number(hd.luong_co_ban).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                        {hd.hinh_thuc_tuyen_dung && (
                          <span>{hd.hinh_thuc_tuyen_dung}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${style.badge}`}>
                        {TRANG_THAI_HOP_DONG_LABELS[hd.trang_thai as TrangThaiHopDong] || hd.trang_thai}
                      </Badge>
                      {hd.trang_thai !== "bi_huy" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => handleEdit(hd)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setCancelId(hd.id)}>
                            <Ban className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {hd.ghi_chu && (
                    <p className="mt-2 text-xs text-slate-400 italic pl-10 border-t border-slate-100 pt-2">{hd.ghi_chu}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <HopDongFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingHopDong={editingHopDong}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        hasActiveContract={activeCount > 0}
      />

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.trang_thai === "dang_hieu_luc" ? (
                <span className="text-amber-600 font-medium">
                  Hợp đồng &quot;{cancelTarget.so_hop_dong}&quot; đang hiệu lực. Hủy sẽ làm thay đổi thông tin hợp đồng hiện tại của nhân viên.
                </span>
              ) : (
                <>Bạn có chắc chắn muốn hủy hợp đồng &quot;{cancelTarget?.so_hop_dong}&quot;?</>
              )}
              {" "}Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Hủy hợp đồng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
