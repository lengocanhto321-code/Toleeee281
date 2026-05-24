"use client"

import { useMemo, useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatCard } from "@/components/ui/stat-card"
import { Wallet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  createKyLuongColumns,
  createTraLuongColumns,
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
  useActivateCauHinhLuong,
} from "@/hooks/luong"
import type { TraLuong, KyLuong, CauHinhLuong } from "@/types/luong.types"
import { Badge } from "@/components/ui/badge"
import { formatDateVN } from "@/lib/date-utils"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function LuongPage() {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<"ky-luong" | "tra-luong" | "cau-hinh">("ky-luong")
  const [chayLuongOpen, setChayLuongOpen] = useState(false)
  const [cauHinhOpen, setCauHinhOpen] = useState(false)
  const [selectedKyLuong, setSelectedKyLuong] = useState<KyLuong | null>(null)
  const [detailTraLuong, setDetailTraLuong] = useState<TraLuong | null>(null)

  const { data: kyLuongData, isLoading: isKyLuongLoading } = useKyLuongList({ page_size: 100 })
  const { data: traLuongData, isLoading: isTraLuongLoading } = useTraLuongByKyLuong(
    selectedKyLuong?.id || "",
    { page: 1, page_size: 100 }
  )
  const { data: cauHinhData, isLoading: isCauHinhLoading } = useCauHinhLuongList()

  const chayLuongMutation = useChayLuong()
  const duyetKyLuongMutation = useDuyetKyLuong()
  const chotKyLuongMutation = useChotKyLuong()
  const createCauHinhMutation = useCreateCauHinhLuong()
  const activateCauHinhMutation = useActivateCauHinhLuong()

  useEffect(() => {
    const handlers: Record<string, () => void> = {
      "sidebar:luong:add": () => setCauHinhOpen(true),
      "sidebar:luong:chay": () => setChayLuongOpen(true),
      "sidebar:luong:cau-hinh": () => setCauHinhOpen(true),
      "sidebar:luong:xem-ky": () => setActiveTab("ky-luong"),
    }
    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler)
    })
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [])

  const handleChayLuong = (data: { thang: number; nam: number }) => {
    chayLuongMutation.mutate(data, {
      onSuccess: () => {
        setChayLuongOpen(false)
        queryClient.invalidateQueries({ queryKey: ["luong", "ky-luong"] })
      },
    })
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

  const handleViewKyLuong = (kyLuong: { id: string; thang?: number; nam?: number }) => {
    const fullKyLuong = kyLuongs.find((k: any) => k.id === kyLuong.id)
    if (fullKyLuong) {
      setSelectedKyLuong(fullKyLuong)
      setActiveTab("tra-luong")
    } else {
      setSelectedKyLuong(kyLuong as any)
      setActiveTab("tra-luong")
    }
  }

  const handleCreateCauHinh = (data: {
    ngay_ap_dung: string
    luong_co_so: number
    he_so_dac_thu: number
    ty_le_bhxh: number
    ty_le_bhyt: number
    ty_le_bhtn: number
    muc_giam_tru_ban_than: number
    muc_giam_tru_nguoi_phu_thuoc: number
    ghi_chu?: string
  }) => {
    createCauHinhMutation.mutate(data, {
      onSuccess: () => {
        setCauHinhOpen(false)
        queryClient.invalidateQueries({ queryKey: ["luong", "cau-hinh"] })
      },
    })
  }

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

  const kyLuongs = kyLuongData || []
  const traLuongs = traLuongData || []
  const cauHinhs = cauHinhData || []

  const tongNhanVien = kyLuongs.reduce((sum, k) => sum + (k.tong_nhan_vien || 0), 0)
  const tongThuNhap = kyLuongs.reduce((sum, k) => sum + (k.tong_thu_nhap || 0), 0)
  const tongThucNhan = kyLuongs.reduce((sum, k) => sum + (k.tong_thuc_nhan || 0), 0)

  return (
    <AuthenticatedLayout>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Kỳ lương" value={kyLuongs.length} accent="primary" />
        <StatCard icon={Wallet} label="Nhân viên" value={tongNhanVien} accent="info" />
        <StatCard icon={Wallet} label="Tổng thu nhập" value={formatCurrency(tongThuNhap)} accent="success" />
        <StatCard icon={Wallet} label="Tổng thực nhận" value={formatCurrency(tongThucNhan)} accent="primary" />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("ky-luong")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "ky-luong"
              ? "bg-accent/50 text-primary border border-primary/20 border-b-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Kỳ lương
        </button>
        <button
          onClick={() => setActiveTab("tra-luong")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "tra-luong"
              ? "bg-accent/50 text-primary border border-primary/20 border-b-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Phiếu lương
        </button>
        <button
          onClick={() => setActiveTab("cau-hinh")}
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
            activeTab === "cau-hinh"
              ? "bg-accent/50 text-primary border border-primary/20 border-b-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Cấu hình
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "ky-luong" && (
          <DataTable
            columns={kyLuongColumns}
            data={kyLuongs}
            loading={isKyLuongLoading}
            emptyMessage="Chưa có kỳ lương nào"
          />
        )}

        {activeTab === "tra-luong" && (
          <>
            {selectedKyLuong ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Phiếu lương - Kỳ: Tháng {selectedKyLuong.thang}/{selectedKyLuong.nam}
                  </h3>
                  <Badge variant="outline">
                    {traLuongs.length} phiếu
                  </Badge>
                </div>
                <DataTable
                  columns={traLuongColumns}
                  data={traLuongs}
                  loading={isTraLuongLoading}
                  emptyMessage="Chưa có phiếu lương nào"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8 text-muted-foreground">
                Chọn một kỳ lương để xem phiếu lương
              </div>
            )}
          </>
        )}

        {activeTab === "cau-hinh" && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-medium text-foreground">Danh sách cấu hình lương</h3>
            </div>
            <div className="divide-y divide-border">
              {isCauHinhLoading ? (
                <div className="p-8 text-center text-muted-foreground/70">Đang tải...</div>
              ) : cauHinhs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground/70">Chưa có cấu hình nào</div>
              ) : (
                cauHinhs.map((cauHinh: CauHinhLuong) => (
                  <div key={cauHinh.id} className={`p-4 ${cauHinh.trang_thai === "dang_ap_dung" ? "bg-accent/30" : "hover:bg-muted/50"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{cauHinh.ghi_chu || `Cấu hình ${formatDateVN(cauHinh.ngay_ap_dung)}`}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Áp dụng từ: {formatDateVN(cauHinh.ngay_ap_dung)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Lương cơ sở: <strong className="text-foreground">{formatCurrency(cauHinh.luong_co_so)}</strong></span>
                          <span>Hệ số đặc thù: <strong className="text-foreground">{cauHinh.he_so_dac_thu}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={cauHinh.trang_thai === "dang_ap_dung" ? "default" : "secondary"}
                        >
                          {cauHinh.trang_thai === "dang_ap_dung" ? "Đang áp dụng" :
                           cauHinh.trang_thai === "sap_hieu_luc" ? "Sắp hiệu lực" : "Hết hiệu lực"}
                        </Badge>
                        {cauHinh.trang_thai !== "dang_ap_dung" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            disabled={activateCauHinhMutation.isPending}
                            onClick={() => activateCauHinhMutation.mutate(cauHinh.id)}
                          >
                            <Check className="h-3 w-3" />
                            Áp dụng
                          </Button>
                        )}
                      </div>
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
        onSubmit={handleChayLuong}
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
