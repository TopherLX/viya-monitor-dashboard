<template>
  <div class="glass-panel py-3 px-4 group cursor-pointer flex flex-col justify-center">
    <div class="grid grid-cols-[1fr_auto_1fr] items-center mb-1 shrink-0">
      <span class="text-xs text-white/60 capitalize">{{ hostName }}</span>
      <div class="flex items-center gap-3">
        <span
          v-for="mp in store.selectedMountpoints"
          :key="mp"
          class="flex items-center gap-1 text-[10px] text-white/40"
        >
          <span class="inline-block w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: mpColor(mp) }" />
          {{ mp }}
          <span class="text-white/25">{{ latestPct(mp) }}%</span>
        </span>
      </div>
      <div />
    </div>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="flex-1 min-h-0"
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

const store = useDiskStore()

const mpColors: Record<string, string> = {
  '/': '#00dfff',
  '/share/spre': '#fbbf24',
  '/saswork': '#8b5cf6',
  '/boot': '#34d399',
  '/boot/efi': '#f87171',
}
const fallbackColors = ['#00dfff', '#fbbf24', '#8b5cf6', '#34d399', '#f87171', '#c4b5fd']

function mpColor(mp: string) {
  return mpColors[mp] ?? fallbackColors[Math.abs(hash(mp)) % fallbackColors.length]
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h
}

const dailyAvgs = computed(() => {
  const result = new Map<string, { day: string; avg: number }[]>()
  for (const mp of store.selectedMountpoints) {
    const recs = store.hostRecords(props.hostName)
      .filter((r) => r.mountpoint === mp && r.fsuse_pct !== null)

    const byDay = new Map<string, number[]>()
    for (const r of recs) {
      const day = r.collected_at.slice(0, 10)
      if (!byDay.has(day)) byDay.set(day, [])
      byDay.get(day)!.push(r.fsuse_pct!)
    }

    result.set(mp, Array.from(byDay.entries())
      .map(([day, vals]) => ({
        day,
        avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      }))
      .sort((a, b) => a.day.localeCompare(b.day))
    )
  }
  return result
})

const option = computed(() => {
  if (!store.selectedMountpoints.length) return null

  const series = store.selectedMountpoints.map((mp) => {
    const data = dailyAvgs.value.get(mp) ?? []
    return {
      name: mp,
      type: 'line' as const,
      data: data.map((d) => d.avg),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1.5, color: mpColor(mp) },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba(mpColor(mp), 0.25) },
            { offset: 1, color: 'rgba(0,0,0,0)' },
          ],
        },
      },
    }
  })

  const days = dailyAvgs.value.get(store.selectedMountpoints[0])?.map((d) => d.day) ?? []

  return {
    grid: { left: 10, right: 10, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: days, boundaryGap: false },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series,
  }
})

function latestPct(mp: string) {
  const data = dailyAvgs.value.get(mp)
  if (!data?.length) return '--'
  return data[data.length - 1].avg
}
</script>
