<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Device Hierarchy</h3>
    <ul class="space-y-1">
      <DeviceNode
        v-for="device in devices"
        :key="device.deviceName"
        :device="device"
        :depth="0"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { DeviceInfo } from '@/types'
import DeviceNode from './DeviceNode.vue'

defineProps<{ devices: DeviceInfo[] }>()
</script>
