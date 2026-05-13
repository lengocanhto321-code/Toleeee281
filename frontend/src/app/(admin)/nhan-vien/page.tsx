"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import {
  createNhanVienColumns,
  NhanVienToolbar,
  NhanVienFormDialog,
  NhanVienImportDialog,
} from "@/components/forms/nhan-vien"
import { useNhanVienList, useCreateNhanVien, useUpdateNhanVien } from "@/hooks/nhan-vien"
import { useUploadTaiLieu } from "@/hooks/upload/use-upload-query"
import { usePhongBanAll } from "@/hooks/phong-ban/use-phong-ban-query"
import type { NhanVien } from "@/types/nhan-vien.types"
import type { NhanVienFilterParams } from "@/hooks/nhan-vien/use-nhan-vien-query"

function parseSortParams(sortValue: string): { sort_by: string; sort_desc: boolean } {
  const parts = sortValue.split("_")
  const dir = parts.pop()
  const field = parts.join("_")
  if (dir === "desc") return { sort_by: field, sort_desc: true }
  return { sort_by: field, sort_desc: false }
}

export default function NhanVienPage() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<NhanVienFilterParams>({})
  const [sortValue, setSortValue] = useState("ho_ten_asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingNhanVien, setEditingNhanVien] = useState<NhanVien | null>(null)

  const { sort_by, sort_desc } = parseSortParams(sortValue)
  const queryFilters: NhanVienFilterParams & { page: number; page_size: number } = {
    ...filters,
    search: search || undefined,
    sort_by,
    sort_desc,
    page,
    page_size: pageSize,
  }

  const { data: listResult, isLoading } = useNhanVienList(queryFilters)
  const createMutation = useCreateNhanVien()
  const updateMutation = useUpdateNhanVien()
  const uploadMutation = useUploadTaiLieu()
  const { data: phongBanList } = usePhongBanAll()

  const nhanViens = listResult?.data || []
  const metadata = listResult?.metadata

  const phongBanOptions = useMemo(() =>
    (phongBanList || []).map((pb: any) => ({ value: pb.id, label: pb.ten_phong_ban })),
    [phongBanList]
  )

  const total = metadata?.total || 0
  const currentPage = metadata?.page || 1
  const totalPages = metadata?.total_pages || 1

  useEffect(() => {
    const handler = () => { setEditingNhanVien(null); setFormOpen(true) }
    window.addEventListener("sidebar:nhan-vien:add", handler)
    return () => window.removeEventListener("sidebar:nhan-vien:add", handler)
  }, [])

  useEffect(() => {
    const handler = () => setImportOpen(true)
    window.addEventListener("sidebar:nhan-vien:import", handler)
    return () => window.removeEventListener("sidebar:nhan-vien:import", handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, filters, sortValue, pageSize])

  const handleFiltersChange = useCallback((newFilters: NhanVienFilterParams) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSortValue(value)
  }, [])

  const columns = useMemo(() => createNhanVienColumns({
    onEdit: (nv) => { setEditingNhanVien(nv); setFormOpen(true) },
  }), [])

  const handleFormSubmit = async (data: Record<string, unknown>, editId?: string, pendingFiles?: { cccd_front?: File; cccd_back?: File }) => {
    const uploadFiles = async (nhanVienId: string, hoTen: string) => {
      const uploads = []
      if (pendingFiles?.cccd_front) {
        uploads.push(
          uploadMutation.mutateAsync({
            file: pendingFiles.cccd_front,
            nhan_vien_id: nhanVienId,
            loai_tai_lieu: "cccd",
            ten_tai_lieu: "CCCD mặt trước",
            ho_ten: hoTen,
            la_ban_chinh: true,
          })
        )
      }
      if (pendingFiles?.cccd_back) {
        uploads.push(
          uploadMutation.mutateAsync({
            file: pendingFiles.cccd_back,
            nhan_vien_id: nhanVienId,
            loai_tai_lieu: "cccd",
            ten_tai_lieu: "CCCD mặt sau",
            ho_ten: hoTen,
            la_ban_chinh: false,
          })
        )
      }
      if (uploads.length > 0) {
        await Promise.all(uploads)
      }
    }

    if (editId) {
      updateMutation.mutate({ id: editId, data: data as any }, {
        onSuccess: async () => {
          if (pendingFiles && (pendingFiles.cccd_front || pendingFiles.cccd_back)) {
            await uploadFiles(editId, (data.ho_ten as string) || "")
          }
          setFormOpen(false)
        },
      })
    } else {
      createMutation.mutate(data as any, {
        onSuccess: async (result: any) => {
          if (pendingFiles && (pendingFiles.cccd_front || pendingFiles.cccd_back)) {
            const nhanVienId = result?.id || (result as any)?.data?.id
            if (nhanVienId) {
              await uploadFiles(nhanVienId, (data.ho_ten as string) || "")
            }
          }
          setFormOpen(false)
        },
      })
    }
  }

  const handleExport = () => {
    const {
      TRANG_THAI_LABELS,
      LOAI_NHAN_VIEN_LABELS,
      LOAI_HOP_DONG_LABELS,
      CAP_HOC_LABELS,
    } = require("@/types/nhan-vien.types")
    const rows = nhanViens.map((nv) => ({
      "Mã NV": nv.ma_nhan_vien,
      "Họ tên": nv.ho_ten,
      "Giới tính": nv.gioi_tinh,
      "Ngày sinh": nv.ngay_sinh || "",
      "Dân tộc": nv.dan_toc || "",
      "Tôn giáo": nv.ton_giao || "",
      "Số CCCD": nv.so_cccd || "",
      "Số ĐT": nv.so_dien_thoai || "",
      "Email": nv.email || "",
      "Loại NV": LOAI_NHAN_VIEN_LABELS?.[nv.loai_nhan_vien] || nv.loai_nhan_vien,
      "Phòng ban": nv.phong_ban?.ten_phong_ban || "",
      "Chức vụ": nv.chuc_vu?.ten_chuc_vu || "",
      "Cấp học": nv.cap_hoc ? (CAP_HOC_LABELS?.[nv.cap_hoc] || nv.cap_hoc) : "",
      "Môn dạy": nv.mon_day || "",
      "Loại HĐ": LOAI_HOP_DONG_LABELS?.[nv.loai_hop_dong] || nv.loai_hop_dong,
      "Ngày vào làm": nv.ngay_vao_lam || "",
      "Trạng thái": TRANG_THAI_LABELS?.[nv.trang_thai] || nv.trang_thai,
      "Ghi chú": nv.ghi_chu || "",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhân viên")
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `nhan-vien-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const tableFooter = total > 0 ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Combobox
          options={[
            { value: "10", label: "10 / trang" },
            { value: "20", label: "20 / trang" },
            { value: "50", label: "50 / trang" },
            { value: "100", label: "100 / trang" },
          ]}
          value={String(pageSize)}
          onChange={(v) => { setPageSize(Number(v)); setPage(1) }}
          placeholder="20 / trang"
          searchPlaceholder="Chọn số lượng..."
          className="h-8 text-xs w-32"
        />
        <span className="text-xs text-slate-500">
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} / {total}
        </span>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(1)} disabled={page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 px-2">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  ) : undefined

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-end mb-4">
        <p className="text-sm text-slate-500">
          {total} nhân viên
        </p>
      </div>

      <div className="mb-4">
        <NhanVienToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          viewMode="table"
          onViewModeChange={() => {}}
          onExport={handleExport}
          phongBanOptions={phongBanOptions}
          totalResults={total}
          totalCount={total}
        />
      </div>

      <DataTable
        columns={columns}
        data={nhanViens}
        loading={isLoading}
        emptyMessage="Không tìm thấy nhân viên nào"
        disablePagination
        footer={tableFooter}
      />

      <NhanVienFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNhanVien={editingNhanVien}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />
      <NhanVienImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </AuthenticatedLayout>
  )
}
