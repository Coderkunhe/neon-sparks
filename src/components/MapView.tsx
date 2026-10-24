"use client";

import { useEffect, useRef } from "react";
import type { Stall } from "@/types";
import { stalls } from "@/data/stalls";

/** 街口位置（用户锚点初始位置，"你刚到"） */
export const STREET_ENTRANCE: [number, number] = [31.1990, 121.6277];

interface MapViewProps {
  onStallClick: (stallId: string) => void;
  selectedStallId: string | null;
  /** 地图实例回传 —— 供弹幕层做 latlng → 屏幕像素换算 */
  mapRef: React.MutableRefObject<import("leaflet").Map | null>;
}

/**
 * Leaflet 地图 —— 暗色霓虹风格。
 * - 摊位：脉冲圈（双层外圈呼吸动画 + 中心实心核），体现"活摊位"
 * - 用户：红色导航指针 pin，尖端锚定真实坐标
 */
export default function MapView({
  onStallClick,
  selectedStallId,
  mapRef,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const onStallClickRef = useRef(onStallClick);
  onStallClickRef.current = onStallClick;

  // 初始化：加载 Leaflet + 创建地图 + 放置 marker
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    import("leaflet").then((L) => {
      if (cancelled) return;
      LRef.current = L;

      const map = L.map(container, {
        center: [31.1995, 121.6279],
        zoom: 17,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // 摊位 marker（脉冲圈）
      stalls.forEach((stall) => {
        const icon = createStallIcon(L, stall.color, false);
        const marker = L.marker(stall.position, { icon })
          .addTo(map)
          .bindTooltip(stall.name, {
            direction: "top",
            offset: [0, -30],
            className: "stall-tooltip",
          });

        marker.on("click", () => onStallClickRef.current(stall.id));
        markersRef.current.set(stall.id, marker);
      });

      // 用户定位指针
      userMarkerRef.current = L.marker(STREET_ENTRANCE, {
        icon: createUserPinIcon(L),
        interactive: false,
        zIndexOffset: 1000,
      }).addTo(map);
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      LRef.current = null;
    };
  }, [mapRef]);

  // selectedStallId 变化 → 更新 marker 高亮 + flyTo
  const prevSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    markersRef.current.forEach((marker, id) => {
      const stall = stalls.find((s) => s.id === id);
      if (!stall) return;
      const icon = createStallIcon(L, stall.color, selectedStallId === id);
      marker.setIcon(icon);
    });

    if (selectedStallId && selectedStallId !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedStallId;
      const stall = stalls.find((s) => s.id === selectedStallId);
      if (stall) {
        map.flyTo(stall.position, 18, { duration: 0.6 });
      }
    }

    if (!selectedStallId) {
      prevSelectedRef.current = null;
    }
  }, [selectedStallId, mapRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 leaflet-dark"
      style={{ zIndex: 1 }}
    />
  );
}

/**
 * 摊位脉冲圈 divIcon —— 双层外圈呼吸扩散 + 中心实心核。
 * 颜色通过 CSS custom property --stall-color 注入。
 */
function createStallIcon(
  L: typeof import("leaflet"),
  color: string,
  isSelected: boolean
) {
  const selClass = isSelected ? " stall-selected" : "";
  return L.divIcon({
    html: `
      <div class="stall-pulse${selClass}" style="--stall-color:${color}">
        <span class="stall-pulse-ring"></span>
        <span class="stall-pulse-ring"></span>
        <span class="stall-pulse-core"></span>
      </div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * 用户定位导航箭头 —— lucide Navigation 小火箭图标。
 * 红色实心 + 白描边 + 底外发光。
 */
function createUserPinIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    html: `<div class="nav-arrow">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="3 11 22 2 13 21 11 13 3 11" fill="#ff4757" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>
</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });
}