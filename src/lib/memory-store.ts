import type { NightMemory } from "@/types";

const STORAGE_KEY = "neon-sparks-memories";

/**
 * 记忆存储 —— localStorage CRUD。
 * 单人本地资产，无需服务端。
 */

/** 保存一条今夜记忆 */
export function saveMemory(memory: NightMemory): void {
  if (typeof window === "undefined") return;
  const existing = loadMemories();
  // 同日期覆盖（一天只保留最新一条）
  const filtered = existing.filter((m) => m.date !== memory.date);
  filtered.push(memory);
  filtered.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/** 加载全部记忆，按日期倒序 */
export function loadMemories(): NightMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NightMemory[];
  } catch {
    return [];
  }
}

/** 按年月加载记忆 */
export function loadMemoriesByMonth(
  year: number,
  month: number
): NightMemory[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return loadMemories().filter((m) => m.date.startsWith(prefix));
}

/** 按日期加载单条记忆 */
export function loadMemoryByDate(date: string): NightMemory | undefined {
  return loadMemories().find((m) => m.date === date);
}

/** 生成记忆 ID */
export function generateMemoryId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}