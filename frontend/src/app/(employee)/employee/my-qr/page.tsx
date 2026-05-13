"use client"

import { useEmployeeProfile } from "@/hooks/employee"
import { useGetMyQR } from "@/hooks/nghi-phep"
import { QrCode, RefreshCw } from "lucide-react"

export default function MyQRPage() {
  const { data: profile } = useEmployeeProfile()
  const { data: qrData, isLoading, refetch } = useGetMyQR()

  const initials = profile?.ho_ten
    ?.split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase() || "NV"

  return (
    <div className="max-w-sm mx-auto space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">{profile?.ho_ten || "Nhân viên"}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{profile?.ma_nhan_vien}</p>
        </div>

        <div className="flex justify-center mb-5">
          {isLoading ? (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : qrData?.qr_data ? (
            <div className="p-3 bg-white rounded-xl border-2 border-blue-100">
              <img src={qrData.qr_data} alt="QR Code" className="w-44 h-44" />
            </div>
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl">
              <QrCode className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới QR
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            QR thay đổi mỗi ngày. Quét trong giờ làm việc.
          </p>
        </div>
      </div>
    </div>
  )
}
