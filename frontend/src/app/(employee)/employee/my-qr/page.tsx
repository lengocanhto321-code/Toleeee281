"use client"

import { useEmployeeProfile } from "@/hooks/employee"
import { useGetMyQR } from "@/hooks/nghi-phep"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"
import { QrCode } from "lucide-react"
import { RefreshCw } from "lucide-react"

export default function MyQRPage() {
  const { data: profile } = useEmployeeProfile()
  const { data: qrData, isLoading, refetch } = useGetMyQR()

  return (
    <AuthenticatedLayout>
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">QR Chấm công</h1>
          <p className="text-slate-500">Quét QR để chấm công hàng ngày</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          {/* Employee info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-indigo-600">
                {profile?.ho_ten?.charAt(0) || "?"}
              </span>
            </div>
            <h2 className="text-lg font-semibold">{profile?.ho_ten || "Nhân viên"}</h2>
            <p className="text-sm text-slate-500">{profile?.ma_nhan_vien}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : qrData?.qr_data ? (
              <div className="p-4 bg-white rounded-lg border-2 border-slate-100">
                <img 
                  src={qrData.qr_data} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg">
                <QrCode className="h-12 w-12 text-slate-300" />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center">
            <button
              onClick={() => refetch()}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới QR
            </button>
            <p className="text-xs text-slate-400 mt-3">
              QR sẽ thay đổi mỗi ngày. Vui lòng quét trong giờ làm việc.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
