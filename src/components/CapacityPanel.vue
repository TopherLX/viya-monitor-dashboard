<template>
  <div class="glass-panel p-6 flex flex-col h-full">
    <h3 class="text-sm font-semibold text-white/70 mb-3 shrink-0">Capacity Overview</h3>

    <div class="flex flex-wrap gap-2 mb-3 shrink-0">
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

    <div class="flex-1 flex flex-wrap gap-6 justify-center items-center">
      <div
        v-for="m in filteredMounts"
        :key="m.mountpoint"
        class="flex flex-col items-center justify-center"
      >
        <div class="relative inline-flex items-center justify-center w-44 h-44 mb-2">
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
              :stroke-dasharray="`${(animatedPct[m.mountpoint] ?? 0) * 0.973} 100`"
              stroke-linecap="round"
              class="transition-all duration-700 ease-out"
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
import { computed, ref, onMounted, watch } from 'vue'
import { useDiskStore } from '@/stores/diskStore'

const props = defineProps<{ hostName: string }>()

const store = useDiskStore()
const animatedPct = ref<Record<string, number>>({})

function animate() {
  animatedPct.value = {}
  requestAnimationFrame(() => {
    const next: Record<string, number> = {}
    filteredMounts.value.forEach((m) => { next[m.mountpoint] = m.fsusePct })
    animatedPct.value = next
  })
}

onMounted(animate)
watch(() => props.hostName, animate)

interface MountInfo {
  mountpoint: string
  fsusePct: number
  sizeBytes: number
}

const filteredMounts = computed<MountInfo[]>(() => {
  const hostRecs = store.hostRecords(props.hostName)
  if (!hostRecs.length) return []
  const latestHour = hostRecs.reduce((max, r) =>
    r.collected_at > max ? r.collected_at : max, hostRecs[0].collected_at
  ).slice(0, 13)
  return hostRecs
    .filter((r) => r.collected_at.slice(0, 13) === latestHour && r.mountpoint && r.fsuse_pct !== null)
    .filter((r) => store.selectedMountpoints.includes(r.mountpoint!))
    .map((r) => ({
      mountpoint: r.mountpoint!,
      fsusePct: r.fsuse_pct!,
      sizeBytes: r.size_bytes,
    }))
    .sort((a, b) => {
      const order = ['/', '/share/spre', '/saswork', '/boot', '/boot/efi']
      const ia = order.indexOf(a.mountpoint)
      const ib = order.indexOf(b.mountpoint)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
})

function gaugeColor(pct: number): string {
  if (pct >= 80) return '#f87171'
  if (pct >= 60) return '#fbbf24'
  return '#00ffd0'
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
