"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  CalendarIcon,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { LoaiNghi } from "@/types/nghi-phep.types"
import { toastError } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useUploadTaiLieu } from "@/hooks/upload/use-upload-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const loaiNghiValues = ["phep_nam", "nghi_om", "viec_rieng", "cong_tac", "ket_hon", "mai_tang", "thai_san"] as const

const donNghiSchema = z.object({
  loai_nghi: z.enum(loaiNghiValues, { message: "Vui lòng chọn loại nghỉ phép" }),
  tu_ngay: z.date({ message: "Vui lòng chọn ngày bắt đầu" }),
  den_ngay: z.date({ message: "Vui lòng chọn ngày kết thúc" }),
  ly_do: z.string().max(500, "Lý do không quá 500 ký tự"),
}).refine((data) => data.den_ngay >= data.tu_ngay, {
  message: "Ngày kết thúc phải từ ngày bắt đầu trở đi",
  path: ["den_ngay"],
})

type DonNghiFormValues = z.infer<typeof donNghiSchema>

const LOAI_NGHI_OPTIONS: { value: LoaiNghi; label: string; canGiayTo: boolean }[] = [
  { value: "phep_nam", label: "Phép năm", canGiayTo: false },
  { value: "nghi_om", label: "Nghỉ ốm", canGiayTo: true },
  { value: "viec_rieng", label: "Việc riêng", canGiayTo: false },
  { value: "cong_tac", label: "Công tác", canGiayTo: true },
  { value: "ket_hon", label: "Kết hôn", canGiayTo: false },
  { value: "mai_tang", label: "Ma táng", canGiayTo: false },
  { value: "thai_san", label: "Thai sản", canGiayTo: true },
]

const GIAY_TO_LABELS: Record<string, string> = {
  nghi_om: "Giấy xác nhận nghỉ ốm",
  cong_tac: "Quyết định cử đi công tác",
  thai_san: "Giấy tờ thai sản",
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.gif,.webp,.pdf"
const MAX_FILE_SIZE = 10 * 1024 * 1024

interface UploadedFile {
  file: File
  url: string
  name: string
  status: "uploading" | "done" | "error"
}

interface CreateEmployeeDonNghiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
    files?: string[]
  }) => void
  isPending?: boolean
  nhanVienId: string
  hoTen: string
}

export function CreateEmployeeDonNghiDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  nhanVienId,
  hoTen,
}: CreateEmployeeDonNghiDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [tuNgayOpen, setTuNgayOpen] = useState(false)
  const [denNgayOpen, setDenNgayOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadTaiLieu()

  const { register, handleSubmit: rhfSubmit, reset, setValue, watch, formState: { errors } } = useForm<DonNghiFormValues>({
    resolver: zodResolver(donNghiSchema),
    mode: "onChange",
    defaultValues: {
      loai_nghi: "phep_nam" as LoaiNghi,
      tu_ngay: undefined as unknown as Date,
      den_ngay: undefined as unknown as Date,
      ly_do: "",
    },
  })

  const loaiNghi = watch("loai_nghi")
  const tuNgay = watch("tu_ngay")
  const denNgay = watch("den_ngay")

  useEffect(() => {
    if (open) {
      reset({
        loai_nghi: "phep_nam" as LoaiNghi,
        tu_ngay: undefined as unknown as Date,
        den_ngay: undefined as unknown as Date,
        ly_do: "",
      })
      setUploadedFiles([])
    }
  }, [open, reset])

  const selectedOption = LOAI_NGHI_OPTIONS.find((o) => o.value === loaiNghi)
  const needsDocument = selectedOption?.canGiayTo ?? false

  const soNgay = useMemo(() => {
    if (tuNgay && denNgay) {
      return differenceInDays(denNgay, tuNgay) + 1
    }
    return 0
  }, [tuNgay, denNgay])

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toastError("Lỗi", "Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF")
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toastError("Lỗi", "File không được vượt quá 10MB")
        return
      }

      const tempId = `${file.name}-${Date.now()}`
      const newFile: UploadedFile = {
        file,
        url: "",
        name: file.name,
        status: "uploading",
      }
      setUploadedFiles((prev) => [...prev, newFile])

      try {
        const result = await uploadMutation.mutateAsync({
          file,
          nhan_vien_id: nhanVienId,
          loai_tai_lieu: `nghi_phep_${loaiNghi}`,
          ten_tai_lieu: `Giấy tờ nghỉ phép - ${file.name}`,
          ho_ten: hoTen,
        })
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f === newFile
              ? { ...f, url: result.url, status: "done" as const }
              : f
          )
        )
      } catch {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f === newFile ? { ...f, status: "error" as const } : f
          )
        )
        toastError("Lỗi", `Không thể tải lên file ${file.name}`)
      }
    },
    [nhanVienId, hoTen, loaiNghi, uploadMutation]
  )

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(handleUploadFile)
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  const onFormSubmit = () => {
    if (needsDocument && uploadedFiles.filter((f) => f.status === "done").length === 0) {
      toastError(
        "Thiếu giấy tờ",
        `Loại nghỉ "${selectedOption?.label}" yêu cầu đính kèm ${GIAY_TO_LABELS[loaiNghi] || "giấy tờ"}`
      )
      return
    }

    const fileUrls = uploadedFiles
      .filter((f) => f.status === "done")
      .map((f) => f.url)

    onSubmit({
      loai_nghi: loaiNghi,
      tu_ngay: tuNgay ? format(tuNgay, "yyyy-MM-dd") : "",
      den_ngay: denNgay ? format(denNgay, "yyyy-MM-dd") : "",
      ly_do: watch("ly_do") || undefined,
      files: fileUrls.length > 0 ? fileUrls : undefined,
    })
    reset({
      loai_nghi: "phep_nam" as LoaiNghi,
      tu_ngay: undefined as unknown as Date,
      den_ngay: undefined as unknown as Date,
      ly_do: "",
    })
    setUploadedFiles([])
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset({
        loai_nghi: "phep_nam" as LoaiNghi,
        tu_ngay: undefined as unknown as Date,
        den_ngay: undefined as unknown as Date,
        ly_do: "",
      })
      setUploadedFiles([])
    }
    onOpenChange(open)
  }

  const isUploading = uploadedFiles.some((f) => f.status === "uploading")
  const canSubmit =
    loaiNghi &&
    tuNgay &&
    denNgay &&
    !isPending &&
    !isUploading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
          <DialogDescription>Điền thông tin và đính kèm giấy tờ (nếu cần)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Loại nghỉ phép</FieldLabel>
              <Select
                value={loaiNghi}
                onValueChange={(v) => {
                  setValue("loai_nghi", v as LoaiNghi, { shouldValidate: true })
                  setUploadedFiles([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  {LOAI_NGHI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span>{opt.label}</span>
                        {opt.canGiayTo && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Cần giấy tờ
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Từ ngày</FieldLabel>
                <Popover open={tuNgayOpen} onOpenChange={setTuNgayOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tuNgay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tuNgay ? format(tuNgay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tuNgay}
                      onSelect={(d) => {
                        if (d && denNgay && d > denNgay) {
                          setValue("den_ngay", d as Date, { shouldValidate: true })
                        }
                        setValue("tu_ngay", d as Date, { shouldValidate: true })
                        setTuNgayOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.tu_ngay && (
                  <p className="text-xs text-destructive mt-1">{errors.tu_ngay.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel>Đến ngày</FieldLabel>
                <Popover open={denNgayOpen} onOpenChange={setDenNgayOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !denNgay && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {denNgay ? format(denNgay, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={denNgay}
                      onSelect={(d) => {
                        setValue("den_ngay", d as Date, { shouldValidate: true })
                        setDenNgayOpen(false)
                      }}
                      disabled={(date) => !tuNgay || date < tuNgay}
                      fromDate={tuNgay}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.den_ngay && (
                  <p className="text-xs text-destructive mt-1">{errors.den_ngay.message}</p>
                )}
              </Field>
            </div>

            {soNgay > 0 && (
              <div className="flex items-center justify-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-sm text-blue-700">
                  Số ngày nghỉ: <strong className="text-lg">{soNgay}</strong> ngày
                </span>
              </div>
            )}

            {needsDocument && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-sm text-amber-700">
                    Yêu cầu đính kèm: <strong>{GIAY_TO_LABELS[loaiNghi]}</strong>
                  </span>
                </div>

                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-300 hover:border-blue-300 hover:bg-slate-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    Kéo thả file hoặc <span className="text-blue-600 font-medium">nhấn để chọn</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    JPG, PNG, PDF — tối đa 10MB
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((uf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        {uf.file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          {uf.name}
                        </span>
                        {uf.status === "uploading" && (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
                        )}
                        {uf.status === "done" && (
                          <span className="text-xs text-emerald-600 shrink-0">Đã tải lên</span>
                        )}
                        {uf.status === "error" && (
                          <span className="text-xs text-red-500 shrink-0">Lỗi</span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(idx)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Field>
              <FieldLabel>Lý do (tùy chọn)</FieldLabel>
              <Textarea
                {...register("ly_do")}
                placeholder="Nhập lý do nghỉ phép..."
                rows={3}
              />
              {errors.ly_do && (
                <p className="text-xs text-destructive mt-1">{errors.ly_do.message}</p>
              )}
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={rhfSubmit(onFormSubmit)}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Đang gửi..." : "Gửi đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
