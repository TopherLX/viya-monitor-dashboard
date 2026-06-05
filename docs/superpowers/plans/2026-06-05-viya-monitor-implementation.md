# Viya Monitor Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static-site SAS Viya disk usage dashboard with Vue 3 + TypeScript + Tailwind + ECharts, deployable to GitHub Pages.

**Architecture:** Vue Router 4 for 4 routes (overview + 3 server details), Pinia store loading 180-day hourly JSON from `/public/`, ECharts custom theme with glass-morphism aesthetic. Data fetched at runtime from static JSON asset.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), TypeScript, Vite 6, Vue Router 4, Pinia, Tailwind CSS 3, ECharts 5 + vue-echarts, pnpm

---

## File Structure

```
viya-monitor-dashboard/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── public/
│   └── viya_server_usage_simulated.json    # moved from root
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── env.d.ts                    # Vite client types
│   ├── types/
│   │   └── index.ts                # DiskRecord, HostSummary interfaces
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── diskStore.ts
│   ├── theme/
│   │   └── echarts.ts              # Custom ECharts theme
│   ├── layouts/
│   │   └── AppLayout.vue
│   ├── pages/
│   │   ├── OverviewPage.vue
│   │   └── ServerDetailPage.vue
│   └── components/
│       ├── ServerCard.vue
│       ├── UsageBarChart.vue
│       ├── TrendSparkline.vue
│       ├── DeviceHierarchy.vue
│       ├── MountTrendChart.vue
│       └── CapacityPanel.vue
```

---

## Phase 1: Project Scaffold

### Task 1: Create package.json with all dependencies

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "viya-monitor-dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "echarts": "^5.6.0",
    "pinia": "^2.3.1",
    "vue": "^3.5.17",
    "vue-echarts": "^7.0.3",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.3",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.3",
    "vite": "^6.3.1",
    "vue-tsc": "^2.2.8"
  }
}
```

- [ ] **Step 2: Run pnpm install**

```bash
pnpm install
```
Expected: installs all packages, creates `pnpm-lock.yaml` and `node_modules/`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: scaffold project with dependencies"
```

---

### Task 2: Create TypeScript, Vite, and PostCSS config

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `vite.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/env.d.ts`

- [ ] **Step 1: Write tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 2: Write tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "src/env.d.ts"]
}
```

- [ ] **Step 3: Write vite.config.ts**

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: './',
})
```

- [ ] **Step 4: Write postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Viya Monitor Dashboard</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="min-h-screen" style="background: linear-gradient(135deg, #0a0a2e 0%, #1a1040 50%, #0d1137 100%)">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Write src/env.d.ts**

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 7: Write src/main.ts**

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 8: Create CSS entry and App.vue placeholder**

```bash
mkdir -p src/assets src/router src/stores src/types src/theme src/layouts src/pages src/components
```

Write `src/assets/main.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Write `src/App.vue`:
```vue
<template>
  <RouterView />
</template>
```

Write `src/router/index.ts`:
```ts
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [],
})

export default router
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add Vite, TypeScript, PostCSS, Vue entry config"
```

---

### Task 3: Configure Tailwind with glass-morphism theme

**Files:**
- Create: `tailwind.config.ts`
- Modify: `src/assets/main.css`

- [ ] **Step 1: Write tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a2e',
        'bg-secondary': '#1a1040',
        'bg-tertiary': '#0d1137',
        'glass-surface': 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.1)',
        'glass-hover': 'rgba(255,255,255,0.08)',
        'accent-cyan': '#00d4ff',
        'accent-teal': '#00ffc8',
        'accent-purple': '#7c3aed',
        'accent-purple-light': '#a78bfa',
        'alert-warning': '#f59e0b',
        'alert-danger': '#f43f5e',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.4)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 2: Update src/assets/main.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-glass-border;
  }
  body {
    @apply text-white/90 antialiased;
  }
}

@layer components {
  .glass-panel {
    @apply rounded-2xl border border-glass-border bg-glass-surface backdrop-blur-xl;
  }
  .glass-panel-hover {
    @apply glass-panel transition-all duration-300 hover:bg-glass-hover hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-cyan/10;
  }
  .gradient-text {
    @apply bg-gradient-to-r from-accent-cyan to-accent-teal bg-clip-text text-transparent;
  }
  .gradient-text-purple {
    @apply bg-gradient-to-r from-accent-purple to-accent-purple-light bg-clip-text text-transparent;
  }
  .glow-border {
    @apply border border-accent-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.15)];
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind glass-morphism theme config"
```

---

## Phase 2: Foundation

### Task 4: Define TypeScript interfaces

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write types/index.ts**

```ts
export interface DiskRecord {
  host_name: string
  host_ip: string
  parent_device: string | null
  device_name: string
  device_type: 'disk' | 'part' | 'lvm'
  mountpoint: string | null
  size_bytes: number
  fsuse_pct: number | null
  collected_at: string
}

export interface HostSummary {
  hostName: string
  hostIp: string
  totalBytes: number
  usedBytes: number
  deviceCount: number
  criticalMounts: { mountpoint: string; fsusePct: number; deviceName: string }[]
}

export interface DeviceInfo {
  deviceName: string
  parentDevice: string | null
  deviceType: 'disk' | 'part' | 'lvm'
  mountpoint: string | null
  sizeBytes: number
  fsusePct: number | null
  children: DeviceInfo[]
}

export interface TimeSeriesPoint {
  time: string
  pct: number
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm vue-tsc -b --noEmit 2>&1 || true
```
Expected: no type errors from the new file.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add DiskRecord and aggregate type definitions"
```

---

### Task 5: Build Pinia diskStore

**Files:**
- Create: `src/stores/diskStore.ts`
- Modify: `simulate_data.py` — update output path to `public/`
- Move data file to public/

- [ ] **Step 1: Move data file to public/**

```bash
cp viya_server_usage_simulated.json public/viya_server_usage_simulated.json
```

- [ ] **Step 2: Update simulate_data.py output path**

Change line in `simulate_data.py`:
```python
OUTPUT = ROOT / "public" / "viya_server_usage_simulated.json"
```

- [ ] **Step 3: Write stores/diskStore.ts**

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DiskRecord, HostSummary, DeviceInfo, TimeSeriesPoint } from '@/types'

export const useDiskStore = defineStore('disk', () => {
  const records = ref<DiskRecord[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const resp = await fetch('/viya_server_usage_simulated.json')
      records.value = await resp.json()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const hosts = computed<string[]>(() => {
    const set = new Set(records.value.map((r) => r.host_name))
    return Array.from(set).sort()
  })

  const latestTimestamp = computed<string>(() => {
    if (!records.value.length) return ''
    return records.value.reduce((max, r) =>
      r.collected_at > max ? r.collected_at : max, records.value[0].collected_at
    )
  })

  const latestSnapshot = computed<DiskRecord[]>(() => {
    const ts = latestTimestamp.value
    return records.value.filter((r) => r.collected_at === ts)
  })

  function hostRecords(hostName: string): DiskRecord[] {
    return records.value.filter((r) => r.host_name === hostName)
  }

  function hostSummary(hostName: string): HostSummary | null {
    const hostRecs = hostRecords(hostName)
    if (!hostRecs.length) return null

    const latest = latestTimestamp.value
    const current = hostRecs.filter((r) => r.collected_at === latest)

    let totalBytes = 0
    let usedBytes = 0
    const criticalMounts: HostSummary['criticalMounts'] = []

    for (const r of current) {
      totalBytes += r.size_bytes
      if (r.fsuse_pct !== null && r.mountpoint) {
        usedBytes += (r.size_bytes * r.fsuse_pct) / 100
        if (r.fsuse_pct >= 70) {
          criticalMounts.push({
            mountpoint: r.mountpoint,
            fsusePct: r.fsuse_pct,
            deviceName: r.device_name,
          })
        }
      }
    }

    const hostIp = hostRecs[0].host_ip
    const deviceCount = new Set(current.map((r) => r.device_name)).size

    return {
      hostName,
      hostIp,
      totalBytes,
      usedBytes,
      deviceCount,
      criticalMounts: criticalMounts.sort((a, b) => b.fsusePct - a.fsusePct),
    }
  }

  function hostDevices(hostName: string): DeviceInfo[] {
    const latest = latestTimestamp.value
    const current = records.value.filter(
      (r) => r.host_name === hostName && r.collected_at === latest
    )

    const byParent = new Map<string | null, DiskRecord[]>()
    for (const r of current) {
      const key = r.parent_device || null
      if (!byParent.has(key)) byParent.set(key, [])
      byParent.get(key)!.push(r)
    }

    function buildTree(parent: string | null): DeviceInfo[] {
      const children = byParent.get(parent) || []
      return children.map((r) => ({
        deviceName: r.device_name,
        parentDevice: r.parent_device,
        deviceType: r.device_type,
        mountpoint: r.mountpoint,
        sizeBytes: r.size_bytes,
        fsusePct: r.fsuse_pct,
        children: buildTree(r.device_name),
      }))
    }

    return buildTree(null)
  }

  function timeSeries(hostName: string, deviceName: string): TimeSeriesPoint[] {
    return records.value
      .filter((r) => r.host_name === hostName && r.device_name === deviceName)
      .sort((a, b) => a.collected_at.localeCompare(b.collected_at))
      .map((r) => ({ time: r.collected_at, pct: r.fsuse_pct ?? 0 }))
  }

  function mountpointsForHost(hostName: string): string[] {
    const latest = latestTimestamp.value
    const mps = records.value
      .filter((r) => r.host_name === hostName && r.collected_at === latest && r.mountpoint)
      .map((r) => r.mountpoint!)
    return Array.from(new Set(mps)).sort()
  }

  return {
    records,
    loaded,
    loading,
    load,
    hosts,
    latestTimestamp,
    latestSnapshot,
    hostRecords,
    hostSummary,
    hostDevices,
    timeSeries,
    mountpointsForHost,
  }
})
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
pnpm vue-tsc -b --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Pinia diskStore with aggregation getters"
```

---

### Task 6: Custom ECharts theme

**Files:**
- Create: `src/theme/echarts.ts`

- [ ] **Step 1: Write theme/echarts.ts**

```ts
import * as echarts from 'echarts/core'
import { BarChart, LineChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  GraphicComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  GraphicComponent,
  CanvasRenderer,
])

export const chartTheme = {
  color: ['#00d4ff', '#7c3aed', '#00ffc8', '#a78bfa', '#f59e0b', '#f43f5e'],
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(255,255,255,0.7)' },
  title: { textStyle: { color: '#ffffff' } },
  legend: {
    textStyle: { color: 'rgba(255,255,255,0.7)' },
  },
  tooltip: {
    backgroundColor: 'rgba(10,10,46,0.9)',
    borderColor: 'rgba(255,255,255,0.15)',
    textStyle: { color: '#ffffff' },
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  gauge: {
    axisLine: {
      lineStyle: {
        color: [[0.3, '#00ffc8'], [0.7, '#f59e0b'], [1, '#f43f5e']],
      },
    },
    axisTick: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' },
    detail: { color: '#ffffff' },
    title: { color: 'rgba(255,255,255,0.7)' },
  },
}

echarts.registerTheme('viya-glass', chartTheme)

export { echarts }
```

- [ ] **Step 2: Verify compilation**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/theme/echarts.ts
git commit -m "feat: add custom ECharts glass-morphism theme"
```

---

### Task 7: Vue Router + AppLayout

**Files:**
- Modify: `src/router/index.ts`
- Create: `src/layouts/AppLayout.vue`
- Modify: `src/App.vue`
- Create: `src/pages/OverviewPage.vue` (placeholder)
- Create: `src/pages/ServerDetailPage.vue` (placeholder)

- [ ] **Step 1: Update router/index.ts**

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '@/pages/OverviewPage.vue'
import ServerDetailPage from '@/pages/ServerDetailPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: OverviewPage,
    },
    {
      path: '/server/:hostName',
      name: 'server-detail',
      component: ServerDetailPage,
      props: true,
    },
  ],
})

export default router
```

- [ ] **Step 2: Write layouts/AppLayout.vue**

```vue
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
```

- [ ] **Step 3: Update App.vue**

```vue
<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
</script>
```

- [ ] **Step 4: Write placeholder pages**

`src/pages/OverviewPage.vue`:
```vue
<template>
  <div>
    <h2 class="text-2xl font-bold gradient-text mb-6">Overview</h2>
    <p class="text-white/50">Server cards and charts will go here.</p>
  </div>
</template>
```

`src/pages/ServerDetailPage.vue`:
```vue
<template>
  <div>
    <h2 class="text-2xl font-bold gradient-text-purple mb-6 capitalize">{{ hostName }}</h2>
    <p class="text-white/50">Detail charts for {{ hostName }} will go here.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hostName: string }>()
</script>
```

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev --host 0.0.0.0
```
Expected: Vite dev server starts, visit http://localhost:5173 to see layout with sidebar and placeholder pages.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Vue Router, AppLayout with glass sidebar"
```

---

## Phase 3: Overview Page

### Task 8: ServerCard component

**Files:**
- Create: `src/components/ServerCard.vue`

```vue
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
```

- [ ] **Step 1: Create file and verify compilation**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServerCard.vue
git commit -m "feat: add ServerCard component with usage bar and critical alerts"
```

---

### Task 9: UsageBarChart component

**Files:**
- Create: `src/components/UsageBarChart.vue`

```vue
<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Mountpoint Usage Comparison</h3>
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
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const store = useDiskStore()

const option = computed(() => {
  const snapshot = store.latestSnapshot
  const withMount = snapshot.filter((r) => r.mountpoint && r.fsuse_pct !== null)
  const hosts = store.hosts
  const mountpoints = Array.from(new Set(withMount.map((r) => r.mountpoint!))).sort()

  const series = hosts.map((host) => ({
    name: host,
    type: 'bar' as const,
    data: mountpoints.map((mp) => {
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
  }))

  return {
    tooltip: { trigger: 'axis' as const },
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
      data: mountpoints,
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
```

- [ ] **Step 1: Create file and verify compilation**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UsageBarChart.vue
git commit -m "feat: add UsageBarChart component for mountpoint comparison"
```

---

### Task 10: TrendSparkline component

**Files:**
- Create: `src/components/TrendSparkline.vue`

```vue
<template>
  <div class="glass-panel p-4 group cursor-pointer" @click="$emit('click')">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-white/60 capitalize">{{ hostName }}</span>
      <span class="text-xs font-mono" :class="trendColor">{{ latestPct }}%</span>
    </div>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-16"
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
defineEmits<{ click: [] }>()

const store = useDiskStore()

const option = computed(() => {
  const roots = store.hostRecords(props.hostName)
    .filter((r) => r.mountpoint === '/' && r.fsuse_pct !== null)
    .sort((a, b) => a.collected_at.localeCompare(b.collected_at))

  // Downsample to ~100 points for sparkline
  const step = Math.max(1, Math.floor(roots.length / 100))
  const sampled = roots.filter((_, i) => i % step === 0)

  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: sampled.map((r) => r.collected_at) },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data: sampled.map((r) => r.fsuse_pct),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: '#00d4ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.3)' },
            { offset: 1, color: 'rgba(0,212,255,0.02)' },
          ],
        },
      },
    }],
  }
})

const latestPct = computed(() => {
  const roots = store.hostRecords(props.hostName)
    .filter((r) => r.mountpoint === '/' && r.fsuse_pct !== null)
  if (!roots.length) return '--'
  const latest = roots.reduce((a, b) =>
    a.collected_at > b.collected_at ? a : b
  )
  return latest.fsuse_pct?.toString() ?? '--'
})

const trendColor = computed(() => {
  const pct = parseInt(latestPct.value)
  if (isNaN(pct)) return 'text-white/40'
  if (pct >= 80) return 'text-alert-danger'
  if (pct >= 60) return 'text-alert-warning'
  return 'text-accent-teal'
})
</script>
```

- [ ] **Step 1: Create file and verify compilation**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TrendSparkline.vue
git commit -m "feat: add TrendSparkline component with mini 24h chart"
```

---

### Task 11: Assemble OverviewPage

**Files:**
- Modify: `src/pages/OverviewPage.vue`

```vue
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <UsageBarChart />
        </div>
        <div class="flex flex-col gap-4">
          <TrendSparkline
            v-for="host in store.hosts"
            :key="host"
            :hostName="host"
            @click="$router.push(`/server/${host}`)"
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
```

- [ ] **Step 1: Verify compilation and test in browser**

```bash
pnpm vue-tsc -b --noEmit && pnpm dev --host 0.0.0.0
```
Expected: Overview page with 3 server cards, bar chart, and sparklines.

- [ ] **Step 2: Commit**

```bash
git add src/pages/OverviewPage.vue
git commit -m "feat: assemble OverviewPage with cards, bar chart, and sparklines"
```

---

## Phase 4: Server Detail Page

### Task 12: DeviceHierarchy component

**Files:**
- Create: `src/components/DeviceHierarchy.vue`

```vue
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
```

Create `src/components/DeviceNode.vue`:

```vue
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
        :class="typeBadgeClass"
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

const typeBadgeClass = {
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
```

- [ ] **Step 1: Create both files and verify**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DeviceHierarchy.vue src/components/DeviceNode.vue
git commit -m "feat: add DeviceHierarchy tree with expandable device nodes"
```

---

### Task 13: MountTrendChart component

**Files:**
- Create: `src/components/MountTrendChart.vue`

```vue
<template>
  <div class="glass-panel p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-white/70">Mountpoint Trends</h3>
      <div class="flex gap-2">
        <button
          v-for="range in ranges"
          :key="range.label"
          class="px-2 py-1 text-xs rounded-md transition-colors"
          :class="selectedRange === range.days
            ? 'bg-accent-cyan/20 text-accent-cyan'
            : 'text-white/40 hover:text-white/70'"
          @click="selectedRange = range.days"
        >{{ range.label }}</button>
      </div>
    </div>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useDiskStore } from '@/stores/diskStore'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ hostName: string }>()

const store = useDiskStore()
const selectedRange = ref(7)
const ranges = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '180d', days: 180 },
]

const colors = ['#00d4ff', '#00ffc8', '#7c3aed', '#a78bfa', '#f59e0b', '#f43f5e']

const option = computed(() => {
  const mountpoints = store.mountpointsForHost(props.hostName)
  const allTimes = new Set<string>()

  const seriesData = mountpoints.map((mp) => {
    const entries = store.hostRecords(props.hostName)
      .filter((r) => r.mountpoint === mp && r.fsuse_pct !== null)
      .sort((a, b) => a.collected_at.localeCompare(b.collected_at))

    // Filter by selected range
    if (selectedRange.value < 180) {
      const cutoff = entries.length > selectedRange.value * 24
        ? entries[entries.length - selectedRange.value * 24].collected_at
        : entries[0]?.collected_at ?? ''
      const filtered = entries.filter((r) => r.collected_at >= cutoff)
      filtered.forEach((r) => allTimes.add(r.collected_at))
      return { name: mp, data: filtered.map((r) => [r.collected_at, r.fsuse_pct]) }
    }

    entries.forEach((r) => allTimes.add(r.collected_at))
    return { name: mp, data: entries.map((r) => [r.collected_at, r.fsuse_pct]) }
  })

  const times = Array.from(allTimes).sort()

  return {
    tooltip: { trigger: 'axis' as const },
    legend: {
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: times,
      axisLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        formatter: (val: string) => {
          const d = val.split(' ')[0]
          return d.slice(5) // "MM-DD"
        },
      },
    },
    yAxis: {
      type: 'value' as const,
      name: '%',
      max: 100,
      axisLabel: { color: 'rgba(255,255,255,0.5)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: seriesData.map((s, i) => ({
      ...s,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: colors[i % colors.length] },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: colors[i % colors.length].replace(')', ',0.2)').replace('rgb', 'rgba') },
            { offset: 1, color: 'rgba(0,0,0,0)' },
          ],
        },
      },
    })),
  }
})
</script>
```

- [ ] **Step 1: Create file and verify**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MountTrendChart.vue
git commit -m "feat: add MountTrendChart with time range selector"
```

---

### Task 14: CapacityPanel component

**Files:**
- Create: `src/components/CapacityPanel.vue`

```vue
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
```

- [ ] **Step 1: Create file and verify**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CapacityPanel.vue
git commit -m "feat: add CapacityPanel with SVG gauge rings per mountpoint"
```

---

### Task 15: Assemble ServerDetailPage

**Files:**
- Modify: `src/pages/ServerDetailPage.vue`

```vue
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
```

- [ ] **Step 1: Verify compilation and test**

```bash
pnpm vue-tsc -b --noEmit
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ServerDetailPage.vue
git commit -m "feat: assemble ServerDetailPage with capacity, hierarchy, and trends"
```

---

## Phase 5: Build & Deploy

### Task 16: Build verification

- [ ] **Step 1: Run full build**

```bash
pnpm build
```
Expected: builds successfully to `dist/`, no TypeScript errors.

- [ ] **Step 2: Check bundle size**

```bash
ls -lh dist/assets/*.js dist/assets/*.css
du -sh public/viya_server_usage_simulated.json
```

- [ ] **Step 3: Preview locally**

```bash
pnpm preview
```
Expected: visit http://localhost:4173, verify all pages render with data.

- [ ] **Step 4: Fix any issues discovered during build/preview**

If ECharts barrel exports cause large bundle, verify tree-shaking works by checking
that only BarChart, LineChart, GaugeChart are in the final bundle.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify production build passes"
```

---

### Task 17: GitHub Actions deploy config

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

---

## Implementation Order

```
T1 → T2 → T3    (scaffold)
T4 → T5 → T6 → T7  (foundation)
T8 → T9 → T10 → T11 (overview page)
T12 → T13 → T14 → T15 (detail page)
T16 → T17  (build & deploy)
```

Tasks within each phase are sequential; phases can be checkpoints for review.
