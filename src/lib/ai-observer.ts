import type { AIObserverInput } from "@/types";

/** AI 观察器输出 —— 叙事精华 */
export interface ObserverResult {
  /** 海报一句点睛 ≤30 字 */
  tagline: string;
  /** AI 推断的心情 */
  feeling: string;
  /** 完整叙事段落 */
  narrative: string;
  /** 天气，由 observer 直接返回，下游取值不依赖正则 */
  weather: string;
  /** 停留最久的摊位名 */
  longestStayName: string;
}

/**
 * AI 观察器 —— 基于行为轨迹推断今夜心情与叙事。
 * 当前为规则引擎 mock 实现，真 LLM 接入时替换此函数。
 *
 * 规则：逛摊数=基调，弹幕数=互动感，搭子=温度，天气/时间=氛围。
 */
export function observe(input: AIObserverInput): ObserverResult {
  const { trail, danmakuLog, buddyStory, longestStayName, time, weather, weekday } =
    input;

  const viewedCount = trail.filter((e) => e.action === "viewed").length;
  const danmakuCount = danmakuLog.length;
  const hasBuddy = buddyStory !== null;

  // ---- 心情推断 ----
  const feelings: string[] = [];
  if (hasBuddy) feelings.push("有人同行的温暖");
  if (danmakuCount >= 3) feelings.push("热闹自在");
  else if (danmakuCount > 0) feelings.push("偶尔搭话的轻松");
  else feelings.push("安静独处");
  if (viewedCount >= 5) feelings.push("尽兴而归");
  else if (viewedCount >= 2) feelings.push("浅尝辄止");
  else feelings.push("匆匆路过");
  const feeling = feelings.join("，");

  // ---- 基调词 ----
  let tone = "";
  if (viewedCount >= 6) tone = "扫街式逛了个遍";
  else if (viewedCount >= 4) tone = "慢悠悠挑着逛";
  else if (viewedCount >= 2) tone = "只奔着喜欢的去";
  else tone = "匆匆路过";

  // ---- 互动感 ----
  let interaction = "";
  if (danmakuCount >= 4) interaction = "今晚话匣子打开就关不住，一条接一条";
  else if (danmakuCount >= 2) interaction = "偶尔冒个泡，话不多但刚好";
  else if (danmakuCount === 1) interaction = "只说了一句话，但被听见了";
  else interaction = "安安静静的，烟火看在眼里就够了";

  // ---- 搭子叙事 ----
  let buddyPart = "";
  if (hasBuddy) {
    buddyPart = `最难得的是，今晚不是一个人。${buddyStory} 这是整条街最有温度的一段记忆。`;
  } else {
    buddyPart =
      "一个人逛也没什么不好——每个摊位都是你的深夜食堂，每条弹幕都是路过的陪伴。";
  }

  // ---- tagline 生成 ----
  const taglines = [
    `在${weather}的${weekday}夜，${tone}`,
    `${tone}的夜晚，烟火知道你来过`,
    `${weather}吹不散的，是这条街的温度`,
    `${tone}，${longestStayName || "每个摊位"}都留下了故事`,
    `一个人也好，一条街也好，今晚都是你的`,
    `${weekday}的夜晚，被${danmakuCount}条弹幕和${viewedCount}个摊位填满`,
    `走过${viewedCount}个摊位，留下${danmakuCount}句话，刚刚好`,
    `${weather}的街，${feeling.substring(0, 6)}的人`,
  ];
  const tagline = taglines[viewedCount % taglines.length];

  // ---- 叙事段落 ----
  const narrative = [
    `${weekday}的晚上，${time}，${weather}。`,
    `你沿着夜市长街，${tone}——一共${viewedCount}个摊位，每个都有它的故事。`,
    interaction + "。",
    buddyPart,
    longestStayName ? `${longestStayName}是你今晚待得最久的地方——大概是真的喜欢吧。` : "",
    `离开的时候，街灯还在亮着。明天它还会在这里，但今晚的烟火，只属于你。`,
  ]
    .filter(Boolean)
    .join("");

  return { tagline, feeling, narrative, weather, longestStayName };
}

/**
 * 从 trail 中提取 AI 观察器所需的 7 维输入
 */
export function buildObserverInput(
  trail: import("@/types").TrailEntry[]
): AIObserverInput {
  const danmakuLog = trail
    .filter((e) => e.action === "danmaku" && e.detail)
    .map((e) => e.detail!);

  const buddyEntry = trail.find((e) => e.action === "buddied");
  const buddyStory = buddyEntry
    ? `在「${buddyEntry.stallName}」你发起了一个饭搭子，想找人和你一起拼桌。`
    : null;

  const stayedEntries = trail.filter((e) => e.action === "stayed");
  const longestStayEntry =
    stayedEntries.length > 0
      ? stayedEntries.reduce((max, e) => {
          const min = parseInt(e.detail ?? "0", 10);
          const maxMin = parseInt(max.detail ?? "0", 10);
          return min > maxMin ? e : max;
        })
      : null;
  const longestStayName = longestStayEntry?.stallName ?? "";
  const longestStayDuration = longestStayEntry?.detail ?? "";

  // mock 天气/时间/星期（后续可接真实数据）
  const weathers = ["小雨淅沥", "微风", "晴夜微凉", "薄雾", "月明星稀"];
  const weather = weathers[Math.floor(Math.random() * weathers.length)];

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[now.getDay()];

  return {
    trail,
    danmakuLog,
    buddyStory,
    longestStayName,
    longestStayDuration,
    time,
    weather,
    weekday,
  };
}