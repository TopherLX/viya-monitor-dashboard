<template>
  <div class="glass-panel p-6">
    <h3 class="text-sm font-semibold text-white/70 mb-4">Device Hierarchy — Sankey</h3>
    <VChart
      v-if="option"
      :option="option"
      :autoresize="true"
      class="h-80"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { SankeyChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { DeviceInfo } from '@/types'

use([SankeyChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{ devices: DeviceInfo[] }>()

interface SankeyNode { name: string; itemStyle: { color: string } }
interface SankeyLink { source: string; target: string; value: number }

const typeColors: Record<string, string> = {
  disk: '#8b5cf6',
  part: '#00dfff',
  lvm: '#00ffd0',
}

function deviceName(device: DeviceInfo): string {
  const short = device.deviceName.split('/').pop()!
  return device.mountpoint ? `${short} (${device.mountpoint})` : short
}

function buildSankey(devices: DeviceInfo[]): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const nodeSet = new Set<string>()
  const links: SankeyLink[] = []

  function walk(device: DeviceInfo) {
    const name = deviceName(device)
    nodeSet.add(name)

    for (const child of device.children) {
      walk(child)
      const childName = deviceName(child)
      links.push({ source: name, target: childName, value: child.sizeBytes })
    }
  }

  for (const d of devices) walk(d)

  return {
    nodes: Array.from(nodeSet).map((name) => {
      const isDisk = !links.some((l) => l.target === name)
      const hasMount = name.includes('(')
      const color = isDisk ? typeColors.disk : hasMount ? typeColors.lvm : typeColors.part
      return { name, itemStyle: { color } }
    }),
    links,
  }
}

const option = computed(() => {
  const { nodes, links } = buildSankey(props.devices)

  return {
    tooltip: {
      formatter: (p: any) => {
        if (p.dataType === 'node') {
          return `${p.name}`
        }
        const sourceNode = p.data.source as string
        const targetNode = p.data.target as string
        return `${sourceNode} → ${targetNode}<br/>Allocated: ${formatBytes(p.data.value)}`
      },
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' as const },
      nodeAlign: 'left' as const,
      layoutIterations: 0,
      nodeWidth: 16,
      nodeGap: 8,
      label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
      },
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
        opacity: 0.25,
      },
      data: nodes,
      links,
    }],
  }
})

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
</script>
