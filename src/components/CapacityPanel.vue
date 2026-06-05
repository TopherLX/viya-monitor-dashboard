<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Capacity Overview</h3>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="m in mountpoints"
        :key="m.mountpoint"
        class="text-center"
      >
        <div class="relative inline-flex items-center justify-center w-24 h-24 mb-2">
          <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              stroke-width="3"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              :stroke="gaugeColor(m.fsusePct)"
              stroke-width="3"
              :stroke-dasharray="`${m.fsusePct * 0.973} 100`"
              stroke-linecap="round"
              class="transition-all duration-700"
            />
          </svg>
          <span class="text-lg font-bold font-mono" :class="textColor(m.fsusePct)">
            {{ m.fsusePct }}%
          </span>
        </div>
        <div class="text-xs text-accent-teal font-mono">{{ m.mountpoint }}</div>
        <div class="text-[10px] text-white/30 font-mono mt-0.5">{{ formatBytes(m.sizeBytes) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiskStore } from '@/stores/diskStore'

const props = defineProps<{ hostName: string }>()

const store = useDiskStore()

interface MountInfo {
  mountpoint: string
  fsusePct: number
  sizeBytes: number
}

const mountpoints = computed<MountInfo[]>(() => {
  const latest = store.latestTimestamp
  return store.hostRecords(props.hostName)
    .filter((r) => r.collected_at === latest && r.mountpoint && r.fsuse_pct !== null)
    .map((r) => ({
      mountpoint: r.mountpoint!,
      fsusePct: r.fsuse_pct!,
      sizeBytes: r.size_bytes,
    }))
    .sort((a, b) => b.fsusePct - a.fsusePct)
})

function gaugeColor(pct: number): string {
  if (pct >= 80) return '#f43f5e'
  if (pct >= 60) return '#f59e0b'
  return '#00ffc8'
}

function textColor(pct: number): string {
  if (pct >= 80) return 'text-alert-danger'
  if (pct >= 60) return 'text-alert-warning'
  return 'text-accent-teal'
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
</script>
