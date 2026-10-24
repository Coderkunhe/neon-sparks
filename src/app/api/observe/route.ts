import { NextResponse } from "next/server";
import { callGpt } from "@/lib/call-gpt";
import type { AIObserverInput } from "@/types";

/**
 * POST /api/observe —— 接收行为轨迹，调用 GPT 生成叙事。
 * 失败返回 500，前端降级到规则引擎 mock。
 */
export async function POST(request: Request) {
  try {
    const input: AIObserverInput = await request.json();
    const result = await callGpt(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    console.warn("[api/observe] GPT 调用失败:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}