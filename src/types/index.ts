// ===== 夜市场域 =====
// 上述类型定义了整个"探寻霓虹中的烟火"的数据模型。
// 从摊位到记忆，从弹幕到海报，一条完整闭环。

// ==================== 摊位 ====================

export interface Stall {
  id: string;
  name: string;
  owner: string;
  category: StallCategory;
  signature: string;
  description: string;
  /** Leaflet 坐标 [lat, lng]（mock） */
  position: [number, number];
  /** 摊位图标颜色 */
  color: string;
  /** 营业时间 */
  hours: string;
  /** 人均 */
  avgPrice: number;
}

export type StallCategory =
  | "炒粉"
  | "烤串"
  | "糖水"
  | "米酒"
  | "铁板"
  | "关东煮"
  | "炸物"
  | "其他";

// ==================== 弹幕 ====================

export interface Danmaku {
  id: string;
  stallId: string;
  content: string;
  /** diner=食客(真人), vendor=商户吆喝(AI替), resident=街坊闲谈(AI替), buddy=搭子旗标(真人) */
  type: "diner" | "vendor" | "resident" | "buddy";
  timestamp: number;
  /** 搭子旗标专属字段 */
  buddy?: BuddyFlag;
}

export interface BuddyFlag {
  /** 发起人昵称 */
  creator: string;
  /** 人均预算 */
  budget: number;
  /** 需要人数 */
  needed: number;
  /** 已加入人数 */
  joined: number;
  /** 状态 */
  status: "recruiting" | "full" | "closed";
  /** 成员列表 */
  members: string[];
}

// ==================== 行为轨迹 ====================

export interface TrailEntry {
  stallId: string;
  stallName: string;
  action: "viewed" | "stayed" | "danmaku" | "buddied";
  timestamp: string;
  detail?: string;
}

// ==================== 今夜记忆 ====================

export interface NightMemory {
  id: string;
  /** ISO 日期 "2026-10-24" */
  date: string;
  time: string;
  weather: string;
  weekday: string;

  /** 行为轨迹 */
  trail: TrailEntry[];

  /** 海报 —— 分享用的精华 */
  poster: {
    /** AI 生成的主视觉图 URL（当前 mock） */
    imageUrl: string;
    /** 一句点睛叙事 ≤30 字 */
    tagline: string;
  };

  /** 日历详情 —— 留存用 */
  detail: {
    danmakuLog: string[];
    buddyStory: string | null;
    longestStay: string;
    feeling: string | null;
    otherStory: string | null;
  };
}

// ==================== AI 观察器输入 ====================

export interface AIObserverInput {
  trail: TrailEntry[];
  danmakuLog: string[];
  buddyStory: string | null;
  longestStay: string;
  time: string;
  weather: string;
  weekday: string;
  feeling?: string;
  otherStory?: string;
}

// ==================== 应用状态机 ====================

export type AppView = "street" | "poster" | "calendar";