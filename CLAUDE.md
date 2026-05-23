# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # next dev (Turbopack)
npm run build   # next build — runs full TypeScript typecheck; lint-passing code can still fail here
npm run start   # serve the production build
npm run lint    # ESLint (flat config, eslint.config.mjs)
```

There is no test runner configured.

## Architecture

### Next.js 16 conventions (read AGENTS.md first)

- **`src/proxy.ts`** is the request middleware — Next.js 16 renamed `middleware.ts` → `proxy.ts` and the named export `middleware` → `proxy`. The `edge` runtime is not available here; `proxy` runs on `nodejs`. See `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` for the full deprecation list before touching auth/routing infra.
- App Router with React 19, Tailwind v4, path alias `@/* → src/*`.

### Three Supabase clients, one cookie story

`@supabase/ssr` requires a different client per execution context — keep them separate:

- `src/lib/supabase/client.ts` — `createBrowserClient`, used in `"use client"` components (auth dialog, `useChat`, `auth-context`).
- `src/lib/supabase/server.ts` — `createServerClient` bound to `next/headers` cookies. Used in route handlers (`/api/ai`, `/auth/callback`). Cookie writes are wrapped in try/catch because Server Components can't set cookies.
- `src/lib/supabase/proxy.ts` (`updateSession`) — called from `src/proxy.ts` on every matched request. It runs `supabase.auth.getUser()` purely for its side effect: refreshing the access-token cookie when stale. If you stop calling this in `proxy.ts`, server-side auth will silently break once tokens expire.

Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (note: publishable, not anon — naming follows Supabase's newer convention).

### Auth flow

1. `AuthProvider` (`src/components/auth/auth-context.tsx`) wraps the app in `layout.tsx`, exposes `useAuth()`, and owns the `isLoginOpen` modal state.
2. `AuthDialog` uses `signInWithPassword` / `signUp`. Signup uses `emailRedirectTo = ${origin}/auth/callback`.
3. `src/app/auth/callback/route.ts` exchanges the OAuth/email code for a session via `exchangeCodeForSession`, then redirects to a `?next=` path filtered through `safeNext()` — only same-origin relative paths are honored (protocol-relative `//evil.com` is rejected). If you add new auth entry points that pass a `next` parameter, route them through the same guard.

### Supabase schema

Both `public.trades` and `public.messages` exist with RLS scoped to `user_id = auth.uid()` for the `authenticated` role (no `anon` access). `user_id` defaults to `auth.uid()`, so client code can insert without explicitly setting it.

`supabase/schema.sql` is a **reconstruction** of the live schema — actual changes were applied via the Supabase dashboard/MCP, not migrations. If reality and the file diverge again, trust the live DB (query via MCP) and update the file.

### AI guestbook

- UI: `src/components/sections/guestbook.tsx` + `src/lib/use-chat.ts`.
- API: `src/app/api/ai/route.ts` — auth-gated (401), validates `Content-Type: application/json` (415 otherwise), per-user rate limit (20 req/min, in-memory per Fluid Compute instance — not globally consistent), then calls OpenRouter (`anthropic/claude-3.5-haiku` by default, override with `OPENROUTER_MODEL`) and inserts `{ai_input, ai_output}` into `public.messages`. Requires `OPENROUTER_API_KEY`. Error messages are sanitized before returning to the client (e.g., missing API key → 503 with "서비스를 일시적으로 사용할 수 없습니다", DB failure → 500 with "저장 실패").

### Trade history

The section is structured as a **tabs orchestrator + two leaf views**:

- `src/components/sections/trade-history.tsx` is the orchestrator. It owns `useAuth`, `useTrades`, summary-card aggregation, and the controlled `Tabs` state. It calls `useTrades` exactly once and passes `trades` + CRUD callbacks down. Summary cards stay above the tabs (apply to both views). The toolbar buttons (`초기화`, `거래 추가`) only render on the **내역** tab.
- The "거래 추가" button in the toolbar lives in the parent but the form mode lives in the child. They communicate via a `pendingCreate: boolean` + `onCreateHandled: () => void` bridge: parent toggles `true`, child opens its form and immediately calls `onCreateHandled()` to flip it back. `onCreateHandled` MUST be stable (wrap in `useCallback`) or the child effect will fire on every parent render.
- `src/components/sections/trade-history-table.tsx` — the **내역** tab: form + table + delete confirm. Owns its `formMode` discriminated union and the logout-close effect.
- `src/components/sections/trade-analytics.tsx` — the **분석** tab: composes the chart components with loading/empty-state guards. Only renders when `isHydrated && trades.length > 0`.

Data layer:

- `src/lib/use-trades.ts` is the browser-side Supabase hook. `resetTrades` deletes the current user's rows via `eq("user_id", user.id)` and re-inserts `SEED_TRADES` — per-user, not global.
- Derived values (`fee`, `tax`, `pnl`, `returnRate`) are always computed by `computeDerived` in `src/lib/trades.ts` from the 7 stored fields. Don't persist them. Korean market rates: broker fee `0.015%` (both sides), transaction tax `0.18%` (sell side). `feeOverride`/`taxOverride` exist for receipt-accurate input.
- `src/lib/analytics.ts` contains pure chart-shaping helpers (`buildEquityCurve`, `buildPnlByTicker`, `buildMonthlyPnl`, `buildHoldingScatter`). All call `computeDerived` so the single source of truth rule is preserved — never bypass it with hand-computed PnL.

Analytics charts (all Recharts, all `"use client"`, all in `src/components/sections/`):

- `equity-curve-chart.tsx` — `LineChart`, cumulative PnL by sellDate, stroke colored by terminal-value sign.
- `pnl-by-ticker-chart.tsx` — `BarChart` with per-bar `<Cell>` coloring, sorted by `|pnl|` desc.
- `monthly-pnl-chart.tsx` — `BarChart`, one bar per `YYYY-MM` sellDate group, sign-colored cells.
- `holding-return-scatter.tsx` — `ScatterChart` with two `<Scatter>` series (positives in `--up`, negatives in `--down`) for color-by-sign.

Chart pattern conventions (follow when adding more):
- Card wrapper: `rounded-lg border border-border/40 bg-card/40 p-6`, `<h3>` Korean title, `h-[280px]` container with `ResponsiveContainer 100%/100%`.
- Pass CSS variables directly to Recharts (`stroke="var(--up)"`) — `globals.css` defines `--up` / `--down` as HEX, not HSL channels.
- Recharts 3's `Tooltip` formatter callback can't take a typed `(value: number, ...)` annotation — drop the annotation and coerce with `Number(value)`.
- Guard `item.payload` with optional chaining — Recharts types it as optional.

### Color convention (Korean market)

`src/app/globals.css` defines `--up: #ef4444` (red) and `--down: #3b82f6` (blue) — opposite of US convention. Use `text-up` / `text-down` / `bg-highlight/15` in Tailwind. Don't "fix" red-for-gain.

### Page composition

`src/app/page.tsx` is the only route. Sections in render order:

1. `Hero` — headline + mini chart preview
2. `PainPoints` — 3 problem cards
3. `MetricsPreview` — 5 metric cards (TWR · MWR · 알파 · 샤프 · MDD)
4. `BenchmarkAttribution` — alpha-vs-beta decomposition visual (example numbers, not yet wired to real data)
5. `RiskCost` — 3 cards on Sharpe / MDD / fee-tax leakage
6. `HowItWorks` — 3-step pipeline diagram
7. `TradeHistory` — the auth-gated interactive section (see "Trade history" above)
8. `Guestbook` — AI guestbook (see "AI guestbook" above)
9. `Faq` — 6-item shadcn Accordion

`SiteFooter` renders outside `<main>` at the bottom.

## Deployment

Vercel auto-deploys from `main`. Project: `tikim84-hues-projects/stock-analysis-landing`. Stable public alias: `https://stock-analysis-landing-six.vercel.app`.

Deployment Protection was disabled on 2026-05-23 via `vercel project protection disable stock-analysis-landing --sso`. To re-enable or inspect protection state, use `vercel project protection [--format json]`. Avoid touching dashboard for this — the CLI flag is faster and scriptable.
