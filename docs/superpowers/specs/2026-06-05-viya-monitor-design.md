# Viya Monitor Dashboard — Design Spec

**Date:** 2026-06-05
**Status:** draft

## Overview

SAS Viya server disk usage monitoring dashboard, deployed as a static site to
GitHub Pages. Visualizes 180 days of hourly disk usage data across 3 servers
(master, worker1, worker2) with a liquid-glass, tech-forward aesthetic.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Routing | Vue Router 4 |
| State | Pinia |
| Styling | Tailwind CSS |
| Charts | ECharts 5 |
| Package manager | pnpm |

## Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | OverviewPage | Server summary cards + comparison chart |
| `/server/:hostName` | ServerDetailPage | Per-server trend charts, device hierarchy, gauges |

## Data Model

Source: `viya_server_usage_simulated.json` (99,360 records).

```ts
interface DiskRecord {
  host_name: string       // "master" | "worker1" | "worker2"
  host_ip: string
  parent_device: string | null
  device_name: string
  device_type: "disk" | "part" | "lvm"
  mountpoint: string | null
  size_bytes: number
  fsuse_pct: number | null   // null for raw disks
  collected_at: string       // "2025-12-07 00:00:00"
}
```

## Pinia Store: `useDiskStore`

Responsibilities:
- Load JSON on first access (lazy)
- Expose raw records via `records` ref
- Provide getters for common aggregations

Key getters:

| Getter | Signature | Returns |
|--------|-----------|---------|
| `hosts` | `() => string[]` | `["master", "worker1", "worker2"]` sorted |
| `hostSummary(hostName)` | `(host: string) => HostSummary` | Aggregated stats per host |
| `hostDevices(hostName)` | `(host: string) => DeviceInfo[]` | Device list with hierarchy |
| `timeSeries(hostName, deviceName)` | `(host, dev) => {time:string, pct:number}[]` | Time series for charting |
| `latestSnapshot` | `() => DiskRecord[]` | Most recent collection (23 records) |

```ts
interface HostSummary {
  hostName: string
  hostIp: string
  totalBytes: number        // sum of all disk sizes
  usedBytes: number         // weighted by fsuse_pct where available
  devicesWithMountpoint: number
  criticalMounts: { mountpoint: string; fsuse_pct: number }[]
}
```

## Component Tree

```
App.vue
└── AppLayout.vue            # glass shell: nav sidebar + content area
    ├── OverviewPage.vue     # route: /
    │   ├── ServerCard.vue   # ×3, click navigates to /server/:hostName
    │   ├── UsageBarChart.vue # ECharts bar: per-mountpoint comparison
    │   └── TrendSparkline.vue # ×3, mini 24h trend per server
    │
    └── ServerDetailPage.vue # route: /server/:hostName
        ├── DeviceHierarchy.vue   # Collapsible tree: disk → part → lvm
        ├── MountTrendChart.vue   # ECharts multi-line: fsuse_pct over time
        └── CapacityPanel.vue     # ECharts gauges + size info per mountpoint
```

## Design: Liquid Glass + Tech Aesthetic

### Color Palette (no gray/black)

| Role | Value |
|------|-------|
| Background | Deep blue-violet gradient: `#0a0a2e` → `#1a1040` → `#0d1137` |
| Glass surface | `rgba(255,255,255,0.05)` + `backdrop-blur-xl` + `border: rgba(255,255,255,0.1)` |
| Accent primary | Cyan/teal gradient: `#00d4ff` → `#00ffc8` |
| Accent secondary | Purple gradient: `#7c3aed` → `#a78bfa` |
| Warning | Amber: `#f59e0b` |
| Danger | Rose: `#f43f5e` |
| Text | White: `#ffffff` at 90%/70%/50% opacity tiers |

### Visual Elements

- **Glass panels**: `backdrop-blur-xl` on semi-transparent backgrounds, subtle border glow
- **Animated gradients**: CSS keyframes on accent elements (borders, chart highlights)
- **Hover states**: Scale + glow intensifies
- **ECharts themes**: Custom theme matching the palette — transparent grids, cyan/teal data lines, no default gray chart chrome

## ECharts Integration

- Init charts via `vue-echarts` wrapper or raw `echarts.init` in `onMounted`
- Custom ECharts theme object replaces all default gray elements
- Responsive: charts resize on window change via `echarts.resize()`
- Lazy load ECharts per component (avoids loading chart code on non-chart views)

## Project Structure

```
viya-monitor-dashboard/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── diskStore.ts
│   ├── data/
│   │   └── viya_server_usage_simulated.json  (symlink or copy)
│   ├── theme/
│   │   └── echarts.ts           # Custom ECharts theme
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
├── viya_server_usage_all.json          # Baseline snapshot
├── viya_server_usage_simulated.json    # Generated 180-day data
├── simulate_data.py                    # Data generation script
├── pyproject.toml
├── CLAUDE.md
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-05-viya-monitor-design.md
```

## Data Loading Strategy

Since this is a static site, the JSON is imported directly:

```ts
// stores/diskStore.ts
import raw from '@/data/viya_server_usage_simulated.json'
```

The file is ~14MB. For GitHub Pages, it'll ship alongside the JS bundle.
At build time Vite handles it as a static asset. At runtime, the store parses
it once on first access.

Trade-off: 14MB is large for a static site (≈3.5MB gzipped). If performance
becomes an issue, options:
- Pre-aggregate to smaller JSON files per host/time-granularity
- Move to a tiny backend (e.g. Cloudflare Workers) that serves pre-filtered chunks
- For MVP, ship as-is and optimize later

## Build & Deploy

```bash
pnpm build              # Vite build → dist/
```

GitHub Pages deployment via GitHub Actions:
- Trigger on push to `main`
- `pnpm install && pnpm build`
- Deploy `dist/` to `gh-pages` branch

## Open Decisions

1. **14MB JSON payload** — Accept for MVP, or pre-aggregate now?
2. **ECharts theme detail** — Design exact theme after project scaffold is up
3. **Responsive breakpoints** — Mobile support scope TBD
