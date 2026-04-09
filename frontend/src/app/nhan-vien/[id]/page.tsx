"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { NhanVienDetailInfo } from "@/components/forms/nhan-vien"
import { useNhanVienDetail } from "@/hooks/nhan-vien"

export default function NhanVienDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: nhanVien, isLoading, isError } = useNhanVienDetail(id)

  return (
    <AuthenticatedLayout breadcrumbLabel={nhanVien ? `${nhanVien.ho_ten} - ${nhanVien.ma_nhan_vien}` : undefined}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 cursor-pointer text-slate-500"
          onClick={() => router.push("/nhan-vien")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        {nhanVien && (
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-slate-400">Đang tải thông tin nhân viên...</div>
        </div>
      ) : isError || !nhanVien ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-slate-400">Không tìm thấy nhân viên</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/nhan-vien")} className="cursor-pointer">
            Quay lại danh sách
          </Button>
        </div>
      ) : (
        <NhanVienDetailInfo nhanVien={nhanVien} />
      )}
    </AuthenticatedLayout>
  )
}
