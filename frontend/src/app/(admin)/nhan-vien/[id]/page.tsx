"use client"

import { use, useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { NhanVienDetailInfo, NhanVienFormDialog, NhanVienTransferDialog } from "@/components/forms/nhan-vien"
import { useNhanVienDetail, useUpdateNhanVien, useRestoreNhanVien, useNguoiThanList, useBangCapList, useKhenThuongKyLuatList } from "@/hooks/nhan-vien"
import { apiGateway } from "@/lib/axios"
import { ApiEndpoints } from "@/types/api.types"
import { toastSuccess, toastError } from "@/lib/utils"
import { useLuongHienTai, useKyLuongList, useTraLuongByKyLuong } from "@/hooks/luong/use-luong-query"
import { useCongTacList } from "@/hooks/cong-tac/use-cong-tac-query"
import { useLichSuChucVuList } from "@/hooks/lich-su-chuc-vu/use-lich-su-chuc-vu-query"
import { useHopDongList } from "@/hooks/hop-dong/use-hop-dong-query"
import type { TraLuong } from "@/types/luong.types"
import type { NhanVien } from "@/types/nhan-vien.types"
import type { NhanVienFullInput } from "@/schemas/employee.schema"

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-sm text-slate-400">Đang tải thông tin nhân viên...</div>
    </div>
  )
}

export default function NhanVienDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  
  const { data: nhanVien, isLoading, isError } = useNhanVienDetail(id)
  const updateMutation = useUpdateNhanVien()
  const restoreMutation = useRestoreNhanVien()
  
  const { data: luong } = useLuongHienTai(id)
  const { data: kyLuongData } = useKyLuongList({ page_size: 100 })
  
  const recentKyLuong = kyLuongData?.data?.[0]
  const recentKyLuongId = recentKyLuong?.id || ""
  const { data: traLuongData } = useTraLuongByKyLuong(recentKyLuongId, { page_size: 20 })
  
  const traLuongs: TraLuong[] = traLuongData?.data?.filter(
    (tl) => tl.nhan_vien_id === id
  ) || []

  const { data: nguoiThans } = useNguoiThanList(id)
  const { data: bangCaps } = useBangCapList(id)
  const { data: khenThuongKyLuats } = useKhenThuongKyLuatList(id)
  const { data: congTacsData } = useCongTacList(id)
  const congTacs = congTacsData?.items || []
  const { data: lichSuChucVuData } = useLichSuChucVuList(id)
  const lichSuChucVus = lichSuChucVuData?.items || []
  const { data: hopDongsData } = useHopDongList(id)
  const hopDongs = hopDongsData || []

  useEffect(() => {
    const handlers: Record<string, () => void> = {
      "sidebar:nv-detail:edit": () => setFormOpen(true),
      "sidebar:nv-detail:viewSalary": () => {
        const el = document.querySelector('[data-tab-value="salary"]') as HTMLElement
        el?.click()
      },
      "sidebar:nv-detail:createContract": () => {
        const el = document.querySelector('[data-tab-value="contract"]') as HTMLElement
        el?.click()
      },
      "sidebar:nv-detail:addReward": () => {
        const el = document.querySelector('[data-tab-value="reward"]') as HTMLElement
        el?.click()
      },
      "sidebar:nv-detail:addDiscipline": () => {
        const el = document.querySelector('[data-tab-value="reward"]') as HTMLElement
        el?.click()
      },
      "sidebar:nv-detail:print": () => window.print(),
      "sidebar:nv-detail:export": () => window.print(),
      "sidebar:nv-detail:restore": () => restoreMutation.mutate(id),
      "sidebar:nv-detail:transfer": () => setTransferOpen(true),
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [id, restoreMutation])

  const handleEdit = () => setFormOpen(true)

  const handleFormSubmit = (data: NhanVienFullInput, editId?: string) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: data as Partial<NhanVien> }, { onSuccess: () => setFormOpen(false) })
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !nhanVien) return

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nhan_vien_id", id)
      formData.append("loai_tai_lieu", "anh_dai_dien")
      formData.append("ten_tai_lieu", `avatar_${nhanVien.ma_nhan_vien}`)
      formData.append("ho_ten", nhanVien.ho_ten)

      const result = await apiGateway.post<Record<string, unknown>>(ApiEndpoints.UPLOAD_FILES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const avatarUrl = (result.url || result.file_url || result.duong_dan) as string
      if (avatarUrl) {
        updateMutation.mutate(
          { id, data: { anh_dai_dien: avatarUrl } as Partial<NhanVien> },
          { onSuccess: () => toastSuccess("Cập nhật ảnh đại diện thành công") }
        )
      }
    } catch {
      toastError("Lỗi", "Tải ảnh đại diện thất bại")
    }
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthenticatedLayout breadcrumbLabel={nhanVien ? `${nhanVien.ho_ten} - ${nhanVien.ma_nhan_vien}` : undefined}>
        {(isLoading || !nhanVien) ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-slate-400">Đang tải thông tin nhân viên...</div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-slate-400">Không tìm thấy nhân viên</p>
          </div>
        ) : (
          <>
            <NhanVienDetailInfo 
              nhanVien={nhanVien} 
              luong={luong}
              traLuongs={traLuongs || []}
              nguoiThans={nguoiThans || []}
              bangCaps={bangCaps || []}
              khenThuongs={khenThuongKyLuats?.filter((k: any) => k.loai === 'khen_thuong') || []}
              kyLuats={khenThuongKyLuats?.filter((k: any) => k.loai === 'ky_luat') || []}
              hopDongs={hopDongs}
              onEdit={handleEdit}
              onAvatarChange={handleAvatarChange}
            />

            <NhanVienFormDialog
              open={formOpen}
              onOpenChange={setFormOpen}
              editingNhanVien={nhanVien}
              isPending={updateMutation.isPending}
              onSubmit={handleFormSubmit}
            />

            <NhanVienTransferDialog
              open={transferOpen}
              onOpenChange={setTransferOpen}
              nhanVien={nhanVien}
              isPending={updateMutation.isPending}
              onTransfer={() => {
                setTransferOpen(false)
              }}
            />
          </>
        )}
      </AuthenticatedLayout>
    </Suspense>
  )
}
