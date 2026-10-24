import type { Stall } from "@/types";

/**
 * Mock 摊位 —— 8 个摊位沿上海张江科学之门附近的夜市长街分布。
 * 中心点：张江科学之门（31.1995, 121.6279），摊位沿南北方向散布约 400m。
 */
export const stalls: Stall[] = [
  {
    id: "stall-1",
    name: "阿强炒粉摊",
    owner: "阿强",
    category: "炒粉",
    signature: "干炒牛河，镬气十足",
    description: "二十年老摊，街坊从小吃到大。阿强师傅颠勺的手法，火光冲天就是开张信号。",
    position: [31.1993, 121.6279],
    color: "#ff9a3c",
    hours: "17:00-01:00",
    avgPrice: 18,
  },
  {
    id: "stall-2",
    name: "老王烤串",
    owner: "老王",
    category: "烤串",
    signature: "炭火羊肉串，孜然撒三遍",
    description: "老王只烤三样：羊肉、面筋、鸡翅。炭火慢烤不着急，等的人越多越香。",
    position: [31.1995, 121.6281],
    color: "#ff5c7a",
    hours: "18:00-02:00",
    avgPrice: 15,
  },
  {
    id: "stall-3",
    name: "糖水阿嬷",
    owner: "林阿嬷",
    category: "糖水",
    signature: "手工芋圆红豆冰，甜而不腻",
    description: "阿嬷做了四十年糖水，芋圆坚持手搓。夏天一碗冰，冬天一碗热，四季都有人排队。",
    position: [31.1997, 121.6280],
    color: "#ffd166",
    hours: "16:00-23:00",
    avgPrice: 12,
  },
  {
    id: "stall-4",
    name: "老周米酒铺",
    owner: "老周",
    category: "米酒",
    signature: "桂花酿，入口柔不上头",
    description: "老周家三代酿米酒，桂花酿是招牌。坐在摊前小凳上喝一碗，整条街的烟火都慢下来。",
    position: [31.1994, 121.6283],
    color: "#e8d5b7",
    hours: "18:00-00:00",
    avgPrice: 20,
  },
  {
    id: "stall-5",
    name: "铁板阿杰",
    owner: "阿杰",
    category: "铁板",
    signature: "铁板鱿鱼，酱汁是灵魂",
    description: "铁板滋滋作响就是阿杰的招牌bgm。鱿鱼须在铁板上跳舞，刷上秘制酱汁，路人走不动道。",
    position: [31.1996, 121.6282],
    color: "#ff6b6b",
    hours: "17:30-01:30",
    avgPrice: 22,
  },
  {
    id: "stall-6",
    name: "关东煮大叔",
    owner: "陈大叔",
    category: "关东煮",
    signature: "日式高汤慢炖，萝卜是冠军",
    description: "大叔的关东煮摊永远冒着白气。汤底用昆布鲣鱼熬六小时，萝卜炖到透明，吸饱了汤汁。",
    position: [31.1995, 121.6277],
    color: "#a8dadc",
    hours: "17:00-00:00",
    avgPrice: 10,
  },
  {
    id: "stall-7",
    name: "炸物小仙",
    owner: "小仙",
    category: "炸物",
    signature: "盐酥鸡外酥里嫩，九层塔是灵魂",
    description: "小仙是夜市最年轻的摊主，专攻台式炸物。盐酥鸡+九层塔+蒜末，一份能让人记住这条街。",
    position: [31.1998, 121.6278],
    color: "#ffb347",
    hours: "18:00-01:00",
    avgPrice: 16,
  },
  {
    id: "stall-8",
    name: "素味人生",
    owner: "阿素",
    category: "其他",
    signature: "炭烤杏鲍菇，比肉还香",
    description: "阿素是素食者，想让吃素的人也能逛夜市。杏鲍菇切片炭烤刷酱，连肉食党都来排队。",
    position: [31.1992, 121.6280],
    color: "#77dd77",
    hours: "17:00-23:00",
    avgPrice: 14,
  },
];

/** 按 id 快速索引摊位 */
export const stallMap = new Map(stalls.map((s) => [s.id, s]));

/** 获取摊位 */
export function getStallById(id: string): Stall | undefined {
  return stallMap.get(id);
}