# 珠间：代码结构与阅读顺序

## 从哪里开始

先读 `catalog.ts` 的领域类型，再读 `model.ts` 的状态与方法，然后沿 `app.tsx` 找到具体组件。涉及订单时，从 `account.tsx` 的 API 请求追到 `server/api.ts`；价格、权限、状态流转由服务端判断。

## 目录职责

- `src/client.tsx`：客户端水合与本地设计初始化。
- `src/app.tsx`：页面外壳、工作台/已保存切换、指南。
- `src/components/BeadLibrary.tsx`：素材筛选与添加。
- `src/components/DesignCanvas.tsx`：画布、背景、珠子排列与编辑。
- `src/components/DesignDetails.tsx`：尺寸、材料清单与操作入口。
- `src/components/SavedDesigns.tsx`、`Inspiration.tsx`：本地设计列表与预设。
- `src/components/Bracelet.tsx`、`Gem.tsx`：共用的珠子与手串渲染。
- `src/lib/`：金额显示、PNG 导出。
- `src/model.ts`：Signals 状态、设计编辑、持久化、分享与 Context。
- `src/catalog.ts`：素材、预设、设计校验、权威材料价格。
- `src/account.tsx`：账户、云端设计、定制与订单界面。
- `src/server/worker.tsx` → `api.ts` / `auth.ts`：SSR、API、会话认证。
- `scripts/`：Node 预览、SQLite 适配与管理员创建；`migrations/`：D1 迁移。

## 修改约定

- 页面入口负责组合，功能放在对应组件或模块；共享规则放到领域/状态层。
- 浏览器操作在事件或客户端初始化中执行，保证服务端渲染时可安全导入。
- 每个请求或应用实例保有自己的状态；不要引入跨用户的全局可变状态。
- 保持现有接口、持久化键、权限和业务行为；数据库变化新增迁移。
- 修改源码后运行 `npm run format`；提交前运行 `npm run format:check`、`npm run build` 和 `npm test`。
- 格式由 `.prettierrc.json` 与 `.editorconfig` 统一，生成资源不手工编辑。
