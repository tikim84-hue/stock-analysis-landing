"use client";

import { useEffect, useState } from "react";
import { Check, LogIn, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-context";
import { useMessage } from "@/lib/use-message";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 200;

export function Guestbook() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const { content, isHydrated, saving, error, save } = useMessage();
  const [draft, setDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (isHydrated) setDraft(content);
  }, [content, isHydrated]);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 2000);
    return () => clearTimeout(t);
  }, [savedFlash]);

  const showAuthGate = !authLoading && !user;
  const trimmed = draft.trim();
  const dirty = trimmed.length > 0 && trimmed !== content;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    const ok = await save(trimmed);
    if (ok) setSavedFlash(true);
  }

  return (
    <section
      id="guestbook"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            Guestbook
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            한 줄 방문내역
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            로그인한 본인만 볼 수 있는 짧은 메모입니다. 다음 방문에도 이 자리에 그대로 남아있습니다.
          </p>
        </div>

        {showAuthGate ? (
          <div className="rounded-lg border border-border/60 bg-card/60 p-10 text-center">
            <h3 className="text-lg font-semibold">
              로그인하면 한 줄 방문내역을 남길 수 있습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              남긴 메모는 본인 계정에서만 보입니다.
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
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-border/60 bg-card/40 p-6"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="guestbook-input">메모</Label>
                <span
                  className={cn(
                    "text-xs tabular-nums text-muted-foreground",
                    draft.length > MAX_LENGTH && "text-down",
                  )}
                >
                  {draft.length}/{MAX_LENGTH}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="guestbook-input"
                  placeholder="방문내역"
                  maxLength={MAX_LENGTH}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={!isHydrated || saving}
                  className="sm:flex-1"
                />
                <Button
                  type="submit"
                  disabled={!dirty || saving || !isHydrated}
                  className="sm:w-auto"
                >
                  {savedFlash ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "저장 중…" : savedFlash ? "저장됨" : "저장"}
                </Button>
              </div>
              {error ? (
                <p className="text-sm text-down">{error}</p>
              ) : !isHydrated ? (
                <p className="text-xs text-muted-foreground">불러오는 중…</p>
              ) : content ? (
                <p className="text-xs text-muted-foreground">
                  이전 메모를 수정할 수 있습니다.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
