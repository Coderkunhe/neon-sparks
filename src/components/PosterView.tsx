"use client";

import TopBar from "./TopBar";

interface PosterViewProps {
  onSaveMemory: () => void;
  onBackToStreet: () => void;
}

/**
 * 海报视图 —— AI 生成的今夜专属画面。
 * 当前只搭框架，后续 task 填入海报内容。
 */
export default function PosterView({
  onSaveMemory,
  onBackToStreet,
}: PosterViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 + 关闭按钮 → 回到街景 */}
      <TopBar title="今夜故事" onClose={onBackToStreet} />

      {/* 海报占位区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-5">
        <div className="w-full max-w-sm aspect-[3/4] rounded-2xl border border-neon-pink/30 bg-night-800 flex flex-col items-center justify-center space-y-4 p-8">
          <div className="w-20 h-20 rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center">
            <span className="text-3xl">🎆</span>
          </div>
          <p className="text-sm text-neon-pink/60 text-center">
            今夜的故事，正在被写成海报…
          </p>
          <div className="text-xs text-foreground/35 text-center space-y-1">
            <p>轨迹 · 插图 · 心情 · 故事</p>
            <p>逛一圈再回来，AI 会记住你的一切</p>
          </div>
        </div>
      </div>

      {/* 底部：存入记忆 */}
      <footer className="flex-shrink-0 px-4 py-3 bg-night-950/90 backdrop-blur-md border-t border-night-700/60 space-y-2">
        <button
          type="button"
          onClick={onSaveMemory}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-gold text-night-950 font-bold text-base tracking-wider active:scale-[0.98] transition-transform"
        >
          💾 存入记忆
        </button>
        <button
          type="button"
          onClick={onBackToStreet}
          className="w-full py-2 rounded-xl border border-night-700/60 text-foreground/50 text-sm active:scale-[0.98] transition-transform"
        >
          再逛逛
        </button>
      </footer>
    </div>
  );
}