"use client"

import { useState } from "react"
import { Award, Users, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useNhanVienList } from "@/hooks/nhan-vien"
import { useChucVuList } from "@/hooks/chuc-vu"
import { useUpdateNhanVien } from "@/hooks/nhan-vien"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

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

interface ChucVuPhanBoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChucVuPhanBoDialog({ open, onOpenChange }: ChucVuPhanBoDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedChucVuId, setSelectedChucVuId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViensData = nhanViensResult?.data || []
  const nhanViens = (nhanViensData as any[]).filter((nv: any) => nv.trang_thai === "dang_lam")
  const { data: chucVusData = [] } = useChucVuList()
  const activeChucVus = (chucVusData as any[]).filter((cv) => cv.trang_thai !== false)
  const updateMutation = useUpdateNhanVien()

  const selectedEmployee = nhanViens.find((nv) => nv.id === selectedEmployeeId)
  const selectedChucVu = activeChucVus.find((cv) => cv.id === selectedChucVuId)

  const filteredNhanViens = selectedChucVuId
    ? nhanViens.filter((nv) => nv.chuc_vu_id !== selectedChucVuId)
    : nhanViens

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedChucVuId) return

    await updateMutation.mutateAsync({
      id: selectedEmployeeId,
      data: { chuc_vu_id: selectedChucVuId },
    })
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedEmployeeId(null)
      setSelectedChucVuId(null)
      onOpenChange(false)
    }, 1500)
  }

  const handleClose = () => {
    setSelectedEmployeeId(null)
    setSelectedChucVuId(null)
    setSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Phân bổ chức vụ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Phân bổ thành công!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedEmployee?.ho_ten} đã được phân bổ chức vụ {selectedChucVu?.ten_chuc_vu}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Chọn chức vụ</Label>
                <Select value={selectedChucVuId || ""} onValueChange={(v) => {
                  setSelectedChucVuId(v === "none" ? null : v)
                  setSelectedEmployeeId(null)
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
                <Label>
                  Chọn nhân viên
                  {selectedChucVuId && (
                    <span className="text-muted-foreground font-normal ml-1">
                      (chưa có chức vụ đích)
                    </span>
                  )}
                </Label>
                <div className="border rounded-lg max-h-[250px] overflow-y-auto">
                  {filteredNhanViens.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không có nhân viên nào để phân bổ
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNhanViens.map((nv) => {
                        const currentCv = activeChucVus.find((cv) => cv.id === nv.chuc_vu_id)
                        return (
                          <div
                            key={nv.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                              selectedEmployeeId === nv.id ? "bg-primary/5" : ""
                            }`}
                            onClick={() => setSelectedEmployeeId(nv.id)}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
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
                            {selectedEmployeeId === nv.id && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedEmployee && selectedChucVuId && (
                <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                  <p className="text-sm">
                    <span className="font-medium text-blue-700">{selectedEmployee.ho_ten}</span>
                    {" "}sẽ được phân bổ chức vụ{" "}
                    <span className="font-medium text-blue-700">{selectedChucVu?.ten_chuc_vu}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedEmployeeId || !selectedChucVuId || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
