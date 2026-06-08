import * as echarts from 'echarts/core'
import { BarChart, LineChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  GraphicComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  GraphicComponent,
  CanvasRenderer,
])

export const chartTheme = {
  color: ['#00dfff', '#8b5cf6', '#00ffd0', '#c4b5fd', '#fbbf24', '#f87171'],
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(255,255,255,0.75)' },
  title: { textStyle: { color: '#ffffff' } },
  legend: {
    textStyle: { color: 'rgba(255,255,255,0.75)' },
  },
  tooltip: {
    backgroundColor: 'rgba(27,28,62,0.95)',
    borderColor: 'rgba(255,255,255,0.18)',
    textStyle: { color: '#ffffff' },
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  gauge: {
    axisLine: {
      lineStyle: {
        color: [[0.3, '#00ffd0'], [0.7, '#fbbf24'], [1, '#f87171']],
      },
    },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    detail: { color: '#ffffff' },
    title: { color: 'rgba(255,255,255,0.7)' },
  },
}

echarts.registerTheme('viya-glass', chartTheme)

export { echarts }
