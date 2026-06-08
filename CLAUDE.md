# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SAS Viya 服务器磁盘使用监控仪表盘，部署在 GitHub Pages 的静态站点。展示 3 台服务器（master/worker1/worker2）多天磁盘使用趋势。

**线上地址:** https://topherlx.github.io/viya-monitor-dashboard/

**最新更新:**
- iOS 26 风格液态玻璃面板（多层伪元素光照折射 + 64px 超强模糊）
- 动态壁纸背景（CSS keyframes 驱动的冷暖光斑漂移）
- 跨图表挂载点联动筛选（Chips + Store 共享状态）
- 桑基图展示设备层级流向
- ECharts 主题全面提亮

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
├── stores/diskStore.ts            # Pinia store: fetch JSON → 聚合 getter + 挂载点选择状态
├── router/index.ts                # 2 路由: / (overview) + /server/:hostName
├── theme/echarts.ts               # 树摇 ECharts + viya-glass 自定义主题
├── assets/main.css                # Tailwind + iOS 玻璃面板 + 动态壁纸动画
├── layouts/AppLayout.vue          # 统一玻璃侧边栏 + 服务器导航 + <slot>
├── pages/
│   ├── OverviewPage.vue           # 3×ServerCard + UsageBarChart + 3×TrendSparkline
│   └── ServerDetailPage.vue       # CapacityPanel + DeviceHierarchy + SankeyChart + MountTrendChart
└── components/
    ├── ServerCard.vue             # 主机名/IP/使用率进度条/容量/告警, 点击跳详情
    ├── UsageBarChart.vue          # 分组柱状图 + 挂载点 chips 联动 + 70% 预警线
    ├── TrendSparkline.vue         # 迷你多线图(按天均值, chips 联动, 按主机分组)
    ├── DeviceHierarchy.vue        # 设备树容器
    ├── DeviceNode.vue             # 递归树节点(disk→part→lvm, 可折叠, 类型徽章)
    ├── MountTrendChart.vue        # 多线趋势图 + 7d/30d/180d + 70%-100% 渐变预警带
    ├── CapacityPanel.vue          # SVG 环形仪表盘 + chips 联动(按挂载点, 颜色阈值)
    └── SankeyChart.vue            # 设备层级桑基图(物理磁盘→分区→LVM→挂载点)
```

## 数据流

1. `AppLayout.vue` `onMounted` 调用 `store.load()`
2. `diskStore.load()` fetch JSON → 存入 `records` ref
3. 各组件通过 store getter 获取聚合数据：
   - `hosts` — 3台主机名
   - `hostSummary(host)` — 单机汇总(总容量=物理磁盘和/已用量/设备数/告警挂载点)
   - `hostDevices(host)` — 设备层级树
   - `timeSeries(host, device)` — 某设备的时间序列
   - `mountpointsForHost(host)` — 挂载点列表
   - `latestSnapshot` — 各主机最新小时快照合并
   - `allMountpoints` / `selectedMountpoints` / `toggleMountpoint()` — 跨图表联动状态
4. 所有组件按**主机各自最新小时**过滤数据（非全局时间戳），`/boot`、`/boot/efi` 默认隐藏

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

- **风格**: iOS 26 液态玻璃 (glassmorphism) + 动态壁纸 + 科技感
- **背景**: `#1b1c3e` → `#222d50` → `#1e2848` 明亮午夜蓝渐变 + CSS keyframes 冷暖光斑漂移
- **配色**: 禁用灰色/黑色。青绿强调 `#00dfff`/`#00ffd0`，紫色 `#8b5cf6`/`#c4b5fd`，琥珀警告 `#fbbf24`，红色危险 `#f87171`
- **玻璃面板**: `rgba(255,255,255,0.08)` + `backdrop-blur-3xl` (64px) + 多层伪元素光照折射 + 内描边高光
- **侧边栏**: 与内容区统一玻璃材质，不再使用独立深色背景
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
