# CHANGELOG

《探寻霓虹中的烟火》改动记录。每条按时间倒序，记录 What / Why / 涉及文件。

---

## 2026-10-24

### 14:50 — 街景重构完成（D+A+B+C+E+F）

**D. 弹幕单一数据源**
- What: DanmakuLayer 改为纯受控组件，StreetView 是弹幕池唯一 owner
- Why: 修复弹幕数据源分裂 bug —— 用户发的弹幕只在详情面板出现，地图滚动墙看不到
- Files: `src/components/DanmakuLayer.tsx`, `src/components/StreetView.tsx`

**A. 声音分类重构**
- What: 弹幕类型从 `human/ai/buddy` 改为 `diner/vendor/resident/buddy`
- Why: 原分类是技术视角，新分类是产品视角 —— AI 不是一类弹幕，AI 是让「商户」「街坊」两类声音自动活起来的手段
- Files: `src/types/index.ts`, `src/data/danmaku.ts`, `src/components/DanmakuLayer.tsx`, `src/components/StreetView.tsx`

**B. 弹幕摊位高度横向滚动**
- What: 弹幕从摊位上方冒泡升起，不再全屏无差别滚动
- Why: 「活摊位」产品定义落地 —— 弹幕跟摊位空间绑定，体现"这个摊正在发生什么"
- Files: `src/components/DanmakuLayer.tsx`, `src/components/MapView.tsx`

**C. 用户锚点**
- What: 地图上加红色三角导航箭头标记用户位置
- Why: 没有用户锚点就没有"我在街上"实感，轨迹海报的起点缺失
- Files: `src/components/MapView.tsx`, `src/app/globals.css`

**E. 全屏沉浸**
- What: 去掉 `max-w-md`，改为全屏 + 悬浮 UI
- Why: 桌面端地图被框成手机宽，投屏只剩插画感
- Files: `src/app/page.tsx`

**F. 技术债收尾**
- What: 手写字体 CDN 加载 / 缩放控件打开 / 死代码清理
- Files: `src/app/layout.tsx`, `src/components/MapView.tsx`, `src/app/globals.css`

### 14:20 — 街景内核完成
- What: Leaflet 暗色地图 + 8 摊位 marker + 弹幕滚动 + 摊位详情面板 + 发弹幕
- Files: `src/components/MapView.tsx`, `src/components/StreetView.tsx`, `src/components/DanmakuLayer.tsx`, `src/components/StallDetailPanel.tsx`, `src/data/stalls.ts`, `src/data/danmaku.ts`, `src/types/index.ts`

### 14:00 — 页面状态机 + 布局框架
- What: Street ↔ Poster ↔ Calendar 三态切换 + TopBar + 日历入口
- Files: `src/app/page.tsx`, `src/components/TopBar.tsx`, `src/components/CalendarView.tsx`, `src/components/PosterView.tsx`

### 12:10 — 脚手架搭建
- What: Next.js 16 + Tailwind v4 + ESLint + TypeScript
- Files: 全项目脚手架

### 12:00 — README.md 完成
- Files: `README.md`

### 11:40 — 产品定义 + 工程决策定稿
- 产品模式 v3：探索→轨迹→插图→心情→故事海报→日历
- 工程决策：布局/存储/地图/弹幕/数据模型/视觉/mock 策略