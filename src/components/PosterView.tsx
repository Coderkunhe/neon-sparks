"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import TopBar from "./TopBar";
import type { TrailEntry } from "@/types";
import { observe, buildObserverInput } from "@/lib/ai-observer";
import { generatePoster } from "@/lib/poster-generator";
import { saveMemory, generateMemoryId } from "@/lib/memory-store";

interface PosterViewProps {
  trail: TrailEntry[];
  onSaveMemory: () => void;
  onBackToStreet: () => void;
}

/**
 * 海报视图 —— AI 生成的今夜专属画面。
 * 接收轨迹 → AI观察器 → 海报生成器 → 展示完整记忆。
 * Canvas 粒子烟火 + tagline + 日期 + 轨迹时间线 + 弹幕记录 + 存入记忆。
 */
export default function PosterView({
  trail,
  onSaveMemory,
  onBackToStreet,
}: PosterViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const generatedRef = useRef(false);

  // AI 观察器输出
  const observerResult = useMemo(() => {
    const input = buildObserverInput(trail);
    return observe(input);
  }, [trail]);

  // 生成海报 Canvas → base64
  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    // Canvas 生成在浏览器环境执行
    const result = generatePoster(observerResult.tagline, dateStr);
    setImageUrl(result.imageUrl);
  }, [observerResult.tagline]);

  // 提取展示数据
  const timeline = useMemo(() => {
    const viewed = trail.filter((e) => e.action === "viewed");
    const danmaku = trail.filter((e) => e.action === "danmaku");
    const stayed = trail.filter((e) => e.action === "stayed");
    const buddied = trail.filter((e) => e.action === "buddied");
    return { viewed, danmaku, stayed, buddied };
  }, [trail]);

  const handleSave = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    // 停留最久的摊位
    const longestStayEntry = [...timeline.stayed].sort((a, b) => {
      const ma = parseInt(a.detail ?? "0", 10);
      const mb = parseInt(b.detail ?? "0", 10);
      return mb - ma;
    })[0];
    const longestStay = longestStayEntry
      ? `「${longestStayEntry.stallName}」${longestStayEntry.detail}`
      : "无";

    saveMemory({
      id: generateMemoryId(),
      date: dateStr,
      time: timeStr,
      weather: observerResult.weather,
      weekday: weekdays[now.getDay()],
      trail,
      poster: {
        imageUrl: imageUrl ?? "",
        tagline: observerResult.tagline,
      },
      detail: {
        danmakuLog: timeline.danmaku.map((e) => e.detail ?? "").filter(Boolean),
        buddyStory: timeline.buddied.length > 0
          ? `在「${timeline.buddied[0].stallName}」发起了一个饭搭子`
          : null,
        longestStay,
        feeling: observerResult.feeling,
        otherStory: null,
      },
    });

    setSaved(true);
    setTimeout(onSaveMemory, 600);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="今夜故事" onClose={onBackToStreet} />

      {/* 主内容区 —— 可滚动 */}
      <div className="flex-1 overflow-y-auto">
        {/* 海报主视觉 */}
        <div className="relative w-full aspect-[3/4] max-w-sm mx-auto mt-4 rounded-2xl overflow-hidden shadow-2xl shadow-neon-pink/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="今夜烟火海报"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-night-800 flex items-center justify-center">
              <span className="text-foreground/30 text-sm">烟火正在绽放...</span>
            </div>
          )}

          {/* Tagline 叠加层 */}
          <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-night-950/90 via-night-950/40 to-transparent">
            <p className="text-white/90 text-lg font-hand tracking-wider leading-relaxed text-center">
              {observerResult.tagline}
            </p>
          </div>
        </div>

        {/* AI 心情 */}
        <div className="px-5 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neon-gold/70 font-hand tracking-wide">
              AI 感受到的心情
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            {observerResult.feeling}
          </p>
        </div>

        {/* 叙事段落 */}
        <div className="px-5 mt-3">
          <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
            {observerResult.narrative}
          </p>
        </div>

        {/* 轨迹时间线 */}
        <div className="px-5 mt-5 mb-2">
          <h3 className="text-xs text-neon-gold/60 font-hand tracking-wide mb-2">
            今夜足迹
          </h3>
          <div className="space-y-1.5">
            {trail
              .filter((e) => e.action === "viewed")
              .map((e, i) => {
                const stayed = trail.find(
                  (s) => s.action === "stayed" && s.stallId === e.stallId
                );
                const danmakuCount = trail.filter(
                  (d) => d.action === "danmaku" && d.stallId === e.stallId
                ).length;
                return (
                  <div
                    key={`${e.stallId}-${i}`}
                    className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-night-800/40 border border-night-700/30"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-neon-orange/10 border border-neon-orange/20 flex items-center justify-center text-xs text-neon-orange/80">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/85 truncate">
                        {e.stallName}
                      </p>
                      {stayed && (
                        <p className="text-xs text-foreground/35">
                          停留 {stayed.detail}
                          {danmakuCount > 0 && ` · 发了${danmakuCount}条弹幕`}
                        </p>
                      )}
                    </div>
                    {danmakuCount > 0 && (
                      <span className="flex-shrink-0 text-xs text-neon-pink/60">
                        💬 {danmakuCount}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* 弹幕记录 */}
        {timeline.danmaku.length > 0 && (
          <div className="px-5 mt-3 mb-4">
            <h3 className="text-xs text-neon-gold/60 font-hand tracking-wide mb-2">
              弹幕记录
            </h3>
            <div className="space-y-1">
              {timeline.danmaku.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-foreground/55 py-1"
                >
                  <span className="flex-shrink-0 text-neon-pink/50 mt-0.5">
                    💬
                  </span>
                  <span>
                    {e.detail}
                    <span className="text-foreground/25 ml-1.5">
                      @{e.stallName}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 搭子故事 */}
        {timeline.buddied.length > 0 && (
          <div className="px-5 mt-3 mb-4">
            <h3 className="text-xs text-neon-gold/60 font-hand tracking-wide mb-2">
              搭子故事
            </h3>
            <div className="p-3 rounded-xl bg-neon-pink/5 border border-neon-pink/20">
              <p className="text-xs text-foreground/65 leading-relaxed">
                在「{timeline.buddied[0].stallName}」你发起了一个饭搭子。在这条街上，有人同行总是更暖。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <footer className="flex-shrink-0 px-4 py-3 bg-night-950/90 backdrop-blur-md border-t border-night-700/60 space-y-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-3 rounded-xl font-bold text-base tracking-wider active:scale-[0.98] transition-all ${
            saved
              ? "bg-night-700 text-foreground/40"
              : "bg-gradient-to-r from-neon-pink to-neon-gold text-night-950"
          }`}
        >
          {saved ? "✨ 已存入记忆" : "💾 存入记忆"}
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