import { format } from "date-fns"
import { TZDate } from "@date-fns/tz"

const VN_TZ = "Asia/Ho_Chi_Minh"

export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "dd/MM/yyyy")
}

export function formatDateTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "dd/MM/yyyy HH:mm")
}

export function formatTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "HH:mm")
}

export function getTodayVN(): string {
  return format(new TZDate(new Date(), VN_TZ), "yyyy-MM-dd")
}
