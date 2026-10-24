# CHANGELOG

《探寻霓虹中的烟火》改动记录。每条按时间倒序，记录 What / Why / 涉及文件。

---

## 2026-10-24

### 18:15 — API Route + OpenAI GPT 文本叙事接入

**后端技术选型：Next.js API Route（Route Handler）**
- What: 新建 `src/app/api/observe/route.ts` POST 端点 + `src/lib/call-gpt.ts` GPT 调用封装
- Why: 替代纯规则引擎 mock，让 AI 真正"观察"用户行为。Next.js API Route 零新增部署单元，同栈 TS，server 端安全藏 key
- 降级策略：GPT 失败/超时/key 未配置 → 自动 fallback 到规则引擎 `observeMock()`，页面永不自屏
- Files: `src/app/api/observe/route.ts`, `src/lib/call-gpt.ts`, `src/lib/ai-observer.ts`, `src/components/PosterView.tsx`, `package.json`, `.env.example`

**ai-observer 异步改造**
- `observe()` 从同步规则引擎 → `async fetch /api/observe`，失败降级 `observeMock()`
- 原规则引擎保留为 `observeMock()`（fallback）
- PosterView: `useMemo(sync)` → `useEffect(async) + useState<ObserverResult | null>`
- loading 状态：GPT 调用中显示「AI 正在为你写故事...」+ 🎆 脉冲动画
- Files: `src/lib/ai-observer.ts`, `src/components/PosterView.tsx`

### 18:00 — UI 打磨 6 项一次性修复（story-line 验收通过后）

**1. 空轨迹 edge case**
- What: trail 无 viewed 时「结束今夜」按钮置灰 + tooltip "先去逛逛摊位吧"，底部文案也切换为"还没逛逛呢，点个摊位进去看看吧"
- Why: 不逛任何摊直接点结束会生成"0个摊位"的尴尬海报
- File: `src/components/StreetView.tsx`

**2. weather 反向解析修复**
- What: `ObserverResult` 新增 `weather` 字段，`observe()` 直接返回天气值，`PosterView.handleSave` 直接取值
- Why: 原来用正则从 narrative 反抽天气 `/小雨|微风|晴夜|薄雾|月明/`，耦合脆、不完整
- Files: `src/lib/ai-observer.ts`, `src/types/index.ts`, `src/components/PosterView.tsx`

**3. longestStay 语义统一**
- What: `AIObserverInput.longestStay` 拆为 `longestStayName` + `longestStayDuration`，observer 返回清晰双字段
- Why: 原来同一字段在 observer 里是摊位名、在 PosterView 里是格式化字符串，同名不同义
- Files: `src/types/index.ts`, `src/lib/ai-observer.ts`

**4. JSON 导出/导入**
- What: `memory-store.ts` 新增 `exportMemories()` / `importMemories()`，CalendarView 加导出/导入按钮（`.json` 文件下载 + FileReader 上传）
- Why: localStorage 做运行时存储（正确），JSON 文件做传输通道，补齐"可配置、可传输"闭环
- Files: `src/lib/memory-store.ts`, `src/components/CalendarView.tsx`

**5. 日历图标重设计**
- What: TopBar 右侧按钮从纯图标圆框 → pill badge（Footprints 图标 + "记忆" 文字），`bg-neon-gold/5 + border-neon-gold/25`
- Why: 纯图标可发现性弱，pill badge 是更现代的入口形态
- File: `src/components/TopBar.tsx`

**6. 字体大小调整**
- What: TopBar 标题 `text-lg` → `text-xl`，PosterView 叙事段落 `text-xs` → `text-sm` + `opacity:45` → `opacity:75`
- Why: 字号太小配合霓虹发光会糊，标题和正文拉大一档可读性明显提升
- Files: `src/components/TopBar.tsx`, `src/components/PosterView.tsx`

### 17:00 — 故事线全链路实现（①→②→③→④→⑤→⑥）

**① 轨迹采集器（StreetView + StallDetailPanel + page.tsx 改造）**
- What: StreetView 内嵌 `trail` 状态，采集点摊位→发弹幕→组搭子行为，结束今夜时补停留时长（3-15分钟随机mock）
- Why: 「逛」的行为从未被记录，故事线跑不通的根因
- Files: `src/components/StreetView.tsx`, `src/components/StallDetailPanel.tsx`, `src/app/page.tsx`

**② AI 观察器（lib/ai-observer.ts 新建）**
- What: 7维输入→叙事输出规则引擎，逛摊数=基调/弹幕数=互动感/搭子=温度/天气时间=氛围
- Why: 「AI观察用户」而非「用户告诉AI」的产品核心体验
- Files: `src/lib/ai-observer.ts`

**③ 海报生成器（lib/poster-generator.ts 新建）**
- What: Canvas 粒子霓虹烟火（暗夜渐变+天际线+多色粒子爆炸+物理模拟+地面光晕+tagline排版），输出base64 data URL，零外链
- Why: 海报需要纯代码生成以支持离线/本地留存 + 高质量视觉呈现
- Files: `src/lib/poster-generator.ts`

**④ 记忆存储（lib/memory-store.ts 新建）**
- What: localStorage CRUD，key: `neon-sparks-memories`，同日期覆盖
- Why: demo单设备localStorage最可靠，不需要服务端
- Files: `src/lib/memory-store.ts`

**⑤ 海报视图实装（PosterView.tsx 重写）**
- What: 轨迹→AI观察器→海报生成器完整链路，Canvas烟火主视觉+tagline+AI心情+叙事段落+轨迹时间线+弹幕记录+搭子故事+存入记忆
- Why: 从占位符到完整功能
- Files: `src/components/PosterView.tsx`

**⑥ 日历视图实装（CalendarView.tsx 重写）**
- What: 月份切换+7列网格+记忆卡片缩略+点击详情overlay，localStorage持久化
- Why: 从占位符到完整功能，完成「我与城市的记忆」闭环
- Files: `src/components/CalendarView.tsx`

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