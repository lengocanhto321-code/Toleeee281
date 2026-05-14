"use client"

import { useMemo, useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatCard } from "@/components/ui/stat-card"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, User, CheckCircle2, Clock, XCircle, CalendarDays, FileText } from "lucide-react"
import { ChamCongEditDialog } from "@/components/forms/nghi-phep"
import { LichChamCongConfig } from "@/components/forms/lich-cham-cong"
import {
  useChamCongThangList,
  useChamCongUpdate,
  useChamCongXacNhan,
  useChamCongDuyet,
  useChamCongChot,
} from "@/hooks/nghi-phep"
import { useNhanVienList } from "@/hooks/nhan-vien"
import type { ChamCongThang } from "@/types/nghi-phep.types"
import { toastSuccess, toastError } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VangMatTab } from "./_components/vang-mat-tab"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const TRANG_THAI_COLORS: Record<string, string> = {
  chua_chot: "bg-amber-100 text-amber-700 border-amber-200",
  da_xac_nhan: "bg-accent/50 text-primary border-primary/20",
  da_duyet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  da_chot: "bg-purple-100 text-purple-700 border-purple-200",
  da_mock: "bg-muted text-muted-foreground border-border",
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
          <p className="text-xs text-muted-foreground">{row.original.nhan_vien_id}</p>
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
      <span className="font-medium text-chart-2">{row.original.so_ngay_co_mat}</span>
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
        <span className="text-primary">{row.original.so_ngay_cong_tac}</span>
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

  const { data: chamCongData, isLoading, refetch } = useChamCongThangList({
    page: 1,
    page_size: 100,
    thang,
    nam,
  })

  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener("sidebar:cham-cong:refresh", handler)
    return () => window.removeEventListener("sidebar:cham-cong:refresh", handler)
  }, [refetch])

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

  return (
    <AuthenticatedLayout>
      <Tabs defaultValue="cham-cong" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cham-cong">Chấm công tháng</TabsTrigger>
          <TabsTrigger value="vang-mat">Vắng mặt</TabsTrigger>
        </TabsList>

        <TabsContent value="cham-cong" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard icon={User} label="Tổng NV" value={stats.total} accent="primary" />
            <StatCard icon={CheckCircle2} label="Có mặt" value={stats.coMat} accent="success" />
            <StatCard icon={Clock} label="Vắng CP" value={stats.vangCp} accent="warning" />
            <StatCard icon={XCircle} label="Vắng KP" value={stats.vangKp} accent="danger" />
            <StatCard icon={CalendarDays} label="Lễ Tết" value={stats.leTet} accent="info" />
            <StatCard icon={FileText} label="Công tác" value={stats.congTac} accent="info" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
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
            </div>
          </div>

          <div className="mt-4">
            <LichChamCongConfig />
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
        </TabsContent>

        <TabsContent value="vang-mat">
          <VangMatTab />
        </TabsContent>
      </Tabs>
    </AuthenticatedLayout>
  )
}
