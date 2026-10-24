"use client";

import { CalendarDays, X } from "lucide-react";

interface TopBarProps {
  title: string;
  /** 有则渲染日历入口图标 */
  onCalendarClick?: () => void;
  /** 有则渲染关闭图标（替代日历入口） */
  onClose?: () => void;
}

/**
 * 顶部栏 —— 全站统一框架。
 * 右侧图标二选一：日历入口（street）或关闭（calendar/poster）。
 */
export default function TopBar({
  title,
  onCalendarClick,
  onClose,
}: TopBarProps) {
  return (
    <header className="relative z-30 flex items-center justify-between px-4 h-14 bg-night-950/85 backdrop-blur-md border-b border-night-700/60">
      <h1 className="font-hand text-base sm:text-lg tracking-wide text-neon-gold neon-text leading-none truncate max-w-[70vw]">
        {title}
      </h1>

      {onCalendarClick && (
        <button
          type="button"
          onClick={onCalendarClick}
          aria-label="打开日历"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-night-700/60 text-neon-gold/90 hover:text-neon-gold hover:border-neon-gold/60 transition-colors"
        >
          <CalendarDays size={18} strokeWidth={1.8} />
          <span className="text-xs">我的烟火</span>
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="flex items-center justify-center w-8 h-8 rounded-full border border-night-700/60 text-foreground/70 hover:text-neon-gold hover:border-neon-gold/60 transition-colors"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      )}
    </header>
  );
}
