<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 border-r border-glass-border bg-glass-surface/30 backdrop-blur-xl">
      <div class="flex flex-col h-full p-6">
        <!-- Logo -->
        <router-link to="/" class="block mb-8">
          <h1 class="text-xl font-bold gradient-text">Viya Monitor</h1>
          <p class="text-xs text-white/40 mt-1">SAS Viya Disk Dashboard</p>
        </router-link>

        <!-- Nav Links -->
        <nav class="flex flex-col gap-1 flex-1">
          <router-link
            to="/"
            class="px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-glass-hover transition-colors"
            :class="{ 'bg-glass-surface text-white': $route.path === '/' }"
          >
            Overview
          </router-link>

          <div class="mt-4 mb-1 text-xs text-white/30 uppercase tracking-wider px-3">
            Servers
          </div>

          <router-link
            v-for="host in hosts"
            :key="host"
            :to="`/server/${host}`"
            class="px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-glass-hover transition-colors capitalize"
            :class="{ 'bg-glass-surface text-white': $route.params.hostName === host }"
          >
            {{ host }}
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="text-xs text-white/20 pt-4 border-t border-glass-border">
          Last update: {{ lastUpdate }}
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDiskStore } from '@/stores/diskStore'

const store = useDiskStore()

onMounted(() => store.load())

const hosts = computed(() => store.hosts)
const lastUpdate = computed(() => store.latestTimestamp || 'Loading...')
</script>
