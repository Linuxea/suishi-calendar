# 岁时（suishi-calendar）项目约定

中国风个人 Web 日历。Vite + React 19 + TypeScript，纯前端无后端，npm 管理依赖。

## 常用命令

- `npm run dev` — 开发服务器
- `npm run build` — tsc 类型检查 + vite 构建（构建前必须过 tsc）
- `npm test` — vitest（测试与 `src/**/*.test.ts` 同置）
- `npm run preview` — 预览构建产物（端口 4173）

## 架构要点

- `src/lib/` 是纯逻辑层，不依赖 React，vitest 全覆盖：
  - `lunar.ts` 封装 lunar-typescript（宜忌/节气/干支/节日），带按日缓存
  - `holidays.ts` 法定节假日：内置 `src/data/holiday-cn-2026.json` 快照 + 运行时按年拉 jsDelivr + localStorage 缓存；**国务院每年 10-11 月才公布次年安排，未公布年份必须跳过拉取**（`dataPublished`），否则 404
  - `repeat.ts` 重复规则展开，`lunar-yearly` 为核心差异化（农历生日）
- lunar-typescript 注意事项：`Lunar.fromYmd` 对不存在的农历日（如廿九月的三十）会抛错，一律用 `Lunar.fromDate`；`getMonthInChinese()` 自带「闰」前缀；闰月 `getMonth()` 返回负数；`getOtherFestivals()` 是冷门条目噪声，不要用
- `src/store.ts` zustand 全局状态；`src/lib/storage.ts` 带版本号的 localStorage schema（key 前缀 `suishi.`），改 schema 需兼容旧数据
- **已部署**：自有服务器 `/calendar/` 子路径（http://SERVER_IP/calendar/），`vite.config.ts` 的 `base` 必须保持 `'/calendar/'`。更新流程：`npm run build` → `rsync dist/ SERVER_WEBROOT`。nginx `/calendar/` location 在服务器 `NGINX_CONF`（改前备份 `nginx-conf-backup`）

## 已锁定决策

- 纯前端本地存储（用户已确认），不做后端同步；数据安全靠导出/导入 JSON
- 黄历宜忌做成可开关模块（`settings.showAlmanac`），呈现为「传统文化参考」
- 不引入 UI 框架/CSS 框架，手写 CSS 变量主题（中国风传统配色，见 `src/styles.css` 顶部注释）

## 测试约定

- 一次性脚本放 `/tmp`（如 Playwright 冒烟），不进项目
- Web 冒烟：playwright-core + 本机 Chrome（`executablePath: '/usr/bin/google-chrome'`，headless）
