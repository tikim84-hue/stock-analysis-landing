-- trades 테이블: src/lib/trades.ts의 Trade 타입을 그대로 반영.
-- DB는 snake_case, TS는 camelCase이므로 클라이언트 측에서 매핑 필요.

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  name text not null,
  buy_price numeric not null check (buy_price >= 0),
  quantity integer not null check (quantity > 0),
  buy_date date not null,
  sell_date date not null,
  sell_amount numeric not null check (sell_amount >= 0),
  fee_override numeric,
  tax_override numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trades_buy_date_idx on public.trades (buy_date desc);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trades_set_updated_at
before update on public.trades
for each row execute function public.touch_updated_at();

-- RLS: 데모용 정책. 인증 도입 시 user_id 컬럼 추가하고
-- auth.uid() 기반으로 교체할 것.
alter table public.trades enable row level security;

create policy "demo: anyone can read trades"
  on public.trades for select using (true);

create policy "demo: anyone can insert trades"
  on public.trades for insert with check (true);

create policy "demo: anyone can update trades"
  on public.trades for update using (true) with check (true);

create policy "demo: anyone can delete trades"
  on public.trades for delete using (true);
