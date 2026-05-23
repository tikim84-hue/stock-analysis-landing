-- 실제 Supabase 프로젝트 스키마 스냅샷.
-- 원본 변경은 대시보드/MCP로 이루어졌으며, 이 파일은 현재 상태를 재구성한 것이다.
-- DB는 snake_case, TS는 camelCase이므로 클라이언트(`src/lib/use-trades.ts`,
-- `src/lib/use-chat.ts`)에서 매핑한다.

------------------------------------------------------------
-- 공용 트리거 함수
------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

------------------------------------------------------------
-- trades: src/lib/trades.ts의 Trade 타입을 반영
------------------------------------------------------------
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  name text not null,
  buy_price numeric not null,
  quantity integer not null,
  buy_date date not null,
  sell_date date not null,
  sell_amount numeric not null,
  fee_override numeric,
  tax_override numeric,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade
);

create index trades_buy_date_idx on public.trades (buy_date desc);
create index trades_user_id_idx on public.trades (user_id);

alter table public.trades enable row level security;

create policy trades_select_own on public.trades
  for select to authenticated
  using (user_id = auth.uid());

create policy trades_insert_own on public.trades
  for insert to authenticated
  with check (user_id = auth.uid());

create policy trades_update_own on public.trades
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy trades_delete_own on public.trades
  for delete to authenticated
  using (user_id = auth.uid());

------------------------------------------------------------
-- messages: AI 방명록 (사용자 입력 + AI 응답을 한 행에 저장)
------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text check (char_length(content) >= 1 and char_length(content) <= 200),
  ai_input text check (ai_input is null or (char_length(ai_input) >= 1 and char_length(ai_input) <= 4000)),
  ai_output text check (ai_output is null or char_length(ai_output) <= 16000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index messages_user_created_idx on public.messages (user_id, created_at desc);

create trigger messages_set_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

alter table public.messages enable row level security;

create policy messages_select_own on public.messages
  for select to authenticated
  using (user_id = auth.uid());

create policy messages_insert_own on public.messages
  for insert to authenticated
  with check (user_id = auth.uid());

create policy messages_update_own on public.messages
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy messages_delete_own on public.messages
  for delete to authenticated
  using (user_id = auth.uid());
