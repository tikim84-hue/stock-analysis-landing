"use client";

import { useState } from "react";
import { LogIn, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-context";
import { useChat, type ChatRow } from "@/lib/use-chat";

const MAX_LENGTH = 400;

export function Guestbook() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const { rows, isHydrated, sending, error, send } = useChat();
  const [draft, setDraft] = useState("");

  const showAuthGate = !authLoading && !user;
  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && !sending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    const ok = await send(trimmed);
    if (ok) setDraft("");
  }

  return (
    <section
      id="guestbook"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            Guestbook · AI chat
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            한 줄 방문내역 + AI 답
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            한 줄 입력하면 AI가 답을 돌려주고, 본인 계정에만 차곡차곡 쌓입니다.
          </p>
        </div>

        {showAuthGate ? (
          <div className="rounded-lg border border-border/60 bg-card/60 p-10 text-center">
            <h3 className="text-lg font-semibold">
              로그인하면 AI와 한 줄 대화를 남길 수 있습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              주고받은 내용은 본인 계정에서만 보입니다.
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-highlight/90 px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-highlight"
            >
              <LogIn className="h-4 w-4" />
              로그인 / 회원가입
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={handleSubmit}
              className="rounded-lg border border-border/60 bg-card/40 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <Input
                  placeholder="방문내역"
                  maxLength={MAX_LENGTH}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={sending}
                  className="sm:flex-1"
                />
                <Button type="submit" disabled={!canSend}>
                  <Send className="h-4 w-4" />
                  {sending ? "AI 답변 중…" : "전송"}
                </Button>
              </div>
              {error ? (
                <p className="mt-2 text-sm text-down">{error}</p>
              ) : null}
            </form>

            <ChatHistory
              rows={rows}
              isHydrated={isHydrated}
              userLabel={user?.email ?? "나"}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ChatHistory({
  rows,
  isHydrated,
  userLabel,
}: {
  rows: ChatRow[];
  isHydrated: boolean;
  userLabel: string;
}) {
  if (!isHydrated) {
    return (
      <p className="text-sm text-muted-foreground">대화 기록을 불러오는 중…</p>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 주고받은 내용이 없습니다. 위에서 한 줄 입력해보세요.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-4">
      {rows.map((row) => (
        <li
          key={row.id}
          className="rounded-lg border border-border/60 bg-card/40 p-4"
        >
          <Bubble role="user" label={userLabel}>
            {row.ai_input}
          </Bubble>
          <Bubble role="assistant" label="AI">
            {row.ai_output}
          </Bubble>
          <p className="mt-3 text-right text-xs text-muted-foreground/70">
            {formatTimestamp(row.created_at)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Bubble({
  role,
  label,
  children,
}: {
  role: "user" | "assistant";
  label: string;
  children: React.ReactNode;
}) {
  const Icon = role === "user" ? User : Sparkles;
  return (
    <div className="flex gap-3 py-2 first:pt-0 last:pb-0">
      <div
        className={
          role === "user"
            ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
            : "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-highlight/20 text-highlight"
        }
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
          {children}
        </p>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
