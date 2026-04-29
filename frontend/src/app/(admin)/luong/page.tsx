"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import {
  createKyLuongColumns,
  createTraLuongColumns,
  LuongToolbar,
  ChayLuongDialog,
  TraLuongDetailDialog,
  CauHinhLuongDialog,
} from "@/components/forms/luong"
import {
  useKyLuongList,
  useTraLuongByKyLuong,
  useCauHinhLuongList,
  useChayLuong,
  useDuyetKyLuong,
  useChotKyLuong,
  useCreateCauHinhLuong,
} from "@/hooks/luong"
import type { TraLuong, KyLuong, CauHinhLuong } from "@/types/luong.types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function LuongPage() {
  const queryClient = useQueryClient()
  const currentDate = new Date()
  
  // Filters
  const [activeTab, setActiveTab] = useState<"ky-luong" | "tra-luong" | "cau-hinh">("ky-luong")
  const [search, setSearch] = useState("")
  const [thang, setThang] = useState(currentDate.getMonth() + 1)
  const [nam, setNam] = useState(currentDate.getFullYear())

  // Dialog states
  const [chayLuongOpen, setChayLuongOpen] = useState(false)
  const [cauHinhOpen, setCauHinhOpen] = useState(false)
  const [selectedKyLuong, setSelectedKyLuong] = useState<KyLuong | null>(null)
  const [detailTraLuong, setDetailTraLuong] = useState<TraLuong | null>(null)

  // Data queries
  const { data: kyLuongData, isLoading: isKyLuongLoading } = useKyLuongList({
    thang,
    nam,
  })
  const { data: traLuongData, isLoading: isTraLuongLoading } = useTraLuongByKyLuong(
    selectedKyLuong?.id || "",
    { page: 1, page_size: 100 }
  )
  const { data: cauHinhData, isLoading: isCauHinhLoading } = useCauHinhLuongList()

  // Mutations
  const chayLuongMutation = useChayLuong()
  const duyetKyLuongMutation = useDuyetKyLuong()
  const chotKyLuongMutation = useChotKyLuong()
  const createCauHinhMutation = useCreateCauHinhLuong()

  // Listen for sidebar "add" event
  useEffect(() => {
    const handler = () => setCauHinhOpen(true)
    window.addEventListener("sidebar:luong:add", handler)
    return () => window.removeEventListener("sidebar:luong:add", handler)
  }, [])

  // Handlers
  const handleChayLuong = () => {
    chayLuongMutation.mutate(
      { thang, nam },
      {
        onSuccess: () => {
          setChayLuongOpen(false)
          queryClient.invalidateQueries({ queryKey: ["luong", "ky-luong"] })
        },
      }
    )
  }

  const handleDuyet = (kyLuong: { id: string }) => {
    duyetKyLuongMutation.mutate(kyLuong.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["luong", "ky-luong"] })
      },
    })
  }

  const handleChot = (kyLuong: { id: string }) => {
    chotKyLuongMutation.mutate(kyLuong.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["luong", "ky-luong"] })
      },
    })
  }

  const handleViewKyLuong = (kyLuong: { id: string }) => {
    const fullKyLuong = kyLuongs.find((k) => k.id === kyLuong.id)
    if (fullKyLuong) {
      setSelectedKyLuong(fullKyLuong)
      setActiveTab("tra-luong")
    }
  }

  const handleCreateCauHinh = (data: {
    ten_cau_hinh: string
    ngay_ap_dung: string
    luong_co_so: number
    he_so_dac_thu: number
    ty_le_bhxh: number
    ty_le_bhyt: number
    ty_le_bhtn: number
    muc_giam_tru_ban_than: number
    muc_giam_tru_nguoi_phu_thuoc: number
  }) => {
    createCauHinhMutation.mutate(data, {
      onSuccess: () => {
        setCauHinhOpen(false)
        queryClient.invalidateQueries({ queryKey: ["luong", "cau-hinh"] })
      },
    })
  }

  // Column definitions
  const kyLuongColumns = useMemo(
    () =>
      createKyLuongColumns({
        onDuyet: handleDuyet,
        onChot: handleChot,
        onViewDetail: handleViewKyLuong,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const traLuongColumns = useMemo(
    () =>
      createTraLuongColumns({
        onViewDetail: (traLuong) => setDetailTraLuong(traLuong),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Stats
  const kyLuongs = kyLuongData?.data || []
  const traLuongs = traLuongData?.data || []
  const cauHinhs = cauHinhData?.data || []

  const tongNhanVien = kyLuongs.reduce((sum, k) => sum + (k.tong_nhan_vien || 0), 0)
  const tongThuNhap = kyLuongs.reduce((sum, k) => sum + (k.tong_thu_nhap || 0), 0)
  const tongThucNhan = kyLuongs.reduce((sum, k) => sum + (k.tong_thuc_nhan || 0), 0)

  // Filtered data
  const filteredKyLuong = useMemo(() => {
    if (!search) return kyLuongs
    return kyLuongs.filter(
      (k) =>
        k.thang.toString().includes(search) ||
        k.nam.toString().includes(search)
    )
  }, [kyLuongs, search])

  const filteredTraLuong = useMemo(() => {
    if (!search) return traLuongs
    return traLuongs.filter(
      (t) =>
        t.nhan_vien_ho_ten?.toLowerCase().includes(search.toLowerCase())
    )
  }, [traLuongs, search])

  return (
    <AuthenticatedLayout>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <span className="text-lg font-bold text-indigo-600">{kyLuongs.length}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{kyLuongs.length}</p>
            <p className="text-xs text-slate-500">Kỳ lương</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <span className="text-lg font-bold text-emerald-600">{tongNhanVien}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{tongNhanVien}</p>
            <p className="text-xs text-slate-500">Nhân viên</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-lg font-bold text-blue-600">₫</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(tongThuNhap)}</p>
            <p className="text-xs text-slate-500">Tổng thu nhập</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <span className="text-lg font-bold text-indigo-600">₫</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(tongThucNhan)}</p>
            <p className="text-xs text-indigo-600">Tổng thực nhận</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <LuongToolbar
        search={search}
        onSearchChange={setSearch}
        thang={thang}
        onThangChange={setThang}
        nam={nam}
        onNamChange={setNam}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChayLuong={() => setChayLuongOpen(true)}
        onCauHinh={() => setCauHinhOpen(true)}
        isChayLuongPending={chayLuongMutation.isPending}
      />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "ky-luong" && (
          <DataTable
            columns={kyLuongColumns}
            data={filteredKyLuong}
            loading={isKyLuongLoading}
            emptyMessage="Chưa có kỳ lương nào"
          />
        )}

        {activeTab === "tra-luong" && (
          <>
            {selectedKyLuong ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-600">
                    Phiếu lương - Kỳ: Tháng {selectedKyLuong.thang}/{selectedKyLuong.nam}
                  </h3>
                  <Badge variant="outline">
                    {traLuongs.length} phiếu
                  </Badge>
                </div>
                <DataTable
                  columns={traLuongColumns}
                  data={filteredTraLuong}
                  loading={isTraLuongLoading}
                  emptyMessage="Chưa có phiếu lương nào"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-slate-500">
                Chọn một kỳ lương để xem phiếu lương
              </div>
            )}
          </>
        )}

        {activeTab === "cau-hinh" && (
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-medium text-slate-900">Danh sách cấu hình lương</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {isCauHinhLoading ? (
                <div className="p-8 text-center text-slate-400">Đang tải...</div>
              ) : cauHinhs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Chưa có cấu hình nào</div>
              ) : (
                cauHinhs.map((cauHinh: CauHinhLuong) => (
                  <div key={cauHinh.id} className="p-4 hover:bg-slate-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{cauHinh.ten_cau_hinh}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Áp dụng từ: {format(new Date(cauHinh.ngay_ap_dung), "dd/MM/yyyy")}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <span>Lương cơ sở: <strong className="text-slate-900">{formatCurrency(cauHinh.luong_co_so)}</strong></span>
                          <span>Hệ số đặc thù: <strong className="text-slate-900">{cauHinh.he_so_dac_thu}</strong></span>
                        </div>
                      </div>
                      <Badge 
                        variant={cauHinh.trang_thai === "dang_ap_dung" ? "default" : "secondary"}
                      >
                        {cauHinh.trang_thai === "dang_ap_dung" ? "Đang áp dụng" : 
                         cauHinh.trang_thai === "sap_hieu_luc" ? "Sắp hiệu lực" : "Hết hiệu lực"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ChayLuongDialog
        open={chayLuongOpen}
        onOpenChange={setChayLuongOpen}
        isPending={chayLuongMutation.isPending}
        onSubmit={(data) => {
          setThang(data.thang)
          setNam(data.nam)
          handleChayLuong()
        }}
      />

      <TraLuongDetailDialog
        open={!!detailTraLuong}
        onOpenChange={(open) => !open && setDetailTraLuong(null)}
        traLuong={detailTraLuong}
      />

      <CauHinhLuongDialog
        open={cauHinhOpen}
        onOpenChange={setCauHinhOpen}
        isPending={createCauHinhMutation.isPending}
        onSubmit={handleCreateCauHinh}
      />
    </AuthenticatedLayout>
  )
}
