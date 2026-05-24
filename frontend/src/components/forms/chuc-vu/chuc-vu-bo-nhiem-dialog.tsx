"use client"

import { useState, useMemo, useEffect } from "react"
import { Award, Users, Check, FileText, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useNhanVienList, useBatchBoNhiem } from "@/hooks/nhan-vien"
import { useChucVuList } from "@/hooks/chuc-vu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const boNhiemSchema = z.object({
  ngay_bo_nhiem: z.string().min(1, "Ngày bổ nhiệm là bắt buộc"),
  so_quyet_dinh: z.string().max(50, "Số quyết định không quá 50 ký tự"),
})

type BoNhiemFormValues = z.infer<typeof boNhiemSchema>

const LOAI_LABELS: Record<string, string> = {
  quan_ly: "Quản lý",
  giao_vien: "Giáo viên",
  nhan_vien: "Nhân viên",
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface ChucVuBoNhiemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChucVuBoNhiemDialog({ open, onOpenChange }: ChucVuBoNhiemDialogProps) {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())
  const [selectedChucVuId, setSelectedChucVuId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const { register, handleSubmit: rhfSubmit, reset, formState: { errors }, watch, setValue } = useForm<BoNhiemFormValues>({
    resolver: zodResolver(boNhiemSchema),
    mode: "onChange",
    defaultValues: {
      ngay_bo_nhiem: new Date().toISOString().split("T")[0],
      so_quyet_dinh: "",
    },
  })

  const ngayBoNhiem = watch("ngay_bo_nhiem")
  const soQuyetDinh = watch("so_quyet_dinh")

  useEffect(() => {
    if (open) {
      reset({
        ngay_bo_nhiem: new Date().toISOString().split("T")[0],
        so_quyet_dinh: "",
      })
    }
  }, [open, reset])

  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViensAll = nhanViensResult?.data || []
  const nhanViens = nhanViensAll.filter((nv: any) => nv.trang_thai === "dang_lam")
  const { data: chucVusData = [] } = useChucVuList()
  const activeChucVus = (chucVusData as any[]).filter((cv) => cv.trang_thai !== false)
  const batchMutation = useBatchBoNhiem()

  const selectedChucVu = activeChucVus.find((cv) => cv.id === selectedChucVuId)

  const filteredNhanViens = useMemo(() => {
    let result = nhanViens
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((nv: any) =>
        nv.ho_ten?.toLowerCase().includes(term) ||
        nv.ma_nhan_vien?.toLowerCase().includes(term)
      )
    }
    return result
  }, [nhanViens, searchTerm])

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedEmployeeIds(new Set(filteredNhanViens.map((nv: any) => nv.id)))
  }

  const deselectAll = () => {
    setSelectedEmployeeIds(new Set())
  }

  const onFormSubmit = async () => {
    if (selectedEmployeeIds.size === 0 || !selectedChucVuId || !ngayBoNhiem) return

    const result = await batchMutation.mutateAsync({
      nhan_vien_ids: Array.from(selectedEmployeeIds),
      chuc_vu_id: selectedChucVuId,
      ngay_bo_nhiem: ngayBoNhiem,
      so_quyet_dinh: soQuyetDinh || undefined,
    })
    setSuccessCount(result.success_count)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSuccessCount(0)
      setSelectedEmployeeIds(new Set())
      setSelectedChucVuId(null)
      reset({
        ngay_bo_nhiem: new Date().toISOString().split("T")[0],
        so_quyet_dinh: "",
      })
      setSearchTerm("")
      onOpenChange(false)
    }, 2000)
  }

  const handleClose = () => {
    setSelectedEmployeeIds(new Set())
    setSelectedChucVuId(null)
    reset({
      ngay_bo_nhiem: new Date().toISOString().split("T")[0],
      so_quyet_dinh: "",
    })
    setSuccess(false)
    setSuccessCount(0)
    setSearchTerm("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="4xl" className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Bổ nhiệm chức vụ
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-2">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Bổ nhiệm thành công!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {successCount} nhân viên đã được bổ nhiệm chức vụ {selectedChucVu?.ten_chuc_vu}
              </p>
            </div>
          ) : (
            <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
              <div className="w-72 shrink-0 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Chức vụ bổ nhiệm</Label>
                  <Select value={selectedChucVuId || ""} onValueChange={(v) => {
                    setSelectedChucVuId(v === "none" ? null : v)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức vụ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeChucVus.map((cv) => (
                        <SelectItem key={cv.id} value={cv.id}>
                          <div className="flex items-center gap-2">
                            <Award className={`h-4 w-4 ${
                              cv.loai === "quan_ly" ? "text-amber-500" :
                              cv.loai === "giao_vien" ? "text-emerald-500" :
                              "text-blue-500"
                            }`} />
                            <span>{cv.ten_chuc_vu}</span>
                            <Badge variant="secondary" className={`text-[10px] ml-1 ${
                              cv.loai === "quan_ly" ? "bg-amber-50 text-amber-700" :
                              cv.loai === "giao_vien" ? "bg-emerald-50 text-emerald-700" :
                              "bg-blue-50 text-blue-700"
                            }`}>
                              {LOAI_LABELS[cv.loai] || cv.loai}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ngày bổ nhiệm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register("ngay_bo_nhiem")}
                  />
                  {errors.ngay_bo_nhiem && (
                    <p className="text-xs text-destructive">{errors.ngay_bo_nhiem.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Số quyết định
                  </Label>
                  <Input
                    {...register("so_quyet_dinh")}
                    placeholder="QĐ-2026/001"
                  />
                  {errors.so_quyet_dinh && (
                    <p className="text-xs text-destructive">{errors.so_quyet_dinh.message}</p>
                  )}
                </div>

                {selectedEmployeeIds.size > 0 && (
                  <div className="rounded-lg bg-primary/5 p-3 border border-primary/20">
                    <div className="text-sm font-medium text-primary">
                      {selectedEmployeeIds.size} nhân viên đã chọn
                    </div>
                    {selectedChucVu && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Bổ nhiệm làm {selectedChucVu.ten_chuc_vu}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0 border rounded-lg overflow-hidden">
                <div className="p-3 border-b bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Chọn nhân viên để bổ nhiệm
                    </Label>
                    {filteredNhanViens.length > 0 && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                          Chọn tất cả
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>
                          Bỏ chọn
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredNhanViens.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Không có nhân viên nào
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNhanViens.map((nv: any) => {
                        const currentCv = activeChucVus.find((cv) => cv.id === nv.chuc_vu_id)
                        const isSelected = selectedEmployeeIds.has(nv.id)
                        return (
                          <div
                            key={nv.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                            onClick={() => toggleEmployee(nv.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleEmployee(nv.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {getInitials(nv.ho_ten)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{nv.ho_ten}</p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>{LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}</span>
                                {currentCv && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{currentCv.ten_chuc_vu}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={rhfSubmit(onFormSubmit)}
              disabled={selectedEmployeeIds.size === 0 || !selectedChucVuId || !ngayBoNhiem || batchMutation.isPending}
            >
              {batchMutation.isPending
                ? "Đang xử lý..."
                : selectedEmployeeIds.size > 0
                  ? `Bổ nhiệm ${selectedEmployeeIds.size} nhân viên`
                  : "Xác nhận"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
