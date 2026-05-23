import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-3.5-haiku";
const MAX_INPUT_LEN = 4000;
const MAX_TOKENS = 400;
const SYSTEM_PROMPT =
  "한국어로 답해. 길이는 3~5줄. 군더더기·서론·맺음말 없이 핵심만. 코드/표가 꼭 필요하면 짧게 한 블록만.";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
// In-memory per-instance limiter. Fluid Compute reuses instances so this catches burst abuse,
// but it's not a globally consistent cap — replace with Upstash Ratelimit if multi-instance correctness matters.
const rateBuckets = new Map<string, number[]>();

function allowRequest(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const bucket = (rateBuckets.get(userId) ?? []).filter((t) => t > cutoff);
  if (bucket.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(userId, bucket);
    return false;
  }
  bucket.push(now);
  rateBuckets.set(userId, bucket);
  return true;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "content-type must be application/json" },
      { status: 415 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!allowRequest(user.id)) {
    return NextResponse.json(
      { error: "요청이 너무 잦습니다. 잠시 후 다시 시도하세요." },
      { status: 429 },
    );
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
    console.error("[ai] OPENROUTER_API_KEY is missing");
    return NextResponse.json(
      { error: "서비스를 일시적으로 사용할 수 없습니다" },
      { status: 503 },
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
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input },
      ],
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
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
  return NextResponse.json(data);
}
