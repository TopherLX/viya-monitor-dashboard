<template>
  <li>
    <div
      class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-glass-hover transition-colors cursor-pointer select-none"
      :style="{ paddingLeft: (depth * 20 + 8) + 'px' }"
      @click="expanded = !expanded"
    >
      <!-- Expand arrow -->
      <span
        v-if="device.children.length"
        class="text-white/30 text-xs transition-transform"
        :class="{ 'rotate-90': expanded }"
      >&#9654;</span>
      <span v-else class="w-3" />

      <!-- Type badge -->
      <span
        class="text-[10px] uppercase px-1.5 py-0.5 rounded font-mono"
        :class="typeBadgeClass[device.deviceType]"
      >{{ device.deviceType }}</span>

      <!-- Device name -->
      <span class="text-sm text-white/80 truncate">{{ device.deviceName.split('/').pop() }}</span>

      <!-- Mountpoint -->
      <span v-if="device.mountpoint" class="text-xs text-accent-teal font-mono ml-auto">
        {{ device.mountpoint }}
      </span>

      <!-- Size -->
      <span class="text-xs text-white/40 font-mono ml-2">
        {{ formatBytes(device.sizeBytes) }}
      </span>

      <!-- Usage -->
      <span
        v-if="device.fsusePct !== null"
        class="text-xs font-mono ml-1"
        :class="usageColor(device.fsusePct)"
      >{{ device.fsusePct }}%</span>
    </div>

    <!-- Children -->
    <ul v-if="expanded && device.children.length" class="space-y-1">
      <DeviceNode
        v-for="child in device.children"
        :key="child.deviceName"
        :device="child"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DeviceInfo } from '@/types'

defineProps<{ device: DeviceInfo; depth: number }>()

const expanded = ref(true)

const typeBadgeClass: Record<string, string> = {
  disk: 'bg-accent-purple/20 text-accent-purple-light',
  part: 'bg-accent-cyan/20 text-accent-cyan',
  lvm: 'bg-accent-teal/20 text-accent-teal',
}

function usageColor(pct: number): string {
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
