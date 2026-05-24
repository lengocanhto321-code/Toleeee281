"use client"

import { useState, useMemo } from "react"
import { Users, Building2, Check, BadgeCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useNhanVienList, useBatchPhanBo } from "@/hooks/nhan-vien"
import { usePhongBanAll } from "@/hooks/phong-ban"
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
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())
  const [selectedPhongBanId, setSelectedPhongBanId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: nhanViensResult } = useNhanVienList({ page: 1, page_size: 100 })
  const nhanViensAll = nhanViensResult?.data || []
  const nhanViens = nhanViensAll.filter((nv: any) => nv.trang_thai === "dang_lam")
  const { data: phongBansData = [] } = usePhongBanAll()
  const batchMutation = useBatchPhanBo()

  const activePhongBans = phongBansData.filter((pb) => pb.trang_thai !== false)
  const selectedPhongBan = activePhongBans.find((pb) => pb.id === selectedPhongBanId)

  const { alreadyInDept, availableForAssign } = useMemo(() => {
    if (!selectedPhongBanId) {
      return { alreadyInDept: [], availableForAssign: nhanViens }
    }
    const inDept = nhanViens.filter((nv: any) => nv.phong_ban_id === selectedPhongBanId)
    const available = nhanViens.filter((nv: any) => nv.phong_ban_id !== selectedPhongBanId)
    return { alreadyInDept: inDept, availableForAssign: available }
  }, [nhanViens, selectedPhongBanId])

  const filteredAvailable = useMemo(() => {
    if (!searchTerm.trim()) return availableForAssign
    const term = searchTerm.toLowerCase()
    return availableForAssign.filter((nv: any) =>
      nv.ho_ten?.toLowerCase().includes(term) ||
      nv.ma_nhan_vien?.toLowerCase().includes(term)
    )
  }, [availableForAssign, searchTerm])

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
    setSelectedEmployeeIds(new Set(filteredAvailable.map((nv: any) => nv.id)))
  }

  const deselectAll = () => {
    setSelectedEmployeeIds(new Set())
  }

  const handleSubmit = async () => {
    if (selectedEmployeeIds.size === 0 || !selectedPhongBanId) return

    const result = await batchMutation.mutateAsync({
      nhan_vien_ids: Array.from(selectedEmployeeIds),
      phong_ban_id: selectedPhongBanId,
    })
    setSuccessCount(result.success_count)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSuccessCount(0)
      setSelectedEmployeeIds(new Set())
      setSelectedPhongBanId(null)
      setSearchTerm("")
      onOpenChange(false)
    }, 2000)
  }

  const handleClose = () => {
    setSelectedEmployeeIds(new Set())
    setSelectedPhongBanId(null)
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
            <Users className="h-5 w-5" />
            Phân bổ nhân viên vào phòng ban
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-2">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-700">Phân bổ thành công!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {successCount} nhân viên đã được chuyển sang {selectedPhongBan?.ten_phong_ban}
              </p>
            </div>
          ) : (
            <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
              <div className="w-72 shrink-0 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Phòng ban đích</Label>
                  <Select value={selectedPhongBanId || ""} onValueChange={(v) => {
                    setSelectedPhongBanId(v === "none" ? null : v)
                    setSelectedEmployeeIds(new Set())
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban..." />
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

                {selectedPhongBanId && (
                  <>
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                        Nhân viên đã trong phòng ban
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {alreadyInDept.length}
                      </div>
                      <div className="text-xs text-muted-foreground">nhân viên</div>
                    </div>

                    {alreadyInDept.length > 0 && (
                      <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                        <div className="divide-y">
                          {alreadyInDept.map((nv: any) => (
                            <div
                              key={nv.id}
                              className="flex items-center gap-3 p-2.5 bg-blue-50/60"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                                {getInitials(nv.ho_ten)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{nv.ho_ten}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {LOAI_NHAN_VIEN_LABELS[nv.loai_nhan_vien] || nv.loai_nhan_vien}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 shrink-0">
                                Đã ở
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0 border rounded-lg overflow-hidden">
                <div className="p-3 border-b bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Chọn nhân viên để phân bổ
                    </Label>
                    {selectedPhongBanId && filteredAvailable.length > 0 && (
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
                  {selectedEmployeeIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {selectedEmployeeIds.size} đã chọn
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {!selectedPhongBanId ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Vui lòng chọn phòng ban đích trước
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Không có nhân viên nào để phân bổ
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredAvailable.map((nv: any) => {
                        const currentPb = activePhongBans.find((pb) => pb.id === nv.phong_ban_id)
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
                                {currentPb && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{currentPb.ten_phong_ban}</span>
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
              onClick={handleSubmit}
              disabled={selectedEmployeeIds.size === 0 || !selectedPhongBanId || batchMutation.isPending}
            >
              {batchMutation.isPending
                ? "Đang xử lý..."
                : selectedEmployeeIds.size > 0
                  ? `Phân bổ ${selectedEmployeeIds.size} nhân viên`
                  : "Xác nhận"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
