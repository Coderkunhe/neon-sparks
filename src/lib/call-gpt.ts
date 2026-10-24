import type { ObserverResult } from "./ai-observer";
import type { AIObserverInput } from "@/types";

/**
 * GPT 文本叙事 —— 调用 OpenAI Chat API，把行为轨迹转成叙事精华。
 * 在服务端（API Route）执行，key 不出浏览器。
 */

const SYSTEM_PROMPT = `你是「探寻霓虹中的烟火」这条夜市街的观察者。
你的职责：根据一个夜游者今晚的行为轨迹，为他写一段属于他自己的深夜故事。

输入是一段轨迹：他逛了哪些摊位、发了什么弹幕、是否组了饭搭子、在哪停留最久。

写作要求：
1. tagline：一句点睛，不超过 30 个字，要有烟火气、有画面感，不矫情、不喊口号。
2. feeling：从行为里推断他今晚的心情，用一句自然的话，不要机械地罗列。
3. narrative：一段 80-150 字的深夜独白，像有人在夜里轻轻讲这段记忆，不要像数据总结。
   - 逛得少就写"匆匆路过"的克制，逛得多就写"尽兴"的满足
   - 发了弹幕就写"被听见"的互动，没发就写"安静"的陪伴
   - 组了饭搭子就多写这段温暖，没组就写一个人也很好
4. weather：直接原样回传输入里的 weather 字段，不要改。
5. longestStayName：直接原样回传输入里的 longestStayName 字段，不要改。

严格输出 JSON，字段名为 tagline / feeling / narrative / weather / longestStayName。`;

/**
 * 调 GPT 生成叙事。失败抛异常，由调用方降级到规则引擎 mock。
 */
export async function callGpt(
  input: AIObserverInput
): Promise<ObserverResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 未配置");
  }

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const userContent = JSON.stringify(
    {
      trail: input.trail,
      danmakuLog: input.danmakuLog,
      buddyStory: input.buddyStory,
      longestStayName: input.longestStayName,
      longestStayDuration: input.longestStayDuration,
      time: input.time,
      weather: input.weather,
      weekday: input.weekday,
    },
    null,
    2
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const completion = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.85,
      },
      { signal: controller.signal }
    );

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<ObserverResult>;

    if (
      typeof parsed.tagline !== "string" ||
      typeof parsed.feeling !== "string" ||
      typeof parsed.narrative !== "string"
    ) {
      throw new Error("GPT 返回 JSON 字段不完整");
    }

    return {
      tagline: parsed.tagline.slice(0, 40),
      feeling: parsed.feeling,
      narrative: parsed.narrative,
      weather: input.weather,
      longestStayName: input.longestStayName,
    };
  } finally {
    clearTimeout(timeout);
  }
}
