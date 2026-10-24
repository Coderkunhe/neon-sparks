import type { Danmaku } from "@/types";

/**
 * 初始弹幕池 —— 每个摊位预置若干条，按「谁在说」分类：
 * - diner    食客（真人，用户 + 其他食客）
 * - vendor   商户吆喝（AI 替摊主自动喊，摊主零操作但"活了"）
 * - resident 街坊闲谈（AI 作为街的居民闲聊，可推荐别家）
 * - buddy    搭子旗标（真人发起，固定悬挂）
 */
export const initialDanmaku: Danmaku[] = [
  // ===== 阿强炒粉摊 =====
  {
    id: "d-1a",
    stallId: "stall-1",
    content: "老板来两份干炒牛河！多放豆芽少放油",
    type: "diner",
    timestamp: Date.now() - 60000,
  },
  {
    id: "d-1b",
    stallId: "stall-1",
    content: "出锅咯——牛河刚炒好，热乎的！",
    type: "vendor",
    timestamp: Date.now() - 45000,
  },
  {
    id: "d-1c",
    stallId: "stall-1",
    content: "从高中吃到当爸爸，还是这个味道👍",
    type: "diner",
    timestamp: Date.now() - 30000,
  },
  {
    id: "d-1d",
    stallId: "stall-1",
    content: "隔壁老王家的羊肉串也好吃，可以一起买",
    type: "resident",
    timestamp: Date.now() - 15000,
  },

  // ===== 老王烤串 =====
  {
    id: "d-2a",
    stallId: "stall-2",
    content: "老王！十串羊肉五串面筋，微辣！",
    type: "diner",
    timestamp: Date.now() - 55000,
  },
  {
    id: "d-2b",
    stallId: "stall-2",
    content: "羊肉串出炉！孜然香飘半条街🔥",
    type: "vendor",
    timestamp: Date.now() - 40000,
  },
  {
    id: "d-2c",
    stallId: "stall-2",
    content: "等了二十分钟了，但值得🥲",
    type: "diner",
    timestamp: Date.now() - 25000,
  },
  {
    id: "d-2d",
    stallId: "stall-2",
    content: "烤面筋外焦里嫩，比肉还香",
    type: "diner",
    timestamp: Date.now() - 10000,
  },
  {
    id: "d-2e",
    stallId: "stall-2",
    content: "吃完烤串去阿嬷那来碗芋圆冰，绝配",
    type: "resident",
    timestamp: Date.now() - 5000,
  },

  // ===== 糖水阿嬷 =====
  {
    id: "d-3a",
    stallId: "stall-3",
    content: "阿嬷～一碗芋圆红豆冰，少冰多芋圆拜托🙏",
    type: "diner",
    timestamp: Date.now() - 50000,
  },
  {
    id: "d-3b",
    stallId: "stall-3",
    content: "手搓芋圆口感就是不一样，Q弹不粘牙",
    type: "diner",
    timestamp: Date.now() - 35000,
  },
  {
    id: "d-3c",
    stallId: "stall-3",
    content: "糖水现熬好咯，冰的温的都有～",
    type: "vendor",
    timestamp: Date.now() - 20000,
  },

  // ===== 老周米酒铺 =====
  {
    id: "d-4a",
    stallId: "stall-4",
    content: "来一碗桂花酿，今晚不醉不归",
    type: "diner",
    timestamp: Date.now() - 48000,
  },
  {
    id: "d-4b",
    stallId: "stall-4",
    content: "三代人的手艺，这桂花香是独门秘方吧",
    type: "diner",
    timestamp: Date.now() - 33000,
  },
  {
    id: "d-4c",
    stallId: "stall-4",
    content: "桂花酿新开坛，入口柔不辣喉",
    type: "vendor",
    timestamp: Date.now() - 18000,
  },

  // ===== 铁板阿杰 =====
  {
    id: "d-5a",
    stallId: "stall-5",
    content: "铁板滋滋响那条街都能听见！一份鱿鱼谢谢",
    type: "diner",
    timestamp: Date.now() - 52000,
  },
  {
    id: "d-5b",
    stallId: "stall-5",
    content: "酱汁是灵魂，阿杰的秘方打死不告诉别人",
    type: "diner",
    timestamp: Date.now() - 37000,
  },
  {
    id: "d-5c",
    stallId: "stall-5",
    content: "铁板鱿鱼马上好，酱汁管够！",
    type: "vendor",
    timestamp: Date.now() - 22000,
  },

  // ===== 关东煮大叔 =====
  {
    id: "d-6a",
    stallId: "stall-6",
    content: "大叔！萝卜要最大的那块，再要两个福袋",
    type: "diner",
    timestamp: Date.now() - 57000,
  },
  {
    id: "d-6b",
    stallId: "stall-6",
    content: "昆布高汤太鲜了，冬天喝一碗整个人都暖了",
    type: "diner",
    timestamp: Date.now() - 42000,
  },
  {
    id: "d-6c",
    stallId: "stall-6",
    content: "关东煮咕嘟咕嘟煮着，萝卜吸饱了汤",
    type: "vendor",
    timestamp: Date.now() - 27000,
  },

  // ===== 炸物小仙 =====
  {
    id: "d-7a",
    stallId: "stall-7",
    content: "小仙！一份盐酥鸡加九层塔，大的！",
    type: "diner",
    timestamp: Date.now() - 51000,
  },
  {
    id: "d-7b",
    stallId: "stall-7",
    content: "外酥里嫩真的绝了，九层塔是点睛之笔",
    type: "diner",
    timestamp: Date.now() - 36000,
  },
  {
    id: "d-7c",
    stallId: "stall-7",
    content: "盐酥鸡刚出锅，趁热最脆！",
    type: "vendor",
    timestamp: Date.now() - 21000,
  },

  // ===== 素味人生 =====
  {
    id: "d-8a",
    stallId: "stall-8",
    content: "杏鲍菇烤得也太香了吧！素食之光🌟",
    type: "diner",
    timestamp: Date.now() - 49000,
  },
  {
    id: "d-8b",
    stallId: "stall-8",
    content: "从来不吃素的人路过被香进来了",
    type: "diner",
    timestamp: Date.now() - 34000,
  },
  {
    id: "d-8c",
    stallId: "stall-8",
    content: "素烤串现点现烤，酱香不输荤的",
    type: "vendor",
    timestamp: Date.now() - 19000,
  },

  // ===== 街坊闲谈（不绑定摊位，整条街的氛围）=====
  {
    id: "d-9a",
    stallId: "",
    content: "今晚人好多，整条街都活了",
    type: "resident",
    timestamp: Date.now() - 44000,
  },
  {
    id: "d-9b",
    stallId: "",
    content: "风里都是烤肉的味道🍢",
    type: "resident",
    timestamp: Date.now() - 29000,
  },
  {
    id: "d-9c",
    stallId: "",
    content: "今晚的月光配这条街正好",
    type: "resident",
    timestamp: Date.now() - 14000,
  },
  {
    id: "d-9d",
    stallId: "",
    content: "又有人组搭子了，真热闹",
    type: "resident",
    timestamp: Date.now() - 6000,
  },
];
