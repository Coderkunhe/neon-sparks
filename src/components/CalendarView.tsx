"use client";

import TopBar from "./TopBar";

interface CalendarViewProps {
  onClose: () => void;
}

/**
 * 日历视图 —— 「我与城市的记忆」按日期归档。
 * 当前只搭框架，后续 task 填入日历网格和记忆卡片。
 */
export default function CalendarView({ onClose }: CalendarViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 + 关闭按钮 → 回到街景 */}
      <TopBar title="我与城市的记忆" onClose={onClose} />

      {/* 日历占位区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-24 h-24 rounded-full bg-neon-gold/10 border border-neon-gold/30 flex items-center justify-center">
          <span className="text-4xl">📅</span>
        </div>
        <p className="text-sm text-neon-gold/60">你的城市烟火编年史</p>
        <p className="text-xs text-foreground/25">
          打开即逛 · AI 自动记录 · 翻开就是故事
        </p>

        {/* 空状态示意 */}
        <div className="w-full max-w-xs mt-4 p-4 rounded-xl border border-dashed border-night-700/60 bg-night-800/50 text-center">
          <p className="text-xs text-foreground/30">
            今晚是你和这座城市的第一页
          </p>
          <p className="text-xs text-foreground/20 mt-1">
            结束今夜后，海报将自动存入这里
          </p>
        </div>
      </div>
    </div>
  );
}