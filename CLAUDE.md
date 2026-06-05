# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SAS Viya 服务器磁盘使用监控仪表盘，部署在 GitHub Pages 的静态站点。展示 3 台服务器（master/worker1/worker2）180 天磁盘使用趋势。

**线上地址:** https://topherlx.github.io/viya-monitor-dashboard/

## 技术栈

- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Vite 6
- Vue Router 4 (hash history, GitHub Pages 兼容)
- Pinia
- Tailwind CSS 3 (glass-morphism 自定义主题)
- ECharts 5 + vue-echarts (按需引入)
- pnpm 11

## 架构

```
src/
├── main.ts / App.vue              # 入口
├── types/index.ts                 # DiskRecord, HostSummary, DeviceInfo, TimeSeriesPoint
├── stores/diskStore.ts            # Pinia store: fetch JSON → 6 聚合 getter
├── router/index.ts                # 2 路由: / (overview) + /server/:hostName
├── theme/echarts.ts               # 树摇 ECharts + viya-glass 自定义主题
├── assets/main.css                # Tailwind + 玻璃面板 utility class
├── layouts/AppLayout.vue          # 玻璃侧边栏 + 服务器导航 + <slot>
├── pages/
│   ├── OverviewPage.vue           # 3×ServerCard + UsageBarChart + 3×TrendSparkline
│   └── ServerDetailPage.vue       # CapacityPanel + DeviceHierarchy + MountTrendChart
└── components/
    ├── ServerCard.vue             # 主机名/IP/使用率进度条/容量/告警, 点击跳详情
    ├── UsageBarChart.vue          # ECharts 分组柱状图(按挂载点对比3台服务器)
    ├── TrendSparkline.vue         # ECharts 迷你折线图(root分区180天趋势)
    ├── DeviceHierarchy.vue        # 设备树容器
    ├── DeviceNode.vue             # 递归树节点(disk→part→lvm, 可折叠, 类型徽章)
    ├── MountTrendChart.vue        # ECharts 多线趋势图 + 7d/30d/180d 时间选择器
    └── CapacityPanel.vue          # SVG 环形仪表盘(按挂载点, 颜色阈值)
```

## 数据流

1. `AppLayout.vue` `onMounted` 调用 `store.load()`
2. `diskStore.load()` fetch JSON → 存入 `records` ref
3. 各组件通过 store getter 获取聚合数据：
   - `hosts` — 3台主机名
   - `hostSummary(host)` — 单机汇总(总容量/使用率/设备数/告警挂载点)
   - `hostDevices(host)` — 设备层级树
   - `timeSeries(host, device)` — 某设备的时间序列
   - `mountpointsForHost(host)` — 挂载点列表
   - `latestSnapshot` — 最新一次采集(23条)

## 常用命令

```bash
pnpm dev              # 开发服务器 (localhost:5173)
pnpm build            # 生产构建 → dist/
pnpm preview          # 预览生产构建
uv run python simulate_data.py   # 重新生成模拟数据
```

## 关键配置

- **Vite `base`**: 开发 `/`, 生产 `/viya-monitor-dashboard/` (条件判断 `command === 'build'`)
- **Router**: `createWebHashHistory()` — GitHub Pages 必须用 hash 模式
- **数据加载**: store 中使用 `import.meta.env.PROD ? import.meta.env.BASE_URL : '/'` 拼接 fetch URL

## 设计规范

- **风格**: 液态玻璃 (glassmorphism) + 动感 + 科技感
- **背景**: `#0a0a2e` → `#1a1040` → `#0d1137` 深蓝紫渐变
- **配色**: 禁用灰色/黑色。青绿强调 `#00d4ff`/`#00ffc8`，紫色 `#7c3aed`/`#a78bfa`，琥珀警告 `#f59e0b`，玫瑰危险 `#f43f5e`
- **玻璃面板**: `rgba(255,255,255,0.05)` + `backdrop-blur-xl`
- **ECharts**: 树摇引入，自定义 `viya-glass` 主题覆盖所有默认灰色

## 模拟数据

`simulate_data.py` 基于 `viya_server_usage_all.json` 基准快照生成模拟数据：
- 3 台服务器 × 23 设备 × 180 天 × 24 小时 = 99,360 条
- fsuse_pct 含随机游走 + 日漂移 + 小时波动
- 输出到 `public/viya_server_usage_simulated.json`

## 部署

推送 `main` 分支 → GitHub Actions 自动 build → deploy 到 GitHub Pages。

工作流: `.github/workflows/deploy.yml`
- pnpm 11 + Node.js 22
- `pnpm install --frozen-lockfile` + `pnpm build`
- `actions/deploy-pages@v4`
