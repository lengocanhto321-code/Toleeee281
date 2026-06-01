"use client"

import { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import {
  useEmployeeTodayAttendance,
  useEmployeeTodayQr,
  useEmployeeCheckIn,
  useEmployeeCheckInByCode,
  useEmployeeCheckOut,
} from "@/hooks/employee"
import { LogIn, LogOut, CheckCircle2, AlertTriangle, Keyboard } from "lucide-react"
import { formatTimeVN } from "@/lib/date-utils"

export default function QRScannerPage() {
  const [scanning, setScanning] = useState<"check_in" | "check_out" | null>(null)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [codeMode, setCodeMode] = useState(true)
  const [codeInput, setCodeInput] = useState("")
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const { data: todayRecord, isLoading: loadingToday } = useEmployeeTodayAttendance()
  const { data: activeQr, isLoading: loadingQr } = useEmployeeTodayQr()
  const checkInMutation = useEmployeeCheckIn()
  const checkInByCodeMutation = useEmployeeCheckInByCode()
  const checkOutMutation = useEmployeeCheckOut()

  const isCheckedIn = !!todayRecord?.check_in_time
  const isCheckedOut = !!todayRecord?.check_out_time

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const handleCheckIn = async (qrData: string) => {
    setResult(null)

    checkInMutation.mutate(
      {
        qr_data: qrData,
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
      }
    )
  }

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
      }
    )
  }

  const handleCheckOut = async () => {
    setResult(null)

    checkOutMutation.mutate({},
      {
        onSuccess: (res) => {
          setResult({
            type: "success",
            message: res.message || "Check-out thành công",
          })
        },
      }
    )
  }

  const startScan = async (mode: "check_in" | "check_out") => {
    setResult(null)
    setScanning(mode)

    try {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            await scanner.stop()
          } catch {
            // scanner may already be stopped or not running yet
          }
          scannerRef.current = null
          setScanning(null)

          if (mode === "check_in") {
            await handleCheckIn(decodedText)
          } else {
            await handleCheckOut()
          }
        },
        () => {}
      )
    } catch {
      setResult({ type: "error", message: "Không thể mở camera. Vui lòng cấp quyền." })
      setScanning(null)
    }
  }

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setScanning(null)
  }

  const formatTime = (iso: string | null) => {
    return formatTimeVN(iso)
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Hôm nay</h2>
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

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Mã chấm công hôm nay</p>
            <p className="mt-1 text-2xl font-mono tracking-[0.3em] text-slate-900">
              {loadingQr ? "Đang tải..." : activeQr?.ma_nhap || "Chưa có mã"}
            </p>
          </div>
          <button
            type="button"
            className="self-start rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            disabled={!activeQr?.ma_nhap}
            onClick={() => navigator.clipboard.writeText(activeQr?.ma_nhap || "")}
          >
            Sao chép mã
          </button>
        </div>
      </div>

      <div
        id="qr-reader"
        className={`rounded-2xl overflow-hidden ${scanning ? "block" : "hidden"}`}
      />

      {scanning && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Đang quét QR... Hướng camera vào mã QR tại cổng trường
          </p>
          <button
            onClick={stopScan}
            className="text-sm text-red-500 font-medium hover:text-red-600"
          >
            Hủy quét
          </button>
        </div>
      )}


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

      {!scanning && (
        <>
          {codeMode && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              {!isCheckedIn ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Nhập mã chấm công</p>
                    <p className="text-xs text-slate-500 mt-1">Mã gồm 6 chữ số, dùng để chấm công nhanh</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        maxLength={6}
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="flex-1 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && codeInput.length === 6) {
                            await handleCheckInByCode()
                          }
                        }}
                      />
                    </div>
                    {activeQr?.ma_nhap && (
                      <button
                        type="button"
                        onClick={() => setCodeInput(activeQr.ma_nhap || "")}
                        className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Dùng mã hiện tại: {activeQr.ma_nhap}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (codeInput.length === 6) {
                        await handleCheckInByCode()
                      }
                    }}
                    disabled={codeInput.length !== 6 || checkInByCodeMutation.isPending}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    {checkInByCodeMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700">Xác thực Check-out bằng tay</p>
                  <button
                    onClick={async () => {
                      await handleCheckOut()
                    }}
                    disabled={isCheckedOut || checkOutMutation.isPending}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    {checkOutMutation.isPending ? "Đang xử lý..." : "Xác nhận Check-out"}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setCodeMode(!codeMode)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-colors ${
                codeMode
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Keyboard className="w-4 h-4 inline mr-1" />
              {codeMode ? "Dùng QR" : "Dùng mã 6 số"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setCodeMode(false); startScan("check_in") }}
              disabled={isCheckedIn || checkInMutation.isPending}
              className={`rounded-2xl p-4 text-center transition-colors ${
                isCheckedIn
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              <LogIn className="w-6 h-6 mx-auto mb-1.5" />
              <div className="text-xs font-semibold">
                {isCheckedIn ? "Đã check-in" : "Quét QR"}
              </div>
            </button>
            <button
              onClick={() => startScan("check_out")}
              disabled={!isCheckedIn || isCheckedOut || checkOutMutation.isPending}
              className={`rounded-2xl p-4 text-center transition-colors ${
                !isCheckedIn || isCheckedOut
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-950 active:bg-blue-950"
              }`}
            >
              <LogOut className="w-6 h-6 mx-auto mb-1.5" />
              <div className="text-xs font-semibold">
                {isCheckedOut ? "Đã check-out" : "Check-out"}
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
