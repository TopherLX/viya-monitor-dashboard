# Viya Monitor Dashboard

SAS Viya 服务器磁盘使用监控仪表盘 —— 静态站点，部署在 GitHub Pages。

**线上地址:** [topherlx.github.io/viya-monitor-dashboard](https://topherlx.github.io/viya-monitor-dashboard/)

## 功能

- **概览页** — 3 台服务器状态卡片、挂载点用量柱状图（可筛选）、迷你多线趋势图（按天聚合）
- **服务器详情页** — SVG 环形容量仪表盘、设备层级树、设备层级桑基图、挂载点多线趋势图（7d/30d/180d + 预警带）
- **跨图表联动** — Chips 筛选同步柱状图、迷你图、容量面板、趋势图
- **模拟数据** — 3 台服务器 × 多设备 × 多天 × 每小时采集

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建 | Vite 6 |
| 路由 | Vue Router 4 (hash) |
| 状态 | Pinia |
| 样式 | Tailwind CSS 3 (iOS 26 liquid glass) |
| 图表 | ECharts 5 + vue-echarts (按需引入) |
| 包管理 | pnpm 11 |

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (localhost:5173)
pnpm dev

# 重新生成模拟数据
uv run python simulate_data.py

# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 设计

iOS 26 风格液态玻璃 + 动态壁纸背景（CSS keyframes 冷暖光斑漂移）。明亮午夜蓝渐变基底，青绿 + 紫色强调色。

## 部署

推送 `main` 分支自动触发 GitHub Actions 构建并部署到 GitHub Pages。
