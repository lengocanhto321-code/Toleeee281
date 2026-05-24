"use client"

import { useState } from "react"
import { Building2, Award, ArrowRightLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePhongBanAll } from "@/hooks/phong-ban/use-phong-ban-query"
import { useChucVuList } from "@/hooks/chuc-vu/use-chuc-vu-query"
import {
  useBatchPhanBo,
  useBatchPhanBoChucVu,
  useBatchBoNhiem,
  useDieuChuyenNhanVien,
} from "@/hooks/nhan-vien"
import type { NhanVien } from "@/types/nhan-vien.types"

type BatchAction = "phan_bo" | "bo_nhiem" | "dieu_chuyen" | null

interface NhanVienBatchActionsBarProps {
  selectedNhanViens: NhanVien[]
  onClearSelection: () => void
}

export function NhanVienBatchActionsBar({
  selectedNhanViens,
  onClearSelection,
}: NhanVienBatchActionsBarProps) {
  const [activeAction, setActiveAction] = useState<BatchAction>(null)

  const count = selectedNhanViens.length
  const nhanVienIds = selectedNhanViens.map((nv) => nv.id)

  if (count === 0) return null

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
          {count} nhân viên
        </Badge>
        <span className="text-sm text-blue-600">đã chọn</span>

        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => setActiveAction("phan_bo")}
          >
            <Building2 className="h-3.5 w-3.5" />
            Phân bổ phòng ban
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => setActiveAction("bo_nhiem")}
          >
            <Award className="h-3.5 w-3.5" />
            Bổ nhiệm chức vụ
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => setActiveAction("dieu_chuyen")}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Điều chuyển
          </Button>
        </div>

        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 cursor-pointer text-blue-400 hover:text-blue-600"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <PhanBoDialog
        open={activeAction === "phan_bo"}
        onOpenChange={(v) => { if (!v) setActiveAction(null) }}
        nhanVienIds={nhanVienIds}
        names={selectedNhanViens.map((nv) => nv.ho_ten)}
        onSuccess={() => { setActiveAction(null); onClearSelection() }}
      />

      <BoNhiemDialog
        open={activeAction === "bo_nhiem"}
        onOpenChange={(v) => { if (!v) setActiveAction(null) }}
        nhanVienIds={nhanVienIds}
        names={selectedNhanViens.map((nv) => nv.ho_ten)}
        onSuccess={() => { setActiveAction(null); onClearSelection() }}
      />

      <DieuChuyenDialog
        open={activeAction === "dieu_chuyen"}
        onOpenChange={(v) => { if (!v) setActiveAction(null) }}
        selectedNhanViens={selectedNhanViens}
        onSuccess={() => { setActiveAction(null); onClearSelection() }}
      />
    </>
  )
}

function PhanBoDialog({
  open,
  onOpenChange,
  nhanVienIds,
  names,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  nhanVienIds: string[]
  names: string[]
  onSuccess: () => void
}) {
  const [phongBanId, setPhongBanId] = useState("")
  const { data: phongBans } = usePhongBanAll()
  const mutation = useBatchPhanBo()

  const handleSubmit = () => {
    if (!phongBanId) return
    mutation.mutate(
      { nhan_vien_ids: nhanVienIds, phong_ban_id: phongBanId },
      { onSuccess }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phân bổ phòng ban hàng loạt</DialogTitle>
          <DialogDescription>
            Phân bổ {nhanVienIds.length} nhân viên vào phòng ban
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-slate-50 border p-3 max-h-32 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-1">Nhân viên được chọn:</p>
            <p className="text-sm">{names.join(", ")}</p>
          </div>
          <div className="space-y-2">
            <Label>Phòng ban <span className="text-red-500">*</span></Label>
            <Select value={phongBanId} onValueChange={setPhongBanId}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn phòng ban" />
              </SelectTrigger>
              <SelectContent>
                {phongBans?.filter((pb) => pb.trang_thai).map((pb) => (
                  <SelectItem key={pb.id} value={pb.id} className="cursor-pointer">
                    {pb.ten_phong_ban}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
          <Button onClick={handleSubmit} disabled={!phongBanId || mutation.isPending} className="cursor-pointer">
            {mutation.isPending ? "Đang xử lý..." : `Phân bổ ${nhanVienIds.length} nhân viên`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BoNhiemDialog({
  open,
  onOpenChange,
  nhanVienIds,
  names,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  nhanVienIds: string[]
  names: string[]
  onSuccess: () => void
}) {
  const [chucVuId, setChucVuId] = useState("")
  const [ngayBoNhiem, setNgayBoNhiem] = useState(new Date().toISOString().split("T")[0])
  const [soQuyetDinh, setSoQuyetDinh] = useState("")
  const { data: chucVus } = useChucVuList()
  const mutation = useBatchBoNhiem()

  const handleSubmit = () => {
    if (!chucVuId || !ngayBoNhiem) return
    mutation.mutate(
      { nhan_vien_ids: nhanVienIds, chuc_vu_id: chucVuId, ngay_bo_nhiem: ngayBoNhiem, so_quyet_dinh: soQuyetDinh || undefined },
      { onSuccess }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bổ nhiệm chức vụ hàng loạt</DialogTitle>
          <DialogDescription>
            Bổ nhiệm chức vụ cho {nhanVienIds.length} nhân viên
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-slate-50 border p-3 max-h-32 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-1">Nhân viên được chọn:</p>
            <p className="text-sm">{names.join(", ")}</p>
          </div>
          <div className="space-y-2">
            <Label>Chức vụ <span className="text-red-500">*</span></Label>
            <Select value={chucVuId} onValueChange={setChucVuId}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn chức vụ" />
              </SelectTrigger>
              <SelectContent>
                {chucVus?.filter((cv) => cv.trang_thai).map((cv) => (
                  <SelectItem key={cv.id} value={cv.id} className="cursor-pointer">
                    {cv.ten_chuc_vu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ngày bổ nhiệm <span className="text-red-500">*</span></Label>
            <Input type="date" value={ngayBoNhiem} onChange={(e) => setNgayBoNhiem(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Số quyết định</Label>
            <Input value={soQuyetDinh} onChange={(e) => setSoQuyetDinh(e.target.value)} placeholder="VD: QĐ-2026/001" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
          <Button onClick={handleSubmit} disabled={!chucVuId || !ngayBoNhiem || mutation.isPending} className="cursor-pointer">
            {mutation.isPending ? "Đang xử lý..." : `Bổ nhiệm ${nhanVienIds.length} nhân viên`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DieuChuyenDialog({
  open,
  onOpenChange,
  selectedNhanViens,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedNhanViens: NhanVien[]
  onSuccess: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phongBanId, setPhongBanId] = useState("")
  const [chucVuId, setChucVuId] = useState("")
  const [ngayDieuChuyen, setNgayDieuChuyen] = useState(new Date().toISOString().split("T")[0])
  const [lyDo, setLyDo] = useState("")
  const { data: phongBans } = usePhongBanAll()
  const { data: chucVus } = useChucVuList()
  const mutation = useDieuChuyenNhanVien()
  const [completedCount, setCompletedCount] = useState(0)

  const nv = selectedNhanViens[currentIndex]
  const totalCount = selectedNhanViens.length
  const isDone = currentIndex >= totalCount

  const handleNext = () => {
    if (!nv || !phongBanId || !chucVuId || !ngayDieuChuyen) return
    mutation.mutate(
      {
        nhan_vien_id: nv.id,
        phong_ban_id_moi: phongBanId,
        chuc_vu_id_moi: chucVuId,
        ngay_dieu_chuyen: ngayDieuChuyen,
        ly_do: lyDo || undefined,
      },
      {
        onSuccess: () => {
          const nextIndex = currentIndex + 1
          setCompletedCount(nextIndex)
          if (nextIndex >= totalCount) {
            onSuccess()
          } else {
            setCurrentIndex(nextIndex)
          }
        },
      }
    )
  }

  const handleClose = () => {
    setCurrentIndex(0)
    setCompletedCount(0)
    setPhongBanId("")
    setChucVuId("")
    setLyDo("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chuyển nhân viên</DialogTitle>
          <DialogDescription>
            {isDone
              ? `Hoàn tất điều chuyển ${completedCount}/${totalCount} nhân viên`
              : `Điều chuyển ${currentIndex + 1}/${totalCount}: ${nv?.ho_ten || ""}`}
          </DialogDescription>
        </DialogHeader>
        {isDone ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-emerald-600">Hoàn tất!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Đã điều chuyển thành công {completedCount} nhân viên
            </p>
          </div>
        ) : nv ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-slate-50 border p-3">
              <p className="text-sm font-medium">{nv.ho_ten}</p>
              <p className="text-xs text-muted-foreground">
                {nv.phong_ban?.ten_phong_ban || "Chưa có phòng ban"} → {nv.chuc_vu?.ten_chuc_vu || "Chưa có chức vụ"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Phòng ban mới <span className="text-red-500">*</span></Label>
              <Select value={phongBanId} onValueChange={setPhongBanId}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {phongBans?.filter((pb) => pb.trang_thai).map((pb) => (
                    <SelectItem key={pb.id} value={pb.id} className="cursor-pointer">
                      {pb.ten_phong_ban}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chức vụ mới <span className="text-red-500">*</span></Label>
              <Select value={chucVuId} onValueChange={setChucVuId}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {chucVus?.filter((cv) => cv.trang_thai).map((cv) => (
                    <SelectItem key={cv.id} value={cv.id} className="cursor-pointer">
                      {cv.ten_chuc_vu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ngày điều chuyển <span className="text-red-500">*</span></Label>
              <Input type="date" value={ngayDieuChuyen} onChange={(e) => setNgayDieuChuyen(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Input value={lyDo} onChange={(e) => setLyDo(e.target.value)} placeholder="VD: Theo nhu cầu công tác" />
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="cursor-pointer">
            {isDone ? "Đóng" : "Hủy"}
          </Button>
          {!isDone && (
            <Button
              onClick={handleNext}
              disabled={!phongBanId || !chucVuId || !ngayDieuChuyen || mutation.isPending}
              className="cursor-pointer"
            >
              {mutation.isPending
                ? "Đang xử lý..."
                : currentIndex < totalCount - 1
                  ? `Điều chuyển & Tiếp`
                  : "Điều chuyển"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
