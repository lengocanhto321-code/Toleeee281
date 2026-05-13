"use client"

import { useState, useEffect, useMemo } from "react"
import { User, Calendar as CalendarIcon, Check, X, AlertTriangle, Search, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DonXinNghi, LoaiNghi, ChamCongThang } from "@/types/nghi-phep.types"
import { createDonXinNghiSchema } from "@/schemas/nghi-phep.schema"
import { toastError } from "@/lib/utils"
import { format, addDays, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useNhanVienList } from "@/hooks/nhan-vien"

const LOAI_NGHI_OPTIONS: { value: LoaiNghi; label: string }[] = [
  { value: "phep_nam", label: "Phép năm" },
  { value: "nghi_om", label: "Nghỉ ốm" },
  { value: "viec_rieng", label: "Việc riêng" },
  { value: "cong_tac", label: "Công tác" },
  { value: "ket_hon", label: "Kết hôn" },
  { value: "mai_tang", label: "Ma táng" },
  { value: "thai_san", label: "Thai sản" },
]

const LOAI_NGHI_COLORS: Record<string, string> = {
  phep_nam: "bg-blue-100 text-blue-700 border-blue-200",
  nghi_om: "bg-red-100 text-red-700 border-red-200",
  viec_rieng: "bg-amber-100 text-amber-700 border-amber-200",
  cong_tac: "bg-purple-100 text-purple-700 border-purple-200",
  ket_hon: "bg-pink-100 text-pink-700 border-pink-200",
  mai_tang: "bg-slate-100 text-slate-700 border-slate-200",
  thai_san: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

const TRANG_THAI_COLORS: Record<string, string> = {
  cho_duyet: "bg-amber-100 text-amber-700 border-amber-200",
  cho_duyet_cap_1: "bg-amber-100 text-amber-700 border-amber-200",
  cho_duyet_cap_2: "bg-blue-100 text-blue-700 border-blue-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  da_duyet_cap_2: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-red-100 text-red-700 border-red-200",
  huy: "bg-slate-100 text-slate-700 border-slate-200",
}

const TRANG_THAI_LABELS: Record<string, string> = {
  cho_duyet: "Chờ duyệt",
  cho_duyet_cap_1: "Chờ cấp 1",
  cho_duyet_cap_2: "Chờ cấp 2",
  da_duyet: "Đã duyệt",
  da_duyet_cap_2: "Đã duyệt",
  tu_choi: "Từ chối",
  huy: "Đã hủy",
}

interface DonNghiDetailDialogProps {
  don: DonXinNghi | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDuyetCap1?: () => void
  onDuyetCap2?: () => void
  onTuChoi: (lyDo: string) => void
}

export function DonNghiDetailDialog({
  don,
  open,
  onOpenChange,
  onDuyetCap1,
  onDuyetCap2,
  onTuChoi,
}: DonNghiDetailDialogProps) {
  const [lyDoTuChoi, setLyDoTuChoi] = useState("")

  if (!don) return null

  const handleTuChoi = () => {
    onTuChoi(lyDoTuChoi)
    setLyDoTuChoi("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono text-foreground">{don.id.slice(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">{don.nhan_vien_ho_ten || "N/A"}</p>
              <p className="text-sm text-muted-foreground">ID: {don.nhan_vien_id}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Loại nghỉ</FieldLabel>
              <Badge variant="outline" className={LOAI_NGHI_COLORS[don.loai_nghi] + " mt-1 w-fit"}>
                {don.ten_loai_nghi || don.loai_nghi}
              </Badge>
            </Field>
            <Field>
              <FieldLabel>Trạng thái</FieldLabel>
              <Badge variant="outline" className={TRANG_THAI_COLORS[don.trang_thai] + " mt-1 w-fit"}>
                {TRANG_THAI_LABELS[don.trang_thai] || don.trang_thai}
              </Badge>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Từ ngày</FieldLabel>
              <p className="text-sm font-medium mt-1">{format(new Date(don.tu_ngay), "dd/MM/yyyy")}</p>
            </Field>
            <Field>
              <FieldLabel>Đến ngày</FieldLabel>
              <p className="text-sm font-medium mt-1">{format(new Date(don.den_ngay), "dd/MM/yyyy")}</p>
            </Field>
          </div>

          <Field>
            <FieldLabel>Số ngày nghỉ</FieldLabel>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{don.so_ngay} ngày</p>
          </Field>

          {don.ly_do && (
            <Field>
              <FieldLabel>Lý do</FieldLabel>
              <p className="text-sm bg-muted/50 p-3 rounded-md mt-1">{don.ly_do}</p>
            </Field>
          )}

          {don.trang_thai === "tu_choi" && don.ghi_chu_duyet && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">Lý do từ chối</p>
              <p className="text-sm text-red-600 mt-1">{don.ghi_chu_duyet}</p>
            </div>
          )}

          {(don.trang_thai === "cho_duyet_cap_1" || don.trang_thai === "cho_duyet_cap_2") && (
            <Field>
              <FieldLabel htmlFor="ly-do-tu-choi">Lý do từ chối (tùy chọn)</FieldLabel>
              <Textarea
                id="ly-do-tu-choi"
                value={lyDoTuChoi}
                onChange={(e) => setLyDoTuChoi(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={2}
                className="mt-1"
              />
            </Field>
          )}

          {(don.trang_thai === "cho_duyet_cap_2" || don.trang_thai === "da_duyet_cap_2") && don.nguoi_duyet_cap_1 && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-700">Đã duyệt cấp 1</p>
              <p className="text-sm text-emerald-600 mt-1">
                Bởi: {don.nguoi_duyet_cap_1} • {don.ngay_duyet_cap_1 ? format(new Date(don.ngay_duyet_cap_1), "dd/MM/yyyy HH:mm") : ""}
              </p>
              {don.ghi_chu_duyet_cap_1 && (
                <p className="text-sm text-emerald-600 mt-1">Ghi chú: {don.ghi_chu_duyet_cap_1}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {don.trang_thai === "cho_duyet_cap_1" ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleTuChoi}
              >
                <X className="size-4 mr-2" data-icon="inline-start" />
                Từ chối
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={onDuyetCap1}
              >
                <Check className="size-4 mr-2" data-icon="inline-start" />
                Duyệt cấp 1
              </Button>
            </div>
          ) : don.trang_thai === "cho_duyet_cap_2" ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleTuChoi}
              >
                <X className="size-4 mr-2" data-icon="inline-start" />
                Từ chối
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={onDuyetCap2}
              >
                <Check className="size-4 mr-2" data-icon="inline-start" />
                Duyệt cấp 2
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CreateDonNghiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onSubmit: (data: {
    nhan_vien_id: string
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
  }) => void
  isPending?: boolean
}

export function CreateDonNghiDialog({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
  isPending = false,
}: CreateDonNghiDialogProps) {
  const [form, setForm] = useState({
    nhan_vien_id: "",
    nhan_vien_ten: "",
    loai_nghi: "phep_nam" as LoaiNghi,
    tu_ngay: undefined as Date | undefined,
    den_ngay: undefined as Date | undefined,
    ly_do: "",
  })
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false)
  const [tuNgayPopoverOpen, setTuNgayPopoverOpen] = useState(false)
  const [denNgayPopoverOpen, setDenNgayPopoverOpen] = useState(false)

  const { data: nhanVienResult } = useNhanVienList({ page: 1, page_size: 100, trang_thai: "dang_lam" })
  const nhanVienList = nhanVienResult?.data || []

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return nhanVienList
    const search = employeeSearch.toLowerCase()
    return nhanVienList.filter(
      (nv) =>
        nv.ho_ten.toLowerCase().includes(search) ||
        nv.ma_nhan_vien.toLowerCase().includes(search)
    )
  }, [nhanVienList, employeeSearch])

  const handleSelectEmployee = (nv: { id: string; ho_ten: string }) => {
    setForm((prev) => ({ ...prev, nhan_vien_id: nv.id, nhan_vien_ten: nv.ho_ten }))
    setEmployeeSearch("")
    setEmployeePopoverOpen(false)
  }

  const handleTuNgaySelect = (date: Date | undefined) => {
    setForm((prev) => {
      const newForm = { ...prev, tu_ngay: date }
      if (date && prev.den_ngay && date > prev.den_ngay) {
        newForm.den_ngay = date
      }
      return newForm
    })
    setTuNgayPopoverOpen(false)
  }

  const handleDenNgaySelect = (date: Date | undefined) => {
    setForm((prev) => ({ ...prev, den_ngay: date }))
    setDenNgayPopoverOpen(false)
  }

  const soNgay = useMemo(() => {
    if (form.tu_ngay && form.den_ngay) {
      return differenceInDays(form.den_ngay, form.tu_ngay) + 1
    }
    return 0
  }, [form.tu_ngay, form.den_ngay])

  const handleSubmit = () => {
    if (!form.nhan_vien_id || !form.loai_nghi || !form.tu_ngay || !form.den_ngay) {
      toastError("Lỗi", "Vui lòng điền đầy đủ thông tin")
      return
    }
    const submitData = {
      nhan_vien_id: form.nhan_vien_id,
      loai_nghi: form.loai_nghi,
      tu_ngay: format(form.tu_ngay, "yyyy-MM-dd"),
      den_ngay: format(form.den_ngay, "yyyy-MM-dd"),
      ly_do: form.ly_do || undefined,
    }
    onSubmit(submitData)
    resetForm()
  }

  const resetForm = () => {
    setForm({
      nhan_vien_id: "",
      nhan_vien_ten: "",
      loai_nghi: "phep_nam",
      tu_ngay: undefined,
      den_ngay: undefined,
      ly_do: "",
    })
    setEmployeeSearch("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đơn nghỉ phép mới</DialogTitle>
          <DialogDescription>Điền thông tin đơn xin nghỉ phép</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Nhân viên</FieldLabel>
              <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-normal",
                      !form.nhan_vien_id && "text-muted-foreground"
                    )}
                  >
                    {form.nhan_vien_ten || "Tìm và chọn nhân viên..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 overflow-hidden" align="start">
                  <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã nhân viên..."
                      className="flex h-9 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {nhanVienList.length === 0 ? "Không có nhân viên nào" : "Không tìm thấy nhân viên"}
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredEmployees.slice(0, 50).map((nv) => (
                          <button
                            key={nv.id}
                            type="button"
                            onClick={() => handleSelectEmployee(nv)}
                            className={cn(
                              "w-full flex cursor-default items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none hover:bg-muted",
                              form.nhan_vien_id === nv.id && "bg-muted"
                            )}
                          >
                            <User className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-1 flex-col items-start text-left">
                              <span className="font-medium">{nv.ho_ten}</span>
                              <span className="text-xs text-muted-foreground">
                                {nv.ma_nhan_vien} • {nv.loai_nhan_vien === "giao_vien" ? "Giáo viên" : "Nhân viên"}
                              </span>
                            </div>
                            {form.nhan_vien_id === nv.id && (
                              <Check className="ml-auto h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel>Loại nghỉ phép</FieldLabel>
              <Select
                value={form.loai_nghi}
                onValueChange={(v) => setForm({ ...form, loai_nghi: v as LoaiNghi })}
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

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Từ ngày</FieldLabel>
                <Popover open={tuNgayPopoverOpen} onOpenChange={setTuNgayPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.tu_ngay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.tu_ngay ? format(form.tu_ngay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.tu_ngay}
                      onSelect={handleTuNgaySelect}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <FieldLabel>Đến ngày</FieldLabel>
                <Popover open={denNgayPopoverOpen} onOpenChange={setDenNgayPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.den_ngay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.den_ngay ? format(form.den_ngay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.den_ngay}
                      onSelect={handleDenNgaySelect}
                      disabled={(date) => !form.tu_ngay || date < form.tu_ngay}
                      fromDate={form.tu_ngay}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>

            {soNgay > 0 && (
              <div className="flex items-center justify-center p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-sm text-indigo-700">
                  Số ngày nghỉ: <strong className="text-lg">{soNgay}</strong> ngày
                </span>
              </div>
            )}

            <Field>
              <FieldLabel>Lý do (tùy chọn)</FieldLabel>
              <Textarea
                value={form.ly_do}
                onChange={(e) => setForm({ ...form, ly_do: e.target.value })}
                placeholder="Nhập lý do nghỉ phép..."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.nhan_vien_id || !form.loai_nghi || !form.tu_ngay || !form.den_ngay || isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending ? "Đang tạo..." : "Tạo đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChamCongDetailDialogProps {
  chamCong: ChamCongThang | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChamCongDetailDialog({
  chamCong,
  open,
  onOpenChange,
}: ChamCongDetailDialogProps) {
  if (!chamCong) return null

  const heSo = chamCong.he_so_ngay_cong
  const heSoPercent = heSo * 100

  const TRANG_THAI_COLORS: Record<string, string> = {
    chua_chot: "bg-amber-100 text-amber-700 border-amber-200",
    da_xac_nhan: "bg-blue-100 text-blue-700 border-blue-200",
    da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
    da_chot: "bg-purple-100 text-purple-700 border-purple-200",
    da_mock: "bg-slate-100 text-slate-700 border-slate-200",
  }

  const TRANG_THAI_LABELS: Record<string, string> = {
    chua_chot: "Chưa chốt",
    da_xac_nhan: "Đã xác nhận",
    da_duyet: "Đã duyệt",
    da_chot: "Đã chốt",
    da_mock: "Đã mock",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết chấm công</DialogTitle>
          <DialogDescription>
            {chamCong.nhan_vien_ho_ten || chamCong.nhan_vien_id} - Tháng {chamCong.thang}/{chamCong.nam}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">{chamCong.nhan_vien_ho_ten || "N/A"}</p>
                <p className="text-sm text-muted-foreground">ID: {chamCong.nhan_vien_id}</p>
              </div>
            </div>
            <Badge variant="outline" className={TRANG_THAI_COLORS[chamCong.trang_thai]}>
              {TRANG_THAI_LABELS[chamCong.trang_thai] || chamCong.trang_thai}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Hệ số ngày công</span>
                <span className="text-2xl font-bold text-indigo-600">{heSo.toFixed(2)}</span>
              </div>
              <Progress value={heSoPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {heSoPercent.toFixed(1)}% hoàn thành công việc
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500 mb-1">Ngày công chuẩn</p>
                <p className="text-xl font-bold">{chamCong.so_ngay_lam_chuan}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-600 mb-1">Có mặt</p>
                <p className="text-xl font-bold text-emerald-700">{chamCong.so_ngay_co_mat}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-lg font-semibold text-amber-700">{chamCong.so_ngay_vang_co_phep}</p>
                <p className="text-xs text-amber-600">Vắng CP</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-lg font-semibold text-red-700">{chamCong.so_ngay_vang_khong_phep}</p>
                <p className="text-xs text-red-600">Vắng KP</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-lg font-semibold text-purple-700">{chamCong.so_ngay_nghi_le_tet}</p>
                <p className="text-xs text-purple-600">Lễ Tết</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ngày công tác</p>
                <p className="text-xs text-muted-foreground">Đi công tác ngoài trường</p>
              </div>
              <span className="text-lg font-semibold text-purple-600">{chamCong.so_ngay_cong_tac}</span>
            </div>

            {chamCong.ghi_chu && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Ghi chú</p>
                <p className="text-sm text-muted-foreground">{chamCong.ghi_chu}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface GenerateChamCongDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { thang: number; nam: number }) => void
  isPending?: boolean
}

export function GenerateChamCongDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: GenerateChamCongDialogProps) {
  const currentDate = new Date()
  const [thang, setThang] = useState(currentDate.getMonth() + 1)
  const [nam, setNam] = useState(currentDate.getFullYear())

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleSubmit = () => {
    onSubmit({ thang, nam })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo chấm công tháng</DialogTitle>
          <DialogDescription>Tạo dữ liệu chấm công mock cho tháng</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="thang">Tháng</FieldLabel>
                <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
                  <SelectTrigger id="thang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        Tháng {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="nam">Năm</FieldLabel>
                <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
                  <SelectTrigger id="nam">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        Năm {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Lưu ý</p>
              <p className="text-amber-700">Dữ liệu chấm công sẽ được tạo tự động dựa trên đơn nghỉ phép đã duyệt.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending ? "Đang tạo..." : "Tạo chấm công"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChamCongEditDialogProps {
  chamCong: ChamCongThang | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, data: {
    so_ngay_co_mat?: number
    so_ngay_vang_co_phep?: number
    so_ngay_vang_khong_phep?: number
    so_ngay_nghi_le_tet?: number
    so_ngay_cong_tac?: number
    ghi_chu?: string
  }) => void
  onXacNhan: (id: string) => void
  onDuyet: (id: string) => void
  onChot: (id: string) => void
  isPending?: boolean
}

const TRANG_THAI_CHAM_CONG_COLORS: Record<string, string> = {
  chua_chot: "bg-amber-100 text-amber-700 border-amber-200",
  da_xac_nhan: "bg-blue-100 text-blue-700 border-blue-200",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  da_chot: "bg-purple-100 text-purple-700 border-purple-200",
}

const TRANG_THAI_CHAM_CONG_LABELS: Record<string, string> = {
  chua_chot: "Chưa chốt",
  da_xac_nhan: "Đã xác nhận",
  da_duyet: "Đã duyệt",
  da_chot: "Đã chốt",
}

export function ChamCongEditDialog({
  chamCong,
  open,
  onOpenChange,
  onUpdate,
  onXacNhan,
  onDuyet,
  onChot,
  isPending = false,
}: ChamCongEditDialogProps) {
  const [form, setForm] = useState({
    so_ngay_co_mat: 0,
    so_ngay_vang_co_phep: 0,
    so_ngay_vang_khong_phep: 0,
    so_ngay_nghi_le_tet: 0,
    so_ngay_cong_tac: 0,
    ghi_chu: "",
  })

  useEffect(() => {
    if (chamCong) {
      setForm({
        so_ngay_co_mat: chamCong.so_ngay_co_mat,
        so_ngay_vang_co_phep: chamCong.so_ngay_vang_co_phep,
        so_ngay_vang_khong_phep: chamCong.so_ngay_vang_khong_phep,
        so_ngay_nghi_le_tet: chamCong.so_ngay_nghi_le_tet,
        so_ngay_cong_tac: chamCong.so_ngay_cong_tac,
        ghi_chu: chamCong.ghi_chu || "",
      })
    }
  }, [chamCong])

  if (!chamCong) return null

  const handleSave = () => {
    onUpdate(chamCong.id, form)
    onOpenChange(false)
  }

  const canEdit = chamCong.trang_thai === "chua_chot" || chamCong.trang_thai === "da_xac_nhan"
  const canXacNhan = chamCong.trang_thai === "chua_chot"
  const canDuyet = chamCong.trang_thai === "da_xac_nhan"
  const canChot = chamCong.trang_thai === "da_duyet"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chấm công</DialogTitle>
          <DialogDescription>
            {chamCong.nhan_vien_ho_ten || chamCong.nhan_vien_id} - Tháng {chamCong.thang}/{chamCong.nam}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={TRANG_THAI_CHAM_CONG_COLORS[chamCong.trang_thai]}>
              {TRANG_THAI_CHAM_CONG_LABELS[chamCong.trang_thai] || chamCong.trang_thai}
            </Badge>
            <span className="text-sm text-slate-500">
              Hệ số: <span className="font-semibold text-indigo-600">{chamCong.he_so_ngay_cong.toFixed(2)}</span>
            </span>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Có mặt</FieldLabel>
              <Input
                type="number"
                min={0}
                max={31}
                value={form.so_ngay_co_mat}
                onChange={(e) => setForm({ ...form, so_ngay_co_mat: parseInt(e.target.value) || 0 })}
                disabled={!canEdit}
              />
            </Field>
            <Field>
              <FieldLabel>Vắng có phép</FieldLabel>
              <Input
                type="number"
                min={0}
                max={31}
                value={form.so_ngay_vang_co_phep}
                onChange={(e) => setForm({ ...form, so_ngay_vang_co_phep: parseInt(e.target.value) || 0 })}
                disabled={!canEdit}
              />
            </Field>
            <Field>
              <FieldLabel>Vắng không phép</FieldLabel>
              <Input
                type="number"
                min={0}
                max={31}
                value={form.so_ngay_vang_khong_phep}
                onChange={(e) => setForm({ ...form, so_ngay_vang_khong_phep: parseInt(e.target.value) || 0 })}
                disabled={!canEdit}
              />
            </Field>
            <Field>
              <FieldLabel>Nghỉ lễ tết</FieldLabel>
              <Input
                type="number"
                min={0}
                max={31}
                value={form.so_ngay_nghi_le_tet}
                onChange={(e) => setForm({ ...form, so_ngay_nghi_le_tet: parseInt(e.target.value) || 0 })}
                disabled={!canEdit}
              />
            </Field>
            <Field>
              <FieldLabel>Công tác</FieldLabel>
              <Input
                type="number"
                min={0}
                max={31}
                value={form.so_ngay_cong_tac}
                onChange={(e) => setForm({ ...form, so_ngay_cong_tac: parseInt(e.target.value) || 0 })}
                disabled={!canEdit}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Ghi chú</FieldLabel>
            <Textarea
              value={form.ghi_chu}
              onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
              placeholder="Ghi chú chấm công..."
              rows={2}
              disabled={!canEdit}
            />
          </Field>

          {(canXacNhan || canDuyet || canChot) && (
            <div className="flex flex-col gap-2 pt-2">
              {canXacNhan && (
                <Button onClick={() => { onXacNhan(chamCong.id); onOpenChange(false); }} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Check className="size-4 mr-2" /> Xác nhận chấm công
                </Button>
              )}
              {canDuyet && (
                <Button onClick={() => { onDuyet(chamCong.id); onOpenChange(false); }} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Check className="size-4 mr-2" /> Duyệt chấm công
                </Button>
              )}
              {canChot && (
                <Button onClick={() => { onChot(chamCong.id); onOpenChange(false); }} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Check className="size-4 mr-2" /> Chốt chấm công
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
