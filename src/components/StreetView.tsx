"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import TopBar from "./TopBar";
import DanmakuLayer from "./DanmakuLayer";
import StallDetailPanel from "./StallDetailPanel";
import type { Danmaku, TrailEntry } from "@/types";
import { initialDanmaku } from "@/data/danmaku";
import { stalls } from "@/data/stalls";

/** MapView 禁用 SSR —— Leaflet 是纯浏览器库 */
const MapView = dynamic(() => import("./MapView"), { ssr: false });

/** AI 弹幕生成池 —— 街坊闲谈，不与初始种子重复 */
const AI_SPAWN_POOL = [
  "好香的味道飘了半条街…",
  "下小雨了，大家撑伞继续逛",
  "今晚的月光配这条街正好",
  "看着这些灯，想家了",
  "路过的阿姨说这家糖水甜到心里去了",
  "听到铁板滋滋响就走不动路",
  "街头卖唱的哥们今天弹的是《成都》",
  "闻到关东煮的汤底就知道冬天来了",
];

interface StreetViewProps {
  onEndNight: (trail: TrailEntry[]) => void;
  onOpenCalendar: () => void;
}

/**
 * 街景主视图 —— 真地图 + 发光摊位 + 弹幕冒泡 + 用户锚点。
 * 弹幕池唯一 owner：发弹幕 / AI 生成 / 冒泡层 / 详情面板 皆读同一份。
 */
export default function StreetView({
  onEndNight,
  onOpenCalendar,
}: StreetViewProps) {
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [danmakuPool, setDanmakuPool] = useState<Danmaku[]>([...initialDanmaku]);
  const [trail, setTrail] = useState<TrailEntry[]>([]);
  const counterRef = useRef(0);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  /** 记录摊位浏览（同摊位只记一次） */
  const recordStallView = useCallback((id: string) => {
    setTrail((prev) => {
      if (prev.some((e) => e.stallId === id && e.action === "viewed")) return prev;
      const stall = stalls.find((s) => s.id === id);
      return [
        ...prev,
        {
          stallId: id,
          stallName: stall?.name ?? id,
          action: "viewed" as const,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const handleStallClick = useCallback(
    (id: string) => {
      setSelectedStallId((prev) => {
        const next = prev === id ? null : id;
        if (next) recordStallView(id);
        return next;
      });
    },
    [recordStallView]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedStallId(null);
  }, []);

  const handleSendDanmaku = useCallback(
    (stallId: string, content: string) => {
      const newDanmaku: Danmaku = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stallId,
        content,
        type: "diner",
        timestamp: Date.now(),
      };
      setDanmakuPool((prev) => [...prev, newDanmaku]);
      const stall = stalls.find((s) => s.id === stallId);
      setTrail((prev) => [
        ...prev,
        {
          stallId,
          stallName: stall?.name ?? stallId,
          action: "danmaku" as const,
          timestamp: new Date().toISOString(),
          detail: content,
        },
      ]);
    },
    []
  );

  /** 组搭子 —— 记录轨迹 */
  const handleBuddy = useCallback((stallId: string) => {
    const stall = stalls.find((s) => s.id === stallId);
    setTrail((prev) => [
      ...prev,
      {
        stallId,
        stallName: stall?.name ?? stallId,
        action: "buddied" as const,
        timestamp: new Date().toISOString(),
        detail: "joined",
      },
    ]);
  }, []);

  /** 写入一条 AI 弹幕到唯一池 */
  const handleAiSpawn = useCallback(() => {
    const content = AI_SPAWN_POOL[Math.floor(Math.random() * AI_SPAWN_POOL.length)];
    counterRef.current += 1;
    const newD: Danmaku = {
      id: `ai-${counterRef.current}-${Date.now()}`,
      stallId: "",
      content,
      type: "resident",
      timestamp: Date.now(),
    };
    setDanmakuPool((prev) => [...prev.slice(-300), newD]);
  }, []);

  /** 结束今夜 —— 为每个逛过的摊位补停留时长，再交给海报 */
  const handleEndNight = useCallback(() => {
    const viewedIds = trail
      .filter((e) => e.action === "viewed")
      .map((e) => e.stallId);
    // 去重 + 保持顺序
    const uniqueViewed = Array.from(new Set(viewedIds));
    const stayed: TrailEntry[] = uniqueViewed.map((id) => {
      const stall = stalls.find((s) => s.id === id);
      const minutes = 3 + Math.floor(Math.random() * 13); // 3-15 分钟
      return {
        stallId: id,
        stallName: stall?.name ?? id,
        action: "stayed" as const,
        timestamp: new Date().toISOString(),
        detail: `${minutes}分钟`,
      };
    });
    // 按时间顺序合并：viewed/danmaku/buddied 保持原序，stayed 追加在末尾
    onEndNight([...trail, ...stayed]);
  }, [trail, onEndNight]);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏悬浮在地图上方 */}
      <TopBar title="探寻霓虹中的烟火" onCalendarClick={onOpenCalendar} />

      {/* 地图区：MapView + 弹幕冒泡层 */}
      <div className="flex-1 relative bg-night-900">
        <MapView
          onStallClick={handleStallClick}
          selectedStallId={selectedStallId}
          mapRef={mapRef}
        />
        <DanmakuLayer
          stallId={selectedStallId}
          pool={danmakuPool}
          onRequestAiSpawn={handleAiSpawn}
          mapRef={mapRef}
        />
      </div>

      {/* 摊位详情面板 —— 底部悬浮 sheet */}
      {selectedStallId && (
        <StallDetailPanel
          stallId={selectedStallId}
          onClose={handleClosePanel}
          onSendDanmaku={handleSendDanmaku}
          onBuddy={handleBuddy}
          danmakuForStall={danmakuPool.filter((d) => d.stallId === selectedStallId)}
        />
      )}

      {/* 底部操作栏 —— 悬浮在地图上方 */}
      <footer className="flex-shrink-0 px-4 py-3 bg-night-950/90 backdrop-blur-md border-t border-night-700/60">
        <button
          type="button"
          onClick={handleEndNight}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink text-white font-bold text-base tracking-wider neon-text-white active:scale-[0.98] transition-transform"
        >
          🌙 结束今夜
        </button>
        <p className="text-center text-xs text-foreground/45 mt-2">
          走进来，你就是这条街的一部分
        </p>
      </footer>
    </div>
  );
}