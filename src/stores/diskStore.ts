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
