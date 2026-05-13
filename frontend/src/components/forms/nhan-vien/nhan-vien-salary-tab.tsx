"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Banknote, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Minus,
  Plus
} from "lucide-react"
import type { NhanVien } from "@/types/nhan-vien.types"
import type { Luong, TraLuong } from "@/types/luong.types"

interface NhanVienSalaryProps {
  nhanVien: NhanVien
  luong?: Luong
  traLuongs?: TraLuong[]
}

function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return "—"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function Field({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm font-medium ${highlight || "text-slate-900"}`}>{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

function SalaryCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  accent,
  highlight 
}: { 
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  accent: string
  highlight?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-base font-bold ${highlight || "text-slate-900"}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
      </div>
    </div>
  )
}

export function NhanVienSalaryTab({ nhanVien, luong, traLuongs = [] }: NhanVienSalaryProps) {
  const recentTraLuongs = traLuongs.slice(0, 6)

  if (!luong) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Banknote className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có thông tin lương</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Nhân viên này chưa được thiết lập bảng lương. Vui lòng liên hệ phòng nhân sự để setup.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SalaryCard
          icon={Banknote}
          label="Lương cơ bản"
          value={formatCurrency(luong.luong_co_ban)}
          subValue={`Hệ số ${luong.he_so_luong}`}
          accent="bg-emerald-100 text-emerald-600"
        />
        <SalaryCard
          icon={Award}
          label="Phụ cấp ưu đãi"
          value={formatCurrency(luong.phu_cap_uu_dai)}
          subValue={`Tỷ lệ ${luong.ty_le_pc_uu_dai}%`}
          accent="bg-violet-100 text-violet-600"
        />
        <SalaryCard
          icon={TrendingUp}
          label="Hệ số lương"
          value={`${luong.he_so_luong}`}
          subValue={`Bậc ${luong.bac || "N/A"} - ${luong.ma_ngach || "N/A"}`}
          accent="bg-blue-100 text-blue-600"
        />
        <SalaryCard
          icon={Clock}
          label="Thâm niên"
          value={`${luong.so_nam_tham_nien} năm`}
          subValue={`Phụ cấp TV: ${formatCurrency(luong.phu_cap_tham_nien_vuot_khung)}`}
          accent="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Tabs for Salary Details */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="w-full justify-start bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="current" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Bảng lương
          </TabsTrigger>
          <TabsTrigger value="allowances" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Phụ cấp
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Lịch sử ({traLuongs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Bảng lương */}
        <TabsContent value="current" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Thông tin lương hiện tại</h3>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Hiệu lực từ {formatDate(luong.hieu_luc_tu)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Field label="Mã ngạch" value={luong.ma_ngach || "—"} />
              <Field label="Bậc lương" value={luong.bac || "—"} />
              <Field label="Hệ số lương" value={luong.he_so_luong} highlight="text-blue-600" />
              <Field label="Số năm thâm niên" value={`${luong.so_nam_tham_nien} năm`} />
              
              <Field label="Lương cơ bản" value={formatCurrency(luong.luong_co_ban)} highlight="text-emerald-600" />
              <Field label="Phụ cấp ưu đãi" value={formatCurrency(luong.phu_cap_uu_dai)} />
              <Field label="Hệ số khu vực" value={luong.he_so_khu_vuc} />
              <Field label="Phụ cấp chức vụ" value={formatCurrency(luong.phu_cap_chuc_vu)} />
              
              <Field label="BHXH" value={formatCurrency(luong.bhxh)} />
              <Field label="BHYT" value={formatCurrency(luong.bhyt)} />
              <Field label="Thuế TNCN" value={formatCurrency(luong.thue_tncn)} />
              <Field label="Khấu trừ khác" value={formatCurrency(luong.khau_tru_khac)} />
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Phụ cấp */}
        <TabsContent value="allowances" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Các khoản phụ cấp</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <Award className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Phụ cấp ưu đãi nghề nghiệp</p>
                    <p className="text-xs text-slate-500">Tỷ lệ {luong.ty_le_pc_uu_dai}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">{formatCurrency(luong.phu_cap_uu_dai)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 border border-violet-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <TrendingUp className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Phụ cấp thâm niên vượt khung</p>
                    <p className="text-xs text-slate-500">Theo số năm công tác</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-violet-600">{formatCurrency(luong.phu_cap_tham_nien_vuot_khung)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Phụ cấp chức vụ</p>
                    <p className="text-xs text-slate-500">Theo chức vụ đảm nhận</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{formatCurrency(luong.phu_cap_chuc_vu)}</p>
                </div>
              </div>

              {luong.phu_cap_khac > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Plus className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Phụ cấp khác</p>
                      <p className="text-xs text-slate-500">Các khoản phụ cấp bổ sung</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-600">{formatCurrency(luong.phu_cap_khac)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Lịch sử */}
        <TabsContent value="history" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Lịch sử lương đã trả</h3>
            
            {recentTraLuongs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Chưa có lịch sử lương</p>
                <p className="text-xs text-slate-400 mt-1">Lương sẽ hiển thị sau khi chạy lương tháng</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTraLuongs.map((traLuong) => (
                  <div 
                    key={traLuong.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        traLuong.trang_thai === "da_tra" 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {traLuong.trang_thai === "da_tra" ? (
                          <DollarSign className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">
                            Tháng {traLuong.thang}/{traLuong.nam}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={
                              traLuong.trang_thai === "da_tra" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }
                          >
                            {traLuong.trang_thai === "da_tra" ? "Đã trả" : "Chưa trả"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Công: {traLuong.so_ngay_cong_thuc_te}/{traLuong.so_ngay_cong_chuan} ngày
                          {traLuong.co_tam_dinh_chi && (
                            <span className="text-amber-600 ml-2">
                              • Tạm đình chỉ
                            </span>
                          )}
                          {traLuong.co_ky_luat && (
                            <span className="text-red-600 ml-2">
                              • Bị kỷ luật
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(traLuong.luong_thuc_nhan)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Thu nhập: {formatCurrency(traLuong.tong_thu_nhap)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
