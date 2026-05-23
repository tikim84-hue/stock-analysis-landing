"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { SEED_TRADES, type Trade } from "@/lib/trades";

type Row = Tables<"trades">;

function rowToTrade(r: Row): Trade {
  const t: Trade = {
    id: r.id,
    ticker: r.ticker,
    name: r.name,
    buyPrice: Number(r.buy_price),
    quantity: r.quantity,
    buyDate: r.buy_date,
    sellDate: r.sell_date,
    sellAmount: Number(r.sell_amount),
  };
  if (r.fee_override !== null) t.feeOverride = Number(r.fee_override);
  if (r.tax_override !== null) t.taxOverride = Number(r.tax_override);
  return t;
}

function tradeToInsert(t: Omit<Trade, "id">): TablesInsert<"trades"> {
  return {
    ticker: t.ticker,
    name: t.name,
    buy_price: t.buyPrice,
    quantity: t.quantity,
    buy_date: t.buyDate,
    sell_date: t.sellDate,
    sell_amount: t.sellAmount,
    fee_override: t.feeOverride ?? null,
    tax_override: t.taxOverride ?? null,
  };
}

export function useTrades() {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const tradesRef = useRef<Trade[]>([]);
  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

  const reload = useCallback(async () => {
    if (!user) {
      setTrades([]);
      return;
    }
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("buy_date", { ascending: false });
    if (error) {
      console.error("[trades] load failed:", error.message);
      return;
    }
    setTrades(data.map(rowToTrade));
  }, [supabase, user]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setIsHydrated(false);
    (async () => {
      await reload();
      if (!cancelled) setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, authLoading]);

  const addTrade = useCallback(
    async (input: Omit<Trade, "id">) => {
      const { data, error } = await supabase
        .from("trades")
        .insert(tradeToInsert(input))
        .select()
        .single();
      if (error) {
        console.error("[trades] add failed:", error.message);
        return;
      }
      const inserted = rowToTrade(data);
      setTrades((prev) => [inserted, ...prev]);
    },
    [supabase],
  );

  const updateTrade = useCallback(
    async (id: string, input: Omit<Trade, "id">) => {
      const { data, error } = await supabase
        .from("trades")
        .update(tradeToInsert(input))
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("[trades] update failed:", error.message);
        return;
      }
      const updated = rowToTrade(data);
      setTrades((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [supabase],
  );

  const removeTrade = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) {
        console.error("[trades] remove failed:", error.message);
        return;
      }
      setTrades((prev) => prev.filter((t) => t.id !== id));
    },
    [supabase],
  );

  const resetTrades = useCallback(async () => {
    const ids = tradesRef.current.map((t) => t.id);
    if (ids.length > 0) {
      const { error } = await supabase.from("trades").delete().in("id", ids);
      if (error) {
        console.error("[trades] reset (delete) failed:", error.message);
        return;
      }
    }
    const { data, error } = await supabase
      .from("trades")
      .insert(SEED_TRADES.map(tradeToInsert))
      .select();
    if (error) {
      console.error("[trades] reset (insert) failed:", error.message);
      return;
    }
    setTrades(data.map(rowToTrade));
  }, [supabase]);

  return { trades, isHydrated, addTrade, updateTrade, removeTrade, resetTrades };
}
