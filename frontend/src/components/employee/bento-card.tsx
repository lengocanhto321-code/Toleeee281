"use client"

import { cn } from "@/lib/utils"

type BentoVariant = "blue" | "darkBlue" | "amber" | "green" | "red" | "slate" | "outline"

const VARIANT_STYLES: Record<BentoVariant, { bg: string; text: string; sub: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", sub: "text-blue-500" },
  darkBlue: { bg: "bg-blue-600", text: "text-white", sub: "text-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", sub: "text-amber-500" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", sub: "text-emerald-500" },
  red: { bg: "bg-red-50", text: "text-red-700", sub: "text-red-500" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", sub: "text-slate-400" },
  outline: { bg: "bg-white", text: "text-blue-600", sub: "text-slate-400" },
}

interface BentoCardProps {
  label: string
  value: string | number
  subtitle?: string
  variant?: BentoVariant
  className?: string
  onClick?: () => void
}

export function BentoCard({
  label,
  value,
  subtitle,
  variant = "blue",
  className,
  onClick,
}: BentoCardProps) {
  const v = VARIANT_STYLES[variant]
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 transition-all duration-200",
        v.bg,
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <div className={cn("text-xs font-medium", v.sub)}>{label}</div>
      <div className={cn("text-2xl font-extrabold mt-1", v.text)}>{value}</div>
      {subtitle && <div className={cn("text-xs mt-1", v.sub)}>{subtitle}</div>}
    </div>
  )
}
