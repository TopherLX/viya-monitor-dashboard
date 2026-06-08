import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { DiskRecord, HostSummary, DeviceInfo, TimeSeriesPoint } from '@/types'

export const useDiskStore = defineStore('disk', () => {
  const records = ref<DiskRecord[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const base = import.meta.env.PROD ? import.meta.env.BASE_URL : '/'
      const resp = await fetch(base + 'viya_server_usage.json')
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
    return hosts.value.flatMap((host) => {
      const hostRecs = records.value.filter((r) => r.host_name === host)
      if (!hostRecs.length) return []
      const latestHour = hostLatestHour(hostRecs)
      return hostRecs.filter((r) => sameHour(r.collected_at, latestHour))
    })
  })

  // --- Mountpoint selection (shared between bar chart & sparkline) ---
  const mountpointOrder = ['/', '/share/spre', '/saswork', '/boot', '/boot/efi']

  const allMountpoints = computed(() => {
    const withMount = latestSnapshot.value.filter((r) => r.mountpoint && r.fsuse_pct !== null)
    const mps = Array.from(new Set(withMount.map((r) => r.mountpoint!)))
    return mps.sort((a, b) => {
      const ia = mountpointOrder.indexOf(a)
      const ib = mountpointOrder.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  })

  const hiddenMountpoints = ref<Set<string>>(new Set())

  watch(allMountpoints, (mps) => {
    hiddenMountpoints.value = new Set(
      mps.filter((mp) => mp === '/boot' || mp === '/boot/efi')
    )
  }, { immediate: true })

  const selectedMountpoints = computed(() =>
    allMountpoints.value.filter((mp) => !hiddenMountpoints.value.has(mp))
  )

  function toggleMountpoint(mp: string) {
    const next = new Set(hiddenMountpoints.value)
    if (next.has(mp)) next.delete(mp)
    else next.add(mp)
    hiddenMountpoints.value = next
  }

  function hostRecords(hostName: string): DiskRecord[] {
    return records.value.filter((r) => r.host_name === hostName)
  }

  function hostLatestHour(hostRecs: DiskRecord[]): string {
    return hostRecs.reduce((max, r) =>
      r.collected_at > max ? r.collected_at : max, hostRecs[0].collected_at
    ).slice(0, 13)
  }

  function sameHour(a: string, b: string): boolean {
    return a.slice(0, 13) === b.slice(0, 13)
  }

  function hostSummary(hostName: string): HostSummary | null {
    const hostRecs = hostRecords(hostName)
    if (!hostRecs.length) return null

    const latestHour = hostLatestHour(hostRecs)
    const current = hostRecs.filter((r) => sameHour(r.collected_at, latestHour))

    let totalBytes = 0
    let usedBytes = 0
    const criticalMounts: HostSummary['criticalMounts'] = []

    for (const r of current) {
      if (r.parent_device === null) {
        totalBytes += r.size_bytes
      }
      if (r.mountpoint && r.fsuse_pct !== null) {
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
    const hostRecs = hostRecords(hostName)
    if (!hostRecs.length) return []
    const latestHour = hostLatestHour(hostRecs)
    const current = hostRecs.filter((r) => sameHour(r.collected_at, latestHour))

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
    const hostRecs = hostRecords(hostName)
    if (!hostRecs.length) return []
    const latestHour = hostLatestHour(hostRecs)
    const mps = hostRecs
      .filter((r) => sameHour(r.collected_at, latestHour) && r.mountpoint)
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
    allMountpoints,
    hiddenMountpoints,
    selectedMountpoints,
    toggleMountpoint,
    hostRecords,
    hostSummary,
    hostDevices,
    timeSeries,
    mountpointsForHost,
  }
})
