"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 rounded-2xl p-5 text-white",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
