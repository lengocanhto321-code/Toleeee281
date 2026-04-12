"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { Button } from "@/components/ui/button"
import { NhanVienDetailInfo } from "@/components/forms/nhan-vien"
import { useNhanVienDetail } from "@/hooks/nhan-vien"
import { useLuongHienTai } from "@/hooks/luong/use-luong-query"
import { useKyLuongList } from "@/hooks/luong/use-luong-query"
import { useTraLuongByKyLuong } from "@/hooks/luong/use-luong-query"
import type { TraLuong } from "@/types/luong.types"

export default function NhanVienDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("personal")
  
  const { data: nhanVien, isLoading, isError } = useNhanVienDetail(id)
  
  const { data: luong } = useLuongHienTai(id)
  const { data: kyLuongData } = useKyLuongList({ page_size: 100 })
  
  const recentKyLuong = kyLuongData?.data?.[0]
  const { data: traLuongData } = useTraLuongByKyLuong(recentKyLuong?.id || "", { page_size: 20 })
  
  const traLuongs: TraLuong[] = traLuongData?.data?.filter(
    (tl) => tl.nhan_vien_id === id
  ) || []

  const handleEdit = () => {
    // TODO: Open edit dialog
    console.log("Edit employee")
  }

  const handleViewSalary = () => {
    setActiveTab("salary")
  }

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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 cursor-pointer"
            onClick={handleEdit}
          >
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
        <NhanVienDetailInfo 
          nhanVien={nhanVien} 
          luong={luong}
          traLuongs={traLuongs}
          onEdit={handleEdit}
          onViewSalary={handleViewSalary}
        />
      )}
    </AuthenticatedLayout>
  )
}
