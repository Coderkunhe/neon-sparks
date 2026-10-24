"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TopBar from "./TopBar";
import { loadMemoriesByMonth, loadMemoryByDate } from "@/lib/memory-store";
import type { NightMemory } from "@/types";

interface CalendarViewProps {
  onClose: () => void;
}

/** 日历网格一个单元格 */
interface DayCell {
  day: number;
  date: string; // ISO "2026-10-24"
  isCurrentMonth: boolean;
  memory: NightMemory | undefined;
}

/**
 * 日历视图 —— 「我与城市的记忆」按日期归档。
 * 月份切换 + 日历网格 + 记忆卡片 + 详情overlay。
 */
export default function CalendarView({ onClose }: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthLabel = `${year}年${month}月`;

  // 加载当月记忆
  const monthMemories = useMemo(
    () => loadMemoriesByMonth(year, month),
    [year, month]
  );

  // 构建日历网格
  const grid = useMemo((): DayCell[] => {
    const firstDay = new Date(year, month - 1, 1);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

    const cells: DayCell[] = [];

    // 前置补齐 — 上个月末尾
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date: dateStr, isCurrentMonth: false, memory: loadMemoryByDate(dateStr) });
    }

    // 当前月
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const memory = monthMemories.find((m) => m.date === dateStr);
      cells.push({ day: d, date: dateStr, isCurrentMonth: true, memory });
    }

    // 后置补齐 — 下个月开头（填满 7×N 网格）
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = month === 12 ? 1 : month + 1;
        const y = month === 12 ? year + 1 : year;
        const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push({ day: d, date: dateStr, isCurrentMonth: false, memory: loadMemoryByDate(dateStr) });
      }
    }

    return cells;
  }, [year, month, monthMemories]);

  const selectedMemory = selectedDate
    ? loadMemoryByDate(selectedDate)
    : null;

  // 月份切换
  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const weekHeaders = ["日", "一", "二", "三", "四", "五", "六"];

  // 如果有选中日期但没有记忆，清掉选中
  const handleDayClick = (date: string) => {
    const mem = loadMemoryByDate(date);
    if (mem) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="我与城市的记忆" onClose={onClose} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 月份切换 */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={goPrev}
            className="w-9 h-9 rounded-full border border-night-700/60 flex items-center justify-center text-foreground/60 hover:text-neon-gold hover:border-neon-gold/60 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-hand tracking-wider text-neon-gold neon-text">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={goNext}
            className="w-9 h-9 rounded-full border border-night-700/60 flex items-center justify-center text-foreground/60 hover:text-neon-gold hover:border-neon-gold/60 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 星期头 */}
        <div className="grid grid-cols-7 px-2 mb-1">
          {weekHeaders.map((w) => (
            <div
              key={w}
              className="text-center text-xs text-foreground/35 py-1.5 font-hand tracking-wide"
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell) => {
              const isToday =
                cell.date ===
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={!cell.memory}
                  onClick={() => cell.memory && handleDayClick(cell.date)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1 transition-colors ${
                    cell.memory
                      ? "hover:bg-neon-gold/10 cursor-pointer border border-neon-gold/20"
                      : "cursor-default text-foreground/15 border border-transparent"
                  } ${
                    selectedDate === cell.date
                      ? "ring-2 ring-neon-gold/60 bg-neon-gold/10"
                      : ""
                  } ${
                    isToday && cell.isCurrentMonth
                      ? "bg-neon-pink/5"
                      : ""
                  }`}
                >
                  {/* 日期数字 */}
                  <span
                    className={`text-xs mt-0.5 ${
                      !cell.isCurrentMonth
                        ? "text-foreground/12"
                        : cell.memory
                          ? "text-foreground/80"
                          : "text-foreground/25"
                    } ${isToday ? "text-neon-pink font-bold" : ""}`}
                  >
                    {cell.day}
                  </span>

                  {/* 有记忆：mini 缩略 */}
                  {cell.memory && (
                    <div className="absolute inset-x-0.5 bottom-0.5 top-5 rounded-md overflow-hidden">
                      {cell.memory.poster.imageUrl ? (
                        <img
                          src={cell.memory.poster.imageUrl}
                          alt=""
                          className="w-full h-full object-cover rounded-md opacity-70"
                        />
                      ) : (
                        <div className="w-full h-full bg-neon-gold/10 rounded-md flex items-center justify-center">
                          <span className="text-[10px]">🎆</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 今天标记 */}
                  {isToday && !cell.memory && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-neon-pink/60" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 空状态提示 */}
          {monthMemories.length === 0 && (
            <div className="text-center mt-6 pb-4">
              <p className="text-xs text-foreground/25">
                这个月还没有城市的记忆
              </p>
              <p className="text-xs text-foreground/15 mt-1">
                逛完街，结束时存下你的烟火
              </p>
            </div>
          )}

          {/* 记忆统计 */}
          {monthMemories.length > 0 && (
            <div className="text-center mt-3 pb-4">
              <p className="text-xs text-foreground/30">
                本月 {monthMemories.length} 夜烟火
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 详情 Overlay */}
      {selectedMemory && (
        <div
          className="absolute inset-0 z-40 bg-night-950/95 backdrop-blur-md flex flex-col animate-fade-in"
        >
          {/* overlay 头部 */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-night-700/60">
            <div>
              <h3 className="font-hand text-lg text-neon-gold neon-text tracking-wide">
                {selectedMemory.date}
              </h3>
              <p className="text-xs text-foreground/40">
                {selectedMemory.weekday} · {selectedMemory.weather}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="w-8 h-8 rounded-full border border-night-600 flex items-center justify-center text-foreground/60 hover:text-neon-gold"
            >
              ✕
            </button>
          </div>

          {/* overlay 内容 */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 海报缩略 */}
            {selectedMemory.poster.imageUrl && (
              <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-lg mb-4">
                <img
                  src={selectedMemory.poster.imageUrl}
                  alt={selectedMemory.poster.tagline}
                  className="w-full object-cover"
                />
              </div>
            )}

            {/* Tagline */}
            <p className="text-center text-base text-neon-gold/90 font-hand tracking-wider leading-relaxed mb-4">
              {selectedMemory.poster.tagline}
            </p>

            {/* AI 心情 */}
            {selectedMemory.detail.feeling && (
              <div className="mb-4">
                <p className="text-xs text-foreground/30 mb-1">当时心情</p>
                <p className="text-sm text-foreground/70">
                  {selectedMemory.detail.feeling}
                </p>
              </div>
            )}

            {/* 轨迹时间线 */}
            <div className="mb-4">
              <p className="text-xs text-foreground/30 mb-2">逛过的摊位</p>
              <div className="space-y-1">
                {selectedMemory.trail
                  .filter((e) => e.action === "viewed")
                  .map((e, i) => {
                    const stayed = selectedMemory.trail.find(
                      (s) => s.action === "stayed" && s.stallId === e.stallId
                    );
                    return (
                      <div
                        key={`${e.stallId}-${i}`}
                        className="flex items-center gap-2 py-1 px-3 rounded-lg bg-night-800/40"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-orange/10 border border-neon-orange/20 flex items-center justify-center text-[10px] text-neon-orange/70">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground/70">
                          {e.stallName}
                        </span>
                        {stayed && (
                          <span className="ml-auto text-xs text-foreground/30">
                            {stayed.detail}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 弹幕记录 */}
            {selectedMemory.detail.danmakuLog.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-foreground/30 mb-1.5">发出的弹幕</p>
                <div className="space-y-1">
                  {selectedMemory.detail.danmakuLog.map((d, i) => (
                    <p
                      key={i}
                      className="text-xs text-foreground/50 pl-3 border-l-2 border-neon-pink/20"
                    >
                      {d}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 搭子故事 */}
            {selectedMemory.detail.buddyStory && (
              <div className="mb-4 p-3 rounded-xl bg-neon-pink/5 border border-neon-pink/20">
                <p className="text-xs text-foreground/30 mb-1">搭子故事</p>
                <p className="text-sm text-foreground/60">
                  {selectedMemory.detail.buddyStory}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}