"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Plus,
  X,
  Image,
  FileIcon,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useTaiLieuByNhanVien, useUploadTaiLieu } from "@/hooks/upload"
import { LOAI_TAI_LIEU_LABELS, LOAI_TAI_LIEU_OPTIONS } from "@/types/nhan-vien.types"
import type { NhanVien, TaiLieuNhanVien } from "@/types/nhan-vien.types"
import { cn } from "@/lib/utils"

interface NhanVienTaiLieuTabProps {
  nhanVien: NhanVien
  initialTaiLieus?: TaiLieuNhanVien[]
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(dinhDang?: string) {
  if (!dinhDang) return FileIcon
  if (dinhDang.startsWith("image/")) return Image
  return FileIcon
}

function isImage(dinhDang?: string) {
  return dinhDang?.startsWith("image/") || false
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nhanVien: NhanVien
  onSuccess: () => void
}

function UploadTaiLieuDialog({ open, onOpenChange, nhanVien, onSuccess }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loaiTaiLieu, setLoaiTaiLieu] = useState("")
  const [tenTaiLieu, setTenTaiLieu] = useState("")
  const [moTa, setMoTa] = useState("")
  const [ngayHetHan, setNgayHetHan] = useState("")
  const [laBanChinh, setLaBanChinh] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const uploadMutation = useUploadTaiLieu()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setTenTaiLieu(selectedFile.name.replace(/\.[^/.]+$/, ""))
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleSubmit = async () => {
    if (!file || !loaiTaiLieu || !tenTaiLieu) return

    await uploadMutation.mutateAsync({
      file,
      nhan_vien_id: nhanVien.id,
      loai_tai_lieu: loaiTaiLieu,
      ten_tai_lieu: tenTaiLieu,
      ho_ten: nhanVien.ho_ten,
      mo_ta: moTa || undefined,
      ngay_het_han: ngayHetHan || undefined,
      la_ban_chinh: laBanChinh,
    })

    setFile(null)
    setLoaiTaiLieu("")
    setTenTaiLieu("")
    setMoTa("")
    setNgayHetHan("")
    setLaBanChinh(false)
    setPreview(null)
    onOpenChange(false)
    onSuccess()
  }

  const handleClose = () => {
    setFile(null)
    setLoaiTaiLieu("")
    setTenTaiLieu("")
    setMoTa("")
    setNgayHetHan("")
    setLaBanChinh(false)
    setPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload tài liệu</DialogTitle>
          <DialogDescription>
            Tải lên tài liệu cho {nhanVien.ho_ten}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Loại tài liệu <span className="text-red-500">*</span></Label>
            <Select value={loaiTaiLieu} onValueChange={setLoaiTaiLieu}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {LOAI_TAI_LIEU_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tên tài liệu <span className="text-red-500">*</span></Label>
            <Input
              value={tenTaiLieu}
              onChange={(e) => setTenTaiLieu(e.target.value)}
              placeholder="VD: CCCD mặt trước"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Mô tả</Label>
            <Textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả nội dung tài liệu..."
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ngày hết hạn</Label>
            <Input
              type="date"
              value={ngayHetHan}
              onChange={(e) => setNgayHetHan(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="la_ban_chinh"
              checked={laBanChinh}
              onCheckedChange={(checked) => setLaBanChinh(!!checked)}
            />
            <Label htmlFor="la_ban_chinh" className="text-sm font-normal">
              Đây là bản chính
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label>File <span className="text-red-500">*</span></Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                file ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
              )}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <FileIcon className="h-12 w-12 mx-auto text-slate-400" />
                  )}
                  <p className="text-sm font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setPreview(null)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600">
                    Kéo thả file hoặc <span className="text-indigo-600 font-medium">bấm để chọn</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, PDF, DOC, XLS (tối đa 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !loaiTaiLieu || !tenTaiLieu || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Đang upload..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NhanVienTaiLieuTab({ nhanVien }: NhanVienTaiLieuTabProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [filterLoai, setFilterLoai] = useState<string>("all")

  const { data, refetch } = useTaiLieuByNhanVien(
    nhanVien.id,
    filterLoai !== "all" ? filterLoai : undefined
  )

  const taiLieus = data?.data || []

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Tài liệu & Giấy tờ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {taiLieus.length} tài liệu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterLoai} onValueChange={setFilterLoai}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {LOAI_TAI_LIEU_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </div>
        </div>

        {taiLieus.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <FileText className="h-12 w-12 mx-auto text-slate-300" />
            <p className="text-slate-500 mt-3">Chưa có tài liệu nào</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload tài liệu đầu tiên
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Tên tài liệu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Ngày upload</TableHead>
                  <TableHead className="text-center">Bản chính</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taiLieus.map((tl, index) => {
                  const FileIcon = getFileIcon(tl.dinh_dang)
                  const isImg = isImage(tl.dinh_dang)
                  return (
                    <TableRow key={tl.id}>
                      <TableCell className="text-slate-400">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{tl.ten_tai_lieu}</span>
                        </div>
                        {tl.mo_ta && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {tl.mo_ta}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {LOAI_TAI_LIEU_LABELS[tl.loai_tai_lieu] || tl.loai_tai_lieu}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatFileSize(tl.kich_thuoc)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(tl.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        {tl.la_ban_chinh ? (
                          <Badge variant="default" className="bg-emerald-500">
                            Chính
                          </Badge>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isImg && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPreviewUrl(tl.duong_dan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = tl.duong_dan
                              link.download = tl.ten_file_goc || tl.ten_tai_lieu
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <UploadTaiLieuDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        nhanVien={nhanVien}
        onSuccess={() => refetch()}
      />

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Xem trước</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={previewUrl || ""}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
