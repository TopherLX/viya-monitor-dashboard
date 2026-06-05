<template>
  <router-link
    :to="`/server/${summary.hostName}`"
    class="glass-panel-hover p-6 block group cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold capitalize text-white">{{ summary.hostName }}</h3>
      <span class="text-xs text-white/40 font-mono">{{ summary.hostIp }}</span>
    </div>

    <!-- Usage Bar -->
    <div class="mb-3">
      <div class="flex justify-between text-xs text-white/50 mb-1">
        <span>Disk Usage</span>
        <span>{{ usagePercent }}%</span>
      </div>
      <div class="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="usageColor"
          :style="{ width: usagePercent + '%' }"
        />
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-3 text-xs text-white/50 mt-4">
      <div>
        <span class="block text-white/30">Total</span>
        <span class="text-white/70 font-mono">{{ formatBytes(summary.totalBytes) }}</span>
      </div>
      <div>
        <span class="block text-white/30">Devices</span>
        <span class="text-white/70 font-mono">{{ summary.deviceCount }}</span>
      </div>
    </div>

    <!-- Critical Warning -->
    <div v-if="summary.criticalMounts.length" class="mt-3 pt-3 border-t border-glass-border">
      <div class="flex items-center gap-1.5 text-xs text-alert-danger">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-alert-danger animate-pulse" />
        {{ summary.criticalMounts.length }} mount(s) above 70%
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HostSummary } from '@/types'

const props = defineProps<{ summary: HostSummary }>()

const usagePercent = computed(() => {
  if (props.summary.totalBytes === 0) return 0
  return Math.round((props.summary.usedBytes / props.summary.totalBytes) * 100)
})

const usageColor = computed(() => {
  if (usagePercent.value >= 80) return 'bg-alert-danger'
  if (usagePercent.value >= 60) return 'bg-alert-warning'
  return 'bg-gradient-to-r from-accent-cyan to-accent-teal'
})

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
</script>
