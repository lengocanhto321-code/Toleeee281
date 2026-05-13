"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
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
  useDuyetCap1,
  useDuyetCap2,
  useTuChoiDon,
} from "@/hooks/nghi-phep"
import { useDuyetDonXinNghi } from "@/hooks/nghi-phep"
import type { DonXinNghi, LoaiNghi, TrangThaiDon } from "@/types/nghi-phep.types"
import { toastSuccess, toastError } from "@/lib/utils"
import { FileText, Clock, CheckCircle2, XCircle, Users } from "lucide-react"

type NghiPhepTab = "all" | "cho_cap_1" | "cho_cap_2" | "da_duyet" | "tu_choi"

const TAB_CONFIG: { value: NghiPhepTab; label: string; icon: any; color: string }[] = [
  { value: "all", label: "Tất cả", icon: FileText, color: "slate" },
  { value: "cho_cap_1", label: "Chờ cấp 1", icon: Clock, color: "amber" },
  { value: "cho_cap_2", label: "Chờ cấp 2", icon: Users, color: "blue" },
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

  const { data: donListData, isLoading, refetch } = useDonXinNghiList({
    page: 1,
    page_size: 100,
    loai_nghi: loaiNghi !== "all" ? loaiNghi : undefined,
    trang_thai: trangThai !== "all" ? trangThai : undefined,
  })

  const createMutation = useCreateDonXinNghi()
  const duyetMutation = useDuyetDonXinNghi()
  const duyetCap1Mutation = useDuyetCap1()
  const duyetCap2Mutation = useDuyetCap2()
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
      items = items.filter((d) => {
        switch (nghiPhepTab) {
          case "cho_cap_1":
            return d.trang_thai === "cho_duyet_cap_1"
          case "cho_cap_2":
            return d.trang_thai === "cho_duyet_cap_2"
          case "da_duyet":
            return d.trang_thai === "da_duyet_cap_2"
          case "tu_choi":
            return d.trang_thai === "tu_choi"
          default:
            return true
        }
      })
    }

    return items
  }, [donItems, search, nghiPhepTab])

  const stats = useMemo(() => {
    return {
      total: donItems.length,
      choCap1: donItems.filter((d) => d.trang_thai === "cho_duyet_cap_1").length,
      choCap2: donItems.filter((d) => d.trang_thai === "cho_duyet_cap_2").length,
      daDuyet: donItems.filter((d) => d.trang_thai === "da_duyet_cap_2").length,
      tuChoi: donItems.filter((d) => d.trang_thai === "tu_choi").length,
    }
  }, [donItems])

  const getTrangThaiLabel = (status: string) => {
    switch (status) {
      case "cho_duyet_cap_1":
        return { text: "Chờ cấp 1", color: "bg-amber-100 text-amber-700 border-amber-200" }
      case "cho_duyet_cap_2":
        return { text: "Chờ cấp 2", color: "bg-blue-100 text-blue-700 border-blue-200" }
      case "da_duyet_cap_2":
        return { text: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
      case "tu_choi":
        return { text: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" }
      default:
        return { text: status, color: "bg-slate-100 text-slate-700" }
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
          const capLabel = getTrangThaiLabel(don.trang_thai)
          
          if (don.trang_thai === "cho_duyet_cap_1") {
            duyetCap1Mutation.mutate(
              { id: don.id },
              {
                onSuccess: () => {
                  toastSuccess("Thành công", "Đã duyệt cấp 1")
                  refetch()
                },
                onError: (err: any) => {
                  toastError("Lỗi", err.message || "Duyệt thất bại")
                },
              }
            )
          } else if (don.trang_thai === "cho_duyet_cap_2") {
            duyetCap2Mutation.mutate(
              { id: don.id },
              {
                onSuccess: () => {
                  toastSuccess("Thành công", "Đã duyệt cấp 2")
                  refetch()
                },
                onError: (err: any) => {
                  toastError("Lỗi", err.message || "Duyệt thất bại")
                },
              }
            )
          }
        },
        onTuChoi: (don) => {
          setSelectedDon(don)
          setDetailOpen(true)
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [duyetCap1Mutation, duyetCap2Mutation]
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

  const handleDuyetCap1 = () => {
    if (!selectedDon) return
    duyetCap1Mutation.mutate(
      { id: selectedDon.id, ghi_chu: "" },
      {
        onSuccess: () => {
          toastSuccess("Thành công", "Đã duyệt cấp 1")
          setDetailOpen(false)
          setSelectedDon(null)
          refetch()
        },
      }
    )
  }

  const handleDuyetCap2 = () => {
    if (!selectedDon) return
    duyetCap2Mutation.mutate(
      { id: selectedDon.id, ghi_chu: "" },
      {
        onSuccess: () => {
          toastSuccess("Thành công", "Đã duyệt cấp 2")
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
      {/* Stats Cards with 2-level approval design */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Tổng đơn</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{stats.choCap1}</p>
            <p className="text-xs text-amber-600">Chờ cấp 1</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats.choCap2}</p>
            <p className="text-xs text-blue-600">Chờ cấp 2</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{stats.daDuyet}</p>
            <p className="text-xs text-emerald-600">Đã duyệt</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{stats.tuChoi}</p>
            <p className="text-xs text-red-600">Từ chối</p>
          </div>
        </div>
      </div>

      {/* Tab Filter for 2-level approval */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-slate-100 rounded-lg w-fit">
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
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && `text-${tab.color}-600`)} />
              {tab.label}
              {tab.value !== "all" && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                    isActive ? `bg-${tab.color}-100 text-${tab.color}-700` : "bg-slate-200"
                  )}
                >
                  {tab.value === "cho_cap_1"
                    ? stats.choCap1
                    : tab.value === "cho_cap_2"
                    ? stats.choCap2
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
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Chuyển sang trang <a href="/cham-cong" className="text-indigo-600 hover:underline">Chấm công</a> để quản lý chấm công
          </div>
        )}
      </div>

      <DonNghiDetailDialog
        don={selectedDon}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDuyetCap1={handleDuyetCap1}
        onDuyetCap2={handleDuyetCap2}
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
