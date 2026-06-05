# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SAS Viya 服务器磁盘使用情况监控仪表盘。将 `viya_server_usage_all.json` 中的服务器磁盘数据可视化为静态网站，最终部署为纯前端静态站点。

## 技术栈

| 领域 | 选择 |
|------|------|
| 语言 | TypeScript |
| 包管理 | pnpm |
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 样式 | Tailwind CSS |
| 图表 | ECharts |
| Python（如需） | uv 管理 |

## 数据模型

`viya_server_usage_all.json` 是服务器磁盘使用快照数组，每条记录：

| 字段 | 类型 | 说明 |
|------|------|------|
| `host_name` | string | 主机名 (master / worker1 / worker2) |
| `host_ip` | string | IP 地址 |
| `parent_device` | string\|null | 父设备路径 |
| `device_name` | string | 设备名 |
| `device_type` | string | 类型: `disk` / `part` / `lvm` |
| `mountpoint` | string\|null | 挂载点 |
| `size_bytes` | number | 总大小（字节） |
| `fsuse_pct` | number\|null | 使用率百分比（仅 part/lvm 有值） |
| `collected_at` | string | 采集时间 |

当前数据覆盖 3 台服务器：master (172.17.12.53)、worker1 (172.17.12.54)、worker2 (172.17.12.55)。

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 生产构建，输出到 dist/
pnpm lint         # 代码检查
pnpm format       # 代码格式化
```

## 设计规范

- **风格**: 液态玻璃（glassmorphism）、动感、科技感
- **配色**: 禁止使用灰色和黑色，使用鲜艳/渐变/透明质感
- **图表**: ECharts 主题需与整体风格协调，避免默认样式
- **数据**: 参考数据文件 `viya_server_usage_all.json`（开发阶段直接 import JSON，后续可替换为 API）

## 开发流程

1. 写代码前通过 Context7 查询相关库的最新文档
2. UI 设计使用 `frontend-design` skill
3. 每次改动后验证 `pnpm build` 通过（最终产物为静态站点）
