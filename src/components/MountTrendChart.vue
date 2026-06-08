<template>
  <div class="glass-panel p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-white/70">Mountpoint Trends</h3>
      <div class="flex gap-2">
        <button
          v-for="range in ranges"
          :key="range.label"
          class="px-2 py-1 text-xs rounded-md transition-colors"
          :class="selectedRange === range.days
            ? 'bg-accent-cyan/20 text-accent-cyan'
            : 'text-white/40 hover:text-white/70'"
          @click="selectedRange = range.days"
        >{{ range.label }}</button>
      </div>
    </div>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkAreaComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, MarkAreaComponent, CanvasRenderer])

const props = defineProps<{ hostName: string }>()

const store = useDiskStore()
const selectedRange = ref(7)
const ranges = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '180d', days: 180 },
]

const colors = ['#00d4ff', '#00ffc8', '#7c3aed', '#a78bfa', '#f59e0b', '#f43f5e']

const option = computed(() => {
  const order = ['/', '/share/spre', '/saswork', '/boot', '/boot/efi']
  const mountpoints = store.mountpointsForHost(props.hostName)
    .filter((mp) => store.selectedMountpoints.includes(mp))
    .sort((a, b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  const allDays = new Set<string>()

  const seriesData = mountpoints.map((mp) => {
    const entries = store.hostRecords(props.hostName)
      .filter((r) => r.mountpoint === mp && r.fsuse_pct !== null)

    // Aggregate by day
    const byDay = new Map<string, number[]>()
    for (const r of entries) {
      const day = r.collected_at.slice(0, 10)
      if (!byDay.has(day)) byDay.set(day, [])
      byDay.get(day)!.push(r.fsuse_pct!)
    }

    let daily = Array.from(byDay.entries())
      .map(([day, vals]) => ({
        day,
        avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      }))
      .sort((a, b) => a.day.localeCompare(b.day))

    // Filter by selected range
    if (selectedRange.value < 180) {
      daily = daily.slice(-selectedRange.value)
    }

    daily.forEach((d) => allDays.add(d.day))
    return { name: mp, data: daily.map((d) => [d.day, d.avg]) }
  })

  const days = Array.from(allDays).sort()

  return {
    tooltip: {
      trigger: 'axis' as const,
      valueFormatter: (val: number) => val + '%',
    },
    legend: {
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: days,
      axisLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        formatter: (val: string) => val.slice(5), // "MM-DD"
      },
    },
    yAxis: {
      type: 'value' as const,
      name: '%',
      max: 100,
      axisLabel: { color: 'rgba(255,255,255,0.5)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: seriesData.map((s, i) => ({
      ...s,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: colors[i % colors.length] },
      ...(i === 0 ? {
        markArea: {
          silent: true,
          data: [[
            { yAxis: 70, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,200,0,0.28)' }, { offset: 1, color: 'rgba(255,200,0,0.06)' }] } } },
            { yAxis: 100 },
          ]],
        },
      } : {}),
    })),
  }
})
</script>
