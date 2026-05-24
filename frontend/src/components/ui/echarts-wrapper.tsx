"use client"

import React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { corporateCleanTheme } from "@/lib/echarts-theme"

let echartsModule: any = null

function getEchartsInstance() {
  return echartsModule
}

interface EChartsWrapperProps {
  option: Record<string, unknown>
  className?: string
  style?: React.CSSProperties
  height?: number | string
  loading?: boolean
  notMerge?: boolean
  lazyUpdate?: boolean
  onEvents?: Record<string, (params: any) => void>
}

const EChartsInner = React.memo(function EChartsInner({
  option,
  height,
  style,
  className,
  notMerge = true,
  lazyUpdate = true,
  loading,
  onEvents,
}: EChartsWrapperProps) {
  const { theme } = useTheme()
  const chartRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let disposed = false
    let chart: any = null

    async function init() {
      const echarts = getEchartsInstance()
      if (!echarts || !containerRef.current || disposed) return

      chart = echarts.init(containerRef.current, theme === 'dark' ? 'dark' : undefined)
      chartRef.current = chart

      const mergedOption = {
        ...corporateCleanTheme,
        ...option,
        backgroundColor: 'transparent',
      }
      chart.setOption(mergedOption, { notMerge, lazyUpdate })

      const handleResize = () => chart?.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart?.dispose()
      }
    }

    init()

    return () => {
      disposed = true
      chart?.dispose()
      chartRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const mergedOption = {
      ...corporateCleanTheme,
      ...option,
      backgroundColor: 'transparent',
    }
    chart.setOption(mergedOption, { notMerge, lazyUpdate })
  }, [option, notMerge, lazyUpdate])

  React.useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    if (loading) {
      chart.showLoading()
    } else {
      chart.hideLoading()
    }
  }, [loading])

  React.useEffect(() => {
    if (!onEvents || !chartRef.current) return
    const chart = chartRef.current
    const entries = Object.entries(onEvents)
    entries.forEach(([event, handler]) => {
      chart.on(event, handler)
    })
    return () => {
      entries.forEach(([event, handler]) => {
        chart.off(event, handler)
      })
    }
  }, [onEvents])

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ height, ...style }}
    />
  )
}, (prev, next) => {
  return prev.option === next.option
    && prev.height === next.height
    && prev.loading === next.loading
    && prev.className === next.className
})

export function EChartsWrapper(props: EChartsWrapperProps) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (echartsModule) {
      setReady(true)
      return
    }
    import('echarts').then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      echartsModule = (mod as any).default || mod
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <div
        className={cn("flex items-center justify-center", props.className)}
        style={{ height: props.height, ...props.style }}
      >
        <div className="text-sm text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return <EChartsInner {...props} />
}
