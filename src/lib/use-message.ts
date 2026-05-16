"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

export function useMessage() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setContent("");
      setIsHydrated(true);
      return;
    }
    let cancelled = false;
    setIsHydrated(false);
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("content")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("[message] load failed:", error.message);
      } else {
        setContent(data?.content ?? "");
      }
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, user, authLoading]);

  const save = useCallback(
    async (text: string) => {
      if (!user) return;
      setSaving(true);
      setError(null);
      const { error } = await supabase
        .from("messages")
        .upsert(
          { user_id: user.id, content: text },
          { onConflict: "user_id" },
        );
      setSaving(false);
      if (error) {
        console.error("[message] save failed:", error.message);
        setError(error.message);
        return false;
      }
      setContent(text);
      return true;
    },
    [supabase, user],
  );

  return { content, isHydrated, saving, error, save };
}
