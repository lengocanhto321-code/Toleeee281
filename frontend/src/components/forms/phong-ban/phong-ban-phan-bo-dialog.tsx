"use client"

import { useState } from "react"
import { Users, Building2, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useNhanVienList } from "@/hooks/nhan-vien"
import { usePhongBanList } from "@/hooks/phong-ban"
import { useUpdateNhanVien } from "@/hooks/nhan-vien"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LOAI_NHAN_VIEN_LABELS } from "@/types/nhan-vien.types"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface PhongBanPhanBoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhongBanPhanBoDialog({ open, onOpenChange }: PhongBanPhanBoDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViensAll = nhanViensResult?.data || []
  const nhanViens = nhanViensAll.filter((nv: any) => nv.trang_thai === "dang_lam")
  const { data: phongBansData = [] } = usePhongBanList()
  const updateMutation = useUpdateNhanVien()

  const activePhongBans = phongBansData.filter((pb) => pb.trang_thai !== false)

  const selectedEmployee = nhanViens.find((nv: any) => nv.id === selectedEmployeeId)
  const selectedPhongBan = activePhongBans.find((pb) => pb.id === selectedPhongBanId)

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedPhongBanId) return

    await updateMutation.mutateAsync({
      id: selectedEmployeeId,
      data: { phong_ban_id: selectedPhongBanId },
    })
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedEmployeeId(null)
      setSelectedPhongBanId(null)
      onOpenChange(false)
    }, 1500)
  }

  const handleClose = () => {
    setSelectedEmployeeId(null)
    setSelectedPhongBanId(null)
    setSuccess(false)
    onOpenChange(false)
  }

  const filteredNhanViens = selectedPhongBanId
    ? nhanViens.filter((nv: any) => nv.phong_ban_id !== selectedPhongBanId)
    : nhanViens

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Phân bổ nhân viên
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
                {selectedEmployee?.ho_ten} đã được chuyển sang {selectedPhongBan?.ten_phong_ban}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Chọn phòng ban đích</Label>
                <Select value={selectedPhongBanId || ""} onValueChange={(v) => {
                  setSelectedPhongBanId(v === "none" ? null : v)
                  setSelectedEmployeeId(null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban đích..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activePhongBans.map((pb) => (
                      <SelectItem key={pb.id} value={pb.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{pb.ten_phong_ban}</span>
                          <Badge variant="secondary" className="text-[10px] ml-1">
                            {pb.loai === "hanh_chinh" ? "HC" : "CM"}
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
                  {selectedPhongBanId && (
                    <span className="text-muted-foreground font-normal ml-1">
                      (không thuộc phòng ban đích)
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
                      {filteredNhanViens.map((nv: any) => {
                        const currentPb = activePhongBans.find((pb) => pb.id === nv.phong_ban_id)
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
                                {currentPb && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{currentPb.ten_phong_ban}</span>
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

              {selectedEmployee && selectedPhongBanId && (
                <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                  <p className="text-sm">
                    <span className="font-medium text-blue-700">{selectedEmployee.ho_ten}</span>
                    {" "}sẽ được chuyển sang{" "}
                    <span className="font-medium text-blue-700">{selectedPhongBan?.ten_phong_ban}</span>
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
              disabled={!selectedEmployeeId || !selectedPhongBanId || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
