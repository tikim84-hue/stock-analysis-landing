"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_TRADES, type Trade } from "@/lib/trades";

const STORAGE_KEY = "stock-trades-v1";
const EMPTY_SERVER: Trade[] = [];

let snapshotCache: Trade[] = EMPTY_SERVER;
let snapshotKey: string | null | undefined = undefined;

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Trade[] {
  if (typeof window === "undefined") return EMPTY_SERVER;
  const raw = readRaw();
  if (snapshotKey !== undefined && raw === snapshotKey) {
    return snapshotCache;
  }
  let next: Trade[];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      next = Array.isArray(parsed) ? (parsed as Trade[]) : SEED_TRADES;
    } catch {
      next = SEED_TRADES;
    }
  } else {
    next = SEED_TRADES;
  }
  snapshotKey = raw;
  snapshotCache = next;
  return snapshotCache;
}

function getServerSnapshot(): Trade[] {
  return EMPTY_SERVER;
}

const subscribers = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  subscribers.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    subscribers.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function notify() {
  for (const cb of subscribers) cb();
}

function writeStorage(trades: Trade[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch {
    // quota or privacy mode — silently ignore
  }
  notify();
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTrades() {
  const trades = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Reference equal to server snapshot until first client read populates the cache.
  const isHydrated = trades !== EMPTY_SERVER;

  const addTrade = useCallback((input: Omit<Trade, "id">) => {
    const next = [{ ...input, id: makeId() }, ...getSnapshot()];
    writeStorage(next);
  }, []);

  const updateTrade = useCallback(
    (id: string, input: Omit<Trade, "id">) => {
      const next = getSnapshot().map((t) =>
        t.id === id ? { ...input, id } : t,
      );
      writeStorage(next);
    },
    [],
  );

  const removeTrade = useCallback((id: string) => {
    writeStorage(getSnapshot().filter((t) => t.id !== id));
  }, []);

  const resetTrades = useCallback(() => {
    writeStorage(SEED_TRADES);
  }, []);

  return { trades, isHydrated, addTrade, updateTrade, removeTrade, resetTrades };
}
