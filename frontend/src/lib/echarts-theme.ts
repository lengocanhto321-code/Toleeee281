// frontend/src/lib/echarts-theme.ts
export const corporateCleanTheme = {
  color: [
    '#1e40af', // chart-1: Blue 800
    '#059669', // chart-2: Emerald 600
    '#d97706', // chart-3: Amber 600
    '#7c3aed', // chart-4: Violet 600
    '#dc2626', // chart-5: Red 600
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#0f172a',
  },
  title: {
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#0f172a',
    },
  },
  legend: {
    textStyle: {
      fontSize: 12,
      color: '#475569',
    },
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    padding: [8, 12],
    textStyle: {
      fontSize: 12,
      color: '#0f172a',
    },
    extraCssText: 'box-shadow: 0 1px 3px rgba(0,0,0,0.1)',
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#e2e8f0',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#64748b',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#f1f5f9',
        type: 'solid',
      },
    },
  },
  yAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#64748b',
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: '#f1f5f9',
        type: 'solid',
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
}
