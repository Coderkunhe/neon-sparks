"use client";

import { useState, useEffect, useRef } from "react";
import type { Danmaku } from "@/types";
import { stallMap } from "@/data/stalls";

/** 同时活跃弹幕上限 */
const MAX_ACTIVE = 6;
/** 弹幕生成间隔 ms */
const SPAWN_INTERVAL = 1600;

interface DanmakuLayerProps {
  stallId: string | null;
  pool: Danmaku[];
  onRequestAiSpawn: () => void;
  /** 地图实例 —— latLngToContainerPoint 换算摊位屏幕行高 */
  mapRef: React.MutableRefObject<import("leaflet").Map | null>;
}

/** 活跃弹幕 */
interface ActiveCell {
  renderId: string;
  danmaku: Danmaku;
  /** 摊位绑定 → anchorY 在生成时固定（避免地图拖动跳动） */
  anchorY: number;
  /** 非摊位闲谈 → 随机漂浮行 */
  floatY?: number;
  /** 滚动时长 ms（8-14s，从容漂过整屏） */
  duration: number;
}

/**
 * 弹幕滚动层 —— 摊位高度横向飘过。
 * - 摊位绑定弹幕：用 latLngToContainerPoint 换算 Y，在该行从右往左滚
 * - 街坊闲谈（无摊位绑定）：随机行高飘过
 * - 四种声音：食客白 / 招牌橙 / 街坊粉 / 搭子金
 */
export default function DanmakuLayer({
  stallId,
  pool,
  onRequestAiSpawn,
  mapRef,
}: DanmakuLayerProps) {
  const [active, setActive] = useState<ActiveCell[]>([]);
  const spawnedIdsRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  /** 从池中取一条弹幕 */
  const popDanmaku = (): Danmaku | null => {
    const candidates = stallId
      ? pool.filter((d) => d.stallId === stallId)
      : pool;
    if (candidates.length === 0) return null;
    const diners = candidates.filter((d) => d.type === "diner");
    const pickPool = diners.length > 0 && Math.random() < 0.6 ? diners : candidates;
    return pickPool[Math.floor(Math.random() * pickPool.length)];
  };

  /** 计算摊位弹幕的屏幕 Y（生成时锁定） */
  const stallScreenY = (danmaku: Danmaku): number | null => {
    const map = mapRef.current;
    const stall = stallMap.get(danmaku.stallId);
    if (!map || !stall) return null;
    const pt = map.latLngToContainerPoint([stall.position[0], stall.position[1]]);
    // 摊位 marker 上方 30-80px 随机偏移，避免跟 marker 完全重合
    return pt.y - 30 - Math.random() * 50;
  };

  /** 发射一条弹幕到屏幕 */
  const spawn = () => {
    const d = popDanmaku();
    if (!d) return;
    if (spawnedIdsRef.current.has(d.id)) return;
    spawnedIdsRef.current.add(d.id);
    if (spawnedIdsRef.current.size > 500) {
      spawnedIdsRef.current = new Set([...spawnedIdsRef.current].slice(-200));
    }

    const renderId = `${d.id}#${Math.random().toString(36).slice(2, 6)}`;
    const duration = 8000 + Math.random() * 6000;

    let anchorY: number;
    let floatY: number | undefined;

    if (d.stallId && stallMap.has(d.stallId)) {
      anchorY = stallScreenY(d) ?? 60 + Math.random() * 200;
    } else {
      // 街坊闲谈：随机行高
      anchorY = 0;
      floatY = 0.08 + Math.random() * 0.55;
    }

    const cell: ActiveCell = { renderId, danmaku: d, anchorY, floatY, duration };

    setActive((prev) => {
      const next = [...prev.filter((b) => b.danmaku.id !== d.id), cell];
      while (next.length > MAX_ACTIVE) next.shift();
      return next;
    });

    setTimeout(() => {
      setActive((prev) => prev.filter((b) => b.renderId !== renderId));
    }, duration);
  };

  // 定时弹幕
  useEffect(() => {
    for (let i = 0; i < 3; i++) setTimeout(spawn, i * 350);
    const timer = setInterval(() => {
      onRequestAiSpawn();
      spawn();
    }, SPAWN_INTERVAL);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stallId]);

  // stallId 切换清空
  useEffect(() => {
    setActive([]);
  }, [stallId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {active.map((c) => {
        const y = resolveY(c, containerRef.current);
        if (y === null) return null;
        const { style: cs } = visual(c.danmaku.type);

        return (
          <div
            key={c.renderId}
            className={`absolute whitespace-nowrap text-sm px-3 py-1 rounded-full backdrop-blur-sm ${cs}`}
            style={{
              top: `${y}px`,
              left: "100%",
              animation: `danmaku-scroll ${c.duration / 1000}s linear forwards`,
            }}
          >
            {c.danmaku.type === "vendor" && (
              <span className="mr-1 text-xs opacity-70">招牌</span>
            )}
            {c.danmaku.type === "resident" && (
              <span className="mr-1 text-xs opacity-70">街坊</span>
            )}
            {c.danmaku.type === "buddy" && <span className="mr-1">🚩</span>}
            {c.danmaku.content}
          </div>
        );
      })}
    </div>
  );
}

/** 解析活跃弹幕的 Y 坐标 */
function resolveY(cell: ActiveCell, container: HTMLDivElement | null): number | null {
  if (!container) return null;
  if (cell.floatY !== undefined) {
    return container.getBoundingClientRect().height * cell.floatY;
  }
  return cell.anchorY;
}

/** 声音分类视觉 */
function visual(type: Danmaku["type"]): { style: string } {
  switch (type) {
    case "vendor":
      return { style: "text-neon-orange bg-neon-orange/10" };
    case "resident":
      return { style: "text-fuchsia-300 bg-fuchsia-400/10" };
    case "buddy":
      return { style: "text-neon-gold bg-neon-gold/15" };
    case "diner":
    default:
      return { style: "text-white/90 bg-black/40" };
  }
}