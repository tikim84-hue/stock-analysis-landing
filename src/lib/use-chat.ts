"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

export type ChatRow = {
  id: string;
  ai_input: string;
  ai_output: string;
  created_at: string;
};

export function useChat() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRows([]);
      setIsHydrated(true);
      return;
    }
    let cancelled = false;
    setIsHydrated(false);
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, ai_input, ai_output, created_at")
        .not("ai_input", "is", null)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("[chat] load failed:", error.message);
      } else {
        setRows((data ?? []) as ChatRow[]);
      }
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, user, authLoading]);

  const send = useCallback(async (input: string) => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : `요청 실패 (${res.status})`;
        setError(message);
        return false;
      }
      setRows((prev) => [payload as ChatRow, ...prev]);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { rows, isHydrated, sending, error, send };
}
