"use client"

import { useMemo, useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatCard } from "@/components/ui/stat-card"
import { cn } from "@/lib/utils"
import {
  createDonNghiColumns,
  NghiPhepToolbar,
  DonNghiDetailDialog,
  CreateDonNghiDialog,
} from "@/components/forms/nghi-phep"
import {
  useDonXinNghiList,
  useCreateDonXinNghi,
  useDuyetDonXinNghi,
  useTuChoiDon,
} from "@/hooks/nghi-phep"
import type { DonXinNghi, LoaiNghi, TrangThaiDon } from "@/types/nghi-phep.types"
import { toastSuccess, toastError } from "@/lib/utils"
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react"

type NghiPhepTab = "all" | "cho_duyet" | "da_duyet" | "tu_choi"

const TAB_CONFIG: { value: NghiPhepTab; label: string; icon: any; color: string }[] = [
  { value: "all", label: "Tất cả", icon: FileText, color: "slate" },
  { value: "cho_duyet", label: "Chờ duyệt", icon: Clock, color: "amber" },
  { value: "da_duyet", label: "Đã duyệt", icon: CheckCircle2, color: "emerald" },
  { value: "tu_choi", label: "Từ chối", icon: XCircle, color: "red" },
]

export default function NghiPhepPage() {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<"don-nghi" | "cham-cong">("don-nghi")
  const [search, setSearch] = useState("")
  const [loaiNghi, setLoaiNghi] = useState<LoaiNghi | "all">("all")
  const [trangThai, setTrangThai] = useState<TrangThaiDon | "all">("all")
  const [nghiPhepTab, setNghiPhepTab] = useState<NghiPhepTab>("all")
  const [selectedDon, setSelectedDon] = useState<DonXinNghi | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener("sidebar:nghi-phep:create", handler)
    return () => window.removeEventListener("sidebar:nghi-phep:create", handler)
  }, [])

  const { data: donListData, isLoading, refetch } = useDonXinNghiList({
    page: 1,
    page_size: 100,
    loai_nghi: loaiNghi !== "all" ? loaiNghi : undefined,
    trang_thai: trangThai !== "all" ? trangThai : undefined,
  })

  const createMutation = useCreateDonXinNghi()
  const duyetMutation = useDuyetDonXinNghi()
  const tuChoiMutation = useTuChoiDon()

  const donItems = donListData?.data || []

  const filteredItems = useMemo(() => {
    let items = donItems

    if (search) {
      items = items.filter(
        (d) =>
          d.nhan_vien_ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
          d.nhan_vien_id?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (nghiPhepTab !== "all") {
      items = items.filter((d) => d.trang_thai === nghiPhepTab)
    }

    return items
  }, [donItems, search, nghiPhepTab])

  const stats = useMemo(() => {
    return {
      total: donItems.length,
      choDuyet: donItems.filter((d) => d.trang_thai === "cho_duyet").length,
      daDuyet: donItems.filter((d) => d.trang_thai === "da_duyet").length,
      tuChoi: donItems.filter((d) => d.trang_thai === "tu_choi").length,
    }
  }, [donItems])

  const getTrangThaiLabel = (status: string) => {
    switch (status) {
      case "cho_duyet":
        return { text: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200" }
      case "da_duyet":
        return { text: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
      case "tu_choi":
        return { text: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" }
      default:
        return { text: status, color: "bg-muted text-muted-foreground" }
    }
  }

  const columns = useMemo(
    () =>
      createDonNghiColumns({
        onViewDetail: (don) => {
          setSelectedDon(don)
          setDetailOpen(true)
        },
        onDuyet: (don) => {
          duyetMutation.mutate(
            don.id,
            {
              onSuccess: () => {
                toastSuccess("Thành công", "Đã duyệt đơn")
                refetch()
              },
              onError: (err: any) => {
                toastError("Lỗi", err.message || "Duyệt thất bại")
              },
            }
          )
        },
        onTuChoi: (don) => {
          setSelectedDon(don)
          setDetailOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [duyetMutation]
  )

  const handleCreate = (data: {
    nhan_vien_id: string
    loai_nghi: LoaiNghi
    tu_ngay: string
    den_ngay: string
    ly_do?: string
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toastSuccess("Thành công", "Đã tạo đơn nghỉ phép")
        setCreateOpen(false)
        refetch()
      },
    })
  }

  const handleDuyet = () => {
    if (!selectedDon) return
    duyetMutation.mutate(
      selectedDon.id,
      {
        onSuccess: () => {
          toastSuccess("Thành công", "Đã duyệt đơn")
          setDetailOpen(false)
          setSelectedDon(null)
          refetch()
        },
      }
    )
  }

  const handleTuChoi = (lyDo: string) => {
    if (!selectedDon) return
    tuChoiMutation.mutate(
      { id: selectedDon.id, ghi_chu: lyDo },
      {
        onSuccess: () => {
          toastSuccess("Thành công", "Đã từ chối đơn")
          setDetailOpen(false)
          setSelectedDon(null)
          refetch()
        },
      }
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Tổng đơn" value={stats.total} accent="neutral" />
        <StatCard icon={Clock} label="Chờ duyệt" value={stats.choDuyet} accent="warning" />
        <StatCard icon={CheckCircle2} label="Đã duyệt" value={stats.daDuyet} accent="success" />
        <StatCard icon={XCircle} label="Từ chối" value={stats.tuChoi} accent="danger" />
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon
          const isActive = nghiPhepTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setNghiPhepTab(tab.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && `text-${tab.color}-600`)} />
              {tab.label}
              {tab.value !== "all" && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                    isActive ? `bg-${tab.color}-100 text-${tab.color}-700` : "bg-accent"
                  )}
                >
                  {tab.value === "cho_duyet"
                    ? stats.choDuyet
                    : tab.value === "da_duyet"
                    ? stats.daDuyet
                    : stats.tuChoi}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <NghiPhepToolbar
        search={search}
        onSearchChange={setSearch}
        loaiNghi={loaiNghi}
        onLoaiNghiChange={setLoaiNghi}
        trangThai={trangThai}
        onTrangThaiChange={setTrangThai}
        onCreate={() => setCreateOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "don-nghi" && (
          <DataTable
            columns={columns}
            data={filteredItems}
            loading={isLoading}
            emptyMessage="Chưa có đơn nghỉ phép nào"
          />
        )}

        {activeTab === "cham-cong" && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Chuyển sang trang <a href="/cham-cong" className="text-primary hover:underline">Chấm công</a> để quản lý chấm công
          </div>
        )}
      </div>

      <DonNghiDetailDialog
        don={selectedDon}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDuyet={handleDuyet}
        onTuChoi={handleTuChoi}
      />

      <CreateDonNghiDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch()}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />
    </AuthenticatedLayout>
  )
}
