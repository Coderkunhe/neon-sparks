"use client";

import { useState } from "react";
import { X, Send, Users } from "lucide-react";
import type { Danmaku } from "@/types";
import { stalls } from "@/data/stalls";

interface StallDetailPanelProps {
  stallId: string;
  onClose: () => void;
  onSendDanmaku: (stallId: string, content: string) => void;
  onBuddy: (stallId: string) => void;
  danmakuForStall: Danmaku[];
}

/**
 * 摊位详情面板 —— 底部 sheet，滑入式。
 * 显示摊位信息 + 该摊位弹幕流 + 发弹幕输入 + 组搭子入口。
 */
export default function StallDetailPanel({
  stallId,
  onClose,
  onSendDanmaku,
  onBuddy,
  danmakuForStall,
}: StallDetailPanelProps) {
  const stall = stalls.find((s) => s.id === stallId);
  const [message, setMessage] = useState("");

  if (!stall) return null;

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSendDanmaku(stallId, trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // 最近 10 条弹幕
  const recentDanmaku = danmakuForStall.slice(-10).reverse();

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
      {/* 遮罩：点击空白关闭 */}
      <div
        className="absolute inset-0 -top-96 pointer-events-auto"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative pointer-events-auto animate-slide-up rounded-t-2xl bg-night-900/95 backdrop-blur-xl border-t border-night-700/60 max-h-[65vh] flex flex-col">
        {/* 拖拽条 */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-night-600" />
        </div>

        {/* 头部 */}
        <div className="flex items-start justify-between px-4 pb-2">
          <div>
            <h2 className="font-hand text-xl text-neon-gold neon-text">
              {stall.name}
            </h2>
            <p className="text-xs text-foreground/50 mt-0.5">
              {stall.owner}掌勺 · {stall.signature}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-night-600 text-foreground/50 hover:text-neon-gold"
          >
            <X size={14} />
          </button>
        </div>

        {/* 描述 */}
        <p className="px-4 text-xs text-foreground/35 leading-relaxed mb-3">
          {stall.description}
        </p>

        {/* 弹幕流 */}
        <div className="px-4 mb-3">
          <p className="text-xs text-neon-gold/60 mb-1.5 font-hand tracking-wide">
            摊前闲聊
          </p>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {recentDanmaku.length === 0 && (
              <p className="text-xs text-foreground/20">还没有弹幕，抢个沙发吧</p>
            )}
            {recentDanmaku.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-2 text-xs"
              >
                <span
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] ${
                    d.type === "vendor"
                      ? "bg-neon-orange/15 text-neon-orange/90"
                      : d.type === "resident"
                        ? "bg-fuchsia-400/15 text-fuchsia-300"
                        : d.type === "buddy"
                          ? "bg-neon-gold/15 text-neon-gold"
                          : "bg-white/10 text-white/70"
                  }`}
                >
                  {d.type === "vendor"
                    ? "招牌"
                    : d.type === "resident"
                      ? "街坊"
                      : d.type === "buddy"
                        ? "搭子"
                        : "食客"}
                </span>
                <span className="text-foreground/70">{d.content}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 操作区：发弹幕 + 组搭子 */}
        <div className="px-4 pb-4 pt-2 border-t border-night-700/40 space-y-2">
          {/* 发弹幕 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发条弹幕…"
              maxLength={60}
              className="flex-1 h-9 px-3 rounded-full bg-night-800 text-sm text-foreground placeholder:text-foreground/20 border border-night-700/50 focus:border-neon-gold/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-neon-gold/20 border border-neon-gold/40 flex items-center justify-center text-neon-gold disabled:opacity-30 transition-opacity"
            >
              <Send size={14} />
            </button>
          </div>

          {/* 组搭子 */}
          <button
            type="button"
            onClick={() => onBuddy(stallId)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-full border border-neon-pink/30 text-neon-pink/50 text-xs hover:border-neon-pink/60 hover:text-neon-pink/70 transition-colors"
          >
            <Users size={14} />
            <span>发起饭搭子 · AA 拼个桌</span>
          </button>
        </div>
      </div>
    </div>
  );
}