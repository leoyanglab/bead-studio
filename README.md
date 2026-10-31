# 珠间 · Bead Studio

用 Preact + TypeScript + Signals 构建的可视化串珠设计器。奶油白与鼠尾草绿的响应式手作工作台，手机和电脑都能使用。

## 功能

- 12 款示例珠材：按材质筛选、搜索、添加。
- SVG 手串预览，拖拽排序；点选后支持键盘/移动端按钮排序、替换、删除。
- 目标手围与估算内围、按珠材单价汇总材料清单。
- 本地自动保存、最多 24 份收藏、导出 1200×1440 PNG。
- 包含完整设计数据的 URL 分享链接；无需账号或服务端数据库。
- 3 组配色灵感：苔间晨露、落日来信、海盐假日。

## 本地运行

建议 Node.js 22.12+。

```sh
npm ci
npm run dev
npm run build
```

## Cloudflare

`wrangler.jsonc` 配置静态资源目录 `dist` 和自定义域名 `beads.bool.win`。

```sh
npx wrangler login
npm run deploy
```

自动部署可在 Cloudflare Workers Builds 连接本仓库，生产分支 `main`，构建命令 `npm run build`，部署命令 `npx wrangler deploy`，根目录 `/`。以后每次 push main 触发构建部署。GitHub Actions 只负责构建检查，避免与 Workers Builds 重复部署。

## 数据说明

珠材名称、颜色和价格均为演示数据，不是商家报价。估算内围 = 珠径总和 − 平均珠径 × π，不含绳结、松量及材料形变。实际制作应试戴确认。保存依赖当前浏览器存储；分享链接本身包含设计数据。

## 技术

Preact / @preact/signals（signal、computed、effect、batch）/ Vite / TypeScript / Lucide / Cloudflare Workers Static Assets。

MIT License © 2026 leoyanglab
