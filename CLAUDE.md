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
3. `src/app/auth/callback/route.ts` exchanges the OAuth/email code for a session via `exchangeCodeForSession`, then redirects to `?next=`.

### Supabase schema

Both `public.trades` and `public.messages` exist with RLS scoped to `user_id = auth.uid()` for the `authenticated` role (no `anon` access). `user_id` defaults to `auth.uid()`, so client code can insert without explicitly setting it.

`supabase/schema.sql` is a **reconstruction** of the live schema — actual changes were applied via the Supabase dashboard/MCP, not migrations. If reality and the file diverge again, trust the live DB (query via MCP) and update the file.

### AI guestbook

- UI: `src/components/sections/guestbook.tsx` + `src/lib/use-chat.ts`.
- API: `src/app/api/ai/route.ts` — auth-gated (401 if no Supabase user), calls OpenRouter (`anthropic/claude-3.5-haiku` by default, override with `OPENROUTER_MODEL`), then inserts `{ai_input, ai_output}` into `public.messages`. Requires `OPENROUTER_API_KEY`.

### Trade history

- `src/components/sections/trade-history.tsx` + `src/lib/use-trades.ts` persist to `public.trades` via the browser Supabase client. The page shows an auth gate (`로그인 / 회원가입`) when no user is present — there is no anonymous/localStorage fallback.
- Derived values (`fee`, `tax`, `pnl`, `returnRate`) are always computed by `computeDerived` in `src/lib/trades.ts` from the 7 stored fields. Don't persist them. Korean market rates: broker fee `0.015%` (both sides), transaction tax `0.18%` (sell side). `feeOverride`/`taxOverride` exist for receipt-accurate input.
- `resetTrades` deletes the current user's rows and re-inserts `SEED_TRADES` — it is **per-user**, not a global reset.

### Color convention (Korean market)

`src/app/globals.css` defines `--up: #ef4444` (red) and `--down: #3b82f6` (blue) — opposite of US convention. Use `text-up` / `text-down` / `bg-highlight/15` in Tailwind. Don't "fix" red-for-gain.

### Page composition

`src/app/page.tsx` lists sections; several (`metrics-preview`, `benchmark-attribution`, `risk-cost`, `faq`, `site-footer`) are commented out because the files don't exist yet. Uncomment imports + JSX together when adding them.

## Deployment

Vercel auto-deploys from `main`. There is an unresolved Vercel SSO protection issue gating the production URL (returns 401) — see user memory before debugging prod auth flows.
