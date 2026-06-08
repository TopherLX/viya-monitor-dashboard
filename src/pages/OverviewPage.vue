<template>
  <div>
    <h2 class="text-2xl font-bold gradient-text mb-1">Overview</h2>
    <p class="text-sm text-white/30 mb-8">SAS Viya cluster disk usage at a glance</p>

    <!-- Loading State -->
    <div v-if="!store.loaded" class="flex items-center justify-center h-64">
      <div class="text-white/40 animate-pulse">Loading data...</div>
    </div>

    <template v-else>
      <!-- Server Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ServerCard
          v-for="host in store.hosts"
          :key="host"
          :summary="store.hostSummary(host)!"
        />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <UsageBarChart />
        </div>
        <div class="flex flex-col gap-3 h-full">
          <TrendSparkline
            v-for="host in store.hosts"
            :key="host"
            :hostName="host"
            class="flex-1"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDiskStore } from '@/stores/diskStore'
import ServerCard from '@/components/ServerCard.vue'
import UsageBarChart from '@/components/UsageBarChart.vue'
import TrendSparkline from '@/components/TrendSparkline.vue'

const store = useDiskStore()
</script>
