<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Mountpoint Usage Comparison</h3>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-72"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const store = useDiskStore()

const option = computed(() => {
  const snapshot = store.latestSnapshot
  const withMount = snapshot.filter((r) => r.mountpoint && r.fsuse_pct !== null)
  const hosts = store.hosts
  const mountpoints = Array.from(new Set(withMount.map((r) => r.mountpoint!))).sort()

  const series = hosts.map((host) => ({
    name: host,
    type: 'bar' as const,
    data: mountpoints.map((mp) => {
      const rec = withMount.find((r) => r.host_name === host && r.mountpoint === mp)
      return rec?.fsuse_pct ?? 0
    }),
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
      color: host === 'master'
        ? 'rgba(0,212,255,0.7)'
        : host === 'worker1'
          ? 'rgba(124,58,237,0.7)'
          : 'rgba(167,139,250,0.7)',
    },
  }))

  return {
    tooltip: { trigger: 'axis' as const },
    legend: {
      textStyle: { color: 'rgba(255,255,255,0.6)' },
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: mountpoints,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Usage %',
      max: 100,
      axisLabel: { color: 'rgba(255,255,255,0.5)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series,
  }
})
</script>
