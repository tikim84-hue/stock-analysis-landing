import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-3.5-haiku";
const MAX_INPUT_LEN = 4000;
const MAX_TOKENS = 800;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { input?: unknown };
  try {
    body = (await request.json()) as { input?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (input.length === 0 || input.length > MAX_INPUT_LEN) {
    return NextResponse.json(
      { error: `input must be 1-${MAX_INPUT_LEN} chars` },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 },
    );
  }
  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const aiRes = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": request.nextUrl.origin,
      "X-Title": "stock-analysis-landing",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: input }],
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!aiRes.ok) {
    const detail = await aiRes.text();
    console.error("[ai] openrouter error:", aiRes.status, detail);
    return NextResponse.json(
      { error: `AI 호출 실패 (${aiRes.status})` },
      { status: 502 },
    );
  }

  const aiData = (await aiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const output = aiData?.choices?.[0]?.message?.content ?? "";
  if (!output) {
    return NextResponse.json(
      { error: "AI 응답이 비어있습니다" },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ ai_input: input, ai_output: output })
    .select("id, ai_input, ai_output, created_at")
    .single();
  if (error) {
    console.error("[ai] db insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
