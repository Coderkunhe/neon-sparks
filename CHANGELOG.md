# CHANGELOG

《探寻霓虹中的烟火》改动记录。每条按时间倒序，记录 What / Why / 涉及文件。

---

## 2026-10-24

### 16:30 — 标题可读性修复 + 足迹图标替换

**标题字体可读性**
- `--font-hand` 字体栈：`Zhi Mang Xing`（草书）移到 `Ma Shan Zheng`（马善政楷体）之后，楷体笔画粗、结构清晰，作为首选
- TopBar 标题保持 `font-hand`，现在渲染为楷体手写风格而非草书
- Why: 草书 + 霓虹发光叠加导致"探寻霓虹中的烟火"看不清，楷体保留烟火气同时确保可读
- File: `src/app/globals.css`

**足迹图标替换**
- 日历入口图标 `CalendarDays` → `Footprints`，去文字只留纯图标
- Owner 决策：标题 7 字已占半屏，右侧再放图标+4 字按钮视觉拥挤；纯图标 + 实边边框足够表达可交互性，且 Footprints 🦶 语义天然指向"我走过的路"
- File: `src/components/TopBar.tsx`

### 16:10 — 产品owner文案+布局+UI商业标准优化

**P0 品牌修复**
- TopBar 标题 `"霓虹夜市"` → `"探寻霓虹中的烟火"`，品牌完整呈现
- Why: 产品全名是品牌资产，缩略名在任何场景都会稀释认知
- File: `src/components/StreetView.tsx`

**P1 文案横扫**
- 底部邀请文案 `"逛逛摊位 · 发发弹幕 · 组个搭子"` → `"走进来，你就是这条街的一部分"`
- 摊位弹幕区标题 `"摊位弹幕"` → `"摊前闲聊"`
- 组搭子按钮 `"组搭子 · 即将上线"` → `"发起饭搭子 · AA 拼个桌"`（去掉"即将上线"自我揭露）
- 海报视图 `"AI 正在生成你的今夜海报…"` → `"今夜的故事，正在被写成海报…"`
- 海报视图 `"四件套即将上线"` → `"逛一圈再回来，AI 会记住你的一切"`
- 日历按钮 `"记忆"` → `"我的烟火"`
- AI_SPAWN_POOL 去重 — 与 danmaku seed 重复的4条替换为新内容
- 底部提示 opacity 0.25→0.45，可读性提升
- Why: 文案从"功能说明书口吻"转为"邀请语"，从"开发者 backlog 清单"转为"用户承诺"
- Files: `src/components/StreetView.tsx`, `src/components/StallDetailPanel.tsx`, `src/components/PosterView.tsx`, `src/components/TopBar.tsx`

**P1 虚线清理**
- PosterView / CalendarView / StallDetailPanel 三类占位区 `border-dashed` → `border-solid`
- Why: 虚线框在用户眼里 = "这里还没做完"，打破沉浸
- Files: `src/components/PosterView.tsx`, `src/components/CalendarView.tsx`, `src/components/StallDetailPanel.tsx`

**P1 视觉修正**
- `neon-text` 发光重写：从金黄+粉红混浊 → 纯金色系三层光晕
- 新增 `neon-text-white` 用于按钮 overlay 文本
- Why: 原发光颜色不纯（金黄字+粉色外发光=浑浊），修正后辨识度更清晰
- File: `src/app/globals.css`

**P2 顺手优化**
- 按钮渐变 `from-orange via-pink to-lantern` → `from-orange to-pink`（去脏色中继）
- StallDetailPanel max-h 55vh → 65vh（小屏弹幕可视空间）
- TopBar 标题加 `truncate` + `max-w-[70vw]` + `text-base sm:text-lg`（长标题自适应）
- File: `src/components/StreetView.tsx`, `src/components/StallDetailPanel.tsx`, `src/components/TopBar.tsx`

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