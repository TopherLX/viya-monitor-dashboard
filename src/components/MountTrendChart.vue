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
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

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
  const mountpoints = store.mountpointsForHost(props.hostName)
  const allTimes = new Set<string>()

  const seriesData = mountpoints.map((mp) => {
    const entries = store.hostRecords(props.hostName)
      .filter((r) => r.mountpoint === mp && r.fsuse_pct !== null)
      .sort((a, b) => a.collected_at.localeCompare(b.collected_at))

    // Filter by selected range
    if (selectedRange.value < 180) {
      const cutoff = entries.length > selectedRange.value * 24
        ? entries[entries.length - selectedRange.value * 24].collected_at
        : entries[0]?.collected_at ?? ''
      const filtered = entries.filter((r) => r.collected_at >= cutoff)
      filtered.forEach((r) => allTimes.add(r.collected_at))
      return { name: mp, data: filtered.map((r) => [r.collected_at, r.fsuse_pct]) }
    }

    entries.forEach((r) => allTimes.add(r.collected_at))
    return { name: mp, data: entries.map((r) => [r.collected_at, r.fsuse_pct]) }
  })

  const times = Array.from(allTimes).sort()

  return {
    tooltip: { trigger: 'axis' as const },
    legend: {
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: times,
      axisLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        formatter: (val: string) => {
          const d = val.split(' ')[0]
          return d.slice(5) // "MM-DD"
        },
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
    })),
  }
})
</script>
