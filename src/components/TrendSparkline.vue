<template>
  <div class="glass-panel p-4 group cursor-pointer" @click="$emit('click')">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-white/60 capitalize">{{ hostName }}</span>
      <span class="text-xs font-mono" :class="trendColor">{{ latestPct }}%</span>
    </div>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-16"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([LineChart, GridComponent, CanvasRenderer])

const props = defineProps<{ hostName: string }>()
defineEmits<{ click: [] }>()

const store = useDiskStore()

const option = computed(() => {
  const roots = store.hostRecords(props.hostName)
    .filter((r) => r.mountpoint === '/' && r.fsuse_pct !== null)
    .sort((a, b) => a.collected_at.localeCompare(b.collected_at))

  // Downsample to ~100 points for sparkline
  const step = Math.max(1, Math.floor(roots.length / 100))
  const sampled = roots.filter((_, i) => i % step === 0)

  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: sampled.map((r) => r.collected_at) },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data: sampled.map((r) => r.fsuse_pct),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: '#00d4ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.3)' },
            { offset: 1, color: 'rgba(0,212,255,0.02)' },
          ],
        },
      },
    }],
  }
})

const latestPct = computed(() => {
  const roots = store.hostRecords(props.hostName)
    .filter((r) => r.mountpoint === '/' && r.fsuse_pct !== null)
  if (!roots.length) return '--'
  const latest = roots.reduce((a, b) =>
    a.collected_at > b.collected_at ? a : b
  )
  return latest.fsuse_pct?.toString() ?? '--'
})

const trendColor = computed(() => {
  const pct = parseInt(latestPct.value)
  if (isNaN(pct)) return 'text-white/40'
  if (pct >= 80) return 'text-alert-danger'
  if (pct >= 60) return 'text-alert-warning'
  return 'text-accent-teal'
})
</script>
