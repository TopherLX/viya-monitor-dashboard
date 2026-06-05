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
  color: ['#00d4ff', '#7c3aed', '#00ffc8', '#a78bfa', '#f59e0b', '#f43f5e'],
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(255,255,255,0.7)' },
  title: { textStyle: { color: '#ffffff' } },
  legend: {
    textStyle: { color: 'rgba(255,255,255,0.7)' },
  },
  tooltip: {
    backgroundColor: 'rgba(10,10,46,0.9)',
    borderColor: 'rgba(255,255,255,0.15)',
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
        color: [[0.3, '#00ffc8'], [0.7, '#f59e0b'], [1, '#f43f5e']],
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
