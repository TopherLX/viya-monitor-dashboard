<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Mountpoint Usage Comparison</h3>

    <!-- Toggle Chips -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="mp in store.allMountpoints"
        :key="mp"
        @click="store.toggleMountpoint(mp)"
        class="px-3 py-1 text-xs rounded-full border transition-all duration-200"
        :class="store.selectedMountpoints.includes(mp)
          ? 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan'
          : 'border-white/10 bg-white/[0.02] text-white/30 hover:text-white/50 hover:border-white/20'"
      >
        {{ mp }}
      </button>
    </div>

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
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([BarChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, CanvasRenderer])

const store = useDiskStore()

const option = computed(() => {
  const snapshot = store.latestSnapshot
  const withMount = snapshot.filter((r) => r.mountpoint && r.fsuse_pct !== null)
  const hosts = store.hosts
  const mps = store.selectedMountpoints

  const markLine = {
    silent: true,
    symbol: 'none',
    z: 10,
    animation: false,
    label: { fontSize: 10, position: 'insideEndTop' as const },
    lineStyle: { type: 'dashed' as const, width: 2 },
    data: [
      { yAxis: 70, lineStyle: { color: '#fbbf24' }, label: { formatter: '70% 告警', color: '#fbbf24' } },
    ],
  }

  const series = hosts.map((host) => ({
    name: host.charAt(0).toUpperCase() + host.slice(1),
    type: 'bar' as const,
    data: mps.map((mp) => {
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
    markLine: host === 'master' ? markLine : undefined,
  }))

  return {
    tooltip: {
      trigger: 'axis' as const,
      valueFormatter: (val: number) => val + '%',
    },
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
      data: mps,
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
