"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Plus, User, CheckCircle2, Clock, XCircle, CalendarDays, FileText } from "lucide-react"
import { ChamCongEditDialog, GenerateChamCongDialog } from "@/components/forms/nghi-phep"
import {
  useChamCongThangList,
  useMockGenerateChamCong,
  useChamCongUpdate,
  useChamCongXacNhan,
  useChamCongDuyet,
  useChamCongChot,
} from "@/hooks/nghi-phep"
import { useNhanVienList } from "@/hooks/nhan-vien"
import type { ChamCongThang } from "@/types/nghi-phep.types"
import { toastSuccess, toastError } from "@/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

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

export const createChamCongColumns = (options: {
  onViewDetail: (chamCong: ChamCongThang) => void
}): ColumnDef<ChamCongThang>[] => [
  {
    accessorKey: "nhan_vien_ho_ten",
    header: "Nhân viên",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-muted">
          <User className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{row.original.nhan_vien_ho_ten || "N/A"}</p>
          <p className="text-xs text-slate-500">{row.original.nhan_vien_id}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "so_ngay_lam_chuan",
    header: "Ngày công chuẩn",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.so_ngay_lam_chuan}</span>
    ),
  },
  {
    accessorKey: "so_ngay_co_mat",
    header: "Có mặt",
    cell: ({ row }) => (
      <span className="font-medium text-emerald-600">{row.original.so_ngay_co_mat}</span>
    ),
  },
  {
    accessorKey: "so_ngay_vang_co_phep",
    header: "Vắng CP",
    cell: ({ row }) => (
      <span className="text-amber-600">{row.original.so_ngay_vang_co_phep}</span>
    ),
  },
  {
    accessorKey: "so_ngay_vang_khong_phep",
    header: "Vắng KP",
    cell: ({ row }) => (
      <span className="text-red-600">{row.original.so_ngay_vang_khong_phep}</span>
    ),
  },
  {
    accessorKey: "so_ngay_nghi_le_tet",
    header: "Lễ Tết",
    cell: ({ row }) => (
      <span className="text-purple-600">{row.original.so_ngay_nghi_le_tet}</span>
    ),
  },
  {
    accessorKey: "so_ngay_cong_tac",
    header: "Công tác",
    cell: ({ row }) => (
      <span className="text-blue-600">{row.original.so_ngay_cong_tac}</span>
    ),
  },
  {
    accessorKey: "he_so_ngay_cong",
    header: "Hệ số",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.he_so_ngay_cong.toFixed(2)}</Badge>
    ),
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant="outline" className={TRANG_THAI_COLORS[row.original.trang_thai]}>
        {TRANG_THAI_LABELS[row.original.trang_thai] || row.original.trang_thai}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs"
        onClick={() => options.onViewDetail(row.original)}
      >
        Chi tiết
      </Button>
    ),
  },
]

export default function ChamCongPage() {
  const queryClient = useQueryClient()
  const currentDate = new Date()

  const [thang, setThang] = useState(currentDate.getMonth() + 1)
  const [nam, setNam] = useState(currentDate.getFullYear())
  const [selectedChamCong, setSelectedChamCong] = useState<ChamCongThang | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  const { data: chamCongData, isLoading, refetch } = useChamCongThangList({
    page: 1,
    page_size: 100,
    thang,
    nam,
  })

  const generateMutation = useMockGenerateChamCong()
  const updateMutation = useChamCongUpdate()
  const xacNhanMutation = useChamCongXacNhan()
  const duyetMutation = useChamCongDuyet()
  const chotMutation = useChamCongChot()

  const handleUpdate = (id: string, data: any) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        refetch()
      },
    })
  }

  const handleXacNhan = (id: string) => {
    xacNhanMutation.mutate(id, {
      onSuccess: () => refetch(),
    })
  }

  const handleDuyet = (id: string) => {
    duyetMutation.mutate(id, {
      onSuccess: () => refetch(),
    })
  }

  const handleChot = (id: string) => {
    chotMutation.mutate(id, {
      onSuccess: () => refetch(),
    })
  }

  const chamCongItems = chamCongData?.data || []

  const columns = useMemo(
    () =>
      createChamCongColumns({
        onViewDetail: (chamCong) => {
          setSelectedChamCong(chamCong)
          setEditOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const stats = useMemo(() => {
    const total = chamCongItems.length
    const coMat = chamCongItems.reduce((sum, cc) => sum + cc.so_ngay_co_mat, 0)
    const vangCp = chamCongItems.reduce((sum, cc) => sum + cc.so_ngay_vang_co_phep, 0)
    const vangKp = chamCongItems.reduce((sum, cc) => sum + cc.so_ngay_vang_khong_phep, 0)
    const leTet = chamCongItems.reduce((sum, cc) => sum + cc.so_ngay_nghi_le_tet, 0)
    const congTac = chamCongItems.reduce((sum, cc) => sum + cc.so_ngay_cong_tac, 0)
    return { total, coMat, vangCp, vangKp, leTet, congTac }
  }, [chamCongItems])

  const handleGenerate = (data: { thang: number; nam: number }) => {
    generateMutation.mutate(data, {
      onSuccess: (result) => {
        toastSuccess("Thành công", `Đã tạo chấm công cho ${result.count} nhân viên`)
        setGenerateOpen(false)
        refetch()
      },
      onError: (error) => {
        toastError("Lỗi", (error as { message?: string })?.message || "Tạo chấm công thất bại")
      },
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Tổng NV</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{stats.coMat}</p>
            <p className="text-xs text-emerald-600">Có mặt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{stats.vangCp}</p>
            <p className="text-xs text-amber-600">Vắng CP</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{stats.vangKp}</p>
            <p className="text-xs text-red-600">Vắng KP</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">{stats.leTet}</p>
            <p className="text-xs text-purple-600">Lễ Tết</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats.congTac}</p>
            <p className="text-xs text-blue-600">Công tác</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <Select value={thang.toString()} onValueChange={(v) => setThang(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={nam.toString()} onValueChange={(v) => setNam(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button size="sm" onClick={() => setGenerateOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Tạo chấm công
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={chamCongItems}
          loading={isLoading}
          emptyMessage="Chưa có dữ liệu chấm công"
        />
      </div>

      <ChamCongEditDialog
        chamCong={selectedChamCong}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={handleUpdate}
        onXacNhan={handleXacNhan}
        onDuyet={handleDuyet}
        onChot={handleChot}
        isPending={updateMutation.isPending}
      />

      <GenerateChamCongDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onSubmit={handleGenerate}
        isPending={generateMutation.isPending}
      />
    </AuthenticatedLayout>
  )
}
