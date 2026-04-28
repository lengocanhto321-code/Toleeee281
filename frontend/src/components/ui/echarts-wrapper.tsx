"use client"

import React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { corporateCleanTheme } from "@/lib/echarts-theme"

interface EChartsWrapperProps {
  option: Record<string, unknown>
  className?: string
  style?: React.CSSProperties
  height?: number | string
  loading?: boolean
  notMerge?: boolean
  lazyUpdate?: boolean
}

export function EChartsWrapper({
  option,
  className,
  style,
  height = 350,
  loading = false,
  notMerge = true,
  lazyUpdate = true,
}: EChartsWrapperProps) {
  const { theme } = useTheme()
  const [EChartsReact, setEChartsReact] = React.useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    import('echarts-for-react').then((mod) => {
      setEChartsReact(() => mod.default)
    })
  }, [])

  if (!EChartsReact) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height, ...style }}
      >
        <div className="text-sm text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  const mergedOption = {
    ...corporateCleanTheme,
    ...option,
    backgroundColor: 'transparent',
  }

  return (
    <div className={cn("w-full", className)} style={{ height, ...style }}>
      <EChartsReact
        echarts={require('echarts')}
        option={mergedOption}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        style={{ height: '100%', width: '100%' }}
        loading={loading}
        theme={theme === 'dark' ? 'dark' : undefined}
      />
    </div>
  )
}
