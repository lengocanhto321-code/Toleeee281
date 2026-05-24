import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type AccentVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral"

const ACCENT_MAP: Record<AccentVariant, { iconBg: string; iconText: string; border: string }> = {
  primary: { iconBg: "bg-blue-50", iconText: "text-blue-600", border: "border-l-blue-500" },
  success: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", border: "border-l-emerald-500" },
  warning: { iconBg: "bg-amber-50", iconText: "text-amber-600", border: "border-l-amber-500" },
  danger:  { iconBg: "bg-red-50", iconText: "text-red-600", border: "border-l-red-500" },
  info:    { iconBg: "bg-blue-50", iconText: "text-blue-600", border: "border-l-blue-500" },
  neutral: { iconBg: "bg-slate-50", iconText: "text-slate-600", border: "border-l-slate-300" },
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: AccentVariant
  trend?: { value: string; direction: "up" | "down" | "neutral" }
  onClick?: () => void
  active?: boolean
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "neutral",
  trend,
  onClick,
  active,
  className,
}: StatCardProps) {
  const a = ACCENT_MAP[accent]
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all duration-200",
        a.border,
        isClickable && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        active && "ring-2 ring-blue-500/20 border-l-blue-500",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", a.iconBg)}>
          <Icon className={cn("h-5 w-5", a.iconText)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {trend && trend.direction !== "neutral" && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-600",
              )}>
                {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
