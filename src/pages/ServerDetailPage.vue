<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-4 mb-1">
      <router-link to="/" class="text-white/30 hover:text-white/70 transition-colors">
        &larr;
      </router-link>
      <h2 class="text-2xl font-bold capitalize gradient-text-purple">{{ hostName }}</h2>
      <span class="text-xs text-white/30 font-mono">{{ ip }}</span>
    </div>
    <p class="text-sm text-white/30 mb-8 ml-8">Disk usage details and trends</p>

    <!-- Content -->
    <div v-if="store.loaded" class="space-y-6">
      <!-- Capacity + Device Tree -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CapacityPanel :hostName="hostName" />
        <DeviceHierarchy :devices="store.hostDevices(hostName)" />
      </div>

      <!-- Trend Chart -->
      <MountTrendChart :hostName="hostName" />
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-white/40 animate-pulse">Loading data...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiskStore } from '@/stores/diskStore'
import CapacityPanel from '@/components/CapacityPanel.vue'
import DeviceHierarchy from '@/components/DeviceHierarchy.vue'
import MountTrendChart from '@/components/MountTrendChart.vue'

const props = defineProps<{ hostName: string }>()

const store = useDiskStore()

const ip = computed(() => {
  const recs = store.hostRecords(props.hostName)
  return recs.length ? recs[0].host_ip : ''
})
</script>
