"use client"

import { useState } from "react"
import {
  useEmployeeTodayAttendance,
  useEmployeeCheckInByCode,
  useEmployeeCheckOut,
} from "@/hooks/employee"
import { LogIn, LogOut, CheckCircle2, AlertTriangle } from "lucide-react"
import { formatTimeVN, formatDateVN } from "@/lib/date-utils"

export default function QRScannerPage() {
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [codeInput, setCodeInput] = useState("")

  const { data: todayRecord, isLoading: loadingToday } = useEmployeeTodayAttendance()
  const checkInByCodeMutation = useEmployeeCheckInByCode()
  const checkOutMutation = useEmployeeCheckOut()

  const isCheckedIn = !!todayRecord?.check_in_time
  const isCheckedOut = !!todayRecord?.check_out_time

  const handleCheckInByCode = async () => {
    if (codeInput.length !== 6) return
    const code = codeInput
    setCodeInput("")
    setResult(null)

    checkInByCodeMutation.mutate(
      {
        ma_nhap: code,
      },
      {
        onSuccess: (res) => {
          setResult({
            type: "success",
            message: res.is_late
              ? `Check-in lúc ${formatTimeVN(res.thoi_gian)} (đi muộn!)`
              : `Check-in lúc ${formatTimeVN(res.thoi_gian)}`,
          })
        },
        onError: (err: any) => {
          const message = err?.message || "Mã không hợp lệ"
          setResult({ type: "error", message })
        },
      }
    )
  }

  const handleCheckOut = async () => {
    setResult(null)

    checkOutMutation.mutate(undefined, {
      onSuccess: (res) => {
        setResult({
          type: "success",
          message: res.message || "Check-out thành công",
        })
      },
      onError: (err: any) => {
        const message = err?.message || "Lỗi không xác định"
        setResult({ type: "error", message })
      },
    })
  }

  const formatTime = (iso: string | null) => {
    return formatTimeVN(iso)
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Hôm nay ({formatDateVN(new Date().toISOString())})
        </h2>
        {loadingToday ? (
          <div className="text-sm text-slate-400 py-4 text-center">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase">Check-in</span>
              </div>
              {isCheckedIn ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900">
                    {formatTime(todayRecord?.check_in_time)}
                  </span>
                  {todayRecord?.check_in_status === "late" && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
              ) : (
                <span className="text-sm text-slate-300">Chưa check-in</span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase">Check-out</span>
              </div>
              {isCheckedOut ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900">
                    {formatTime(todayRecord?.check_out_time)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-300">Chưa check-out</span>
              )}
            </div>
          </div>
        )}
      </div>

      {result && (
        <div
          className={`rounded-2xl p-4 ${
            result.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.type === "success" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {result.message}
          </p>
        </div>
      )}

      {!isCheckedIn ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Nhập mã OTP</p>
            <p className="text-xs text-slate-500 mt-1">Mã gồm 6 chữ số, dùng để chấm công</p>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={async (e) => {
                if (e.key === "Enter" && codeInput.length === 6) {
                  await handleCheckInByCode()
                }
              }}
            />
          </div>
          <button
            onClick={handleCheckInByCode}
            disabled={codeInput.length !== 6 || checkInByCodeMutation.isPending}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            {checkInByCodeMutation.isPending ? "Đang xử lý..." : "Check-in"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Xác nhận Check-out</p>
          <button
            onClick={handleCheckOut}
            disabled={isCheckedOut || checkOutMutation.isPending}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            {checkOutMutation.isPending ? "Đang xử lý..." : "Xác nhận Check-out"}
          </button>
        </div>
      )}
    </div>
  )
}
