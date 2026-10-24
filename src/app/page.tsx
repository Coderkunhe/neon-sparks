"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppView, TrailEntry } from "@/types";
import StreetView from "@/components/StreetView";
import PosterView from "@/components/PosterView";
import CalendarView from "@/components/CalendarView";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * 单页状态机 —— 所有视图在此切换。
 * street ↔ poster ↔ calendar，不路由。
 * 全屏沉浸：无 max-w 限制，移动端到桌面端全覆盖。
 */
export default function Home() {
  const [view, setView] = useState<AppView>("street");
  /** 轨迹数据：从 street 采集，传给 poster 使用 */
  const [trail, setTrail] = useState<TrailEntry[]>([]);

  const handleEndNight = useCallback((t: TrailEntry[]) => {
    setTrail(t);
    setView("poster");
  }, []);

  return (
    <main className="relative flex-1 flex flex-col w-full h-full overflow-hidden bg-night-950">
      <AnimatePresence mode="wait">
        {view === "street" && (
          <motion.div
            key="street"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="absolute inset-0"
          >
            <StreetView
              onEndNight={handleEndNight}
              onOpenCalendar={() => setView("calendar")}
            />
          </motion.div>
        )}

        {view === "poster" && (
          <motion.div
            key="poster"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="absolute inset-0"
          >
            <PosterView
              trail={trail}
              onSaveMemory={() => setView("calendar")}
              onBackToStreet={() => setView("street")}
            />
          </motion.div>
        )}

        {view === "calendar" && (
          <motion.div
            key="calendar"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="absolute inset-0"
          >
            <CalendarView onClose={() => setView("street")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}