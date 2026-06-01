"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLichChamCong, useCreateLichChamCong, useToggleLichChamCong, useTodayQR, useGenerateQr } from "@/hooks/lich-cham-cong"

const NGAY_LAM_VIEC = [
  { value: 0, label: "T2" },
  { value: 1, label: "T3" },
  { value: 2, label: "T4" },
  { value: 3, label: "T5" },
  { value: 4, label: "T6" },
  { value: 5, label: "T7" },
  { value: 6, label: "CN" },
]

const DEFAULT_CHECKED_DAYS = [0, 1, 2, 3, 4, 5]

export function LichChamCongConfig() {
  const { data, isLoading } = useLichChamCong()
  const createMutation = useCreateLichChamCong()
  const toggleMutation = useToggleLichChamCong()
  const generateQrMutation = useGenerateQr()
  const { data: todayQr } = useTodayQR()

  const hasConfig = !!data
  const isActive = data?.trang_thai === "active"

  const [gioCheckIn, setGioCheckIn] = useState("07:00")
  const [gioCheckOut, setGioCheckOut] = useState("17:00")
  const [checkedDays, setCheckedDays] = useState<number[]>(DEFAULT_CHECKED_DAYS)

  useEffect(() => {
    if (!data) return
    setGioCheckIn(data.gio_check_in || "07:00")
    setGioCheckOut(data.gio_check_out || "17:00")

    const days = data.ngay_lam_viec
      ? data.ngay_lam_viec.split(",").map(Number).filter((d) => !isNaN(d))
      : DEFAULT_CHECKED_DAYS
    setCheckedDays(days)
  }, [data])

  const handleGenerateTodayQr = () => {
    const today = new Date().toISOString().slice(0, 10)

    const payload = {
      ngay: today,
      loai: "all",
      gio_bat_dau: gioCheckIn,
      gio_ket_thuc: gioCheckOut,
      bat_gps: false,
    }

    generateQrMutation.mutate(payload)
  }

  const toggleDay = (day: number) => {
    setCheckedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleToggleActive = () => {
    if (!data) return
    toggleMutation.mutate({
      id: data.id,
      data: { trang_thai: isActive ? "inactive" : "active" },
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      gio_check_in: gioCheckIn,
      gio_check_out: gioCheckOut,
      ngay_lam_viec: checkedDays.sort().join(","),
      bat_gps: false,
    }

    createMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          Đang tải cấu hình...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Lịch tự động tạo OTP
        </CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge
              className={
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }
            >
              {isActive ? "Đang bật" : "Đã tắt"}
            </Badge>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={!hasConfig || toggleMutation.isPending}
            />
          </div>
        </CardAction>
      </CardHeader>

      <div className="mx-6 mt-2 mb-0 p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-blue-600 font-medium">
            Mã OTP hôm nay {todayQr?.ngay ? `(${todayQr.ngay.split("-").reverse().join("/")})` : ""}
          </p>
          <p className="text-2xl font-mono font-bold tracking-[0.3em] text-blue-900">
            {todayQr?.ma_nhap ?? "Chưa có mã OTP"}
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
            {todayQr?.trang_thai === "active" ? "Đang hoạt động" : todayQr?.trang_thai ?? "Chưa có"}
          </Badge>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateTodayQr}
              disabled={!!todayQr?.id || generateQrMutation.isPending}
            >
              {todayQr?.id ? "OTP hôm nay đã có" : generateQrMutation.isPending ? "Đang tạo..." : "Tạo mã OTP hôm nay"}
            </Button>
            {todayQr?.ma_nhap && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(todayQr.ma_nhap || "")}
              >
                Sao chép mã
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-5">
          <fieldset className="space-y-3" disabled={hasConfig && !isActive}>
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Thời gian
            </legend>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gio_check_in">Giờ check-in</Label>
                <Input
                  id="gio_check_in"
                  type="time"
                  value={gioCheckIn}
                  onChange={(e) => setGioCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gio_check_out">Giờ check-out</Label>
                <Input
                  id="gio_check_out"
                  type="time"
                  value={gioCheckOut}
                  onChange={(e) => setGioCheckOut(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3" disabled={hasConfig && !isActive}>
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ngày làm việc
            </legend>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {NGAY_LAM_VIEC.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer select-none hover:bg-muted has-[button[data-state=checked]]:border-blue-300 has-[button[data-state=checked]]:bg-blue-50 has-[button[data-state=checked]]:text-blue-700"
                >
                  <Checkbox
                    checked={checkedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <CardFooter className="px-0 pt-2">
            <Button
              type="submit"
              disabled={(hasConfig && !isActive) || createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
