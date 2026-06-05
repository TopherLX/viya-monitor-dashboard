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
